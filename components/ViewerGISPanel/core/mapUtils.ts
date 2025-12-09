import mapboxgl from 'mapbox-gl';
import type { DataPoint, AssetTracker, AssetTrackerOptions } from './types';

/**
 * Filtra puntos con coordenadas válidas
 */
export function filterValidPoints(dataPoints: DataPoint[]): DataPoint[] {
  return dataPoints.filter(p => 
    typeof p.metadata?.x === 'number' && 
    typeof p.metadata?.y === 'number' &&
    !isNaN(p.metadata.x) &&
    !isNaN(p.metadata.y) &&
    Math.abs(p.metadata.x) <= 90 &&    // X es latitud: -90 a 90
    Math.abs(p.metadata.y) <= 180      // Y es longitud: -180 a 180
  );
}

/**
 * Agrupa puntos por sensorId, manteniendo solo el más reciente
 */
export function groupPointsByAsset(dataPoints: DataPoint[]): Map<string, DataPoint> {
  const pointsByAsset = new Map<string, DataPoint>();
  
  dataPoints.forEach(point => {
    const existingPoint = pointsByAsset.get(point.sensorId);
    // Mantener el punto más reciente por sensorId
    if (!existingPoint || new Date(point.timestamp) > new Date(existingPoint.timestamp)) {
      pointsByAsset.set(point.sensorId, point);
    }
  });
  
  return pointsByAsset;
}

/**
 * Calcula los bounds para centrar el mapa
 */
export function calculateBounds(dataPoints: DataPoint[]): mapboxgl.LngLatBounds | null {
  const validPoints = filterValidPoints(dataPoints);
  
  if (validPoints.length === 0) return null;

  // X = latitud, Y = longitud (según tu estructura de datos)
  const lats = validPoints.map(p => p.metadata!.x!); // Latitudes
  const lngs = validPoints.map(p => p.metadata!.y!); // Longitudes

  // Mapbox LngLatBounds espera: [lng, lat]
  return new mapboxgl.LngLatBounds(
    [Math.min(...lngs), Math.min(...lats)], // [minLng, minLat]
    [Math.max(...lngs), Math.max(...lats)]  // [maxLng, maxLat]
  );
}

/**
 * Obtiene el color de un punto según el modo y valor
 */
export function getPointColor(
  point: DataPoint,
  colorMode: 'heatmap' | 'sensor-type',
  valueRange: { min: number; max: number }
): string {
  if (colorMode === 'sensor-type') {
    const sensorType = point.metadata?.sensorType || 'unknown';
    const colors: Record<string, string> = {
      temperature: '#ef4444',
      pressure: '#8b5cf6',
      humidity: '#3b82f6',
      speed: '#10b981',
      unknown: '#6b7280'
    };
    return colors[sensorType.toLowerCase()] || colors.unknown;
  } else {
    // Heatmap: interpolar entre azul (bajo) y rojo (alto)
    const normalized = Math.max(0, Math.min(1, 
      (point.value - valueRange.min) / (valueRange.max - valueRange.min || 1)
    ));
    const hue = (1 - normalized) * 240; // 240 = azul, 0 = rojo
    return `hsl(${hue}, 80%, 50%)`;
  }
}

/**
 * Valida un token de Mapbox
 */
export function validateMapboxToken(token: string | undefined): boolean {
  return Boolean(
    token && 
    token !== 'TU_MAPBOX_TOKEN_AQUI' && 
    token.startsWith('pk.')
  );
}

/**
 * Obtiene el token de Mapbox de múltiples fuentes
 */
export function getMapboxToken(providedToken?: string): string {
  return providedToken || 
         process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 
         process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
         '';
}