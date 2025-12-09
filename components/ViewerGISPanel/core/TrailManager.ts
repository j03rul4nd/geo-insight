import mapboxgl from 'mapbox-gl';
import type { DataPoint } from './types';
import type { VisualizationLayer } from '@/hooks/useVisualizationLayers';
import { TrailColorRulesEngine, type ColorEvaluation } from './TrailColorRulesEngine';

// ============================================================================
// TIPOS
// ============================================================================

interface TrailPoint {
  position: [number, number];
  timestamp: number;
  color: string; // Color calculado en el momento de creación
  dataPoint: DataPoint; // Guardar dataPoint completo para re-evaluar si es necesario
  isValid: boolean;
}

interface TrailState {
  points: TrailPoint[];
  lastUpdate: number;
  sourceId: string;
  layerId: string;
  pointsLayerId: string; 
  maxLength: number;
  isActive: boolean;
}

interface TrailConfig {
  maxLength: number;
  width: number;
  opacity: number;
  minDistanceThreshold?: number;
  maxTimeBetweenPoints?: number;
  enableValidation?: boolean;
}

// ============================================================================
// TRAIL MANAGER CON SISTEMA DE REGLAS
// ============================================================================

export class TrailManager {
  private map: mapboxgl.Map;
  private trails: Map<string, TrailState> = new Map();
  private activeLayerIds: Set<string> = new Set();
  private colorRulesEngine: TrailColorRulesEngine;

  private readonly DEFAULT_CONFIG: Required<TrailConfig> = {
    maxLength: 50,
    width: 2,
    opacity: 0.8,
    minDistanceThreshold: 0.00001,
    maxTimeBetweenPoints: 300000,
    enableValidation: true
  };

  constructor(map: mapboxgl.Map, colorRulesEngine?: TrailColorRulesEngine) {
    this.map = map;
    this.colorRulesEngine = colorRulesEngine || new TrailColorRulesEngine();
    console.log('✨ TrailManager inicializado con sistema de reglas');
  }

  // ============================================================================
  // ACCESO AL MOTOR DE REGLAS
  // ============================================================================

  /**
   * Obtiene el motor de reglas para configuración externa
   */
  getColorRulesEngine(): TrailColorRulesEngine {
    return this.colorRulesEngine;
  }

  // ============================================================================
  // API PÚBLICA
  // ============================================================================

  public getTrailLayerId(stateKey: string): string | null {
    const trail = this.trails.get(stateKey);
    return trail ? trail.layerId : null;
  }

  public getTrailSourceId(stateKey: string): string | null {
    const trail = this.trails.get(stateKey);
    return trail ? trail.sourceId : null;
  }

  public hasActiveTrail(stateKey: string): boolean {
    const trail = this.trails.get(stateKey);
    return trail ? trail.isActive : false;
  }

  /**
   * Crea o actualiza un trail para un asset
   */
  public updateTrail(
    stateKey: string,
    currentPosition: [number, number],
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    baseColor: string
  ): void {
    const existingTrail = this.trails.get(stateKey);
    
    if (!existingTrail) {
      this.createNewTrail(stateKey, currentPosition, layer, dataPoint, baseColor);
    } else {
      this.updateExistingTrail(stateKey, currentPosition, layer, dataPoint, baseColor);
    }
  }

  /**
   * Actualiza el estilo de un trail existente
   * IMPORTANTE: Esto ahora re-evalúa TODOS los puntos del trail
   */
  public updateTrailStyle(
    stateKey: string,
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    baseColor: string
  ): void {
    const trail = this.trails.get(stateKey);
    if (!trail || !this.map.getLayer(trail.layerId)) return;

    console.log(`🎨 Re-evaluando colores de trail: ${stateKey}`);

    // Re-evaluar color de cada punto según reglas actuales
    this.reevaluateTrailColors(stateKey, trail, layer, baseColor);

    // Actualizar geometría con los nuevos colores
    this.updateTrailGeometry(stateKey, trail, layer, dataPoint, baseColor);

    // Actualizar propiedades básicas de la layer
    const width = layer.trailWidth || this.DEFAULT_CONFIG.width;
    const opacity = layer.trailOpacity || this.DEFAULT_CONFIG.opacity;

    this.map.setPaintProperty(trail.layerId, 'line-width', width);
    this.map.setPaintProperty(trail.layerId, 'line-opacity', opacity);
  }

  /**
   * Re-evalúa los colores de todos los puntos de un trail
   * Útil cuando las reglas cambian
   */
  private reevaluateTrailColors(
    stateKey: string,
    trail: TrailState,
    layer: VisualizationLayer,
    baseColor: string
  ): void {
    const totalPoints = trail.points.length;

    trail.points.forEach((point, index) => {
      const isCurrentPoint = index === totalPoints - 1;
      
      // Re-evaluar color según reglas actuales
      const colorEval = this.colorRulesEngine.evaluatePointColor(
        stateKey,
        point.dataPoint,
        layer,
        point.timestamp,
        baseColor,
        isCurrentPoint
      );

      // Actualizar color del punto
      point.color = colorEval.color;

      // Si no es histórico (es decir, se aplicó una regla), guardar en histórico
      if (!colorEval.isHistorical && !isCurrentPoint) {
        this.colorRulesEngine.saveHistoricalColor(
          stateKey,
          point.timestamp,
          colorEval.color
        );
      }
    });

    console.log(`✅ Re-evaluados ${totalPoints} puntos para ${stateKey}`);
  }

  /**
   * Fuerza la re-evaluación de todos los trails activos
   * Útil cuando se modifican las reglas globalmente
   */
  public reevaluateAllTrails(
    layers: Map<string, VisualizationLayer>,
    baseColorProvider: (stateKey: string) => string
  ): void {
    console.log('🔄 Re-evaluando TODOS los trails...');

    this.trails.forEach((trail, stateKey) => {
      // Extraer layerId del stateKey (formato: "layerId-sensorId")
      const layerId = stateKey.split('-')[0];
      const layer = layers.get(layerId);
      
      if (!layer) return;

      const baseColor = baseColorProvider(stateKey);
      const latestPoint = trail.points[trail.points.length - 1];
      
      if (latestPoint) {
        this.updateTrailStyle(stateKey, layer, latestPoint.dataPoint, baseColor);
      }
    });

    console.log('✅ Re-evaluación global completada');
  }

  /**
   * Limpia todos los trails
   */
  public clearAll(): void {
    console.log('🧹 TrailManager: Limpiando todos los trails');
    
    this.trails.forEach((_, stateKey) => {
      this.removeTrail(stateKey);
    });

    this.trails.clear();
    this.activeLayerIds.clear();
    this.colorRulesEngine.clearAllHistoricalColors();
  }

  public getActiveTrailCount(): number {
    return Array.from(this.trails.values()).filter(t => t.isActive).length;
  }

  public getTrailInfo(stateKey: string): TrailState | null {
    return this.trails.get(stateKey) || null;
  }

  // ============================================================================
  // MÉTODOS PRIVADOS - CREACIÓN Y ACTUALIZACIÓN
  // ============================================================================

  private createNewTrail(
    stateKey: string,
    currentPosition: [number, number],
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    baseColor: string
  ): void {
    const sourceId = `trail-${stateKey}`;
    const layerId = `trail-layer-${stateKey}`;
    const pointsLayerId = `trail-layer-${stateKey}-points`;
    const maxLength = layer.trailLength || this.DEFAULT_CONFIG.maxLength;

    console.log(`✨ Creando nuevo trail: ${stateKey}`);

    // Evaluar color inicial
    const colorEval = this.colorRulesEngine.evaluatePointColor(
      stateKey,
      dataPoint,
      layer,
      Date.now(),
      baseColor,
      true // Es el punto actual
    );

    // Crear estado inicial
    const trailState: TrailState = {
      points: [{
        position: currentPosition,
        timestamp: Date.now(),
        color: colorEval.color,
        dataPoint: dataPoint,
        isValid: true
      }],
      lastUpdate: Date.now(),
      sourceId,
      layerId,
      pointsLayerId,
      maxLength,
      isActive: true
    };

    // Guardar en histórico
    this.colorRulesEngine.saveHistoricalColor(
      stateKey,
      Date.now(),
      colorEval.color
    );

    // Crear GeoJSON vacío
    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: []
    };

    this.map.addSource(sourceId, {
      type: 'geojson',
      data: geojson
    });

    // Crear layer de línea
    const width = layer.trailWidth || this.DEFAULT_CONFIG.width;
    const opacity = layer.trailOpacity || this.DEFAULT_CONFIG.opacity;

    this.map.addLayer({
      id: layerId,
      type: 'line',
      source: sourceId,
      filter: ['==', ['get', 'featureType'], 'trail-line'],
      paint: {
        'line-color': ['get', 'color'],
        'line-width': width,
        'line-opacity': opacity,
      }
    });

    // Crear layer de puntos históricos
    this.map.addLayer({
      id: pointsLayerId,
      type: 'circle',
      source: sourceId,
      filter: ['==', ['get', 'featureType'], 'history-point'],
      paint: {
        'circle-radius': ['*', ['get', 'size'], 4],
        'circle-color': ['get', 'color'],
        'circle-opacity': ['get', 'opacity'],
        'circle-stroke-width': 1,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-opacity': ['get', 'opacity']
      }
    });

    this.trails.set(stateKey, trailState);
    this.activeLayerIds.add(layerId);
    this.activeLayerIds.add(pointsLayerId);

    console.log(`✅ Trail creado: ${layerId}`);
  }

  private updateExistingTrail(
    stateKey: string,
    currentPosition: [number, number],
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    baseColor: string
  ): void {
    const trail = this.trails.get(stateKey);
    if (!trail) return;

    const config = this.getTrailConfig(layer);
    
    if (!this.shouldAddPoint(trail, currentPosition, config)) {
      console.log(`⏭️ Punto ignorado: ${stateKey}`);
      return;
    }

    // Evaluar color del nuevo punto
    const colorEval = this.colorRulesEngine.evaluatePointColor(
      stateKey,
      dataPoint,
      layer,
      Date.now(),
      baseColor,
      true // Es el punto actual
    );

    // Crear nuevo punto con su color
    const newPoint: TrailPoint = {
      position: currentPosition,
      timestamp: Date.now(),
      color: colorEval.color,
      dataPoint: dataPoint,
      isValid: true
    };

    trail.points.push(newPoint);
    trail.lastUpdate = Date.now();

    // Guardar color en histórico
    this.colorRulesEngine.saveHistoricalColor(
      stateKey,
      Date.now(),
      colorEval.color
    );

    // Mantener longitud máxima
    while (trail.points.length > trail.maxLength) {
      const removed = trail.points.shift();
      // Opcional: limpiar histórico del punto eliminado
    }

    console.log(`🔄 Trail actualizado: ${stateKey} (${trail.points.length} puntos, color: ${colorEval.color})`);

    // Actualizar GeoJSON
    this.updateTrailGeometry(stateKey, trail, layer, dataPoint, baseColor);
  }

  /**
   * Actualiza la geometría del trail con colores por segmento
   */
  private updateTrailGeometry(
    stateKey: string,
    trail: TrailState,
    layer: VisualizationLayer,
    dataPoint: DataPoint,
    baseColor: string
  ): void {
    const source = this.map.getSource(trail.sourceId) as mapboxgl.GeoJSONSource;
    
    if (!source) {
      console.warn(`⚠️ Source no encontrado: ${trail.sourceId}`);
      return;
    }

    const validPoints = trail.points.filter(p => p.isValid);

    if (validPoints.length < 2) {
      source.setData({
        type: 'FeatureCollection',
        features: []
      });
      return;
    }

    const features: GeoJSON.Feature[] = [];

    // 🎨 CREAR SEGMENTOS CON COLORES INDIVIDUALES
    // Cada segmento (línea entre dos puntos) tiene su propio color
    for (let i = 0; i < validPoints.length - 1; i++) {
      const currentPoint = validPoints[i];
      const nextPoint = validPoints[i + 1];

      // El color del segmento es el del punto inicial del segmento
      const segmentColor = currentPoint.color;

      // Aplicar fade si está configurado
      const opacity = this.colorRulesEngine.calculateOpacityForAge(currentPoint.timestamp);
      const finalColor = this.colorRulesEngine.applyOpacityToColor(segmentColor, opacity);

      features.push({
        type: 'Feature',
        properties: { 
          color: finalColor,
          stateKey,
          featureType: 'trail-line',
          segmentIndex: i,
          timestamp: currentPoint.timestamp
        },
        geometry: {
          type: 'LineString',
          coordinates: [currentPoint.position, nextPoint.position]
        }
      });
    }

    // 🔵 PUNTOS HISTÓRICOS
    const pointInterval = Math.max(1, Math.floor(trail.points.length / 10));
    
    validPoints.forEach((point, index) => {
      const age = (Date.now() - point.timestamp) / (5 * 60 * 1000);
      const opacity = Math.max(0.2, 1 - age);
      const sizeFactor = Math.max(0.3, 1 - age * 0.7);
      
      if (index % pointInterval === 0 || index === validPoints.length - 1) {
        const pointOpacity = this.colorRulesEngine.calculateOpacityForAge(point.timestamp);
        const finalColor = this.colorRulesEngine.applyOpacityToColor(point.color, pointOpacity);

        features.push({
          type: 'Feature',
          properties: {
            featureType: 'history-point',
            opacity: opacity * pointOpacity,
            size: sizeFactor,
            timestamp: point.timestamp,
            color: finalColor
          },
          geometry: {
            type: 'Point',
            coordinates: point.position
          }
        });
      }
    });

    const geojson: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features
    };

    source.setData(geojson);
  }

  // ============================================================================
  // VALIDACIÓN Y UTILIDADES
  // ============================================================================

  private shouldAddPoint(
    trail: TrailState,
    newPosition: [number, number],
    config: Required<TrailConfig>
  ): boolean {
    if (!config.enableValidation) return true;
    if (trail.points.length === 0) return true;

    const lastPoint = trail.points[trail.points.length - 1];
    const timeDiff = Date.now() - lastPoint.timestamp;

    if (timeDiff > config.maxTimeBetweenPoints) {
      console.log(`⏰ Reset trail por timeout: ${timeDiff}ms`);
      trail.points = [];
      return true;
    }

    const distance = this.calculateDistance(lastPoint.position, newPosition);
    if (distance < config.minDistanceThreshold) {
      return false;
    }

    return true;
  }

  private calculateDistance(
    pos1: [number, number],
    pos2: [number, number]
  ): number {
    const [lng1, lat1] = pos1;
    const [lng2, lat2] = pos2;
    const dLng = lng2 - lng1;
    const dLat = lat2 - lat1;
    return Math.sqrt(dLng * dLng + dLat * dLat);
  }

  private getTrailConfig(layer: VisualizationLayer): Required<TrailConfig> {
    return {
      maxLength: layer.trailLength || this.DEFAULT_CONFIG.maxLength,
      width: layer.trailWidth || this.DEFAULT_CONFIG.width,
      opacity: layer.trailOpacity || this.DEFAULT_CONFIG.opacity,
      minDistanceThreshold: this.DEFAULT_CONFIG.minDistanceThreshold,
      maxTimeBetweenPoints: this.DEFAULT_CONFIG.maxTimeBetweenPoints,
      enableValidation: this.DEFAULT_CONFIG.enableValidation
    };
  }

  // ============================================================================
  // CONTROL DE TRAILS
  // ============================================================================

  public removeTrail(stateKey: string): void {
    const trail = this.trails.get(stateKey);
    if (!trail) return;

    console.log(`🗑️ Eliminando trail: ${stateKey}`);

    if (this.map.getLayer(trail.pointsLayerId)) {
      this.map.removeLayer(trail.pointsLayerId);
      this.activeLayerIds.delete(trail.pointsLayerId);
    }

    if (this.map.getLayer(trail.layerId)) {
      this.map.removeLayer(trail.layerId);
      this.activeLayerIds.delete(trail.layerId);
    }

    if (this.map.getSource(trail.sourceId)) {
      this.map.removeSource(trail.sourceId);
    }

    this.trails.delete(stateKey);
    this.colorRulesEngine.clearHistoricalColors(stateKey);
  }

  public setTrailVisibility(stateKey: string, visible: boolean): void {
    const trail = this.trails.get(stateKey);
    if (!trail) return;

    const visibility = visible ? 'visible' : 'none';
    
    if (this.map.getLayer(trail.layerId)) {
      this.map.setLayoutProperty(trail.layerId, 'visibility', visibility);
    }

    if (this.map.getLayer(trail.pointsLayerId)) {
      this.map.setLayoutProperty(trail.pointsLayerId, 'visibility', visibility);
    }

    trail.isActive = visible;
  }
}