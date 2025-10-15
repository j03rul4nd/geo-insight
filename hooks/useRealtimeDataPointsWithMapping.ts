/**
 * Hook mejorado que combina useRealtimeDataPoints con normalización de payload
 * 
 * MEJORAS:
 * - Normalización automática de payloads MQTT usando mapping configurado
 * - Carga automática de configuración de mapping
 * - Reactividad ante cambios en el mapping
 * - Fallback a estructura plana si no hay mapping
 */

import { useEffect, useRef, useCallback } from 'react';
import { useRealtimeDataPoints, UseRealtimeDataPointsOptions } from './useRealtimeDataPoints';
import { useDatasetMapping } from './useDatasetMapping';
import { normalizePayload, MappingConfig } from '@/lib/normalizePayload';

interface UseRealtimeWithMappingOptions extends UseRealtimeDataPointsOptions {
  // Si es true, espera a que el mapping se cargue antes de conectar
  waitForMapping?: boolean;
}

/**
 * Hook compuesto que combina realtime data + normalización con mapping
 */
export function useRealtimeDataPointsWithMapping(
  datasetId: string,
  options: UseRealtimeWithMappingOptions = {}
) {
  const {
    waitForMapping = false,
    ...realtimeOptions
  } = options;

  // Cargar configuración de mapping
  const {
    mapping,
    isLoading: mappingLoading,
    isReady: mappingReady,
    error: mappingError,
  } = useDatasetMapping(datasetId, {
    autoLoad: true,
  });

  // Referencia al mapping actual (para usar en callbacks)
  const mappingRef = useRef<MappingConfig | null>(null);

  // Actualizar ref cuando cambia el mapping
  useEffect(() => {
    if (mapping) {
      mappingRef.current = mapping;
      console.log('✅ Mapping configuration updated:', mapping);
    }
  }, [mapping]);

  // Callback personalizado para normalizar datos recibidos
  const handleDataReceived = useCallback((rawPoint: any) => {
    const currentMapping = mappingRef.current;
    
    // Si no hay mapping o los datos ya vienen normalizados, pasar directo
    if (!currentMapping || rawPoint.metadata?.mappingApplied) {
      if (options.onDataReceived) {
        options.onDataReceived(rawPoint);
      }
      return;
    }

    // Intentar normalizar
    try {
      const normalized = normalizePayload(rawPoint, currentMapping);
      
      if (normalized && options.onDataReceived) {
        // Agregar el id del punto original si existe
        const fullPoint = {
          ...normalized,
          id: rawPoint.id || `${Date.now()}-${Math.random()}`,
        };
        
        options.onDataReceived(fullPoint as any);
      }
    } catch (error) {
      console.error('❌ Failed to normalize payload:', error);
      // Fallback: usar el punto sin normalizar
      if (options.onDataReceived) {
        options.onDataReceived(rawPoint);
      }
    }
  }, [options]);

  // Determinar si debe auto-conectar
  const shouldAutoConnect = 
    !waitForMapping || (waitForMapping && mappingReady);

  // Hook principal de realtime data
  const realtimeData = useRealtimeDataPoints(datasetId, {
    ...realtimeOptions,
    autoConnect: shouldAutoConnect,
    onDataReceived: handleDataReceived,
  });

  // Reconectar si el mapping se carga después
  useEffect(() => {
    if (waitForMapping && mappingReady && !realtimeData.isConnected) {
      console.log('🔄 Mapping ready, connecting to realtime data...');
      realtimeData.connect();
    }
  }, [waitForMapping, mappingReady, realtimeData.isConnected]);

  return {
    ...realtimeData,
    
    // Estado del mapping
    mapping,
    mappingLoading,
    mappingReady,
    mappingError,
    
    // Estado combinado
    isFullyReady: realtimeData.isConnected && mappingReady,
    overallLoading: realtimeData.isLoading || (waitForMapping && mappingLoading),
  };
}