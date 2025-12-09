import mapboxgl from 'mapbox-gl';
import type { DataPoint } from './types';
import type { VisualizationLayer, Model3DConfig } from '@/hooks/useVisualizationLayers';

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface LoadedModel {
  scene: any;
  animations: any[];
  mixer?: THREE.AnimationMixer;
}

interface Model3DState {
  layerId: string;
  assetId: string;
  position: [number, number];
  modelUrl: string;
  sourceId: string;
  layerIds: string[];
  
  scale: [number, number, number];
  rotation: [number, number, number];
  translate: [number, number, number];
  
  altitude: number;
  bearing: number;
  pitch: number;
  orientation: 'map' | 'viewport' | 'auto';
  anchor: 'center' | 'bottom' | 'top';
  altitudeMode: 'absolute' | 'relative' | 'clampToGround';
  heightOffset: number;
  
  autoRotate: boolean;
  autoRotateOffset: number;
  scaleWithZoom: boolean;
  scaleRange?: [number, number];
  minZoom?: number;
  maxZoom?: number;
  
  loaded: boolean;
  visible: boolean;
  currentZoom: number;

  debugMarker?: mapboxgl.Marker;
  debugSphereLayerId?: string;
}

export class Model3DManager {
  private map: mapboxgl.Map;
  private models: Map<string, Model3DState>;
  private loadedModelUrls: Set<string>;
  private enableDebugMarkers: boolean = true;

  private gltfLoader: GLTFLoader;
  public loadedModels: Map<string, LoadedModel>;
  private threeCamera: THREE.Camera;
  private threeScene: THREE.Scene;
  private threeRenderer: THREE.WebGLRenderer | null = null;
  public modelMeshes: Map<string, THREE.Group>;

  constructor(map: mapboxgl.Map) {
    this.map = map;
    this.models = new Map();
    this.loadedModelUrls = new Set();

    this.gltfLoader = new GLTFLoader();
    this.loadedModels = new Map();
    this.modelMeshes = new Map();
    this.threeCamera = new THREE.Camera();
    this.threeScene = new THREE.Scene();

    // 🔥 FIX #1: Inicializar renderer INMEDIATAMENTE
    this.initializeRenderer();

    this.map.on('zoom', () => this.handleZoomChange());

    console.log('🎮 Model3DManager inicializado');
  }

  // ============================================================================
  // DEBUG MARKERS
  // ============================================================================

  private updateDebugMarkers(stateKey: string, position: [number, number], altitude: number): void {
    const modelState = this.models.get(stateKey);
    if (!modelState || !this.enableDebugMarkers) return;

    try {
      if (modelState.debugMarker) {
        modelState.debugMarker.setLngLat(position);
      }

      if (modelState.debugSphereLayerId) {
        const sphereSourceId = `debug-sphere-source-${stateKey}`;
        const source = this.map.getSource(sphereSourceId) as mapboxgl.GeoJSONSource;
        
        if (source) {
          source.setData({
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: { altitude },
              geometry: {
                type: 'Point',
                coordinates: [position[0], position[1]]
              }
            }]
          });
        }
      }
    } catch (error) {
      console.error(`❌ Error actualizando debug markers para ${stateKey}:`, error);
    }
  }

  private removeDebugMarkers(stateKey: string): void {
    const modelState = this.models.get(stateKey);
    if (!modelState) return;

    try {
      if (modelState.debugMarker) {
        modelState.debugMarker.remove();
        modelState.debugMarker = undefined;
      }

      if (modelState.debugSphereLayerId) {
        const sphereSourceId = `debug-sphere-source-${stateKey}`;
        
        if (this.map.getLayer(modelState.debugSphereLayerId)) {
          this.map.removeLayer(modelState.debugSphereLayerId);
        }
        
        if (this.map.getSource(sphereSourceId)) {
          this.map.removeSource(sphereSourceId);
        }
        
        modelState.debugSphereLayerId = undefined;
      }
    } catch (error) {
      console.error(`❌ Error eliminando debug markers para ${stateKey}:`, error);
    }
  }

  public setDebugMarkersEnabled(enabled: boolean): void {
    console.log(`🔧 Debug markers ${enabled ? 'ACTIVADOS' : 'DESACTIVADOS'}`);
    this.enableDebugMarkers = enabled;

    if (enabled) {
      this.models.forEach((state, stateKey) => {
        if (!state.debugMarker && !state.debugSphereLayerId) {
          this.createDebugMarkers(stateKey, state.position, state.altitude);
        }
      });
    } else {
      this.models.forEach((state, stateKey) => {
        this.removeDebugMarkers(stateKey);
      });
    }
  }


  private initializeRenderer(): void {
    const tryInit = () => {
      if (this.threeRenderer) {
        console.log('✅ Renderer ya inicializado');
        return true;
      }

      try {
        // Verificar que el mapa esté listo
        if (!this.map.isStyleLoaded()) {
          console.log('⏳ Esperando a que el mapa cargue...');
          return false;
        }

        const gl = this.map.painter?.context?.gl;
        if (!gl) {
          console.warn('⚠️ Contexto WebGL no disponible aún');
          return false;
        }

        this.threeRenderer = new THREE.WebGLRenderer({
          canvas: this.map.getCanvas(),
          context: gl as any,
          antialias: true
        });
        this.threeRenderer.autoClear = false;
        
        console.log('✅ THREE.WebGLRenderer inicializado correctamente');
        return true;
      } catch (error) {
        console.error('❌ Error inicializando renderer:', error);
        return false;
      }
    };

    // Intentar inmediatamente
    if (tryInit()) return;

    // Si falla, intentar cuando el estilo cargue
    const onStyleLoad = () => {
      if (tryInit()) {
        this.map.off('style.load', onStyleLoad);
      }
    };
    this.map.on('style.load', onStyleLoad);

    // Y también en cada render hasta que funcione
    const onRender = () => {
      if (tryInit()) {
        this.map.off('render', onRender);
      }
    };
    this.map.on('render', onRender);
  }

  // ============================================================================
  // CREACIÓN Y ACTUALIZACIÓN DE MODELOS 3D
  // ============================================================================

  public createOrUpdate3DModel(
    stateKey: string,
    position: [number, number],
    layer: VisualizationLayer,
    point: DataPoint
  ): void {
    try {
      if (!layer.modelUrl) {
        console.warn(`⚠️ No hay modelUrl configurado para layer ${layer.name}`);
        return;
      }

      const existingModel = this.models.get(stateKey);

      if (existingModel) {
        //this.update3DModel(stateKey, position, layer, point);
        this.createDebugSphere(stateKey, position, existingModel.altitude || 1);
      } else {
        //this.create3DModel(stateKey, position, layer, point);
        this.createDebugSphere(stateKey, position, 1);

      }
    } catch (error) {
      console.error(`❌ Error en createOrUpdate3DModel para ${stateKey}:`, error);
    }
  }

  public focusOnModel(stateKey: string, options?: {
    zoom?: number;
    bearing?: number;
    pitch?: number;
    duration?: number;
  }): void {
    const modelState = this.models.get(stateKey);
    if (!modelState) {
      console.warn(`⚠️ No se encontró modelo para ${stateKey}`);
      return;
    }

    const defaultOptions = {
      zoom: 18,
      bearing: modelState.bearing || 0,
      pitch: 60,
      duration: 1500
    };

    const finalOptions = { ...defaultOptions, ...options };

    this.map.flyTo({
      center: modelState.position,
      zoom: finalOptions.zoom,
      bearing: finalOptions.bearing,
      pitch: finalOptions.pitch,
      duration: finalOptions.duration,
      essential: true
    });
  }

  // ============================================================================
  // 🔥 FIX #2: CAPA CUSTOM SIN SOURCE
  // ============================================================================

  private create3DModel(
    stateKey: string,
    position: [number, number],
    layer: VisualizationLayer,
    point: DataPoint
  ): void {
    console.log(`🎮 Creando modelo 3D: ${stateKey}`);

    const modelUrl = layer.modelUrl!;
    const layerId = `model3d-layer-${stateKey}`;
    const config = layer.model3dConfig;

    const scale = this.extractScale(point, config);
    const rotation = this.extractRotation(point, config);
    const translate = this.extractTranslate(point, config);
    const altitude = this.extractAltitude(point, config);
    const altitudeMode = config?.altitudeMode || 'relative';
    const heightOffset = config?.heightOffset || 0;
    const bearing = this.extractBearing(point, config);
    const pitch = this.extractPitch(point, config);
    const orientation = config?.orientation || 'map';
    const anchor = config?.anchor || 'center';
    const autoRotate = config?.autoRotate || false;
    const autoRotateOffset = config?.autoRotateOffset || 0;
    const scaleWithZoom = config?.scaleWithZoom || false;
    const scaleRange = config?.scaleRange;
    const minZoom = config?.minZoom;
    const maxZoom = config?.maxZoom;

    const finalAltitude = this.calculateFinalAltitude(
      altitude,
      heightOffset,
      altitudeMode,
      position
    );

    // 🔥 FIX #2: Capa custom SIN source
    if (!this.map.getLayer(layerId)) {
      this.map.addLayer({
        id: layerId,
        type: 'custom',
        // ❌ REMOVIDO: source: sourceId,
        renderingMode: '3d',
        render: (gl: WebGLRenderingContext, matrix: number[]) => {
          this.render3DModel(gl, matrix, stateKey, modelUrl, position, finalAltitude);
        }
      } as any);

      if (minZoom !== undefined || maxZoom !== undefined) {
        this.map.setLayerZoomRange(
          layerId,
          minZoom ?? 0,
          maxZoom ?? 24
        );
      }
    }

    const modelState: Model3DState = {
      layerId: layer.id,
      assetId: point.sensorId,
      position,
      modelUrl,
      sourceId: `unused-${stateKey}`,
      layerIds: [layerId],
      
      scale,
      rotation,
      translate,
      
      altitude: finalAltitude,
      bearing,
      pitch,
      orientation,
      anchor,
      altitudeMode,
      heightOffset,
      
      autoRotate,
      autoRotateOffset,
      scaleWithZoom,
      scaleRange,
      minZoom,
      maxZoom,
      
      loaded: false,
      visible: true,
      currentZoom: this.map.getZoom(),
    };

    this.models.set(stateKey, modelState);
    this.loadModel(modelUrl, stateKey);

    if (this.enableDebugMarkers) {
      this.createDebugMarkers(stateKey, position, altitude);
    }

    console.log(`✅ Modelo 3D creado: ${stateKey}`, {
      scale,
      rotation,
      altitude: finalAltitude,
      position
    });
  }

  private update3DModel(
    stateKey: string,
    position: [number, number],
    layer: VisualizationLayer,
    point: DataPoint
  ): void {
    const modelState = this.models.get(stateKey);
    if (!modelState) return;

    const config = layer.model3dConfig;

    modelState.position = position;
    modelState.scale = this.extractScale(point, config);
    modelState.rotation = this.extractRotation(point, config);
    modelState.translate = this.extractTranslate(point, config);
    
    const rawAltitude = this.extractAltitude(point, config);
    modelState.altitude = this.calculateFinalAltitude(
      rawAltitude,
      modelState.heightOffset,
      modelState.altitudeMode,
      position
    );
    
    modelState.bearing = this.extractBearing(point, config);
    modelState.pitch = this.extractPitch(point, config);

    this.map.triggerRepaint();
    
    if (this.enableDebugMarkers) {
      this.updateDebugMarkers(stateKey, position, modelState.altitude);
    }
  }

  // ============================================================================
  // EXTRACCIÓN DE CONFIGURACIÓN
  // ============================================================================

  private extractScale(point: DataPoint, config: Model3DConfig | null): [number, number, number] {
    if (config?.scale) return config.scale;
    if (point.metadata?.scale) {
      const s = point.metadata.scale;
      if (Array.isArray(s) && s.length === 3) return [s[0], s[1], s[2]];
      return [s, s, s];
    }
    return [1, 1, 1];
  }

  private extractRotation(point: DataPoint, config: Model3DConfig | null): [number, number, number] {
    if (config?.rotation) return config.rotation;
    if (point.metadata?.rotation) {
      const r = point.metadata.rotation;
      if (Array.isArray(r) && r.length === 3) {
        return [
          r[0] * (Math.PI / 180),
          r[1] * (Math.PI / 180),
          r[2] * (Math.PI / 180),
        ];
      }
      return [0, 0, r * (Math.PI / 180)];
    }
    return [0, 0, 0];
  }

  private extractTranslate(point: DataPoint, config: Model3DConfig | null): [number, number, number] {
    if (config?.translate) return config.translate;
    if (point.metadata?.translate && Array.isArray(point.metadata.translate)) {
      return point.metadata.translate as [number, number, number];
    }
    return [0, 0, 0];
  }

  private extractAltitude(point: DataPoint, config: Model3DConfig | null): number {
    if (point.metadata?.altitude !== undefined) return point.metadata.altitude;
    if (point.metadata?.z !== undefined) return point.metadata.z;
    return 0;
  }

  private calculateFinalAltitude(
    baseAltitude: number,
    heightOffset: number,
    altitudeMode: 'absolute' | 'relative' | 'clampToGround',
    position: [number, number]
  ): number {
    switch (altitudeMode) {
      case 'absolute':
        return baseAltitude + heightOffset;
      case 'relative':
        return baseAltitude + heightOffset;
      case 'clampToGround':
        return heightOffset;
      default:
        return baseAltitude + heightOffset;
    }
  }

  private extractBearing(point: DataPoint, config: Model3DConfig | null): number {
    if (point.metadata?.bearing !== undefined) return point.metadata.bearing;
    return 0;
  }

  private extractPitch(point: DataPoint, config: Model3DConfig | null): number {
    if (point.metadata?.pitch !== undefined) return point.metadata.pitch;
    return 0;
  }

  // ============================================================================
  // CARGA Y RENDERIZADO
  // ============================================================================

 private async loadModel(modelUrl: string, stateKey: string): Promise<void> {
    if (this.loadedModels.has(modelUrl)) {
      console.log(`✓ Modelo ya cargado: ${modelUrl}`);
      this.createModelInstance(stateKey, modelUrl);
      return;
    }

    try {
      console.log(`📦 Cargando modelo GLTF: ${modelUrl}`);
      
      // Validar URL antes de intentar cargar
      if (!modelUrl || modelUrl.trim() === '') {
        throw new Error('URL del modelo está vacía');
      }

      // Verificar si la URL es accesible
      try {
        const response = await fetch(modelUrl, { method: 'HEAD' });
        if (!response.ok) {
          throw new Error(`URL no accesible: ${response.status} ${response.statusText}`);
        }
        console.log(`✓ URL verificada: ${modelUrl} (${response.headers.get('content-type')})`);
      } catch (fetchError: any) {
        console.error(`❌ Error verificando URL: ${fetchError.message}`);
        throw new Error(`No se puede acceder al modelo: ${fetchError.message}`);
      }

      // Intentar cargar el modelo
      const gltf = await this.gltfLoader.loadAsync(modelUrl);
      
      const loadedModel: LoadedModel = {
        scene: gltf.scene,
        animations: gltf.animations || [],
        mixer: gltf.animations.length > 0 ? new THREE.AnimationMixer(gltf.scene) : undefined
      };

      if (loadedModel.mixer && loadedModel.animations.length > 0) {
        loadedModel.animations.forEach(clip => {
          loadedModel.mixer!.clipAction(clip).play();
        });
      }

      this.loadedModels.set(modelUrl, loadedModel);
      this.loadedModelUrls.add(modelUrl);
      
      // Crear instancia para este stateKey
      this.createModelInstance(stateKey, modelUrl);

      console.log(`✅ Modelo GLTF cargado: ${modelUrl}`);
    } catch (error: any) {
      const modelState = this.models.get(stateKey);
      
      console.error(`❌ Error cargando modelo ${modelUrl}:`, {
        error: error.message || error,
        stateKey,
        modelUrl,
        errorType: error.name,
        stack: error.stack
      });

      // Marcar el modelo como fallido pero mantenerlo en el mapa
      if (modelState) {
        modelState.loaded = false;
        console.warn(`⚠️ Modelo marcado como no cargado: ${stateKey}`);
      }

      // Propagar el error con contexto adicional
      throw new Error(`Failed to load 3D model: ${error.message || 'Unknown error'}. URL: ${modelUrl}`);
    }
  }

  private createModelInstance(stateKey: string, modelUrl: string): void {
    const loadedModel = this.loadedModels.get(modelUrl);
    const state = this.models.get(stateKey);
    
    if (!loadedModel || !state) {
      console.warn(`⚠️ No se puede crear instancia para ${stateKey}`);
      return;
    }

    const modelInstance = loadedModel.scene.clone();
    this.modelMeshes.set(stateKey, modelInstance);
    this.threeScene.add(modelInstance);
    
    state.loaded = true;
    
    console.log(`✅ Instancia de modelo creada: ${stateKey}`);
    
    // Forzar un repaint
    this.map.triggerRepaint();
  }

  // ============================================================================
  // 🔥 FIX #3: RENDERIZADO CORRECTO CON MATRIZ DE MAPBOX
  // ============================================================================

  private render3DModel(
    gl: WebGLRenderingContext,
    matrix: number[],
    stateKey: string,
    modelUrl: string,
    position: [number, number],
    altitude: number
  ): void {
    const modelState = this.models.get(stateKey);
    if (!modelState || !modelState.loaded || !modelState.visible) return;

    const currentZoom = this.map.getZoom();
    if (modelState.minZoom !== undefined && currentZoom < modelState.minZoom) return;
    if (modelState.maxZoom !== undefined && currentZoom > modelState.maxZoom) return;

    if (!this.threeRenderer) {
      console.warn('⚠️ Renderer no inicializado, intentando inicializar...');
      this.initializeRenderer();
      return;
    }

    const modelMesh = this.modelMeshes.get(stateKey);
    if (!modelMesh) {
      console.warn(`⚠️ No hay mesh para ${stateKey}`);
      return;
    }

    // Calcular escala dinámica
    let renderScale = modelState.scale;
    if (modelState.scaleWithZoom && modelState.scaleRange) {
      const [minScale, maxScale] = modelState.scaleRange;
      const zoomFactor = (currentZoom - (modelState.minZoom || 0)) / 
                        ((modelState.maxZoom || 24) - (modelState.minZoom || 0));
      const scaleFactor = minScale + (maxScale - minScale) * Math.max(0, Math.min(1, zoomFactor));
      renderScale = [
        modelState.scale[0] * scaleFactor,
        modelState.scale[1] * scaleFactor,
        modelState.scale[2] * scaleFactor,
      ];
    }

    // Calcular rotación con auto-rotate
    let renderRotation = modelState.rotation;
    if (modelState.autoRotate) {
      const time = Date.now() / 1000;
      const autoRotateAngle = time + modelState.autoRotateOffset;
      renderRotation = [
        modelState.rotation[0],
        modelState.rotation[1],
        autoRotateAngle,
      ];
    }

    // 🔥 FIX #3: Transformar correctamente usando coordenadas Mercator
    const modelAsMercatorCoordinate = mapboxgl.MercatorCoordinate.fromLngLat(
      position,
      altitude
    );

    const modelTransform = {
      translateX: modelAsMercatorCoordinate.x,
      translateY: modelAsMercatorCoordinate.y,
      translateZ: modelAsMercatorCoordinate.z || 0,
      rotateX: renderRotation[0],
      rotateY: renderRotation[1],
      rotateZ: renderRotation[2],
      scale: modelAsMercatorCoordinate.meterInMercatorCoordinateUnits()
    };

    const rotationX = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(1, 0, 0),
      modelTransform.rotateX
    );
    const rotationY = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 1, 0),
      modelTransform.rotateY
    );
    const rotationZ = new THREE.Matrix4().makeRotationAxis(
      new THREE.Vector3(0, 0, 1),
      modelTransform.rotateZ
    );

    const m = new THREE.Matrix4().fromArray(matrix);
    const l = new THREE.Matrix4()
      .makeTranslation(
        modelTransform.translateX,
        modelTransform.translateY,
        modelTransform.translateZ
      )
      .scale(
        new THREE.Vector3(
          modelTransform.scale * renderScale[0],
          -modelTransform.scale * renderScale[1],
          modelTransform.scale * renderScale[2]
        )
      )
      .multiply(rotationX)
      .multiply(rotationY)
      .multiply(rotationZ);

    // Aplicar translación adicional
    if (modelState.translate[0] !== 0 || modelState.translate[1] !== 0 || modelState.translate[2] !== 0) {
      const translateMatrix = new THREE.Matrix4().makeTranslation(
        modelState.translate[0] * modelTransform.scale,
        modelState.translate[1] * modelTransform.scale,
        modelState.translate[2] * modelTransform.scale
      );
      l.multiply(translateMatrix);
    }

    // Aplicar transformación
    this.threeCamera.projectionMatrix = m.multiply(l);
    this.threeRenderer.resetState();
    this.threeRenderer.render(this.threeScene, this.threeCamera);

    // Actualizar animaciones
    const loadedModel = this.loadedModels.get(modelUrl);
    if (loadedModel?.mixer) {
      loadedModel.mixer.update(0.016);
    }
  }

  // ============================================================================
  // MANEJO DE ZOOM
  // ============================================================================

  private handleZoomChange(): void {
    const currentZoom = this.map.getZoom();
    this.models.forEach((state, stateKey) => {
      if (state.currentZoom !== currentZoom) {
        state.currentZoom = currentZoom;
        if (state.scaleWithZoom) {
          this.map.triggerRepaint();
        }
      }
    });
  }

  // ============================================================================
  // VISIBILIDAD Y CONTROL
  // ============================================================================

  public setModelVisibility(stateKey: string, visible: boolean): void {
    const modelState = this.models.get(stateKey);
    if (!modelState) return;
    modelState.visible = visible;
    modelState.layerIds.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
      }
    });
  }

  public setLayerModelsVisibility(layerId: string, visible: boolean): void {
    this.models.forEach((state, stateKey) => {
      if (state.layerId === layerId) {
        this.setModelVisibility(stateKey, visible);
      }
    });
  }

  public updateModelScale(stateKey: string, scale: [number, number, number]): void {
    const modelState = this.models.get(stateKey);
    if (!modelState) return;
    modelState.scale = scale;
    this.map.triggerRepaint();
  }

  public updateModelRotation(stateKey: string, rotation: [number, number, number]): void {
    const modelState = this.models.get(stateKey);
    if (!modelState) return;
    modelState.rotation = rotation;
    this.map.triggerRepaint();
  }

  public updateModelTranslate(stateKey: string, translate: [number, number, number]): void {
    const modelState = this.models.get(stateKey);
    if (!modelState) return;
    modelState.translate = translate;
    this.map.triggerRepaint();
  }

  public updateModelAutoRotate(stateKey: string, enabled: boolean, offset?: number): void {
    const modelState = this.models.get(stateKey);
    if (!modelState) return;
    modelState.autoRotate = enabled;
    if (offset !== undefined) {
      modelState.autoRotateOffset = offset;
    }
    this.map.triggerRepaint();
  }

  // ============================================================================
  // LIMPIEZA
  // ============================================================================

  public removeModel(stateKey: string): void {
    const modelState = this.models.get(stateKey);
    if (!modelState) return;

    const modelMesh = this.modelMeshes.get(stateKey);
    if (modelMesh) {
      this.threeScene.remove(modelMesh);
      modelMesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
      this.modelMeshes.delete(stateKey);
    }

    modelState.layerIds.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });

    this.models.delete(stateKey);
  }

  public removeLayerModels(layerId: string): void {
    const keysToRemove: string[] = [];
    this.models.forEach((state, stateKey) => {
      if (state.layerId === layerId) {
        keysToRemove.push(stateKey);
      }
    });
    keysToRemove.forEach(key => this.removeModel(key));
  }

  public cleanup(): void {
    this.map.off('zoom', () => this.handleZoomChange());
    
    this.modelMeshes.forEach((mesh, key) => {
      this.threeScene.remove(mesh);
      mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    });
    this.modelMeshes.clear();

    this.loadedModels.forEach((model, url) => {
      if (model.mixer) {
        model.mixer.stopAllAction();
      }
    });
    this.loadedModels.clear();

    this.threeRenderer = null;

    const allKeys = Array.from(this.models.keys());
    allKeys.forEach(key => this.removeModel(key));

    this.loadedModelUrls.clear();
  }

  // ============================================================================
  // QUERIES
  // ============================================================================

  public isModelLoaded(stateKey: string): boolean {
    const modelState = this.models.get(stateKey);
    return modelState?.loaded ?? false;
  }

  public getActiveModels(): Model3DState[] {
    return Array.from(this.models.values());
  }

  public getModelState(stateKey: string): Model3DState | undefined {
    return this.models.get(stateKey);
  }

  public getVisibleModels(): Model3DState[] {
    const currentZoom = this.map.getZoom();
    return Array.from(this.models.values()).filter(state => {
      if (!state.visible || !state.loaded) return false;
      if (state.minZoom !== undefined && currentZoom < state.minZoom) return false;
      if (state.maxZoom !== undefined && currentZoom > state.maxZoom) return false;
      return true;
    });
  }

  public getStats() {
    const all = Array.from(this.models.values());
    return {
      total: all.length,
      loaded: all.filter(s => s.loaded).length,
      visible: all.filter(s => s.visible).length,
      withAutoRotate: all.filter(s => s.autoRotate).length,
      withScaleZoom: all.filter(s => s.scaleWithZoom).length,
      uniqueModels: this.loadedModelUrls.size,
      rendererReady: this.threeRenderer !== null
    };
  }


  // ============================================================================
// DEBUG MARKERS - MÉTODOS COMPLETOS
// ============================================================================

  /**
   * Crea marcadores de debug (esfera 3D + marcador HTML) para visualizar la posición del modelo
   */
  private createDebugMarkers(stateKey: string, position: [number, number], altitude: number): void {
    try {
      const modelState = this.models.get(stateKey);
      if (!modelState) return;

      console.log(`🔧 Creando debug markers para ${stateKey}`);
      console.log(`📍 Posición:`, position);
      console.log(`📏 Altitud:`, altitude);

      // ============================================================================
      // 1. CREAR ESFERA 3D BÁSICA
      // ============================================================================
      const sphereLayerId = `debug-sphere-${stateKey}`;
      const sphereSourceId = `debug-sphere-source-${stateKey}`;

      // Source para la esfera (SIN altitud en las coordenadas para que sea 2D visible)
      if (!this.map.getSource(sphereSourceId)) {
        this.map.addSource(sphereSourceId, {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: [{
              type: 'Feature',
              properties: {
                altitude: altitude // Guardar como propiedad pero no en coordenadas
              },
              geometry: {
                type: 'Point',
                coordinates: [position[0], position[1]] // Solo lng, lat (2D)
              }
            }]
          }
        });
        console.log(`✅ Source creado: ${sphereSourceId}`);
      }

      // Layer de la esfera (círculo grande y visible)
      if (!this.map.getLayer(sphereLayerId)) {
        this.map.addLayer({
          id: sphereLayerId,
          type: 'circle',
          source: sphereSourceId,
          paint: {
            'circle-radius': 30, // Más grande para ser bien visible
            'circle-color': '#ff0000',
            'circle-opacity': 0.8, // Más opaco
            'circle-stroke-width': 4,
            'circle-stroke-color': '#ffff00', // Amarillo para contraste
            'circle-stroke-opacity': 1
          }
        });

        // Asegurarse de que la capa esté visible por encima de otras
        const layers = this.map.getStyle().layers;
        if (layers && layers.length > 0) {
          // Buscar la primera capa de símbolo para posicionar debajo
          const firstSymbolLayer = layers.find(layer => layer.type === 'symbol');
          if (firstSymbolLayer) {
            this.map.moveLayer(sphereLayerId, firstSymbolLayer.id);
          }
        }

        modelState.debugSphereLayerId = sphereLayerId;
        modelState.layerIds.push(sphereLayerId);
        
        console.log(`✅ Layer de esfera creado: ${sphereLayerId}`);
        console.log(`🎨 Esfera configurada: 30px, rojo con borde amarillo`);
      }

      // Verificar que la layer se agregó correctamente
      const layerExists = this.map.getLayer(sphereLayerId);
      const sourceExists = this.map.getSource(sphereSourceId);
      
      console.log(`🔍 Verificación de esfera:`, {
        layerExists: !!layerExists,
        sourceExists: !!sourceExists,
        layerId: sphereLayerId,
        visible: layerExists ? this.map.getLayoutProperty(sphereLayerId, 'visibility') : 'N/A'
      });

      // ============================================================================
      // 2. CREAR MARCADOR HTML CON CLICK HANDLER
      // ============================================================================
      const el = document.createElement('div');
      el.className = 'debug-marker-3d';
      el.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: bold;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          user-select: none;
          transition: transform 0.2s, box-shadow 0.2s;
          border: 2px solid white;
        ">
          🎮 3D Model<br/>
          <span style="font-size: 10px; opacity: 0.9;">${modelState.assetId}</span>
        </div>
      `;

      // Hover effect
      el.addEventListener('mouseenter', () => {
        const innerDiv = el.querySelector('div') as HTMLElement;
        if (innerDiv) {
          innerDiv.style.transform = 'scale(1.1) translateY(-2px)';
          innerDiv.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
        }
      });

      el.addEventListener('mouseleave', () => {
        const innerDiv = el.querySelector('div') as HTMLElement;
        if (innerDiv) {
          innerDiv.style.transform = 'scale(1) translateY(0)';
          innerDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        }
      });

      // Click handler para autofoco
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log(`🎯 Click en debug marker: ${stateKey}`);
        console.log(`📍 Enfocando en posición:`, position);
        this.focusOnModel(stateKey, {
          zoom: 18,
          pitch: 60,
          duration: 1000
        });
      });

      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom'
      })
        .setLngLat(position)
        .addTo(this.map);

      modelState.debugMarker = marker;

      console.log(`✅ Debug markers creados completamente:`, {
        sphereLayerId,
        sphereSourceId,
        markerPosition: position,
        altitude,
        clickable: true,
        markerAdded: true
      });

    } catch (error) {
      console.error(`❌ Error creando debug markers para ${stateKey}:`, error);
      console.error(`Stack trace:`, error instanceof Error ? error.stack : 'N/A');
    }
  }

  /**
   * Crea una esfera 3D de THREE.js para debug
   */
  /**
   * Crea una esfera 3D de THREE.js para debug
   */
  private createDebugSphere(stateKey: string, position: [number, number], altitude: number): void {
    const modelState = this.models.get(stateKey);
    console.log(`🔧 Intentando crear esfera 3D de debug para ${stateKey} en`, position, `altitud:`, altitude);
    if (!modelState) {
      console.warn(`⚠️ No se encontró modelState para ${stateKey}`);
      return;
    }

    const sphereLayerId = `debug-sphere-3d-${stateKey}`;

    // Layer custom 3D para la esfera (SIN source, igual que los modelos)
    if (!this.map.getLayer(sphereLayerId)) {
      this.map.addLayer({
        id: sphereLayerId,
        type: 'custom',
        renderingMode: '3d',
        render: (gl: WebGLRenderingContext, matrix: number[]) => {
          this.renderDebugSphere(gl, matrix, stateKey, position, altitude);
        }
      } as any);

      modelState.debugSphereLayerId = sphereLayerId;
      modelState.layerIds.push(sphereLayerId);

      console.log(`✅ Layer de esfera 3D creada: ${sphereLayerId}`);
    }
  }

  /**
   * Renderiza la esfera de debug usando THREE.js
   */
/**
   * Renderiza la esfera de debug usando THREE.js
   */
  private renderDebugSphere(
    gl: WebGLRenderingContext,
    matrix: number[],
    stateKey: string,
    position: [number, number],
    altitude: number
  ): void {
    if (!this.threeRenderer) return;

    const sphereKey = `debug-sphere-mesh-${stateKey}`;
    let sphereMesh = this.modelMeshes.get(sphereKey);
    
    if (!sphereMesh) {
      // Crear geometría de esfera (radio 5 metros)
      const geometry = new THREE.SphereGeometry(1, 32, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        transparent: true,
        opacity: 0.8,
        wireframe: false,
        side: THREE.DoubleSide
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      // Envolver el mesh en un Group para consistencia con modelMeshes
      sphereMesh = new THREE.Group();
      sphereMesh.add(mesh);
      
      this.threeScene.add(sphereMesh);
      this.modelMeshes.set(sphereKey, sphereMesh);
      
      console.log(`✅ Mesh de esfera debug creada para ${stateKey}`);
    }
  }

}
