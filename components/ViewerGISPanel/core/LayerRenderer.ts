import mapboxgl from 'mapbox-gl';
import type { DataPoint } from './types';
import type { VisualizationLayer } from '@/hooks/useVisualizationLayers';
import { TrailManager } from "./TrailManager";
import { ColorSchemeManager } from './ColorSchemeManager';
import { RulesEngine } from './RulesEngine';
import { LayerOrderManager } from './LayerOrderManager';
import { AssetFactory } from './AssetFactory';
import { AssetRenderer } from './AssetRenderer';
import { TrailColorRulesEngine, createCommonRules } from './TrailColorRulesEngine';
import { Model3DManager } from './Model3DManager';
// ==========================================
// TIPOS
// ==========================================

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
}

/**
 * Gestor avanzado de layers con soporte completo para:
 * - Assets móviles con trails y sistema de reglas de color
 * - Assets estáticos
 * - Áreas (shapes)
 * - Múltiples tipos de renderizado (marker, icon, image, model3d, shape)
 */
export class LayerRenderer {
  private map: mapboxgl.Map;
  private activeLayerIds: Set<string> = new Set();
  private assetStates: Map<string, AssetState> = new Map();
  private markers: Map<string, mapboxgl.Marker> = new Map();
  
  // Managers
  private colorManager: ColorSchemeManager;
  private rulesEngine: RulesEngine;
  private layerOrderManager: LayerOrderManager; 
  private assetFactory: AssetFactory;
  private model3DManager: Model3DManager;
  
  // 🎨 Nuevo: Sistema de reglas de color para trails
  private trailColorRulesEngine: TrailColorRulesEngine;
  private trailManager: TrailManager;
  private assetRenderer: AssetRenderer;

  constructor(map: mapboxgl.Map) {
    this.map = map;
    
    // Inicializar managers básicos
    this.colorManager = new ColorSchemeManager();
    this.rulesEngine = new RulesEngine(); 
    this.layerOrderManager = new LayerOrderManager(map);
    this.model3DManager = new Model3DManager(map);
    
    // 🎨 Inicializar sistema de reglas de color PRIMERO
    this.trailColorRulesEngine = new TrailColorRulesEngine();
    this.initializeTrailColorRules();
    
    // Inicializar TrailManager CON el motor de reglas
    this.trailManager = new TrailManager(map, this.trailColorRulesEngine);
    
    // Inicializar AssetFactory
    this.assetFactory = new AssetFactory(
      this.map,
      this.markers,
      this.assetStates,
      this.colorManager,
      this.rulesEngine,
      this.layerOrderManager,
      this.model3DManager
    );
    
    // Inicializar AssetRenderer con todos los componentes necesarios
    this.assetRenderer = new AssetRenderer(
      this.map,
      this.assetStates,
      this.markers,
      this.colorManager,
      this.rulesEngine,
      this.layerOrderManager,
      this.assetFactory,
      this.activeLayerIds,
      this.model3DManager
    );

    console.log('✨ LayerRenderer inicializado con sistema de reglas de color');
  }

  // ============================================================================
  // INICIALIZACIÓN DEL SISTEMA DE REGLAS
  // ============================================================================

  /**
   * Inicializa las reglas de color para trails
   * Puedes personalizar esto según tus necesidades
   */
  private initializeTrailColorRules(): void {
    console.log('🎨 Configurando reglas de color para trails en LayerRenderer...');

    // 1. Configurar gradiente histórico
    this.trailColorRulesEngine.setGradientConfig({
      enabled: true,
      fadeOldSegments: true,
      fadeStartAge: 2 * 60 * 1000,  // 2 minutos
      fadeEndAge: 5 * 60 * 1000,    // 5 minutos
      minOpacity: 0.3
    });

    // 2. Registrar reglas comunes predefinidas
    const commonRules = createCommonRules();
    commonRules.forEach(rule => {
      this.trailColorRulesEngine.registerRule(rule);
    });

    console.log('✅ Sistema de reglas de color configurado en LayerRenderer');
    this.trailColorRulesEngine.printDebugInfo();
  }

  // ============================================================================
  // API PÚBLICA - GESTIÓN DE REGLAS
  // ============================================================================

  /**
   * Obtiene el motor de reglas para acceso externo
   * Útil para agregar reglas personalizadas desde componentes React
   */
  public getTrailColorRulesEngine(): TrailColorRulesEngine {
    return this.trailColorRulesEngine;
  }

  /**
   * Método público para agregar reglas personalizadas
   * 
   * @example
   * ```typescript
   * layerRenderer.addTrailColorRule({
   *   id: 'my-custom-rule',
   *   name: 'Mi Regla Personalizada',
   *   priority: 750,
   *   applicationType: 'current-segment',
   *   condition: (point) => point.metadata?.temperature > 80,
   *   getColor: () => '#ff0000'
   * });
   * ```
   */
  public addTrailColorRule(rule: any): void {
    this.trailColorRulesEngine.registerRule(rule);
    console.log(`✅ Regla personalizada agregada: ${rule.name}`);
  }

  /**
   * Activa/desactiva una regla de color específica
   */
  public setTrailColorRuleEnabled(ruleId: string, enabled: boolean): void {
    this.trailColorRulesEngine.setRuleEnabled(ruleId, enabled);
    console.log(`${enabled ? '✅' : '⏸️'} Regla ${ruleId}: ${enabled ? 'activada' : 'desactivada'}`);
  }

  /**
   * Remueve una regla de color
   */
  public removeTrailColorRule(ruleId: string): void {
    this.trailColorRulesEngine.removeRule(ruleId);
    console.log(`🗑️ Regla ${ruleId} removida`);
  }

  /**
   * Re-evalúa todos los trails con las reglas actuales
   * Útil después de cambiar reglas dinámicamente
   */
  public refreshAllTrailColors(layers: VisualizationLayer[]): void {
    console.log('🔄 Re-evaluando colores de todos los trails...');
    
    const layersMap = new Map(layers.map(l => [l.id, l]));
    
    this.assetRenderer.refreshAllTrailColors(layersMap);
    
    console.log('✅ Trails actualizados');
  }

  /**
   * Configura el gradiente temporal para trails
   */
  public configureTrailGradient(config: {
    enabled: boolean;
    fadeOldSegments?: boolean;
    fadeStartAge?: number;
    fadeEndAge?: number;
    minOpacity?: number;
  }): void {
    this.trailColorRulesEngine.setGradientConfig(config);
    console.log('🎨 Configuración de gradiente actualizada:', config);
  }

  /**
   * Obtiene información de debug sobre las reglas activas
   */
  public getTrailRulesDebugInfo(): any {
    return this.trailColorRulesEngine.getRulesInfo();
  }

  // ============================================================================
  // ACTUALIZACIÓN DE LAYERS
  // ============================================================================

  /**
   * Actualiza todas las layers en el mapa
   * 
   * FLUJO:
   * 1. Ordena layers por z-index
   * 2. Limpia assets obsoletos
   * 3. Para cada layer:
   *    - Filtra dataPoints que pertenecen a esa layer
   *    - Renderiza según assetType (moving/static/area)
   * 4. Reorganiza z-index de todas las layers
   */
  updateLayers(
    layers: VisualizationLayer[],
    dataPoints: DataPoint[],
    colorMode: 'heatmap' | 'sensor-type',
    valueRange: { min: number; max: number }
  ): void {
    console.log('🎨 LayerRenderer: Actualizando layers:', layers.length);
    console.log('📊 Total dataPoints recibidos:', dataPoints.length);

    // Ordenar layers por order (menor = bottom, mayor = top)
    const sortedLayers = [...layers].sort((a, b) => a.order - b.order);
    
    console.log('📋 Orden de renderizado:');
    sortedLayers.forEach((layer, idx) => {
      console.log(
        `  ${idx + 1}. [${layer.assetType}] ${layer.name} ` +
        `(order: ${layer.order}) ${layer.enabled ? '✓' : '✗'}`
      );
    });

    // Limpiar layers/assets obsoletos
    this.cleanupObsolete(sortedLayers);

    // Renderizar cada layer según su tipo
    sortedLayers.forEach((layer, index) => {
      if (!layer.enabled) {
        console.log(`⏸️ Layer deshabilitada: ${layer.name}`);
        this.hideLayer(layer);
        return;
      }

      // 🎯 Filtrar puntos que pertenecen a esta layer específica
      const filteredPoints = this.filterPointsForLayer(dataPoints, layer);
      
      console.log(`🔍 Layer "${layer.name}": ${filteredPoints.length} puntos filtrados de ${dataPoints.length} totales`);

      if (filteredPoints.length === 0) {
        console.log(`⚠️ Layer "${layer.name}" sin datos, omitiendo...`);
        return;
      }

      // 🎯 Renderizar según assetType
      switch (layer.assetType) {
        case 'moving':
          // El AssetRenderer maneja internamente las reglas de color
          this.renderMovingAssets(layer, filteredPoints, colorMode, valueRange);
          break;
          
        case 'point':
          this.renderStaticAssets(layer, filteredPoints, colorMode, valueRange);
          break;
          
        case 'area':
          this.renderAreaAssets(layer, filteredPoints, colorMode, valueRange);
          break;
          
        default:
          console.warn(`⚠️ AssetType desconocido: ${layer.assetType}`);
      }
    });

    // Reorganizar z-index de todas las layers
    this.reorganizeLayerOrder(sortedLayers);
    this.layerOrderManager.reorganizeAll(sortedLayers);

    console.log('✅ Actualización de layers completada');
  }

  // ============================================================================
  // RENDERIZADO POR TIPO DE ASSET
  // ============================================================================

  /**
   * Renderiza assets móviles con trails
   * Delega al AssetRenderer que maneja el sistema de reglas
   */
  private renderMovingAssets(
    layer: VisualizationLayer,
    dataPoints: DataPoint[],
    colorMode: 'heatmap' | 'sensor-type',
    valueRange: { min: number; max: number }
  ): void {
    this.assetRenderer.renderMovingAssets(layer, dataPoints, colorMode, valueRange);
  }

  /**
   * Renderiza assets estáticos (sin movimiento)
   */
  private renderStaticAssets(
    layer: VisualizationLayer,
    dataPoints: DataPoint[],
    colorMode: 'heatmap' | 'sensor-type',
    valueRange: { min: number; max: number }
  ): void {
    this.assetRenderer.renderStaticAssets(layer, dataPoints, colorMode, valueRange);
  }

  /**
   * Renderiza áreas (shapes/polígonos)
   */
  private renderAreaAssets(
    layer: VisualizationLayer,
    dataPoints: DataPoint[],
    colorMode: 'heatmap' | 'sensor-type',
    valueRange: { min: number; max: number }
  ): void {
    this.assetRenderer.renderAreaAssets(layer, dataPoints, colorMode, valueRange);
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  private hideLayer(layer: VisualizationLayer): void {
    // Ocultar todos los assets de esta layer
    this.assetStates.forEach((state, stateKey) => {
      if (state.layerId === layer.id) {
        // Ocultar marker
        const marker = this.markers.get(stateKey);
        if (marker && state.element) {
          state.element.style.display = 'none';
        }
        
        // Ocultar trail también
        this.trailManager.setTrailVisibility(stateKey, false);
      }
    });
    
    // Ocultar shape layers
    const areaLayerId = `area-layer-${layer.id}`;
    if (this.map.getLayer(areaLayerId)) {
      this.map.setLayoutProperty(areaLayerId, 'visibility', 'none');
    }
    if (layer.renderType === 'model3d') {
      this.model3DManager.setLayerModelsVisibility(layer.id, false);
    }
  }

  private cleanupObsolete(currentLayers: VisualizationLayer[]): void {
    const currentLayerIds = new Set(currentLayers.map(l => l.id));
    
    // Remover assets obsoletos
    this.assetStates.forEach((state, stateKey) => {
      if (!currentLayerIds.has(state.layerId)) {
        this.removeAsset(stateKey);
      }
    });
  }

  private removeAsset(stateKey: string): void {
    // 1. Remover marker
    const marker = this.markers.get(stateKey);
    if (marker) {
      marker.remove();
      this.markers.delete(stateKey);
    }

    // 2. Desregistrar del LayerOrderManager
    this.layerOrderManager.unregisterHtmlElement(stateKey);
    
    // 3. Obtener y desregistrar el trail ANTES de eliminarlo
    const trailLayerId = this.trailManager.getTrailLayerId(stateKey);
    if (trailLayerId) {
      this.layerOrderManager.unregisterMapboxLayer(trailLayerId);
    }

    // 4. Eliminar el trail (esto limpia automáticamente los colores históricos)
    this.trailManager.removeTrail(stateKey);

    // 5. Limpiar estado
    this.assetStates.delete(stateKey);
  }

  /**
   * Limpia todos los assets y trails
   */
  clearAll(): void {
    console.log('🧹 Limpiando todos los assets y trails');
    
    // Limpiar trails (esto también limpia los colores históricos)
    this.trailManager.clearAll();

    this.model3DManager.cleanup();


    // Remover todos los markers
    this.markers.forEach(marker => marker.remove());
    this.markers.clear();

    // Remover todas las layers
    this.activeLayerIds.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });

    // Remover todos los sources
    this.assetStates.forEach((state) => {
      if (this.map.getSource(state.sourceId)) {
        this.map.removeSource(state.sourceId);
      }
    });

    this.assetStates.clear();
    this.activeLayerIds.clear();
    this.assetFactory.clearAllAssets();

    console.log('✅ Limpieza completada');
  }

  /**
   * Obtiene el número de assets activos
   */
  getActiveAssetCount(): number {
    return this.assetStates.size;
  }

  /**
   * Obtiene el número de trails activos
   */
  getActiveTrailCount(): number {
    return this.trailManager.getActiveTrailCount();
  }

  /**
   * Obtiene estadísticas completas
   */
  getStats(): {
    totalAssets: number;
    activeTrails: number;
    totalRules: number;
    activeRules: number;
  } {
    const rulesInfo = this.trailColorRulesEngine.getRulesInfo();
    
    return {
      totalAssets: this.assetStates.size,
      activeTrails: this.trailManager.getActiveTrailCount(),
      totalRules: rulesInfo.length,
      activeRules: rulesInfo.filter(r => r.enabled).length
    };
  }

  private filterPointsForLayer(
    dataPoints: DataPoint[],
    layer: VisualizationLayer
  ): DataPoint[] {
    return this.rulesEngine.filterPointsForLayer(dataPoints, layer);
  }

  private reorganizeLayerOrder(sortedLayers: VisualizationLayer[]): void {
    console.log('🔄 Reorganizando z-index de layers...');
    
    // Para markers/HTML elements, usar CSS z-index
    sortedLayers.forEach((layer, index) => {
      this.assetStates.forEach((state) => {
        if (state.layerId === layer.id && state.element) {
          state.element.style.zIndex = `${layer.order}`;
        }
      });
    });

    // Para layers de Mapbox (trails, shapes), reorganizar manualmente
    sortedLayers.forEach((layer, i) => {
      const layerId = `area-layer-${layer.id}`;
      
      if (this.map.getLayer(layerId)) {
        try {
          const nextLayerId = i < sortedLayers.length - 1 
            ? `area-layer-${sortedLayers[i + 1].id}` 
            : undefined;
          
          // Remover y re-agregar para cambiar orden
          const layerDef = this.map.getLayer(layerId) as any;
          const source = this.map.getSource(`area-source-${layer.id}`);
          
          if (layerDef && source) {
            const paintProps = {
              'fill-color': this.map.getPaintProperty(layerId, 'fill-color'),
              'fill-opacity': this.map.getPaintProperty(layerId, 'fill-opacity'),
            };
            
            this.map.removeLayer(layerId);
            
            this.map.addLayer({
              id: layerId,
              type: 'fill',
              source: `area-source-${layer.id}`,
              paint: paintProps
            }, nextLayerId);
          }
        } catch (error) {
          console.warn(`⚠️ Error reordenando layer ${layer.name}:`, error);
        }
      }
    });
    
    console.log('✅ Reorganización completada');
  }

}