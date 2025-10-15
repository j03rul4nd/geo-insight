/**
 * Hook para gestionar estadísticas agregadas del dataset
 * 
 * CARACTERÍSTICAS CLAVE:
 * - Obtiene stats agregadas (count, avg, min, max) por rango de tiempo
 * - Timeline para gráficos (agrupado por 15min/1h/1d)
 * - Polling inteligente con cache (30-60s)
 * - Filtros por rango temporal (1h, 24h, 7d, 30d, custom)
 * - Bounding box para configurar cámara 3D
 * - Detección de health del dataset
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// ============================================================================
// TIPOS
// ============================================================================

export interface DatasetInfo {
  id: string;
  name: string;
  status: 'active' | 'inactive' | 'error' | 'paused';
  source: 'mqtt_stream' | 'webhook' | 'api' | 'file_upload';
  isHealthy: boolean;
  createdAt: string;
}

export interface DatasetTotals {
  allTimeDataPoints: number;
  todayDataPoints: number;
  lastDataReceived: string | null;
  avgUpdateFrequency: number | null; // segundos entre actualizaciones
  estimatedDataRate: number | null; // puntos por hora
}

export interface RangeStats {
  period: string;
  start: string;
  end: string;
  dataPoints: number;
  avgValue: number;
  maxValue: number;
  minValue: number;
}

export interface SensorStats {
  type: string;
  count: number;
  avgValue: number;
  maxValue: number;
  minValue: number;
}

export interface SensorType {
  type: string;
  unit: string | null;
}

export interface AlertsInfo {
  enabled: boolean;
  activeCount: number;
}

export interface TimelinePoint {
  timestamp: string;
  count: number;
  avgValue: number;
}

export interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}

export interface DatasetStats {
  dataset: DatasetInfo;
  totals: DatasetTotals;
  range: RangeStats;
  sensors: SensorStats[];
  availableSensorTypes: SensorType[];
  alerts: AlertsInfo;
  timeline?: TimelinePoint[];
  boundingBox?: BoundingBox;
}

interface StatsResponse {
  success: boolean;
  data: DatasetStats;
  metadata: {
    queriedAt: string;
    cached: boolean;
  };
}

export type TimeRange = '1h' | '24h' | '7d' | '30d';

export interface UseDatasetStatsOptions {
  // Rango temporal inicial
  initialRange?: TimeRange;
  
  // Incluir timeline para gráficos
  includeTimeline?: boolean;
  
  // Incluir bounding box para 3D
  includeBoundingBox?: boolean;
  
  // Polling automático
  enablePolling?: boolean;
  pollingInterval?: number; // ms (default: 30000 = 30s)
  
  // Auto-fetch al montar
  autoFetch?: boolean;
  
  // Callbacks
  onStatsReceived?: (stats: DatasetStats) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useDatasetStats(
  datasetId: string,
  options: UseDatasetStatsOptions = {}
) {
  const {
    initialRange = '24h',
    includeTimeline = true,
    includeBoundingBox = true,
    enablePolling = false,
    pollingInterval = 30000, // 30s por defecto
    autoFetch = true,
    onStatsReceived,
    onError,
  } = options;

  // ========== ESTADO ==========
  const [stats, setStats] = useState<DatasetStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<TimeRange>(initialRange);
  const [isPolling, setIsPolling] = useState(enablePolling);

  // Refs para tracking
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastFetchRef = useRef<number>(0);

  // ========== FETCH STATS ==========
  const fetchStats = useCallback(
    async (timeRange: TimeRange = range) => {
      // Evitar fetch duplicados muy cercanos (< 5s)
      const now = Date.now();
      if (now - lastFetchRef.current < 5000 && stats) {
        console.log('⏭️ Skipping duplicate fetch (< 5s)');
        return stats;
      }
      lastFetchRef.current = now;

      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        // Construir URL con query params
        const params = new URLSearchParams();
        params.append('range', timeRange);
        
        if (!includeTimeline) {
          params.append('timeline', 'false');
        }
        if (!includeBoundingBox) {
          params.append('boundingBox', 'false');
        }

        const response = await fetch(
          `/api/datasets/${datasetId}/stats?${params.toString()}`,
          {
            signal: abortControllerRef.current.signal,
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch statistics');
        }

        const result: StatsResponse = await response.json();

        setStats(result.data);

        // Callback
        if (onStatsReceived) {
          onStatsReceived(result.data);
        }

        return result.data;
      } catch (err) {
        // Ignorar errores de abort
        if (err instanceof Error && err.name === 'AbortError') {
          return null;
        }

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        } else {
          toast.error('Error loading statistics', {
            description: errorMessage,
          });
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [datasetId, range, includeTimeline, includeBoundingBox, stats, onStatsReceived, onError]
  );

  // ========== CARGA INICIAL ==========
  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [autoFetch]); // Solo ejecutar en mount

  // ========== POLLING ==========
  useEffect(() => {
    if (!isPolling) {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      return;
    }

    // Configurar polling
    pollingIntervalRef.current = setInterval(() => {
      fetchStats();
    }, pollingInterval);

    // Cleanup
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [isPolling, pollingInterval, fetchStats]);

  // ========== RE-FETCH AL CAMBIAR RANGO ==========
  useEffect(() => {
    if (autoFetch) {
      fetchStats(range);
    }
  }, [range]); // Solo cuando cambia el rango

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
   * Refrescar estadísticas manualmente
   */
  const refresh = useCallback(() => {
    return fetchStats();
  }, [fetchStats]);

  /**
   * Cambiar rango temporal (dispara nuevo fetch automáticamente)
   */
  const changeRange = useCallback((newRange: TimeRange) => {
    setRange(newRange);
  }, []);

  /**
   * Habilitar/deshabilitar polling
   */
  const togglePolling = useCallback((enabled?: boolean) => {
    setIsPolling(prev => enabled ?? !prev);
  }, []);

  /**
   * Obtener stats de un sensor específico
   */
  const getSensorStats = useCallback(
    (sensorType: string): SensorStats | null => {
      if (!stats) return null;
      return stats.sensors.find(s => s.type === sensorType) || null;
    },
    [stats]
  );

  /**
   * Verificar si el dataset está recibiendo datos
   */
  const isReceivingData = useCallback(() => {
    if (!stats?.totals.lastDataReceived) return false;
    const lastReceived = new Date(stats.totals.lastDataReceived).getTime();
    const now = Date.now();
    const timeSinceLastData = (now - lastReceived) / 1000; // segundos
    
    // Considerar "recibiendo datos" si el último dato fue hace menos de 5 min
    return timeSinceLastData < 5 * 60;
  }, [stats]);

  /**
   * Obtener tiempo desde el último dato recibido (en segundos)
   */
  const getTimeSinceLastData = useCallback(() => {
    if (!stats?.totals.lastDataReceived) return null;
    const lastReceived = new Date(stats.totals.lastDataReceived).getTime();
    const now = Date.now();
    return Math.floor((now - lastReceived) / 1000); // segundos
  }, [stats]);

  /**
   * Calcular dimensiones del bounding box (para configurar cámara 3D)
   */
  const getBoundingBoxDimensions = useCallback(() => {
    if (!stats?.boundingBox) return null;

    const { min, max } = stats.boundingBox;
    
    return {
      width: max.x - min.x,
      height: max.y - min.y,
      depth: max.z - min.z,
      center: {
        x: (min.x + max.x) / 2,
        y: (min.y + max.y) / 2,
        z: (min.z + max.z) / 2,
      },
      diagonal: Math.sqrt(
        Math.pow(max.x - min.x, 2) +
        Math.pow(max.y - min.y, 2) +
        Math.pow(max.z - min.z, 2)
      ),
    };
  }, [stats]);

  /**
   * Obtener el timeline preparado para Recharts
   */
  const getTimelineForChart = useCallback(() => {
    if (!stats?.timeline) return [];
    
    return stats.timeline.map(point => ({
      timestamp: new Date(point.timestamp).getTime(),
      date: new Date(point.timestamp).toLocaleString(),
      count: point.count,
      avgValue: Number(point.avgValue.toFixed(2)),
    }));
  }, [stats]);

  /**
   * Obtener stats por sensor preparadas para gráficos
   */
  const getSensorStatsForChart = useCallback(() => {
    if (!stats?.sensors) return [];
    
    return stats.sensors
      .sort((a, b) => b.count - a.count) // Ordenar por cantidad
      .map(sensor => ({
        name: sensor.type,
        count: sensor.count,
        avg: Number(sensor.avgValue.toFixed(2)),
        max: Number(sensor.maxValue.toFixed(2)),
        min: Number(sensor.minValue.toFixed(2)),
      }));
  }, [stats]);

  /**
   * Calcular progreso del día (para "Today's Progress")
   */
  const getTodayProgress = useCallback(() => {
    if (!stats) return null;

    const today = stats.totals.todayDataPoints;
    const allTime = stats.totals.allTimeDataPoints;
    
    if (allTime === 0) return 0;
    
    const avgDailyRate = allTime / Math.max(1, getDaysSinceCreation());
    const progress = (today / Math.max(avgDailyRate, 1)) * 100;
    
    return Math.min(Math.round(progress), 100);
  }, [stats]);

  /**
   * Calcular días desde creación del dataset
   */
  const getDaysSinceCreation = useCallback(() => {
    if (!stats?.dataset.createdAt) return 0;
    const created = new Date(stats.dataset.createdAt).getTime();
    const now = Date.now();
    return Math.floor((now - created) / (24 * 60 * 60 * 1000));
  }, [stats]);

  /**
   * Obtener health status detallado
   */
  const getHealthStatus = useCallback(() => {
    if (!stats) return null;

    const isReceiving = isReceivingData();
    const timeSinceLastData = getTimeSinceLastData();
    const hasActiveAlerts = stats.alerts.activeCount > 0;
    
    let status: 'healthy' | 'warning' | 'error' | 'inactive';
    let message: string;

    if (stats.dataset.status !== 'active') {
      status = 'inactive';
      message = 'Dataset is not active';
    } else if (!isReceiving) {
      status = 'error';
      message = `No data received for ${Math.floor((timeSinceLastData || 0) / 60)} minutes`;
    } else if (hasActiveAlerts) {
      status = 'warning';
      message = `${stats.alerts.activeCount} active alert${stats.alerts.activeCount > 1 ? 's' : ''}`;
    } else {
      status = 'healthy';
      message = 'All systems operational';
    }

    return {
      status,
      message,
      isReceiving,
      timeSinceLastData,
      hasActiveAlerts,
      activeAlertsCount: stats.alerts.activeCount,
    };
  }, [stats, isReceivingData, getTimeSinceLastData]);

  /**
   * Comparar con el período anterior (para mostrar % change)
   */
  const compareWithPreviousPeriod = useCallback(() => {
    // TODO: Implementar si la API devuelve datos del período anterior
    // Por ahora retornar null
    return null;
  }, []);

  // ========== RETURN ==========
  return {
    // Estado principal
    stats,
    isLoading,
    error,

    // Configuración
    range,
    isPolling,

    // Acciones
    refresh,
    changeRange,
    togglePolling,

    // Queries específicas
    getSensorStats,
    isReceivingData,
    getTimeSinceLastData,
    getBoundingBoxDimensions,
    getHealthStatus,
    getDaysSinceCreation,
    getTodayProgress,

    // Datos formateados para UI/Charts
    getTimelineForChart,
    getSensorStatsForChart,
    compareWithPreviousPeriod,

    // Info útil
    hasData: !!stats,
    hasTimeline: !!stats?.timeline && stats.timeline.length > 0,
    hasBoundingBox: !!stats?.boundingBox,
    sensorCount: stats?.availableSensorTypes.length || 0,
    totalDataPoints: stats?.totals.allTimeDataPoints || 0,
    dataPointsInRange: stats?.range.dataPoints || 0,
  };
}

// ============================================================================
// HELPER: Range selector component
// ============================================================================

/**
 * Tipos de rango con labels para UI
 */
export const TIME_RANGE_OPTIONS: Array<{
  value: TimeRange;
  label: string;
  description: string;
}> = [
  {
    value: '1h',
    label: 'Last Hour',
    description: 'Data from the last 60 minutes',
  },
  {
    value: '24h',
    label: 'Last 24 Hours',
    description: 'Data from the last day',
  },
  {
    value: '7d',
    label: 'Last 7 Days',
    description: 'Data from the last week',
  },
  {
    value: '30d',
    label: 'Last 30 Days',
    description: 'Data from the last month',
  },
];