import { useState, useCallback } from 'react';

// Tipos
export interface AIInsight {
  id: string;
  type: 'anomaly' | 'prediction' | 'optimization' | 'pattern';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  summary: string;
  details: string | null;
  recommendations: string | null;
  affectedArea: any;
  metricsDelta: any;
  isResolved: boolean;
  resolvedAt: string | null;
  dataset: {
    id: string;
    name: string;
    status: string;
  };
  ai: {
    model: string;
    confidence: number | null;
    processingTime: number | null;
    tokensUsed: number | null;
  };
  createdAt: string;
}

export interface InsightsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface InsightsFilters {
  datasetId?: string;
  type?: 'anomaly' | 'prediction' | 'optimization' | 'pattern';
  severity?: 'info' | 'warning' | 'critical';
  isResolved?: boolean;
  page?: number;
  limit?: number;
}

export interface GenerateInsightParams {
  datasetId: string;
  type?: 'anomaly' | 'prediction' | 'optimization' | 'pattern';
  timeRange?: '1h' | '24h' | '7d' | '30d';
}

export interface GenerateInsightResponse {
  insight: AIInsight;
  usage: {
    used: number;
    limit: number;
    remaining: number | 'unlimited';
  };
  performance: {
    totalTime: number;
    aiProcessingTime: number;
    dataPointsAnalyzed: number;
    tokensUsed: number | null;
  };
}

export interface InsightDetail extends AIInsight {
  details: string;
  recommendations: string;
  resolvedBy: string | null;
  user: {
    id: string;
    email: string;
    name: string;
  };
  metadata: {
    daysAgo: number;
    isRecent: boolean;
    isStale: boolean;
    ageLabel: string;
  };
  relatedInsights: Array<{
    id: string;
    type: string;
    severity: string;
    title: string;
    summary: string;
    isResolved: boolean;
    createdAt: string;
  }>;
}

interface UseAIInsightsReturn {
  // Estado
  insights: AIInsight[];
  currentInsight: InsightDetail | null;
  pagination: InsightsPagination | null;
  loading: boolean;
  error: string | null;
  generating: boolean;
  updating: boolean;
  
  // Métodos
  fetchInsights: (filters?: InsightsFilters) => Promise<void>;
  fetchInsightById: (id: string) => Promise<InsightDetail>;
  generateInsight: (params: GenerateInsightParams) => Promise<GenerateInsightResponse>;
  updateInsightStatus: (id: string, isResolved: boolean) => Promise<void>;
  deleteInsight: (id: string) => Promise<void>;
  refreshInsights: () => Promise<void>;
  clearError: () => void;
}

export function useAIInsights(initialFilters?: InsightsFilters): UseAIInsightsReturn {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [pagination, setPagination] = useState<InsightsPagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<InsightsFilters>(initialFilters || {});
  const [currentInsight, setCurrentInsight] = useState<InsightDetail | null>(null);
  const [updating, setUpdating] = useState(false);

  /**
   * Obtener lista de insights con filtros opcionales
   */
  const fetchInsights = useCallback(async (filters?: InsightsFilters) => {
    try {
      setLoading(true);
      setError(null);

      const filtersToUse = filters || currentFilters;
      setCurrentFilters(filtersToUse);

      // Construir query params
      const params = new URLSearchParams();
      if (filtersToUse.datasetId) params.append('datasetId', filtersToUse.datasetId);
      if (filtersToUse.type) params.append('type', filtersToUse.type);
      if (filtersToUse.severity) params.append('severity', filtersToUse.severity);
      if (filtersToUse.isResolved !== undefined) {
        params.append('isResolved', String(filtersToUse.isResolved));
      }
      if (filtersToUse.page) params.append('page', String(filtersToUse.page));
      if (filtersToUse.limit) params.append('limit', String(filtersToUse.limit));

      const response = await fetch(`/api/insights?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener insights');
      }

      setInsights(data.data.insights);
      setPagination(data.data.pagination);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      console.error('Error fetching insights:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  /**
   * Generar nuevo análisis AI
   */
  const generateInsight = useCallback(async (
    params: GenerateInsightParams
  ): Promise<GenerateInsightResponse> => {
    try {
      setGenerating(true);
      setError(null);

      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejar errores específicos
        if (response.status === 429) {
          if (data.retryAfter) {
            throw new Error(`${data.message} (espera ${data.retryAfter}s)`);
          }
          throw new Error(data.message || 'Límite alcanzado');
        }
        throw new Error(data.error || 'Error al generar análisis');
      }

      // Agregar el nuevo insight a la lista si existe
      if (data.data.insight) {
        setInsights(prev => [data.data.insight, ...prev]);
      }

      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setGenerating(false);
    }
  }, []);

  /**
   * Obtener detalle de insight por ID
   */
  const fetchInsightById = useCallback(async (id: string): Promise<InsightDetail> => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/insights/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener detalle del insight');
      }
      setCurrentInsight(data.data);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar estado de resolución de un insight
   */
  const updateInsightStatus = useCallback(async (id: string, isResolved: boolean): Promise<void> => {
    try {
      setUpdating(true);
      setError(null);
      const response = await fetch(`/api/insights/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isResolved }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar estado');
      }
      // Actualizar insight en la lista
      setInsights(prev =>
        prev.map(insight =>
          insight.id === id ? { ...insight, isResolved: data.data.isResolved, resolvedAt: data.data.resolvedAt } : insight
        )
      );
      // Actualizar currentInsight si corresponde
      if (currentInsight && currentInsight.id === id) {
        setCurrentInsight({ ...currentInsight, isResolved: data.data.isResolved, resolvedAt: data.data.resolvedAt });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [currentInsight]);

  /**
   * Eliminar insight
   */
  const deleteInsight = useCallback(async (id: string): Promise<void> => {
    try {
      setUpdating(true);
      setError(null);
      const response = await fetch(`/api/insights/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error al eliminar insight');
      }
      setInsights(prev => prev.filter(insight => insight.id !== id));
      if (currentInsight && currentInsight.id === id) {
        setCurrentInsight(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, [currentInsight]);

  /**
   * Refrescar insights con los filtros actuales
   */
  const refreshInsights = useCallback(async () => {
    await fetchInsights(currentFilters);
  }, [fetchInsights, currentFilters]);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    insights,
    currentInsight,
    pagination,
    loading,
    error,
    generating,
    updating,
    fetchInsights,
    fetchInsightById,
    generateInsight,
    updateInsightStatus,
    deleteInsight,
    refreshInsights,
    clearError,
  };
}