'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
import MetricsList from './components/MetricsList';
import CreateMetricModal from './components/CreateMetricModal';
import EditMetricModal from './components/EditMetricModal';
import MetricChart from '@/components/MetricChart/index';

import { useMetrics, MetricConfig, CreateMetricData, UpdateMetricData } from '@/hooks/useMetrics';

// ============================================
// TYPES
// ============================================

interface DataPoint {
  id: string;
  datasetId: string;
  value: number;
  sensorId: string;
  timestamp: Date | string;
  metadata?: {
    [key: string]: any;
  };
}

interface RealTimeMetricsProps {
  datasetId: string;
  dataPoints: DataPoint[];
  collapsed?: boolean;
  className?: string;
}

// ============================================
// MAIN COMPONENT
// ============================================

const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
  datasetId,
  dataPoints,
  collapsed = false,
  className = ''
}) => {
  // ============================================
  // STATE & HOOKS
  // ============================================
  
  const {
    metrics,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isBatchProcessing,
    error,
    createMetric,
    updateMetric,
    deleteMetric,
    duplicateMetric,
    reorderMetrics,
    toggleMetricsVisibility,
    batchDeleteMetrics,
  } = useMetrics(datasetId);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingMetric, setEditingMetric] = useState<MetricConfig | null>(null);
  const [expandedMetrics, setExpandedMetrics] = useState<Set<string>>(new Set());
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set());

  // ============================================
  // HANDLERS - CRUD OPERATIONS
  // ============================================

  const handleCreateMetric = useCallback(async (config: CreateMetricData) => {
    const newMetric = await createMetric(config);
    
    if (newMetric) {
      setShowCreateModal(false);
      setExpandedMetrics(prev => new Set(prev).add(newMetric.id));
    }
  }, [createMetric]);

  const handleUpdateMetric = useCallback(async (id: string, updates: UpdateMetricData) => {
    const updatedMetric = await updateMetric(id, updates);
    
    if (updatedMetric) {
      setEditingMetric(null);
    }
  }, [updateMetric]);

  const handleDeleteMetric = useCallback(async (id: string) => {
    const success = await deleteMetric(id);
    
    if (success) {
      setExpandedMetrics(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setSelectedMetrics(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [deleteMetric]);

  const handleDuplicateMetric = useCallback(async (id: string) => {
    const duplicated = await duplicateMetric(id);
    
    if (duplicated) {
      setExpandedMetrics(prev => new Set(prev).add(duplicated.id));
    }
  }, [duplicateMetric]);

  const toggleMetricExpanded = useCallback((id: string) => {
    setExpandedMetrics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleMetricSelected = useCallback((id: string) => {
    setSelectedMetrics(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedMetrics.size === metrics.length) {
      setSelectedMetrics(new Set());
    } else {
      setSelectedMetrics(new Set(metrics.map(m => m.id)));
    }
  }, [selectedMetrics.size, metrics]);

  // ============================================
  // HANDLERS - BATCH OPERATIONS
  // ============================================

  const handleBatchDelete = useCallback(async () => {
    if (selectedMetrics.size === 0) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedMetrics.size} metric(s)?`
    );
    
    if (!confirmed) return;

    const success = await batchDeleteMetrics(Array.from(selectedMetrics));
    
    if (success) {
      setSelectedMetrics(new Set());
      setExpandedMetrics(prev => {
        const newSet = new Set(prev);
        selectedMetrics.forEach(id => newSet.delete(id));
        return newSet;
      });
    }
  }, [selectedMetrics, batchDeleteMetrics]);

  const handleBatchToggleVisibility = useCallback(async (isVisible: boolean) => {
    if (selectedMetrics.size === 0) return;

    await toggleMetricsVisibility(Array.from(selectedMetrics), isVisible);
    setSelectedMetrics(new Set());
  }, [selectedMetrics, toggleMetricsVisibility]);

  const handleReorderMetrics = useCallback(async (reorderedMetrics: MetricConfig[]) => {
    const metricsWithNewOrder = reorderedMetrics.map((metric, index) => ({
      id: metric.id,
      sortOrder: index
    }));

    await reorderMetrics(metricsWithNewOrder);
  }, [reorderMetrics]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const extractValue = useCallback((dataPoint: DataPoint, selector: string): number | null => {
    try {
      const path = selector.split('.');
      let value: any = dataPoint;

      for (const key of path) {
        if (value && typeof value === 'object' && key in value) {
          value = value[key];
        } else {
          return null;
        }
      }

      const numValue = Number(value);
      return isNaN(numValue) ? null : numValue;
    } catch (error) {
      console.error('Error extracting value:', error);
      return null;
    }
  }, []);

  const metricsData = useMemo(() => {
    return metrics
      .filter(metric => metric.isVisible)
      .map(metric => {
        const values = dataPoints
          .map(dp => {
            const value = extractValue(dp, metric.valueSelector);
            return value !== null ? {
              timestamp: new Date(dp.timestamp),
              value
            } : null;
          })
          .filter((v): v is { timestamp: Date; value: number } => v !== null)
          .slice(-(metric.windowSize || 50));

        return {
          metric,
          values,
          isEmpty: values.length === 0
        };
      });
  }, [metrics, dataPoints, extractValue]);

  const isProcessing = isCreating || isUpdating || isDeleting || isBatchProcessing;

  // ============================================
  // RENDER - COLLAPSED MODE
  // ============================================

  if (collapsed) {
    return (
      <div className={`${className}`}>
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full p-2 hover:bg-[#27272a] rounded transition-colors"
          title="Add Metric"
          disabled={isProcessing}
        >
          <TrendingUp size={18} className="mx-auto" />
        </button>
      </div>
    );
  }

  // ============================================
  // RENDER - FULL MODE
  // ============================================

  return (
    <div className={`${className}`}>
      {/* HEADER */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <TrendingUp size={16} className="text-[#10b981]" />
            Real-time Metrics
            {metrics.length > 0 && (
              <span className="text-xs text-gray-500">({metrics.length})</span>
            )}
          </h3>

          <button
            onClick={() => setShowCreateModal(true)}
            disabled={isProcessing}
            className="p-1.5 bg-[#3b82f6] hover:bg-[#2563eb] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
            title="Add Metric"
          >
            <Plus size={14} />
          </button>
        </div>
        
        {/* Batch Actions Bar */}
        {selectedMetrics.size > 0 && (
          <div className="flex items-center gap-2 p-2 bg-[#27272a] rounded-lg border border-[#3b82f6]/30 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <span className="text-xs font-medium text-[#3b82f6] shrink-0">
                {selectedMetrics.size} selected
              </span>
              <div className="h-3 w-px bg-gray-700 shrink-0"></div>
              <div className="flex items-center gap-1 flex-wrap min-w-0">
                <button
                  onClick={() => handleBatchToggleVisibility(false)}
                  disabled={isProcessing}
                  className="px-2 py-1 bg-[#3f3f46] hover:bg-[#52525b] rounded text-[11px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95"
                  title="Hide selected metrics"
                >
                  Hide
                </button>
                <button
                  onClick={() => handleBatchToggleVisibility(true)}
                  disabled={isProcessing}
                  className="px-2 py-1 bg-[#3f3f46] hover:bg-[#52525b] rounded text-[11px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95"
                  title="Show selected metrics"
                >
                  Show
                </button>
                <button
                  onClick={handleBatchDelete}
                  disabled={isProcessing}
                  className="px-2 py-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded text-[11px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95 border border-red-600/20"
                  title="Delete selected metrics"
                >
                  Delete
                </button>
              </div>
            </div>
            <button
              onClick={() => setSelectedMetrics(new Set())}
              className="text-gray-500 hover:text-gray-300 transition-colors text-xs shrink-0 ml-auto"
              title="Clear selection"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="mb-3 bg-red-900/20 border border-red-600/50 rounded p-3 text-sm text-red-400">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* LOADING STATE */}
      {isLoading && metrics.length === 0 ? (
        <div className="bg-[#27272a] rounded p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10b981] mx-auto mb-3"></div>
          <p className="text-sm text-gray-400">Loading metrics...</p>
        </div>
      ) : null}

      {/* EMPTY STATE */}
      {!isLoading && metrics.length === 0 ? (
        <div className="bg-[#27272a] rounded p-6 text-center">
          <TrendingUp size={32} className="mx-auto mb-3 text-gray-600" />
          <p className="text-sm text-gray-400 mb-3">
            No metrics configured yet
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={isProcessing}
            className="text-xs px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? 'Creating...' : 'Create First Metric'}
          </button>
        </div>
      ) : null}

      {/* METRICS LIST & CHARTS */}
      {metrics.length > 0 ? (
        <div className="space-y-3">
          <MetricsList
            metrics={metrics}
            expandedMetrics={expandedMetrics}
            selectedMetrics={selectedMetrics}
            onToggleExpand={toggleMetricExpanded}
            onToggleSelect={toggleMetricSelected}
            onSelectAll={toggleSelectAll}
            onEdit={(metric) => setEditingMetric(metric)}
            onDelete={handleDeleteMetric}
            onDuplicate={handleDuplicateMetric}
            onReorder={handleReorderMetrics}
            isProcessing={isProcessing}
          />

          {/* ✨ AQUÍ SE USA MetricChart - Sin cambios necesarios */}
          <div className="space-y-3">
            {metricsData
              .filter(({ metric }) => expandedMetrics.has(metric.id))
              .map(({ metric, values, isEmpty }) => (
                <MetricChart
                  key={metric.id}
                  metric={metric}
                  values={values}
                  isEmpty={isEmpty}
                  onClose={() => toggleMetricExpanded(metric.id)}
                />
              ))}
          </div>
        </div>
      ) : null}

      {/* MODALS */}
      {showCreateModal && (
        <CreateMetricModal
          onSave={handleCreateMetric}
          onClose={() => setShowCreateModal(false)}
          existingMetrics={metrics}
          sampleDataPoint={dataPoints[0]}
          isCreating={isCreating}
        />
      )}

      {editingMetric && (
        <EditMetricModal
          metric={editingMetric}
          onSave={(updates) => handleUpdateMetric(editingMetric.id, updates)}
          onClose={() => setEditingMetric(null)}
          sampleDataPoint={dataPoints[0]}
          isUpdating={isUpdating}
        />
      )}

      {isBatchProcessing && (
        <div className="fixed bottom-4 right-4 bg-[#27272a] border border-[#3b82f6] rounded-lg p-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#10b981]"></div>
            <span className="text-sm text-gray-300">Processing batch operation...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeMetrics;