import mapboxgl from 'mapbox-gl';
import type { VisualizationLayer } from '@/hooks/useVisualizationLayers';

interface AssetElement {
  element?: HTMLElement;
  layerId: string;
  order: number;
}

interface MapboxLayerInfo {
  id: string;
  type: string;
  sourceId: string;
  layerId: string;
  order: number;
}

/**
 * Gestor centralizado del orden de renderizado de layers
 * Maneja tanto elementos HTML (markers) como layers de Mapbox (trails, shapes)
 */
export class LayerOrderManager {
  private map: mapboxgl.Map;
  private htmlElements: Map<string, AssetElement> = new Map();
  private mapboxLayers: Map<string, MapboxLayerInfo> = new Map();

  constructor(map: mapboxgl.Map) {
    this.map = map;
  }

  // ============================================================================
  // REGISTRO DE ELEMENTOS
  // ============================================================================

  /**
   * Registra un elemento HTML (marker, icon, image)
   */
  registerHtmlElement(
    stateKey: string,
    element: HTMLElement,
    layerId: string,
    order: number
  ): void {
    this.htmlElements.set(stateKey, {
      element,
      layerId,
      order
    });
  }

  /**
   * Registra una layer de Mapbox (trail, shape, área)
   */
  registerMapboxLayer(
    layerId: string,
    type: 'trail' | 'shape' | 'area',
    sourceId: string,
    parentLayerId: string,
    order: number
  ): void {
    this.mapboxLayers.set(layerId, {
      id: layerId,
      type,
      sourceId,
      layerId: parentLayerId,
      order
    });
  }

  /**
   * Desregistra un elemento HTML
   */
  unregisterHtmlElement(stateKey: string): void {
    this.htmlElements.delete(stateKey);
  }

  /**
   * Desregistra una layer de Mapbox
   */
  unregisterMapboxLayer(layerId: string): void {
    this.mapboxLayers.delete(layerId);
  }

  // ============================================================================
  // REORGANIZACIÓN DE ORDEN
  // ============================================================================

  /**
   * Reorganiza todas las layers según el orden especificado
   */
  reorganizeAll(sortedLayers: VisualizationLayer[]): void {
    console.log('🔄 LayerOrderManager: Reorganizando z-index...');

    // 1. Reorganizar elementos HTML (más simple)
    this.reorganizeHtmlElements(sortedLayers);

    // 2. Reorganizar layers de Mapbox (más complejo)
    this.reorganizeMapboxLayers(sortedLayers);

    console.log('✅ LayerOrderManager: Reorganización completada');
  }

  /**
   * Reorganiza solo los elementos HTML
   */
  private reorganizeHtmlElements(sortedLayers: VisualizationLayer[]): void {
    const layerOrderMap = new Map(
      sortedLayers.map(layer => [layer.id, layer.order])
    );

    this.htmlElements.forEach((asset, stateKey) => {
      const order = layerOrderMap.get(asset.layerId);
      if (order !== undefined && asset.element) {
        asset.element.style.zIndex = `${order}`;
        asset.order = order;
      }
    });

    console.log(`  ✓ ${this.htmlElements.size} elementos HTML actualizados`);
  }

  /**
   * Reorganiza las layers de Mapbox
   * Este es el método más complejo porque Mapbox no tiene z-index
   */
  private reorganizeMapboxLayers(sortedLayers: VisualizationLayer[]): void {
    // Crear mapa de orden
    const layerOrderMap = new Map(
      sortedLayers.map(layer => [layer.id, layer.order])
    );

    // Actualizar orden en registro
    this.mapboxLayers.forEach((info) => {
      const order = layerOrderMap.get(info.layerId);
      if (order !== undefined) {
        info.order = order;
      }
    });

    // Obtener todas las layers ordenadas
    const sortedMapboxLayers = Array.from(this.mapboxLayers.values())
      .sort((a, b) => a.order - b.order);

    console.log('  📋 Orden de layers de Mapbox:');
    sortedMapboxLayers.forEach((info, idx) => {
      console.log(`    ${idx + 1}. [${info.type}] ${info.id} (order: ${info.order})`);
    });

    // Reorganizar cada layer
    sortedMapboxLayers.forEach((info, index) => {
      if (!this.map.getLayer(info.id)) return;

      try {
        // Encontrar la siguiente layer visible para usar como referencia
        const nextLayerId = this.findNextVisibleLayer(sortedMapboxLayers, index);
        
        // Remover y re-agregar la layer para cambiar su orden
        this.reinsertLayer(info, nextLayerId);

      } catch (error) {
        console.warn(`  ⚠️ Error reordenando layer ${info.id}:`, error);
      }
    });

    console.log(`  ✓ ${sortedMapboxLayers.length} layers de Mapbox reorganizadas`);
  }

  /**
   * Encuentra la siguiente layer visible en el array
   */
  private findNextVisibleLayer(
    layers: MapboxLayerInfo[],
    currentIndex: number
  ): string | undefined {
    for (let i = currentIndex + 1; i < layers.length; i++) {
      if (this.map.getLayer(layers[i].id)) {
        return layers[i].id;
      }
    }
    return undefined;
  }

  /**
   * Reinserta una layer en el mapa para cambiar su orden
   */
  private reinsertLayer(
    info: MapboxLayerInfo,
    beforeLayerId?: string
  ): void {
    const layer = this.map.getLayer(info.id);
    if (!layer) return;

    // Guardar configuración de la layer
    const layerDef = this.saveLayerDefinition(info.id);
    if (!layerDef) return;

    // Remover layer actual
    this.map.removeLayer(info.id);

    // Re-agregar con nueva posición
    this.map.addLayer(layerDef, beforeLayerId);
  }

  /**
   * Guarda la definición completa de una layer antes de removerla
   */
  private saveLayerDefinition(layerId: string): mapboxgl.AnyLayer | null {
    const layer = this.map.getLayer(layerId);
    if (!layer) return null;

    const layerDef: any = {
      id: layer.id,
      type: layer.type,
      source: (layer as any).source,
    };

    // Guardar todas las propiedades de paint
    if (layer.type === 'fill') {
      layerDef.paint = {
        'fill-color': this.map.getPaintProperty(layerId, 'fill-color'),
        'fill-opacity': this.map.getPaintProperty(layerId, 'fill-opacity'),
      };
    } else if (layer.type === 'line') {
      layerDef.paint = {
        'line-color': this.map.getPaintProperty(layerId, 'line-color'),
        'line-width': this.map.getPaintProperty(layerId, 'line-width'),
        'line-opacity': this.map.getPaintProperty(layerId, 'line-opacity'),
      };
    } else if (layer.type === 'circle') {
      layerDef.paint = {
        'circle-color': this.map.getPaintProperty(layerId, 'circle-color'),
        'circle-radius': this.map.getPaintProperty(layerId, 'circle-radius'),
        'circle-opacity': this.map.getPaintProperty(layerId, 'circle-opacity'),
      };
    }

    // Guardar propiedades de layout
    const visibility = this.map.getLayoutProperty(layerId, 'visibility');
    if (visibility) {
      layerDef.layout = { visibility };
    }

    return layerDef as mapboxgl.AnyLayer;
  }

  // ============================================================================
  // ACTUALIZACIÓN DE ORDEN INDIVIDUAL
  // ============================================================================

  /**
   * Actualiza el orden de una layer específica
   */
  updateLayerOrder(layerId: string, newOrder: number): void {
    // Actualizar elementos HTML de esta layer
    this.htmlElements.forEach((asset) => {
      if (asset.layerId === layerId && asset.element) {
        asset.element.style.zIndex = `${newOrder}`;
        asset.order = newOrder;
      }
    });

    // Actualizar layers de Mapbox de esta layer
    this.mapboxLayers.forEach((info) => {
      if (info.layerId === layerId) {
        info.order = newOrder;
      }
    });
  }

  /**
   * Mueve una layer arriba en el orden
   */
  moveLayerUp(layerId: string, allLayers: VisualizationLayer[]): void {
    const currentLayer = allLayers.find(l => l.id === layerId);
    if (!currentLayer) return;

    const sortedLayers = [...allLayers].sort((a, b) => a.order - b.order);
    const currentIndex = sortedLayers.findIndex(l => l.id === layerId);
    
    if (currentIndex < sortedLayers.length - 1) {
      const nextLayer = sortedLayers[currentIndex + 1];
      const tempOrder = currentLayer.order;
      currentLayer.order = nextLayer.order;
      nextLayer.order = tempOrder;
      
      this.reorganizeAll(sortedLayers);
    }
  }

  /**
   * Mueve una layer abajo en el orden
   */
  moveLayerDown(layerId: string, allLayers: VisualizationLayer[]): void {
    const currentLayer = allLayers.find(l => l.id === layerId);
    if (!currentLayer) return;

    const sortedLayers = [...allLayers].sort((a, b) => a.order - b.order);
    const currentIndex = sortedLayers.findIndex(l => l.id === layerId);
    
    if (currentIndex > 0) {
      const prevLayer = sortedLayers[currentIndex - 1];
      const tempOrder = currentLayer.order;
      currentLayer.order = prevLayer.order;
      prevLayer.order = tempOrder;
      
      this.reorganizeAll(sortedLayers);
    }
  }

  // ============================================================================
  // VISIBILIDAD
  // ============================================================================

  /**
   * Muestra u oculta una layer completa
   */
  setLayerVisibility(layerId: string, visible: boolean): void {
    // Ocultar/mostrar elementos HTML
    this.htmlElements.forEach((asset) => {
      if (asset.layerId === layerId && asset.element) {
        asset.element.style.display = visible ? 'block' : 'none';
      }
    });

    // Ocultar/mostrar layers de Mapbox
    this.mapboxLayers.forEach((info) => {
      if (info.layerId === layerId && this.map.getLayer(info.id)) {
        this.map.setLayoutProperty(
          info.id,
          'visibility',
          visible ? 'visible' : 'none'
        );
      }
    });
  }

  // ============================================================================
  // LIMPIEZA
  // ============================================================================

  /**
   * Limpia todos los elementos registrados de una layer
   */
  clearLayer(layerId: string): void {
    // Remover elementos HTML
    const htmlToRemove: string[] = [];
    this.htmlElements.forEach((asset, stateKey) => {
      if (asset.layerId === layerId) {
        htmlToRemove.push(stateKey);
      }
    });
    htmlToRemove.forEach(key => this.htmlElements.delete(key));

    // Remover layers de Mapbox
    const mapboxToRemove: string[] = [];
    this.mapboxLayers.forEach((info) => {
      if (info.layerId === layerId) {
        mapboxToRemove.push(info.id);
      }
    });
    mapboxToRemove.forEach(id => this.mapboxLayers.delete(id));

    console.log(`🧹 LayerOrderManager: Limpiada layer ${layerId}`);
  }

  /**
   * Limpia todos los registros
   */
  clearAll(): void {
    this.htmlElements.clear();
    this.mapboxLayers.clear();
    console.log('🧹 LayerOrderManager: Todos los registros limpiados');
  }

  // ============================================================================
  // INFORMACIÓN Y DEBUG
  // ============================================================================

  /**
   * Obtiene información sobre el estado actual
   */
  getStats(): {
    htmlElements: number;
    mapboxLayers: number;
    layerDistribution: Map<string, number>;
  } {
    const distribution = new Map<string, number>();
    
    this.htmlElements.forEach((asset) => {
      const count = distribution.get(asset.layerId) || 0;
      distribution.set(asset.layerId, count + 1);
    });

    this.mapboxLayers.forEach((info) => {
      const count = distribution.get(info.layerId) || 0;
      distribution.set(info.layerId, count + 1);
    });

    return {
      htmlElements: this.htmlElements.size,
      mapboxLayers: this.mapboxLayers.size,
      layerDistribution: distribution
    };
  }

  /**
   * Imprime el estado actual para debug
   */
  printDebugInfo(): void {
    console.group('🔍 LayerOrderManager Debug Info');
    
    console.log('HTML Elements:', this.htmlElements.size);
    const htmlByLayer = new Map<string, number>();
    this.htmlElements.forEach((asset) => {
      htmlByLayer.set(
        asset.layerId,
        (htmlByLayer.get(asset.layerId) || 0) + 1
      );
    });
    htmlByLayer.forEach((count, layerId) => {
      console.log(`  - ${layerId}: ${count} elementos`);
    });

    console.log('\nMapbox Layers:', this.mapboxLayers.size);
    this.mapboxLayers.forEach((info) => {
      console.log(`  - ${info.id} [${info.type}] (order: ${info.order})`);
    });

    console.groupEnd();
  }

  /**
   * Valida que todas las layers registradas existan en el mapa
   */
  validateIntegrity(): {
    valid: boolean;
    missingLayers: string[];
    orphanedHtmlElements: string[];
  } {
    const missingLayers: string[] = [];
    const orphanedHtmlElements: string[] = [];

    // Validar layers de Mapbox
    this.mapboxLayers.forEach((info) => {
      if (!this.map.getLayer(info.id)) {
        missingLayers.push(info.id);
      }
    });

    // Validar elementos HTML
    this.htmlElements.forEach((asset, stateKey) => {
      if (!asset.element || !asset.element.parentElement) {
        orphanedHtmlElements.push(stateKey);
      }
    });

    const valid = missingLayers.length === 0 && orphanedHtmlElements.length === 0;

    if (!valid) {
      console.warn('⚠️ LayerOrderManager: Problemas de integridad detectados');
      if (missingLayers.length > 0) {
        console.warn('  - Layers faltantes:', missingLayers);
      }
      if (orphanedHtmlElements.length > 0) {
        console.warn('  - Elementos huérfanos:', orphanedHtmlElements);
      }
    }

    return {
      valid,
      missingLayers,
      orphanedHtmlElements
    };
  }
}