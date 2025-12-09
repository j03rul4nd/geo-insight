import mapboxgl from 'mapbox-gl';
import type { DataPoint } from './types';
import type { VisualizationLayer } from '@/hooks/useVisualizationLayers';
import { ColorSchemeManager } from './ColorSchemeManager';
import { RulesEngine } from './RulesEngine';
import { LayerOrderManager } from './LayerOrderManager';
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
}

/**
 * Factory para creación y actualización de assets (markers, icons, images)
 * Maneja todos los tipos de renderizado excepto shapes/areas
 */
export class AssetFactory {
  private map: mapboxgl.Map;
  private markers: Map<string, mapboxgl.Marker>;
  private assetStates: Map<string, AssetState>;
  private colorManager: ColorSchemeManager;
  private rulesEngine: RulesEngine;
  private layerOrderManager: LayerOrderManager;
  private model3DManager: Model3DManager;

  constructor(
    map: mapboxgl.Map,
    markers: Map<string, mapboxgl.Marker>,
    assetStates: Map<string, AssetState>,
    colorManager: ColorSchemeManager,
    rulesEngine: RulesEngine,
    layerOrderManager: LayerOrderManager,
    model3DManager: Model3DManager
  ) {
    this.map = map;
    this.markers = markers;
    this.assetStates = assetStates;
    this.colorManager = colorManager;
    this.rulesEngine = rulesEngine;
    this.layerOrderManager = layerOrderManager;
    this.model3DManager = model3DManager;
  }

  // ============================================================================
  // CREACIÓN DE ASSETS
  // ============================================================================

  /**
   * Crea un asset según renderType
   */
  createAsset(
    stateKey: string,
    position: [number, number],
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    color: string
  ): void {
    console.log(`🎨 Creando asset tipo "${layer.renderType}" para ${stateKey}`);

    switch (layer.renderType) {
      case 'marker':
        this.createMarkerAsset(stateKey, position, layer, dataPoint, color);
        break;
      case 'icon':
        this.createIconAsset(stateKey, position, layer, dataPoint, color);
        break;
      case 'image':
        this.createImageAsset(stateKey, position, layer, dataPoint, color);
        break;
      case 'model3d':
          this.createModel3DAsset(stateKey, position, layer, dataPoint, color);
        break;
      default:
        console.warn(`⚠️ RenderType desconocido: ${layer.renderType}, usando marker`);
        this.createMarkerAsset(stateKey, position, layer, dataPoint, color);
    }
  }

  /**
   * Crea un marker circular básico
   */
  private createMarkerAsset(
    stateKey: string,
    position: [number, number],
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    color: string
  ): void {
    const size = 10 + layer.pointSize * 10;
    
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      opacity: ${layer.opacity};
    `;

    this.applyBorderAndShadow(el, layer);

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(position)
      .addTo(this.map);

    this.markers.set(stateKey, marker);
    
    const state = this.assetStates.get(stateKey);
    if (state) {
      state.element = el;
      state.markerId = stateKey;
    }

    this.layerOrderManager.registerHtmlElement(
      stateKey,
      el,
      layer.id,
      layer.order
    );

    console.log(`✅ Marker creado: ${stateKey}`);
  }

  /**
   * Crea un icono SVG
   */
  private createIconAsset(
    stateKey: string,
    position: [number, number],
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    color: string
  ): void {
    const iconName = layer.markerConfig?.iconName || 'circle';
    const size = 20 + layer.pointSize * 10;

    const el = document.createElement('div');
    el.className = 'custom-icon-marker';
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      color: ${color};
      cursor: pointer;
      transition: all 0.3s ease;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
      opacity: ${layer.opacity};
    `;
    
    // SVG genérico (círculo por defecto)
    el.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10"/>
      </svg>
    `;

    this.applyBorderAndShadow(el, layer);

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(position)
      .addTo(this.map);

    this.markers.set(stateKey, marker);
    
    const state = this.assetStates.get(stateKey);
    if (state) {
      state.element = el;
      state.markerId = stateKey;
    }

    this.layerOrderManager.registerHtmlElement(
      stateKey,
      el,
      layer.id,
      layer.order
    );

    console.log(`✅ Icon creado: ${stateKey}`);
  }

  /**
   * Crea una imagen custom
   */
  private createImageAsset(
    stateKey: string,
    position: [number, number],
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    color: string
  ): void {
    const size = 30 + layer.pointSize * 15;
    const imageUrl = layer.imageUrl || 'https://via.placeholder.com/40';

    const el = document.createElement('div');
    el.className = 'custom-image-marker';
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background-image: url(${imageUrl});
      background-size: cover;
      background-position: center;
      border: 2px solid ${color};
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
      opacity: ${layer.opacity};
    `;

    this.applyBorderAndShadow(el, layer);

    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(position)
      .addTo(this.map);

    this.markers.set(stateKey, marker);
    
    const state = this.assetStates.get(stateKey);
    if (state) {
      state.element = el;
      state.markerId = stateKey;
    }

    this.layerOrderManager.registerHtmlElement(
      stateKey,
      el,
      layer.id,
      layer.order
    );

    console.log(`✅ Image marker creado: ${stateKey}`);
  }

  // ============================================================================
  // ACTUALIZACIÓN DE ASSETS
  // ============================================================================

  /**
   * Actualiza la posición de un asset (mueve el marker)
   */
  updateAssetPosition(
    stateKey: string,
    position: [number, number],
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    color: string,
    valueRange: { min: number; max: number }
  ): void {
    const marker = this.markers.get(stateKey);
    if (!marker) {
      console.warn(`⚠️ No se encontró marker para ${stateKey}`);
      return;
    }
    if (layer.renderType === 'model3d') {
      this.model3DManager.createOrUpdate3DModel(stateKey, position, layer, dataPoint);
    }else{      
      marker.setLngLat(position);
      this.updateAssetStyle(stateKey, layer, dataPoint, color, valueRange);  
    }

    console.log(`📍 Asset movido: ${stateKey} → [${position[0].toFixed(6)}, ${position[1].toFixed(6)}]`);
  }

  /**
   * Actualiza el estilo visual de un asset (sin mover)
   */
  updateAssetStyle(
    stateKey: string,
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    baseColor: string,
    valueRange: { min: number; max: number }
  ): void {
    const state = this.assetStates.get(stateKey);
    if (!state?.element) {
      console.warn(`⚠️ No se encontró elemento para ${stateKey}`);
      return;
    }
    if (layer.renderType === 'model3d') {
      // Los modelos 3D se actualizan en updateAssetPosition
      return;
    }

    const evaluatedStyle = this.rulesEngine.evaluateDynamicRules(
      layer,
      dataPoint,
      valueRange
    );

    const el = state.element;

    // Ocultar si las reglas lo indican
    if (!evaluatedStyle.visible) {
      el.style.display = 'none';
      return;
    }

    el.style.display = 'block';

    const finalColor = this.colorManager.getPointColor(
      dataPoint,
      layer,
      'heatmap',
      valueRange,
      evaluatedStyle.colorScheme
    );
    
    const finalScale = evaluatedStyle.scale;

    // Actualizar según renderType
    switch (layer.renderType) {
      case 'marker':
        this.updateMarkerStyle(el, finalColor, finalScale, layer);
        break;
      case 'icon':
        this.updateIconStyle(el, finalColor, finalScale, layer);
        break;
      case 'image':
        this.updateImageStyle(el, finalColor, finalScale, layer);
        break;
    }

    el.style.opacity = `${layer.opacity}`;
  }

  private updateMarkerStyle(
    el: HTMLElement,
    color: string,
    scale: number,
    layer: VisualizationLayer
  ): void {
    const size = 10 + scale * 10;
    el.style.backgroundColor = color;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
  }

  private updateIconStyle(
    el: HTMLElement,
    color: string,
    scale: number,
    layer: VisualizationLayer
  ): void {
    const size = 20 + scale * 10;
    el.style.color = color;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    
    // Actualizar el SVG interno si existe
    const svg = el.querySelector('svg');
    if (svg) {
      svg.setAttribute('width', `${size}`);
      svg.setAttribute('height', `${size}`);
    }
  }

  private updateImageStyle(
    el: HTMLElement,
    color: string,
    scale: number,
    layer: VisualizationLayer
  ): void {
    const size = 30 + scale * 15;
    el.style.borderColor = color;
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
  }

  // ============================================================================
  // UTILIDADES DE ESTILO
  // ============================================================================

  private applyBorderAndShadow(
    element: HTMLElement,
    layer: VisualizationLayer
  ): void {
    // Aplicar borde personalizado
    if (layer.borderConfig) {
      const { width, color, style, opacity } = layer.borderConfig;
      const borderColor = this.colorManager.applyOpacityToColor(
        color,
        opacity || 1.0
      );
      element.style.border = `${width}px ${style} ${borderColor}`;
    }

    // Aplicar sombra personalizada
    if (layer.shadowConfig?.enabled) {
      const { color, blur, offsetX, offsetY } = layer.shadowConfig;
      element.style.boxShadow = `${offsetX}px ${offsetY}px ${blur}px ${color}`;
    }
  }

  // ============================================================================
  // LIMPIEZA
  // ============================================================================

  /**
   * Remueve un asset específico
   */
  removeAsset(stateKey: string): void {
    const marker = this.markers.get(stateKey);
    if (marker) {
      marker.remove();
      this.model3DManager.removeModel(stateKey);
      this.markers.delete(stateKey);
      console.log(`🗑️ Asset removido: ${stateKey}`);
    }
  }

  /**
   * Limpia todos los assets
   */
  clearAllAssets(): void {
    console.log(`🧹 Limpiando ${this.markers.size} assets...`);
    
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();
    this.model3DManager.cleanup();

    
    console.log('✅ Todos los assets limpiados');
  }


/**
   * Crea un modelo 3D con asset de respaldo
   */
  private createModel3DAsset(
    stateKey: string,
    position: [number, number],
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    color: string
  ): void {
    console.log(`🎮 Creando modelo 3D con asset de respaldo para ${stateKey}`);
    
    // 1. Crear el modelo 3D
    this.model3DManager.createOrUpdate3DModel(stateKey, position, layer, dataPoint);
    
    // 2. Crear asset de respaldo (marker semi-transparente)
    const size = 20 + layer.pointSize * 8;
    
    const el = document.createElement('div');
    el.className = 'model3d-fallback-marker';
    el.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: 2px solid white;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 8px rgba(0,0,0,0.4);
      opacity: ${Math.max(0.6, layer.opacity)};
      position: relative;
    `;

    // Añadir indicador visual de modelo 3D
    const icon = document.createElement('div');
    icon.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="white" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    `;
    el.appendChild(icon);

    // 3. Añadir evento de click para enfocar el modelo
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      console.log(`🎯 Click en fallback marker, enfocando modelo ${stateKey}`);
      
      this.model3DManager.focusOnModel(stateKey, {
        zoom: 19,
        pitch: 65,
        duration: 1200
      });
    });

    // 4. Añadir efecto hover
    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.2)';
      el.style.opacity = '1.0';
      el.style.boxShadow = '0 6px 12px rgba(0,0,0,0.6)';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.opacity = `${Math.max(0.6, layer.opacity)}`;
      el.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
    });

    this.applyBorderAndShadow(el, layer);

    // 5. Crear marker en el mapa
    const marker = new mapboxgl.Marker({ element: el })
      .setLngLat(position)
      .addTo(this.map);

    this.markers.set(stateKey, marker);
    
    // 6. Actualizar state
    const state = this.assetStates.get(stateKey);
    if (state) {
      state.element = el;
      state.markerId = stateKey;
    }

    // 7. Registrar en el sistema de ordenamiento
    this.layerOrderManager.registerHtmlElement(
      stateKey,
      el,
      layer.id,
      layer.order
    );
    
    console.log(`✅ Modelo 3D con fallback creado: ${stateKey}`);
    console.log(`   📍 Posición: [${position[0].toFixed(6)}, ${position[1].toFixed(6)}]`);
    console.log(`   🎨 Color: ${color}`);
    console.log(`   📦 Modelo URL: ${layer.modelUrl}`);
  }


}