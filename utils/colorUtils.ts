// utils/colorUtils.ts
import * as THREE from 'three';

export interface ValueRange {
  min: number;
  max: number;
}

export interface DataPoint {
  value: number;
  metadata?: {
    sensorType?: string;
  };
}


// Constantes con valores por defecto
const DEFAULT_COLOR = 0x6b7280; // Color gris neutro
const DEFAULT_SENSOR_TYPE = 'default';
const DEFAULT_COLOR_MODE = 'heatmap';
const DEFAULT_VALUE_RANGE: ValueRange = { min: 0, max: 100 };

// Paleta de colores para sensores
const SENSOR_COLORS: Record<string, number> = {
  temperature: 0xef4444,
  humidity: 0x3b82f6,
  pressure: 0x10b981,
  speed: 0xf59e0b,
  position: 0x8b5cf6,
  battery: 0xec4899,
  default: DEFAULT_COLOR
};

// Paleta de colores para heatmap
const HEATMAP_COLORS = {
  cold: 0x3b82f6,      // Azul
  cool: 0x10b981,      // Verde
  warm: 0xf59e0b,      // Naranja
  hot: 0xef4444        // Rojo
};

/**
 * Genera un color aleatorio
 */
export const getRandomColor = (): THREE.Color => {
  const randomHex = Math.floor(Math.random() * 0xffffff);
  return new THREE.Color(randomHex);
};

/**
 * Obtiene un color basado en un valor dentro de un rango (heatmap)
 * @param value - Valor a mapear
 * @param valueRange - Rango de valores (opcional, usa valores por defecto si no se proporciona)
 * @returns Color THREE.Color
 */
export const getHeatmapColor = (
  value: number,
  valueRange?: ValueRange
): THREE.Color => {
  // Validación de entrada
  if (typeof value !== 'number' || !isFinite(value)) {
    console.warn('Invalid value provided to getHeatmapColor, using random color');
    return getRandomColor();
  }

  // Usar rango por defecto si no se proporciona o es inválido
  const range = valueRange && 
                typeof valueRange.min === 'number' && 
                typeof valueRange.max === 'number' &&
                valueRange.max > valueRange.min
    ? valueRange
    : DEFAULT_VALUE_RANGE;

  const { min, max } = range;
  
  // Normalizar el valor entre 0 y 1
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  
  // Mapear a colores
  if (normalized < 0.25) {
    return new THREE.Color(HEATMAP_COLORS.cold);
  } else if (normalized < 0.5) {
    return new THREE.Color(HEATMAP_COLORS.cool);
  } else if (normalized < 0.75) {
    return new THREE.Color(HEATMAP_COLORS.warm);
  } else {
    return new THREE.Color(HEATMAP_COLORS.hot);
  }
};

/**
 * Obtiene un color basado en el tipo de sensor
 * @param sensorType - Tipo de sensor (opcional, usa 'default' si no se proporciona)
 * @returns Color THREE.Color
 */
export const getSensorTypeColor = (sensorType?: string): THREE.Color => {
  // Si no se proporciona tipo, usar valor por defecto
  if (!sensorType || typeof sensorType !== 'string') {
    return new THREE.Color(SENSOR_COLORS.default);
  }

  const normalizedType = sensorType.toLowerCase().trim();
  const colorHex = SENSOR_COLORS[normalizedType] || SENSOR_COLORS.default;
  
  return new THREE.Color(colorHex);
};

/**
 * Obtiene el color de un punto de datos según el modo especificado
 * @param point - Punto de datos
 * @param colorMode - Modo de color (opcional, por defecto 'heatmap')
 * @param valueRange - Rango de valores para heatmap (opcional)
 * @returns Color THREE.Color
 */
export const getPointColor = (
  point: DataPoint,
  colorMode?: 'heatmap' | 'sensor-type',
  valueRange?: ValueRange
): THREE.Color => {
  // Validar que point existe y tiene value
  if (!point || typeof point.value !== 'number' || !isFinite(point.value)) {
    console.warn('Invalid point provided to getPointColor, using random color');
    return getRandomColor();
  }

  // Usar modo por defecto si no se proporciona
  const mode = colorMode || DEFAULT_COLOR_MODE;

  if (mode === 'heatmap') {
    return getHeatmapColor(point.value, valueRange);
  } else if (mode === 'sensor-type') {
    const sensorType = point.metadata?.sensorType || DEFAULT_SENSOR_TYPE;
    return getSensorTypeColor(sensorType);
  } else {
    // Si el modo no es válido, usar heatmap por defecto
    console.warn(`Invalid colorMode '${mode}', using 'heatmap'`);
    return getHeatmapColor(point.value, valueRange);
  }
};

/**
 * Añade un nuevo tipo de sensor con su color personalizado
 * @param sensorType - Nombre del tipo de sensor
 * @param colorHex - Color en formato hexadecimal
 */
export const addSensorType = (sensorType: string, colorHex: number): void => {
  if (typeof sensorType === 'string' && typeof colorHex === 'number') {
    SENSOR_COLORS[sensorType.toLowerCase()] = colorHex;
  }
};

/**
 * Obtiene todos los tipos de sensores disponibles
 */
export const getAvailableSensorTypes = (): string[] => {
  return Object.keys(SENSOR_COLORS);
};