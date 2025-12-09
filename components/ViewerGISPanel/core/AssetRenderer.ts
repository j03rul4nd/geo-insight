import mapboxgl from 'mapbox-gl';
import type { DataPoint } from './types';
import type { VisualizationLayer } from '@/hooks/useVisualizationLayers';
import { TrailManager } from './TrailManager';
import { ColorSchemeManager } from './ColorSchemeManager';
import { RulesEngine } from './RulesEngine';
import { LayerOrderManager } from './LayerOrderManager';
import { AssetFactory } from './AssetFactory';
import { TrailColorRulesEngine, createCommonRules } from './TrailColorRulesEngine';
import { Model3DManager } from './Model3DManager';

interface AssetState {
  layerId: string;
  assetId: string;
  currentPosition: [number, number];
  lastUpdate: number;
  trail: [number, number][];
  sourceId: string;
  markerId?: string;
  element?: HTMLElement;
  currentPoint: DataPoint;
  hasTrail?: boolean;
  is3DModel?: boolean;
}

/**
 * AssetRenderer - Gestor unificado de renderizado de assets
 * 
 * Características:
 * - Renderizado de assets estáticos, móviles y áreas
 * - Sistema de trails con reglas de color jerárquicas
 * - Soporte completo para modelos 3D (GLTF/GLB)
 * - Integración con Model3DManager para transformaciones avanzadas
 * - Sincronización automática de visibilidad entre markers, trails y modelos 3D
 */
export class AssetRenderer {
  private map: mapboxgl.Map;
  private assetStates: Map<string, AssetState>;
  private markers: Map<string, mapboxgl.Marker>;
  private trailManager: TrailManager;
  private colorManager: ColorSchemeManager;
  private rulesEngine: RulesEngine;
  private layerOrderManager: LayerOrderManager;
  private assetFactory: AssetFactory;
  private activeLayerIds: Set<string>;
  private model3DManager: Model3DManager;
  private trailColorRulesEngine: TrailColorRulesEngine;

  constructor(
    map: mapboxgl.Map,
    assetStates: Map<string, AssetState>,
    markers: Map<string, mapboxgl.Marker>,
    colorManager: ColorSchemeManager,
    rulesEngine: RulesEngine,
    layerOrderManager: LayerOrderManager,
    assetFactory: AssetFactory,
    activeLayerIds: Set<string>,
    model3DManager: Model3DManager
  ) {
    this.map = map;
    this.assetStates = assetStates;
    this.markers = markers;
    this.colorManager = colorManager;
    this.rulesEngine = rulesEngine;
    this.layerOrderManager = layerOrderManager;
    this.assetFactory = assetFactory;
    this.activeLayerIds = activeLayerIds;
    this.model3DManager = model3DManager;

    // Inicializar sistema de reglas de color
    this.trailColorRulesEngine = new TrailColorRulesEngine();
    this.initializeTrailColorRules();

    // Crear TrailManager con el motor de reglas
    this.trailManager = new TrailManager(map, this.trailColorRulesEngine);

    console.log('✨ AssetRenderer inicializado con sistema de reglas de color y Model3D');
  }

  // ============================================================================
  // INICIALIZACIÓN DEL SISTEMA DE REGLAS
  // ============================================================================

  private initializeTrailColorRules(): void {
    console.log('🎨 Configurando reglas de color para trails...');

    // Configurar gradiente histórico
    this.trailColorRulesEngine.setGradientConfig({
      enabled: true,
      fadeOldSegments: true,
      fadeStartAge: 2 * 60 * 1000,
      fadeEndAge: 5 * 60 * 1000,
      minOpacity: 0.3
    });

    // Registrar reglas comunes
    const commonRules = createCommonRules();
    commonRules.forEach(rule => {
      this.trailColorRulesEngine.registerRule(rule);
    });

    console.log('✅ Sistema de reglas de color configurado');
    this.trailColorRulesEngine.printDebugInfo();
  }

  public addTrailColorRule(rule: any): void {
    this.trailColorRulesEngine.registerRule(rule);
    console.log(`✅ Regla personalizada agregada: ${rule.name}`);
  }

  public setTrailColorRuleEnabled(ruleId: string, enabled: boolean): void {
    this.trailColorRulesEngine.setRuleEnabled(ruleId, enabled);
  }

  public refreshAllTrailColors(layers: Map<string, VisualizationLayer>): void {
    console.log('🔄 Re-evaluando colores de todos los trails...');
    
    this.trailManager.reevaluateAllTrails(
      layers,
      (stateKey) => this.getBaseColorForAsset(stateKey)
    );
    
    console.log('✅ Trails actualizados');
  }

  private getBaseColorForAsset(stateKey: string): string {
    const state = this.assetStates.get(stateKey);
    if (!state) return '#ffffff';
    return '#3b82f6';
  }

  public getTrailColorRulesEngine(): TrailColorRulesEngine {
    return this.trailColorRulesEngine;
  }

  // ============================================================================
  // RENDERIZADO DE MOVING ASSETS (Con soporte 3D completo)
  // ============================================================================

  /**
   * Renderiza assets móviles con trails y modelos 3D
   */
  renderMovingAssets(
    layer: VisualizationLayer,
    dataPoints: DataPoint[],
    colorMode: 'heatmap' | 'sensor-type',
    valueRange: { min: number; max: number }
  ): void {
    console.log(`🚗 Renderizando ${dataPoints.length} assets móviles para "${layer.name}"`);

    try {
      this.syncVisibility(layer);
      const pointsBySensor = this.groupBySensorId(dataPoints);

      console.log(`📊 Sensores detectados: ${pointsBySensor.size}`);

      pointsBySensor.forEach((points, sensorId) => {
        try {
          const stateKey = `${layer.id}-${sensorId}`;
          const latestPoint = points[points.length - 1];
          
          const position = this.extractPosition(latestPoint);
          if (!position) {
            console.warn(`⚠️ Posición inválida para sensor ${sensorId}`);
            return;
          }

          const color = this.getPointColor(latestPoint, layer, colorMode, valueRange);
          const existingState = this.assetStates.get(stateKey);

          if (existingState) {
            this.updateExistingMovingAsset(
              stateKey,
              existingState,
              position,
              layer,
              latestPoint,
              color,
              valueRange
            );
          } else {
            console.log(`✨ Nuevo sensor detectado: ${sensorId} con ${points.length} puntos históricos`);
            
            this.createNewMovingAsset(
              stateKey,
              sensorId,
              position,
              layer,
              latestPoint,
              color,
              points
            );
          }
        } catch (error) {
          console.error(`❌ Error procesando sensor ${sensorId}:`, error);
        }
      });

      this.cleanupOrphanedAssets(layer.id, pointsBySensor);

    } catch (error) {
      console.error(`❌ Error en renderMovingAssets para layer "${layer.name}":`, error);
    }
  }

  /**
   * Crea un nuevo asset móvil (marker/icon/image O modelo 3D)
   */
  private createNewMovingAsset(
    stateKey: string,
    sensorId: string,
    position: [number, number],
    layer: VisualizationLayer,
    latestPoint: DataPoint,
    color: string,
    allPoints: DataPoint[]
  ): void {
    try {
      console.log(`✨ Creando nuevo asset móvil: ${stateKey}`);
      console.log(`   📦 Puntos históricos disponibles: ${allPoints.length}`);
      console.log(`   🎨 Tipo de render: ${layer.renderType}`);

      const newState: AssetState = {
        layerId: layer.id,
        assetId: sensorId,
        currentPosition: position,
        lastUpdate: Date.now(),
        trail: [],
        sourceId: `trail-${stateKey}`,
        currentPoint: latestPoint,
        hasTrail: false,
        is3DModel: layer.renderType === 'model3d'
      };

      this.assetStates.set(stateKey, newState);
      
      // Crear el asset visual según el tipo
      if (layer.renderType === 'model3d') {
        // ============================================================
        // RENDERIZADO 3D
        // ============================================================
        this.create3DAsset(stateKey, position, layer, latestPoint);
      } else {
        // ============================================================
        // RENDERIZADO 2D (marker, icon, image)
        // ============================================================
        this.assetFactory.createAsset(stateKey, position, layer, latestPoint, color);
      }

      // Crear trail si está habilitado (aplica para ambos tipos)
      if (layer.enabled && layer.showTrail) {
        console.log(`🎨 Inicializando trail con ${allPoints.length} puntos históricos...`);
        
        this.initializeAssetTrailWithHistory(
          stateKey,
          layer,
          latestPoint,
          color,
          allPoints
        );
      } else {
        console.log(`⏸️ Trail deshabilitado para esta layer`);
      }

    } catch (error) {
      console.error(`❌ Error creando asset ${stateKey}:`, error);
      this.assetStates.delete(stateKey);
    }
  }

  /**
   * Crea un asset 3D usando Model3DManager
   */
  private create3DAsset(
    stateKey: string,
    position: [number, number],
    layer: VisualizationLayer,
    point: DataPoint
  ): void {
    console.log(`🎮 Creando modelo 3D: ${stateKey}`);

    if (!layer.modelUrl) {
      console.error(`❌ No hay modelUrl configurado para layer ${layer.name}`);
      return;
    }

    this.model3DManager.createOrUpdate3DModel(stateKey, position, layer, point);

    console.log(`✅ Modelo 3D creado:`, {
      modelUrl: layer.modelUrl,
      scale: layer.model3dConfig?.scale,
      rotation: layer.model3dConfig?.rotation,
      autoRotate: layer.model3dConfig?.autoRotate,
    });
  }

  /**
   * Actualiza un asset móvil existente
   */
  private updateExistingMovingAsset(
    stateKey: string,
    existingState: AssetState,
    position: [number, number],
    layer: VisualizationLayer,
    latestPoint: DataPoint,
    color: string,
    valueRange: { min: number; max: number }
  ): void {
    try {
      const positionChanged = 
        existingState.currentPosition[0] !== position[0] ||
        existingState.currentPosition[1] !== position[1];

      if (positionChanged) {
        console.log(`📍 Movimiento detectado para ${stateKey}`);
        
        // Actualizar según tipo de asset
        if (existingState.is3DModel && layer.renderType === 'model3d') {
          // Actualizar modelo 3D
          this.model3DManager.createOrUpdate3DModel(stateKey, position, layer, latestPoint);
        } else if (!existingState.is3DModel) {
          // Actualizar marker/icon/image
          this.assetFactory.updateAssetPosition(
            stateKey,
            position,
            layer,
            latestPoint,
            color,
            valueRange
          );
        }

        // Actualizar trail (aplica para todos los tipos)
        if (layer.enabled && layer.showTrail) {
          this.updateAssetTrail(stateKey, position, layer, latestPoint, color);
        }
      } else {
        // Sin movimiento, solo actualizar estilo
        if (!existingState.is3DModel) {
          this.assetFactory.updateAssetStyle(
            stateKey,
            layer,
            latestPoint,
            color,
            valueRange
          );
        }

        // Actualizar estilo del trail si existe
        if (existingState.hasTrail && layer.enabled && layer.showTrail) {
          this.updateTrailStyleSafely(stateKey, layer, latestPoint, color);
        }
      }

      existingState.currentPosition = position;
      existingState.currentPoint = latestPoint;
      existingState.lastUpdate = Date.now();

    } catch (error) {
      console.error(`❌ Error actualizando asset ${stateKey}:`, error);
      this.attemptAssetRecovery(stateKey, position, layer, latestPoint, color);
    }
  }

  /**
   * Inicializa trail con histórico completo
   */
  private initializeAssetTrailWithHistory(
    stateKey: string,
    layer: VisualizationLayer,
    latestPoint: DataPoint,
    color: string,
    allPoints: DataPoint[]
  ): void {
    try {
      console.log(`🎨 Inicializando trail con histórico para ${stateKey}`);

      if (this.trailManager.hasActiveTrail(stateKey)) {
        console.warn(`⚠️ Trail existente detectado para ${stateKey}, eliminando...`);
        this.removeAssetTrailSafely(stateKey);
      }

      if (!allPoints || allPoints.length === 0) {
        console.warn(`⚠️ Sin datos históricos para ${stateKey}`);
        const position = this.extractPosition(latestPoint);
        if (position) {
          this.trailManager.updateTrail(stateKey, position, layer, latestPoint, color);
          this.finalizeTrailInitialization(stateKey, layer);
        }
        return;
      }

      console.log(`📊 Procesando ${allPoints.length} puntos históricos`);

      const sortedPoints = [...allPoints].sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      let validPoints = 0;
      let skippedPoints = 0;

      sortedPoints.forEach((point, index) => {
        try {
          const position = this.extractPosition(point);

          if (!position) {
            skippedPoints++;
            return;
          }

          const [lng, lat] = position;
          if (!this.isValidCoordinate(lng, lat)) {
            skippedPoints++;
            return;
          }

          const pointColor = this.getPointColor(
            point,
            layer,
            'heatmap',
            this.calculateValueRangeForPoint(point)
          );

          this.trailManager.updateTrail(stateKey, position, layer, point, pointColor);
          validPoints++;

          if ((index + 1) % 10 === 0 || index === sortedPoints.length - 1) {
            console.log(`  ✓ Procesados ${index + 1}/${sortedPoints.length} puntos`);
          }

        } catch (pointError) {
          skippedPoints++;
          console.error(`❌ Error procesando punto ${index}:`, pointError);
        }
      });

      console.log(`✅ Trail histórico creado:`);
      console.log(`   - Puntos válidos: ${validPoints}`);
      console.log(`   - Puntos omitidos: ${skippedPoints}`);

      this.finalizeTrailInitialization(stateKey, layer);

    } catch (error) {
      console.error(`❌ Error inicializando trail para ${stateKey}:`, error);
      this.removeAssetTrailSafely(stateKey);
      
      const state = this.assetStates.get(stateKey);
      if (state) {
        state.hasTrail = false;
      }
    }
  }

  private finalizeTrailInitialization(stateKey: string, layer: VisualizationLayer): void {
    try {
      const trailLayerId = this.trailManager.getTrailLayerId(stateKey);
      const trailSourceId = this.trailManager.getTrailSourceId(stateKey);

      if (!trailLayerId || !trailSourceId) {
        throw new Error(`Trail IDs no disponibles para ${stateKey}`);
      }

      if (!this.map.getLayer(trailLayerId)) {
        throw new Error(`Layer ${trailLayerId} no encontrada en el mapa`);
      }

      this.layerOrderManager.registerMapboxLayer(
        trailLayerId,
        'trail',
        trailSourceId,
        layer.id,
        layer.order
      );

      const state = this.assetStates.get(stateKey);
      if (state) {
        state.hasTrail = true;
      }

      console.log(`✅ Trail histórico registrado: ${trailLayerId}`);

    } catch (error) {
      console.error(`❌ Error finalizando trail para ${stateKey}:`, error);
      throw error;
    }
  }

  // ============================================================================
  // SINCRONIZACIÓN DE VISIBILIDAD (2D + 3D + Trails)
  // ============================================================================

  /**
   * Sincroniza la visibilidad de todos los componentes del asset
   * (markers 2D, modelos 3D y trails)
   */
  private syncVisibility(layer: VisualizationLayer): void {
    const shouldShowTrails = layer.enabled && layer.showTrail;
    
    this.assetStates.forEach((state, stateKey) => {
      if (state.layerId !== layer.id) return;

      try {
        // Sincronizar trails
        if (state.hasTrail) {
          this.trailManager.setTrailVisibility(stateKey, shouldShowTrails);
        }

        // Sincronizar según tipo de asset
        if (state.is3DModel && layer.renderType === 'model3d') {
          // Controlar visibilidad del modelo 3D
          this.model3DManager.setModelVisibility(stateKey, layer.enabled);
        } else if (state.element) {
          // Controlar visibilidad del marker HTML
          state.element.style.display = layer.enabled ? 'block' : 'none';
        }
        
      } catch (error) {
        console.error(`❌ Error sincronizando visibilidad para ${stateKey}:`, error);
      }
    });
  }

  // ============================================================================
  // CONTROL AVANZADO DE MODELOS 3D
  // ============================================================================

  /**
   * Actualiza la rotación de un modelo 3D
   */
  public updateModel3DRotation(stateKey: string, rotation: [number, number, number]): void {
    this.model3DManager.updateModelRotation(stateKey, rotation);
  }

  /**
   * Actualiza la escala de un modelo 3D
   */
  public updateModel3DScale(stateKey: string, scale: [number, number, number]): void {
    this.model3DManager.updateModelScale(stateKey, scale);
  }

  /**
   * Actualiza la translación de un modelo 3D
   */
  public updateModel3DTranslate(stateKey: string, translate: [number, number, number]): void {
    this.model3DManager.updateModelTranslate(stateKey, translate);
  }

  /**
   * Enfoca la cámara en un modelo 3D
   */
  public focusOnModel3D(stateKey: string, options?: {
    zoom?: number;
    bearing?: number;
    pitch?: number;
    duration?: number;
  }): void {
    this.model3DManager.focusOnModel(stateKey, options);
  }

  /**
   * Activa/desactiva auto-rotate para un modelo 3D
   */
  public setModel3DAutoRotate(stateKey: string, enabled: boolean, offset?: number): void {
    this.model3DManager.updateModelAutoRotate(stateKey, enabled, offset);
  }

  /**
   * Obtiene el estado de un modelo 3D
   */
  public getModel3DState(stateKey: string) {
    return this.model3DManager.getModelState(stateKey);
  }

  /**
   * Obtiene estadísticas de los modelos 3D activos
   */
  public getModel3DStats() {
    return this.model3DManager.getStats();
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  private groupBySensorId(points: DataPoint[]): Map<string, DataPoint[]> {
    const map = new Map<string, DataPoint[]>();
    
    points.forEach(point => {
      const existing = map.get(point.sensorId) || [];
      existing.push(point);
      map.set(point.sensorId, existing);
    });

    map.forEach((pts) => {
      pts.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    });

    return map;
  }

  private extractPosition(point: DataPoint): [number, number] | null {
    const x = point.metadata?.x;
    const y = point.metadata?.y;
    
    if (typeof x !== 'number' || typeof y !== 'number') return null;
    
    return [y, x];
  }

  private getPointColor(
    point: DataPoint,
    layer: VisualizationLayer,
    colorMode: 'heatmap' | 'sensor-type',
    valueRange: { min: number; max: number }
  ): string {
    const evaluatedStyle = this.rulesEngine.evaluateDynamicRules(layer, point, valueRange);
    if (!evaluatedStyle.visible) return 'transparent';
    
    return this.colorManager.getPointColor(
      point,
      layer,
      colorMode,
      valueRange,
      evaluatedStyle.colorScheme
    );
  }

  private calculateValueRangeForPoint(point: DataPoint): { min: number; max: number } {
    const value = point.value || 0;
    return {
      min: Math.min(value - 10, 0),
      max: Math.max(value + 10, 100)
    };
  }

  private isValidCoordinate(lng: number, lat: number): boolean {
    return (
      typeof lng === 'number' &&
      typeof lat === 'number' &&
      !isNaN(lng) &&
      !isNaN(lat) &&
      lng >= -180 &&
      lng <= 180 &&
      lat >= -90 &&
      lat <= 90 &&
      isFinite(lng) &&
      isFinite(lat)
    );
  }

  // ============================================================================
  // LIMPIEZA Y MANTENIMIENTO
  // ============================================================================

  private removeAssetTrailSafely(stateKey: string): void {
    this.trailManager.removeTrail(stateKey);
  }

  private cleanupOrphanedAssets(layerId: string, activeSensors: Map<string, DataPoint[]>): void {
    const keysToRemove: string[] = [];

    this.assetStates.forEach((state, stateKey) => {
      if (state.layerId !== layerId) return;

      const sensorId = state.assetId;
      if (!activeSensors.has(sensorId)) {
        keysToRemove.push(stateKey);
      }
    });

    keysToRemove.forEach(key => {
      console.log(`🗑️ Limpiando asset huérfano: ${key}`);
      
      const state = this.assetStates.get(key);
      
      // Limpiar trail
      if (state?.hasTrail) {
        this.removeAssetTrailSafely(key);
      }

      // Limpiar modelo 3D si aplica
      if (state?.is3DModel) {
        this.model3DManager.removeModel(key);
      }

      // Limpiar marker 2D si aplica
      if (!state?.is3DModel) {
        this.assetFactory.removeAsset(key);
      }

      this.assetStates.delete(key);
    });

    if (keysToRemove.length > 0) {
      console.log(`✅ Limpiados ${keysToRemove.length} assets huérfanos`);
    }
  }

  /**
   * Limpia todos los assets de una layer
   */
  public cleanupLayer(layerId: string): void {
    console.log(`🧹 Limpiando layer: ${layerId}`);

    const keysToRemove: string[] = [];

    this.assetStates.forEach((state, stateKey) => {
      if (state.layerId === layerId) {
        keysToRemove.push(stateKey);
      }
    });

    keysToRemove.forEach(key => {
      const state = this.assetStates.get(key);
      
      if (state?.hasTrail) {
        this.removeAssetTrailSafely(key);
      }

      if (state?.is3DModel) {
        this.model3DManager.removeModel(key);
      } else {
        this.assetFactory.removeAsset(key);
      }

      this.assetStates.delete(key);
    });

    console.log(`✅ Layer limpiada: ${keysToRemove.length} assets removidos`);
  }

  /**
   * Limpieza completa de todos los recursos
   */
  public cleanup(): void {
    console.log('🧹 Limpieza completa de AssetRenderer...');

    // Limpiar trails
    this.assetStates.forEach((state, key) => {
      if (state.hasTrail) {
        this.removeAssetTrailSafely(key);
      }
    });

    // Limpiar modelos 3D
    this.model3DManager.cleanup();

    // Limpiar assets 2D
    this.assetStates.forEach((state, key) => {
      if (!state.is3DModel) {
        this.assetFactory.removeAsset(key);
      }
    });

    this.assetStates.clear();
    console.log('✅ Limpieza completada');
  }

  // ============================================================================
  // STUBS PARA OTROS TIPOS DE ASSETS
  // ============================================================================

  private updateAssetTrail(...args: any[]): void {
    // Implementar según necesidad
  }

  private updateTrailStyleSafely(...args: any[]): void {
    // Implementar según necesidad
  }

  private attemptAssetRecovery(...args: any[]): void {
    // Implementar según necesidad
  }

  public renderStaticAssets(...args: any[]): void {
    // Implementar para assets estáticos
  }

  public renderAreaAssets(...args: any[]): void {
    // Implementar para assets de área
  }

  // ============================================================================
  // QUERIES Y ESTADÍSTICAS
  // ============================================================================

  /**
   * Obtiene estadísticas de renderizado
   */
  public getStats() {
    const all = Array.from(this.assetStates.values());
    const model3DStats = this.model3DManager.getStats();

    return {
      totalAssets: all.length,
      assets2D: all.filter(s => !s.is3DModel).length,
      assets3D: all.filter(s => s.is3DModel).length,
      assetsWithTrails: all.filter(s => s.hasTrail).length,
      model3DStats,
    };
  }

  /**
   * Verifica si un asset está cargado como modelo 3D
   */
  public isModel3D(stateKey: string): boolean {
    const state = this.assetStates.get(stateKey);
    return state?.is3DModel ?? false;
  }

  /**
   * Obtiene información de un asset
   */
  public getAssetState(stateKey: string): AssetState | undefined {
    return this.assetStates.get(stateKey);
  }
}