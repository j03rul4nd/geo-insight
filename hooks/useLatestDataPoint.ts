/**
 * Hook para gestionar data points en tiempo real para el 3D viewer
 * 
 * CARACTERÍSTICAS CLAVE:
 * - Polling inteligente (ajusta frecuencia según actividad del dataset)
 * - Incremental loading (solo carga puntos nuevos después del último timestamp)
 * - Filtros reactivos (sensorType, sensorId)
 * - Gestión automática de límites y paginación
 * - Optimizado para rendimiento (evita re-renders innecesarios)
 * - Maneja datasets vacíos correctamente
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// ============================================================================
// TIPOS
// ============================================================================

export interface DataPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  value: number;
  sensorId: string;
  sensorType: string;
  unit: string | null;
  timestamp: Date | string;
}

export interface DataPointsMetadata {
  count: number;
  limit: number;
  hasMore: boolean;
  totalAvailable: number;
  filters: {
    sensorType: string | null;
    sensorId: string | null;
    since: string | null;
  };
  warning?: string;
}

interface DataPointsResponse {
  success: boolean;
  data: DataPoint[];
  metadata: DataPointsMetadata;
}

export interface UseLatestDataPointsOptions {
  // Límite inicial de puntos a cargar
  initialLimit?: number;
  
  // Auto-refresh config
  enablePolling?: boolean;
  pollingInterval?: number; // ms (default: 10000 = 10s)
  
  // Filtros iniciales
  initialFilters?: {
    sensorType?: string;
    sensorId?: string;
  };
  
  // Incremental loading
  incrementalMode?: boolean; // Solo carga puntos nuevos
  
  // Callbacks
  onDataReceived?: (points: DataPoint[], isIncremental: boolean) => void;
  onError?: (error: string) => void;
  
  // Silenciar errores (útil para datasets vacíos)
  silentErrors?: boolean;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useLatestDataPoints(
  datasetId: string,
  options: UseLatestDataPointsOptions = {}
) {
  const {
    initialLimit = 1000,
    enablePolling = false,
    pollingInterval = 10000,
    initialFilters = {},
    incrementalMode = true,
    onDataReceived,
    onError,
    silentErrors = false,
  } = options;

  // ========== ESTADO ==========
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [metadata, setMetadata] = useState<DataPointsMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(enablePolling);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false); // Nuevo: track si dataset está vacío

  // Filtros reactivos
  const [filters, setFilters] = useState(initialFilters);
  const [limit, setLimit] = useState(initialLimit);

  // Refs para tracking
  const lastTimestampRef = useRef<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialLoadRef = useRef(true);
  const consecutiveEmptyFetches = useRef(0); // Track fetches vacíos consecutivos

  // ========== FUNCIÓN DE FETCH PRINCIPAL ==========
  const fetchDataPoints = useCallback(
    async (isIncremental: boolean = false) => {
      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      
      // Solo mostrar loading en carga inicial o refresh completo
      if (!isIncremental || isInitialLoadRef.current) {
        setIsLoading(true);
      }
      
      setError(null);

      try {
        // Construir URL con query params
        const params = new URLSearchParams();
        
        // Límite
        params.append('limit', limit.toString());

        // Filtros
        if (filters.sensorType) {
          params.append('sensorType', filters.sensorType);
        }
        if (filters.sensorId) {
          params.append('sensorId', filters.sensorId);
        }

        // Modo incremental: solo puntos después del último timestamp
        if (isIncremental && lastTimestampRef.current) {
          params.append('since', lastTimestampRef.current);
        }

        const response = await fetch(
          `/api/datasets/${datasetId}/latest?${params.toString()}`,
          {
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch data points');
        }

        const result: DataPointsResponse = await response.json();

        // Actualizar metadata
        setMetadata(result.metadata);

        // Warning si hay límite grande (solo si no es silencioso)
        if (result.metadata.warning && !silentErrors) {
          toast.warning('Performance Notice', {
            description: result.metadata.warning,
          });
        }

        // Procesar data points
        const newPoints = result.data.map(point => ({
          ...point,
          timestamp: new Date(point.timestamp),
        }));

        // ✅ MANEJO DE DATASET VACÍO
        if (newPoints.length === 0) {
          consecutiveEmptyFetches.current += 1;
          
          if (!isIncremental) {
            // Primera carga sin datos
            setDataPoints([]);
            setIsEmpty(true);
            
            if (!silentErrors && isInitialLoadRef.current) {
              console.log('ℹ️ Dataset is empty - waiting for data...');
            }
          }
          
          // Callback con array vacío
          if (onDataReceived) {
            onDataReceived([], isIncremental);
          }
          
          return [];
        }

        // ✅ HAY DATOS - Resetear contador de fetches vacíos
        consecutiveEmptyFetches.current = 0;
        setIsEmpty(false);

        if (isIncremental && newPoints.length > 0) {
          // Modo incremental: agregar solo puntos nuevos
          setDataPoints(prev => {
            // Si antes estaba vacío, reemplazar directamente
            if (prev.length === 0) {
              return newPoints;
            }
            
            // Combinar y ordenar por timestamp DESC
            const combined = [...newPoints, ...prev];
            const unique = Array.from(
              new Map(combined.map(p => [p.id, p])).values()
            );
            return unique
              .sort((a, b) => 
                new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
              )
              .slice(0, limit); // Mantener solo los últimos N
          });
        } else {
          // Carga completa: reemplazar todos
          setDataPoints(newPoints);
        }

        // Actualizar último timestamp
        if (newPoints.length > 0) {
          const latestPoint = newPoints[0]; // Ya está ordenado DESC
          lastTimestampRef.current = new Date(latestPoint.timestamp).toISOString();
        }

        // Callback
        if (onDataReceived) {
          onDataReceived(newPoints, isIncremental);
        }

        return newPoints;
      } catch (err) {
        // Ignorar errores de abort
        if (err instanceof Error && err.name === 'AbortError') {
          return [];
        }

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);

        // Solo mostrar error si no es silencioso y no es un dataset vacío
        if (!silentErrors && consecutiveEmptyFetches.current < 3) {
          if (onError) {
            onError(errorMessage);
          } else {
            toast.error('Error loading data points', {
              description: errorMessage,
            });
          }
        }

        return [];
      } finally {
        setIsLoading(false);
        isInitialLoadRef.current = false;
      }
    },
    [datasetId, limit, filters, onDataReceived, onError, silentErrors]
  );

  // ========== CARGA INICIAL ==========
  useEffect(() => {
    fetchDataPoints(false);
  }, [fetchDataPoints]);

  // ========== POLLING ==========
  useEffect(() => {
    if (!isPolling) {
      // Limpiar polling si está deshabilitado
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // ✅ AJUSTAR INTERVALO SI DATASET ESTÁ VACÍO
    const adjustedInterval = isEmpty ? pollingInterval * 3 : pollingInterval;

    // Configurar polling
    pollingIntervalRef.current = setInterval(() => {
      // Solo carga incremental en polling si ya hay datos
      if (incrementalMode && dataPoints.length > 0) {
        fetchDataPoints(true);
      } else {
        fetchDataPoints(false);
      }
    }, adjustedInterval);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isPolling, pollingInterval, incrementalMode, fetchDataPoints, isEmpty, dataPoints.length]);

  // ========== CLEANUP ==========
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // ========== MÉTODOS PÚBLICOS ==========

  /**
   * Refrescar manualmente los datos (carga completa)
   */
  const refresh = useCallback(() => {
    lastTimestampRef.current = null; // Reset timestamp
    consecutiveEmptyFetches.current = 0; // Reset contador
    return fetchDataPoints(false);
  }, [fetchDataPoints]);

  /**
   * Cargar solo puntos nuevos desde el último timestamp
   */
  const loadNewPoints = useCallback(() => {
    return fetchDataPoints(true);
  }, [fetchDataPoints]);

  /**
   * Actualizar filtros (dispara nueva carga automática)
   */
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    lastTimestampRef.current = null; // Reset para carga completa
    consecutiveEmptyFetches.current = 0;
  }, []);

  /**
   * Limpiar todos los filtros
   */
  const clearFilters = useCallback(() => {
    setFilters({});
    lastTimestampRef.current = null;
    consecutiveEmptyFetches.current = 0;
  }, []);

  /**
   * Actualizar límite de puntos
   */
  const updateLimit = useCallback((newLimit: number) => {
    setLimit(Math.min(newLimit, 5000)); // Max 5000
    lastTimestampRef.current = null;
  }, []);

  /**
   * Iniciar/detener polling
   */
  const togglePolling = useCallback((enabled?: boolean) => {
    setIsPolling(prev => enabled ?? !prev);
  }, []);

  /**
   * Limpiar todos los datos
   */
  const clearData = useCallback(() => {
    setDataPoints([]);
    setMetadata(null);
    lastTimestampRef.current = null;
    consecutiveEmptyFetches.current = 0;
    setIsEmpty(false);
  }, []);

  /**
   * Obtener puntos filtrados por tipo de sensor
   */
  const getPointsBySensorType = useCallback(
    (sensorType: string) => {
      return dataPoints.filter(point => point.sensorType === sensorType);
    },
    [dataPoints]
  );

  /**
   * Obtener puntos filtrados por sensor ID
   */
  const getPointsBySensorId = useCallback(
    (sensorId: string) => {
      return dataPoints.filter(point => point.sensorId === sensorId);
    },
    [dataPoints]
  );

  /**
   * Obtener estadísticas rápidas
   */
  const getStats = useCallback(() => {
    if (dataPoints.length === 0) return null;

    const values = dataPoints.map(p => p.value);
    const sensorTypes = new Set(dataPoints.map(p => p.sensorType));
    const sensorIds = new Set(dataPoints.map(p => p.sensorId));

    return {
      count: dataPoints.length,
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
      avgValue: values.reduce((a, b) => a + b, 0) / values.length,
      sensorTypeCount: sensorTypes.size,
      sensorIdCount: sensorIds.size,
      timeRange: {
        earliest: new Date(Math.min(...dataPoints.map(p => new Date(p.timestamp).getTime()))),
        latest: new Date(Math.max(...dataPoints.map(p => new Date(p.timestamp).getTime()))),
      },
    };
  }, [dataPoints]);

  // ========== RETURN ==========
  return {
    // Estado principal
    dataPoints,
    metadata,
    isLoading,
    isPolling,
    error,
    isEmpty, // ✅ NUEVO: Indica si dataset está vacío

    // Estado de filtros
    filters,
    limit,

    // Acciones de carga
    refresh,
    loadNewPoints,

    // Gestión de filtros
    updateFilters,
    clearFilters,
    updateLimit,

    // Control de polling
    togglePolling,

    // Utilidades
    clearData,
    getPointsBySensorType,
    getPointsBySensorId,
    getStats,

    // Info útil
    hasData: dataPoints.length > 0,
    isInitialLoad: isInitialLoadRef.current,
    lastTimestamp: lastTimestampRef.current,
    consecutiveEmptyFetches: consecutiveEmptyFetches.current, // ✅ NUEVO: Para debugging
  };
}