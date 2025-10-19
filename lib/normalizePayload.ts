/**
 * Sistema de normalización de payloads MQTT variables
 * Inspirado en Grafana data transformations
 */

import { DataPoint } from '@/hooks/useRealtimeDataPoints';

export interface MappingConfig {
  valuePath: string;
  xPath?: string | null;
  yPath?: string | null;
  zPath?: string | null;
  sensorIdPath?: string | null;
  sensorTypePath?: string | null;
  timestampPath: string;
  unitPath?: string | null;
  transforms?: Record<string, any>;
}

/**
 * Obtiene un valor anidado de un objeto usando notación de punto
 * Ejemplo: getNestedValue({ a: { b: { c: 42 } } }, "a.b.c") => 42
 */
export function getNestedValue(
  obj: any,
  path: string | null | undefined
): any {
  if (!path || !obj) return undefined;
  
  try {
    return path.split('.').reduce((current, key) => {
      // Manejar arrays con notación [index]
      if (key.includes('[') && key.includes(']')) {
        const [arrayKey, indexStr] = key.split('[');
        const index = parseInt(indexStr.replace(']', ''));
        return current?.[arrayKey]?.[index];
      }
      return current?.[key];
    }, obj);
  } catch (error) {
    console.warn(`Failed to get nested value for path: ${path}`, error);
    return undefined;
  }
}

/**
 * Aplica transformaciones opcionales a un valor
 */
function applyTransforms(
  value: any,
  transforms?: Record<string, any>
): any {
  if (!transforms) return value;
  
  let result = value;
  
  // Transformación: escalado
  if (transforms.scale !== undefined) {
    result = Number(result) * transforms.scale;
  }
  
  // Transformación: offset
  if (transforms.offset !== undefined) {
    result = Number(result) + transforms.offset;
  }
  
  // Transformación: redondeo
  if (transforms.round !== undefined) {
    result = Number(result.toFixed(transforms.round));
  }
  
  return result;
}

/**
 * Normaliza un payload MQTT usando la configuración de mapping
 * 
 * @param payload - Objeto JSON del mensaje MQTT
 * @param mapping - Configuración de paths y transformaciones
 * @param datasetId - ID del dataset al que pertenece este punto
 * @returns DataPoint normalizado o null si falla
 */
export function normalizePayload(
  payload: any,
  mapping: MappingConfig,
  datasetId: string
): Omit<DataPoint, 'id'> | null {
  try {
    // Campos obligatorios
    const value = getNestedValue(payload, mapping.valuePath);
    const timestamp = getNestedValue(payload, mapping.timestampPath);
    
    if (value === undefined || timestamp === undefined) {
      console.warn('Missing required fields (value or timestamp)', {
        payload,
        mapping,
      });
      return null;
    }
    
    // Campos opcionales
    const x = getNestedValue(payload, mapping.xPath);
    const y = getNestedValue(payload, mapping.yPath);
    const z = getNestedValue(payload, mapping.zPath);
    const sensorId = getNestedValue(payload, mapping.sensorIdPath);
    const sensorType = getNestedValue(payload, mapping.sensorTypePath);
    const unit = getNestedValue(payload, mapping.unitPath);
    
    // Aplicar transformaciones al valor
    const transformedValue = applyTransforms(
      value,
      mapping.transforms?.value
    );
    
    // Construir metadata solo con campos que existen
    const metadata: DataPoint['metadata'] = {
      originalPayload: payload,
      mappingApplied: true,
    };
    
    if (x !== undefined) metadata.x = Number(x);
    if (y !== undefined) metadata.y = Number(y);
    if (z !== undefined) metadata.z = Number(z);
    if (sensorType) metadata.sensorType = String(sensorType);
    if (unit) metadata.unit = String(unit);
    
    // Construir el DataPoint normalizado
    const normalizedPoint: Omit<DataPoint, 'id'> = {
      datasetId,
      value: Number(transformedValue),
      sensorId: sensorId ? String(sensorId) : 'unknown',
      timestamp: new Date(timestamp),
      metadata,
    };
    
    return normalizedPoint;
  } catch (error) {
    console.error('Error normalizing payload:', error, {
      payload,
      mapping,
    });
    return null;
  }
}

/**
 * Detecta automáticamente el mapping más probable para un payload
 * Útil para sugerir configuraciones iniciales
 */
export function detectMapping(payload: any): Partial<MappingConfig> {
  const detected: Partial<MappingConfig> = {};
  
  // Detectar campos comunes
  const flatPaths = flattenObject(payload);
  
  // Buscar campos de valor
  const valueKeys = ['value', 'val', 'measurement', 'data', 'reading'];
  for (const key of valueKeys) {
    const found = flatPaths.find(p => 
      p.toLowerCase().includes(key.toLowerCase())
    );
    if (found) {
      detected.valuePath = found;
      break;
    }
  }
  
  // Buscar timestamp
  const timestampKeys = ['timestamp', 'time', 'ts', 'date', 'datetime'];
  for (const key of timestampKeys) {
    const found = flatPaths.find(p => 
      p.toLowerCase().includes(key.toLowerCase())
    );
    if (found) {
      detected.timestampPath = found;
      break;
    }
  }
  
  // Buscar coordenadas
  detected.xPath = flatPaths.find(p => p.match(/^x$|\.x$/i));
  detected.yPath = flatPaths.find(p => p.match(/^y$|\.y$/i));
  detected.zPath = flatPaths.find(p => p.match(/^z$|\.z$/i));
  
  // Buscar sensor info
  const sensorIdKeys = ['sensorid', 'id', 'sensor', 'device'];
  for (const key of sensorIdKeys) {
    const found = flatPaths.find(p => 
      p.toLowerCase().includes(key.toLowerCase())
    );
    if (found) {
      detected.sensorIdPath = found;
      break;
    }
  }
  
  const typeKeys = ['type', 'sensortype', 'kind', 'category'];
  for (const key of typeKeys) {
    const found = flatPaths.find(p => 
      p.toLowerCase().includes(key.toLowerCase())
    );
    if (found) {
      detected.sensorTypePath = found;
      break;
    }
  }
  
  detected.unitPath = flatPaths.find(p => 
    p.toLowerCase().includes('unit')
  );
  
  return detected;
}

/**
 * Aplana un objeto anidado a un array de paths
 * Ejemplo: { a: { b: 1 } } => ["a.b"]
 */
function flattenObject(
  obj: any,
  prefix: string = '',
  result: string[] = []
): string[] {
  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      flattenObject(obj[key], path, result);
    } else {
      result.push(path);
    }
  }
  
  return result;
}

/**
 * Valida que un mapping sea correcto
 */
export function validateMapping(
  mapping: MappingConfig,
  samplePayload?: any
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Campos obligatorios
  if (!mapping.valuePath) {
    errors.push('valuePath is required');
  }
  if (!mapping.timestampPath) {
    errors.push('timestampPath is required');
  }
  
  // Si hay payload de ejemplo, probar extracción
  if (samplePayload) {
    const value = getNestedValue(samplePayload, mapping.valuePath);
    const timestamp = getNestedValue(samplePayload, mapping.timestampPath);
    
    if (value === undefined) {
      errors.push(`Cannot extract value from path: ${mapping.valuePath}`);
    }
    if (timestamp === undefined) {
      errors.push(`Cannot extract timestamp from path: ${mapping.timestampPath}`);
    }
    
    // Validar que timestamp sea fecha válida
    if (timestamp !== undefined) {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) {
        errors.push(`Invalid timestamp format at path: ${mapping.timestampPath}`);
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}