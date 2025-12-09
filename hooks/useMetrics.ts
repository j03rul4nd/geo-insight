// ============================================
// hooks/useMetrics.ts
// Hook para gestionar métricas de un dataset
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

export type FilterOperator = 
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equal'
  | 'less_than_or_equal'
  | 'in'
  | 'not_in';

export interface FilterRule {
  field: string;
  operator: FilterOperator;
  value: string | number | boolean | (string | number)[];
}

export interface FiltersConfig {
  logic: 'AND' | 'OR';
  rules: FilterRule[];
}

export interface MetricThreshold {
  value: number;
  color: string;
  label?: string;
}

export interface MetricConfig {
  id: string;
  datasetId: string;
  name: string;
  color: string;
  valueSelector: string;
  aggregation: 'none' | 'avg' | 'sum' | 'min' | 'max' | 'count';
  windowSize: number;
  chartType: 'line' | 'area' | 'bar' | 'scatter' | 'gauge' | 'distribution';
  showStats: boolean;
  unit: string | null;
  decimals: number;
  
  // 🆕 Filtros avanzados
  filters?: FiltersConfig | null;
  
  // Propiedades avanzadas
  secondaryValueSelector?: string | null;
  groupBySelector?: string | null;
  thresholds?: MetricThreshold[] | null;
  description?: string | null;
  isVisible: boolean;
  sortOrder: number;
  
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CreateMetricData {
  name: string;
  color: string;
  valueSelector: string;
  aggregation?: 'none' | 'avg' | 'sum' | 'min' | 'max' | 'count';
  windowSize?: number;
  chartType?: 'line' | 'area' | 'bar' | 'scatter' | 'gauge' | 'distribution';
  showStats?: boolean;
  unit?: string | null;
  decimals?: number;
  
  // 🆕 Filtros avanzados
  filters?: FiltersConfig | null;
  
  // Opciones avanzadas
  secondaryValueSelector?: string | null;
  groupBySelector?: string | null;
  thresholds?: MetricThreshold[] | null;
  description?: string | null;
  isVisible?: boolean;
  sortOrder?: number;
}

export interface UpdateMetricData extends Partial<CreateMetricData> {}

// Tipos para operaciones batch
export type BatchReorderData = {
  action: 'reorder';
  metrics: Array<{ id: string; sortOrder: number }>;
};

export type BatchToggleVisibilityData = {
  action: 'toggle_visibility';
  metricIds: string[];
  isVisible: boolean;
};

export type BatchDeleteData = {
  action: 'delete';
  metricIds: string[];
};

export type BatchOperationData = 
  | BatchReorderData 
  | BatchToggleVisibilityData 
  | BatchDeleteData;

interface UseMetricsReturn {
  metrics: MetricConfig[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isBatchProcessing: boolean;
  error: string | null;
  fetchMetrics: (options?: FetchMetricsOptions) => Promise<void>;
  createMetric: (data: CreateMetricData) => Promise<MetricConfig | null>;
  updateMetric: (id: string, data: UpdateMetricData) => Promise<MetricConfig | null>;
  deleteMetric: (id: string) => Promise<boolean>;
  duplicateMetric: (id: string) => Promise<MetricConfig | null>;
  batchOperation: (operation: BatchOperationData) => Promise<boolean>;
  reorderMetrics: (metrics: Array<{ id: string; sortOrder: number }>) => Promise<boolean>;
  toggleMetricsVisibility: (metricIds: string[], isVisible: boolean) => Promise<boolean>;
  batchDeleteMetrics: (metricIds: string[]) => Promise<boolean>;
}

interface FetchMetricsOptions {
  includeHidden?: boolean;
  chartType?: 'line' | 'area' | 'bar' | 'scatter' | 'gauge' | 'distribution';
  hasFilters?: boolean;
}

// ============================================
// HOOK
// ============================================

export function useMetrics(datasetId: string): UseMetricsReturn {
  const [metrics, setMetrics] = useState<MetricConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBatchProcessing, setIsBatchProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================
  // FETCH: Obtener todas las métricas
  // ============================================
  
  const fetchMetrics = useCallback(async (options?: FetchMetricsOptions) => {
    if (!datasetId) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options?.includeHidden) {
        params.append('includeHidden', 'true');
      }
      if (options?.chartType) {
        params.append('chartType', options.chartType);
      }
      if (options?.hasFilters) {
        params.append('hasFilters', 'true');
      }

      const url = `/api/datasets/${datasetId}/metrics${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch metrics');
      }

      setMetrics(data.metrics || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(message);
      console.error('Error fetching metrics:', err);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [datasetId]);

  // ============================================
  // CREATE: Crear nueva métrica
  // ============================================
  
  const createMetric = useCallback(
    async (data: CreateMetricData): Promise<MetricConfig | null> => {
      if (!datasetId) return null;

      setIsCreating(true);
      setError(null);

      try {
        const response = await fetch(`/api/datasets/${datasetId}/metrics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          // Manejo de errores de validación de Zod
          if (result.details) {
            const errorMessages = result.details
              .map((detail: any) => `${detail.path}: ${detail.message}`)
              .join(', ');
            throw new Error(errorMessages);
          }
          throw new Error(result.error || 'Failed to create metric');
        }

        const newMetric = result.metric;
        setMetrics((prev) => [...prev, newMetric]);
        toast.success('Metric created successfully');
        return newMetric;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create metric';
        setError(message);
        console.error('Error creating metric:', err);
        toast.error(message);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [datasetId]
  );

  // ============================================
  // UPDATE: Actualizar métrica existente
  // ============================================
  
  const updateMetric = useCallback(
    async (id: string, data: UpdateMetricData): Promise<MetricConfig | null> => {
      if (!datasetId) return null;

      setIsUpdating(true);
      setError(null);

      try {
        const response = await fetch(`/api/datasets/${datasetId}/metrics/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          // Manejo de errores de validación de Zod
          if (result.details) {
            const errorMessages = result.details
              .map((detail: any) => `${detail.path}: ${detail.message}`)
              .join(', ');
            throw new Error(errorMessages);
          }
          throw new Error(result.error || 'Failed to update metric');
        }

        const updatedMetric = result.metric;
        setMetrics((prev) =>
          prev.map((m) => (m.id === id ? updatedMetric : m))
        );
        toast.success('Metric updated successfully');
        return updatedMetric;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update metric';
        setError(message);
        console.error('Error updating metric:', err);
        toast.error(message);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [datasetId]
  );

  // ============================================
  // DELETE: Eliminar métrica
  // ============================================
  
  const deleteMetric = useCallback(
    async (id: string): Promise<boolean> => {
      if (!datasetId) return false;

      setIsDeleting(true);
      setError(null);

      try {
        const response = await fetch(`/api/datasets/${datasetId}/metrics/${id}`, {
          method: 'DELETE',
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete metric');
        }

        setMetrics((prev) => prev.filter((m) => m.id !== id));
        toast.success('Metric deleted successfully');
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete metric';
        setError(message);
        console.error('Error deleting metric:', err);
        toast.error(message);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [datasetId]
  );

  // ============================================
  // DUPLICATE: Duplicar métrica existente
  // ============================================
  
  const duplicateMetric = useCallback(
    async (id: string): Promise<MetricConfig | null> => {
      const metric = metrics.find((m) => m.id === id);
      if (!metric) return null;

      const duplicatedData: CreateMetricData = {
        name: `${metric.name} (Copy)`,
        color: metric.color,
        valueSelector: metric.valueSelector,
        aggregation: metric.aggregation,
        windowSize: metric.windowSize,
        chartType: metric.chartType,
        showStats: metric.showStats,
        unit: metric.unit,
        decimals: metric.decimals,
        filters: metric.filters, // 🆕 Duplicar filtros también
        secondaryValueSelector: metric.secondaryValueSelector,
        groupBySelector: metric.groupBySelector,
        thresholds: metric.thresholds,
        description: metric.description,
        isVisible: metric.isVisible,
        sortOrder: metric.sortOrder + 1,
      };

      return createMetric(duplicatedData);
    },
    [metrics, createMetric]
  );

  // ============================================
  // BATCH OPERATION: Operación batch genérica
  // ============================================
  
  const batchOperation = useCallback(
    async (operation: BatchOperationData): Promise<boolean> => {
      if (!datasetId) return false;

      setIsBatchProcessing(true);
      setError(null);

      try {
        const response = await fetch(`/api/datasets/${datasetId}/metrics/batch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(operation),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to perform batch operation');
        }

        // Refetch metrics para asegurar sincronización
        await fetchMetrics();
        
        toast.success(result.message || 'Batch operation completed successfully');
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to perform batch operation';
        setError(message);
        console.error('Error in batch operation:', err);
        toast.error(message);
        return false;
      } finally {
        setIsBatchProcessing(false);
      }
    },
    [datasetId, fetchMetrics]
  );

  // ============================================
  // REORDER: Reordenar métricas
  // ============================================
  
  const reorderMetrics = useCallback(
    async (metricsToReorder: Array<{ id: string; sortOrder: number }>): Promise<boolean> => {
      return batchOperation({
        action: 'reorder',
        metrics: metricsToReorder,
      });
    },
    [batchOperation]
  );

  // ============================================
  // TOGGLE VISIBILITY: Mostrar/ocultar métricas
  // ============================================
  
  const toggleMetricsVisibility = useCallback(
    async (metricIds: string[], isVisible: boolean): Promise<boolean> => {
      return batchOperation({
        action: 'toggle_visibility',
        metricIds,
        isVisible,
      });
    },
    [batchOperation]
  );

  // ============================================
  // BATCH DELETE: Eliminar múltiples métricas
  // ============================================
  
  const batchDeleteMetrics = useCallback(
    async (metricIds: string[]): Promise<boolean> => {
      return batchOperation({
        action: 'delete',
        metricIds,
      });
    },
    [batchOperation]
  );

  // ============================================
  // EFFECT: Cargar métricas al montar
  // ============================================
  
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // ============================================
  // RETURN
  // ============================================
  
  return {
    metrics,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isBatchProcessing,
    error,
    fetchMetrics,
    createMetric,
    updateMetric,
    deleteMetric,
    duplicateMetric,
    batchOperation,
    reorderMetrics,
    toggleMetricsVisibility,
    batchDeleteMetrics,
  };
}