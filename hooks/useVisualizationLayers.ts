/**
 * Hook para gestionar capas de visualización del 3D viewer
 * 
 * CARACTERÍSTICAS CLAVE:
 * - CRUD completo de layers (create, read, update, delete, reorder)
 * - Toggle individual de layers (show/hide)
 * - Drag & drop reordering con optimistic updates
 * - Aplicación de filtros en cliente (filterQuery evaluation)
 * - Color scheme management (gradient, solid, heatmap, categorical)
 * - Gestión de orden y z-index para renderizado correcto
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// ============================================================================
// TIPOS
// ============================================================================

export type ColorSchemeType = 'gradient' | 'solid' | 'heatmap' | 'categorical';

export interface ColorScheme {
  type: ColorSchemeType;
  low?: string;        // Para gradient
  high?: string;       // Para gradient
  color?: string;      // Para solid
  colors?: string[];   // Para categorical
  thresholds?: number[]; // Para heatmap
}

export interface VisualizationLayer {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  order: number;
  colorScheme: ColorScheme;
  opacity: number;      // 0.0 - 1.0
  pointSize: number;    // 0.1 - 10.0 (multiplicador)
  filterQuery: string | null; // SQL-like: "sensorType = 'temperature' AND value > 70"
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface LayersData {
  datasetId: string;
  datasetName: string;
  layers: VisualizationLayer[];
  totalLayers: number;
  enabledLayers: number;
}

interface LayersResponse {
  success: boolean;
  data: LayersData;
}

export interface CreateLayerPayload {
  name: string;
  description?: string | null;
  enabled?: boolean;
  colorScheme: ColorScheme;
  opacity?: number;
  pointSize?: number;
  filterQuery?: string | null;
}

export interface UpdateLayerPayload {
  name?: string;
  description?: string | null;
  enabled?: boolean;
  colorScheme?: ColorScheme;
  opacity?: number;
  pointSize?: number;
  filterQuery?: string | null;
}

export interface ReorderLayer {
  id: string;
  order: number;
}

export interface UseVisualizationLayersOptions {
  // Auto-fetch al montar
  autoFetch?: boolean;
  
  // Callbacks
  onLayersChanged?: (layers: VisualizationLayer[]) => void;
  onLayerToggled?: (layerId: string, enabled: boolean) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useVisualizationLayers(
  datasetId: string,
  options: UseVisualizationLayersOptions = {}
) {
  const {
    autoFetch = true,
    onLayersChanged,
    onLayerToggled,
    onError,
  } = options;

  // ========== ESTADO ==========
  const [layers, setLayers] = useState<VisualizationLayer[]>([]);
  const [datasetName, setDatasetName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ========== FETCH LAYERS ==========
  const fetchLayers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/datasets/${datasetId}/layers`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch layers');
      }

      const result: LayersResponse = await response.json();

      setLayers(result.data.layers);
      setDatasetName(result.data.datasetName);

      if (onLayersChanged) {
        onLayersChanged(result.data.layers);
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);

      if (onError) {
        onError(errorMessage);
      } else {
        toast.error('Error loading layers', {
          description: errorMessage,
        });
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  }, [datasetId, onLayersChanged, onError]);

  // ========== CREATE LAYER ==========
  const createLayer = useCallback(
    async (payload: CreateLayerPayload) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/datasets/${datasetId}/layers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create layer');
        }

        // Refresh layers
        await fetchLayers();

        toast.success('Layer created', {
          description: `${payload.name} has been created successfully`,
        });

        return result.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        } else {
          toast.error('Error creating layer', {
            description: errorMessage,
          });
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [datasetId, fetchLayers, onError]
  );

  // ========== UPDATE LAYER ==========
  const updateLayer = useCallback(
    async (layerId: string, payload: UpdateLayerPayload) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/datasets/${datasetId}/layers/${layerId}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to update layer');
        }

        // Refresh layers
        await fetchLayers();

        toast.success('Layer updated', {
          description: 'Changes saved successfully',
        });

        return result.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        } else {
          toast.error('Error updating layer', {
            description: errorMessage,
          });
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [datasetId, fetchLayers, onError]
  );

  // ========== DELETE LAYER ==========
  const deleteLayer = useCallback(
    async (layerId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/datasets/${datasetId}/layers/${layerId}`,
          {
            method: 'DELETE',
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to delete layer');
        }

        // Refresh layers
        await fetchLayers();

        toast.success('Layer deleted', {
          description: 'Layer has been removed',
        });

        return true;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        } else {
          toast.error('Error deleting layer', {
            description: errorMessage,
          });
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [datasetId, fetchLayers, onError]
  );

  // ========== TOGGLE LAYER ==========
  const toggleLayer = useCallback(
    async (layerId: string, enabled?: boolean) => {
      // Optimistic update
      const layer = layers.find(l => l.id === layerId);
      if (!layer) return;

      const newEnabled = enabled ?? !layer.enabled;

      setLayers(prev =>
        prev.map(l => (l.id === layerId ? { ...l, enabled: newEnabled } : l))
      );

      if (onLayerToggled) {
        onLayerToggled(layerId, newEnabled);
      }

      try {
        await updateLayer(layerId, { enabled: newEnabled });
      } catch (err) {
        // Revert optimistic update on error
        setLayers(prev =>
          prev.map(l => (l.id === layerId ? { ...l, enabled: !newEnabled } : l))
        );
      }
    },
    [layers, updateLayer, onLayerToggled]
  );

  // ========== REORDER LAYERS ==========
  const reorderLayers = useCallback(
    async (reorderedLayers: ReorderLayer[]) => {
      // Optimistic update
      const previousLayers = [...layers];
      
      setLayers(prev => {
        const newLayers = [...prev];
        reorderedLayers.forEach(({ id, order }) => {
          const layer = newLayers.find(l => l.id === id);
          if (layer) {
            layer.order = order;
          }
        });
        return newLayers.sort((a, b) => a.order - b.order);
      });

      try {
        const response = await fetch(`/api/datasets/${datasetId}/layers`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ layers: reorderedLayers }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to reorder layers');
        }

        toast.success('Layers reordered', {
          description: 'Layer order updated successfully',
        });

        if (onLayersChanged) {
          onLayersChanged(layers);
        }
      } catch (err) {
        // Revert optimistic update on error
        setLayers(previousLayers);

        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        
        if (onError) {
          onError(errorMessage);
        } else {
          toast.error('Error reordering layers', {
            description: errorMessage,
          });
        }

        throw err;
      }
    },
    [datasetId, layers, onLayersChanged, onError]
  );

  // ========== CARGA INICIAL ==========
  useEffect(() => {
    if (autoFetch) {
      fetchLayers();
    }
  }, [autoFetch, fetchLayers]);

  // ========== UTILIDADES ==========

  /**
   * Obtener layer por ID
   */
  const getLayerById = useCallback(
    (layerId: string): VisualizationLayer | null => {
      return layers.find(l => l.id === layerId) || null;
    },
    [layers]
  );

  /**
   * Obtener solo layers habilitados
   */
  const getEnabledLayers = useCallback(() => {
    return layers.filter(l => l.enabled);
  }, [layers]);

  /**
   * Evaluar filterQuery contra un data point
   * NOTA: Implementación básica - mejorar con parser robusto
   */
  const evaluateFilter = useCallback(
    (filterQuery: string | null, dataPoint: any): boolean => {
      if (!filterQuery) return true;

      try {
        // Parse básico de filterQuery
        // Formato: "sensorType = 'temperature' AND value > 70"
        
        // Esta es una implementación SIMPLE - en producción usar un parser real
        const conditions = filterQuery.split(/\s+AND\s+/i);
        
        return conditions.every(condition => {
          const match = condition.match(/(\w+)\s*(=|>|<|>=|<=|!=)\s*('([^']*)'|(\d+\.?\d*))/);
          
          if (!match) return true; // Skip invalid conditions
          
          const [, field, operator, , strValue, numValue] = match;
          const value = strValue !== undefined ? strValue : parseFloat(numValue);
          const dataValue = dataPoint[field];
          
          switch (operator) {
            case '=':
              return dataValue == value;
            case '!=':
              return dataValue != value;
            case '>':
              return dataValue > value;
            case '<':
              return dataValue < value;
            case '>=':
              return dataValue >= value;
            case '<=':
              return dataValue <= value;
            default:
              return true;
          }
        });
      } catch (err) {
        console.warn('Error evaluating filter:', err);
        return true; // En caso de error, mostrar el punto
      }
    },
    []
  );

  /**
   * Filtrar data points según las layers habilitadas
   */
  const filterDataPoints = useCallback(
    (dataPoints: any[]): Map<string, any[]> => {
      const enabledLayers = getEnabledLayers();
      const layerMap = new Map<string, any[]>();

      enabledLayers.forEach(layer => {
        const filteredPoints = dataPoints.filter(point =>
          evaluateFilter(layer.filterQuery, point)
        );
        layerMap.set(layer.id, filteredPoints);
      });

      return layerMap;
    },
    [getEnabledLayers, evaluateFilter]
  );

  /**
   * Obtener color para un valor según el color scheme de una layer
   */
  const getColorForValue = useCallback(
    (layerId: string, value: number): string => {
      const layer = getLayerById(layerId);
      if (!layer) return '#ffffff';

      const { colorScheme } = layer;

      switch (colorScheme.type) {
        case 'solid':
          return colorScheme.color || '#ffffff';

        case 'gradient':
          // Interpolación básica entre low y high
          // TODO: Implementar interpolación real con min/max del dataset
          return colorScheme.low || '#ffffff';

        case 'heatmap':
          // Encontrar threshold correcto
          if (!colorScheme.thresholds || !colorScheme.colors) {
            return '#ffffff';
          }
          
          for (let i = 0; i < colorScheme.thresholds.length; i++) {
            if (value <= colorScheme.thresholds[i]) {
              return colorScheme.colors[i] || '#ffffff';
            }
          }
          return colorScheme.colors[colorScheme.colors.length - 1] || '#ffffff';

        case 'categorical':
          // Para categorical necesitamos saber la categoría, no el valor numérico
          return colorScheme.colors?.[0] || '#ffffff';

        default:
          return '#ffffff';
      }
    },
    [getLayerById]
  );

  /**
   * Toggle all layers on/off
   */
  const toggleAllLayers = useCallback(
    async (enabled: boolean) => {
      // Optimistic update
      setLayers(prev => prev.map(l => ({ ...l, enabled })));

      try {
        await Promise.all(
          layers.map(layer => updateLayer(layer.id, { enabled }))
        );

        toast.success(enabled ? 'All layers enabled' : 'All layers disabled');
      } catch (err) {
        // Revert on error
        await fetchLayers();
      }
    },
    [layers, updateLayer, fetchLayers]
  );

  /**
   * Duplicate layer
   */
  const duplicateLayer = useCallback(
    async (layerId: string) => {
      const layer = getLayerById(layerId);
      if (!layer) return;

      const payload: CreateLayerPayload = {
        name: `${layer.name} (Copy)`,
        description: layer.description,
        enabled: layer.enabled,
        colorScheme: layer.colorScheme,
        opacity: layer.opacity,
        pointSize: layer.pointSize,
        filterQuery: layer.filterQuery,
      };

      return createLayer(payload);
    },
    [getLayerById, createLayer]
  );

  /**
   * Move layer up/down in order
   */
  const moveLayer = useCallback(
    async (layerId: string, direction: 'up' | 'down') => {
      const currentIndex = layers.findIndex(l => l.id === layerId);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex < 0 || newIndex >= layers.length) return;

      const reordered = [...layers];
      const [movedLayer] = reordered.splice(currentIndex, 1);
      reordered.splice(newIndex, 0, movedLayer);

      const reorderPayload = reordered.map((layer, index) => ({
        id: layer.id,
        order: index,
      }));

      return reorderLayers(reorderPayload);
    },
    [layers, reorderLayers]
  );

  // ========== RETURN ==========
  return {
    // Estado
    layers,
    datasetName,
    isLoading,
    error,

    // CRUD operations
    fetchLayers,
    createLayer,
    updateLayer,
    deleteLayer,

    // Layer management
    toggleLayer,
    toggleAllLayers,
    reorderLayers,
    moveLayer,
    duplicateLayer,

    // Queries
    getLayerById,
    getEnabledLayers,

    // Filtering & rendering
    evaluateFilter,
    filterDataPoints,
    getColorForValue,

    // Info útil
    hasLayers: layers.length > 0,
    layerCount: layers.length,
    enabledLayerCount: layers.filter(l => l.enabled).length,
    disabledLayerCount: layers.filter(l => !l.enabled).length,
  };
}

// ============================================================================
// PRESET COLOR SCHEMES
// ============================================================================

export const PRESET_COLOR_SCHEMES: Record<string, ColorScheme> = {
  temperature: {
    type: 'gradient',
    low: '#0066ff',
    high: '#ff0000',
  },
  humidity: {
    type: 'gradient',
    low: '#ffff99',
    high: '#006699',
  },
  pressure: {
    type: 'heatmap',
    colors: ['#00ff00', '#ffff00', '#ff9900', '#ff0000'],
    thresholds: [25, 50, 75, 100],
  },
  categorical: {
    type: 'categorical',
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
  },
  monochrome: {
    type: 'solid',
    color: '#888888',
  },
};

// ============================================================================
// HELPER: Default layer payload
// ============================================================================

export const DEFAULT_LAYER: Omit<CreateLayerPayload, 'name'> = {
  enabled: true,
  colorScheme: PRESET_COLOR_SCHEMES.temperature,
  opacity: 1.0,
  pointSize: 1.0,
  filterQuery: null,
};