/**
 * Hook para gestionar capas de visualización del viewer (GIS y Three.js)
 * 
 * CARACTERÍSTICAS CLAVE:
 * - CRUD completo de layers (create, read, update, delete, reorder)
 * - Toggle individual de layers (show/hide)
 * - Drag & drop reordering con optimistic updates
 * - Aplicación de filtros en cliente (filterQuery evaluation)
 * - Color scheme management (gradient, solid, heatmap, categorical, threshold)
 * - Soporte para assets móviles con trails dinámicos
 * - Reglas dinámicas (color, scale, visibility)
 * - Múltiples tipos de renderizado (marker, icon, image, model3d, shape)
 * - Trail con modos: static, dynamic, gradient, rules
 * - Trail color rules con prioridades y tipos de aplicación
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// ============================================================================
// INTERPOLACIÓN DE COLORES
// ============================================================================

const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  
  const r1 = (c1 >> 16) & 0xff;
  const g1 = (c1 >> 8) & 0xff;
  const b1 = c1 & 0xff;
  
  const r2 = (c2 >> 16) & 0xff;
  const g2 = (c2 >> 8) & 0xff;
  const b2 = c2 & 0xff;
  
  const r = Math.round(r1 + factor * (r2 - r1));
  const g = Math.round(g1 + factor * (g2 - g1));
  const b = Math.round(b1 + factor * (b2 - b1));
  
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
};

// ============================================================================
// TIPOS BASE
// ============================================================================

export type AssetType = 'point' | 'moving' | 'area';
export type RenderType = 'marker' | 'icon' | 'image' | 'model3d' | 'shape';
export type IconLibrary = 'lucide' | 'custom';
export type ShapeType = 'circle' | 'polygon' | 'rectangle' | 'custom';
export type BorderStyle = 'solid' | 'dashed' | 'dotted';
export type ColorSchemeType = 'gradient' | 'solid' | 'heatmap' | 'categorical' | 'threshold';
export type TrailColorMode = 'static' | 'dynamic' | 'gradient' | 'rules';
export type TrailApplicationType = 'entire-trail' | 'current-segment' | 'future-segments' | 'historical';
export type Orientation3D = 'map' | 'viewport' | 'auto';
export type Anchor3D = 'center' | 'bottom' | 'top';
export type AltitudeMode = 'absolute' | 'relative' | 'clampToGround';

// ============================================================================
// CONFIGURACIONES
// ============================================================================

export interface MarkerConfig {
  iconName?: string;
  iconLibrary?: IconLibrary;
  customSvg?: string;
}

export interface Model3DConfig {
  scale?: [number, number, number];
  rotation?: [number, number, number];
  translate?: [number, number, number];
  orientation?: Orientation3D;
  anchor?: Anchor3D;
  autoRotate?: boolean;
  autoRotateOffset?: number;
  minZoom?: number;
  maxZoom?: number;
  scaleWithZoom?: boolean;
  scaleRange?: [number, number];
  animations?: {
    idle?: string;
    moving?: string;
    speed?: number;
  };
  castShadows?: boolean;
  receiveShadows?: boolean;
  metalness?: number;
  roughness?: number;
  emissiveIntensity?: number;
  frustumCulling?: boolean;
  lodEnabled?: boolean;
  lodDistances?: number[];
  clickable?: boolean;
  hoverable?: boolean;
  altitudeMode?: AltitudeMode;
  heightOffset?: number;
}

export interface ShapeConfig {
  type: ShapeType;
  coordinates?: number[][];
  radius?: number;
  width?: number;
  height?: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
}

export interface BorderConfig {
  width: number;
  color: string;
  style: BorderStyle;
  opacity?: number;
}

export interface ShadowConfig {
  enabled: boolean;
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

// ============================================================================
// COLOR SCHEMES
// ============================================================================

export interface BaseColorScheme {
  type: ColorSchemeType;
  valueKey?: string;
}

export interface GradientColorScheme extends BaseColorScheme {
  type: 'gradient';
  low: string;
  high: string;
}

export interface SolidColorScheme extends BaseColorScheme {
  type: 'solid';
  color: string;
}

export interface HeatmapColorScheme extends BaseColorScheme {
  type: 'heatmap';
  colors: string[];
  thresholds: number[];
}

export interface CategoricalColorScheme extends BaseColorScheme {
  type: 'categorical';
  categories: string[];
  colors: string[];
  categoryKey: string;
}

export interface ThresholdColorScheme extends BaseColorScheme {
  type: 'threshold';
  thresholdRanges: Array<{
    min: number;
    max: number;
    color: string;
    label?: string;
  }>;
}

export type ColorScheme =
  | GradientColorScheme
  | SolidColorScheme
  | HeatmapColorScheme
  | CategoricalColorScheme
  | ThresholdColorScheme;

// ============================================================================
// REGLAS DINÁMICAS
// ============================================================================

export interface ColorRule {
  id: string;
  condition: string;
  colorScheme: ColorScheme;
  priority?: number;
}

export interface ScaleRule {
  id: string;
  condition: string;
  scale: number;
  priority?: number;
}

export interface VisibilityRule {
  id: string;
  condition: string;
  visible: boolean;
  priority?: number;
}

// ============================================================================
// TRAIL COLOR RULES
// ============================================================================

export interface TrailColorRule {
  id: string;
  name: string;
  priority: number;
  applicationType: TrailApplicationType;
  enabled: boolean;
  description?: string;
  condition: string;
  color: string;
}

// ============================================================================
// TRAIL CONFIGURATION
// ============================================================================

export interface StaticTrailColorScheme {
  type: 'static';
  staticColor: string;
}

export interface GradientTrailColorScheme {
  type: 'gradient';
  gradient: {
    stops: Array<{ value: number; color: string }>;
  };
  valueKey: string;
}

export interface SpeedBasedTrailColorScheme {
  type: 'speed-based';
  speedBased: {
    lowSpeed: { threshold: number; color: string };
    mediumSpeed: { threshold: number; color: string };
    highSpeed: { threshold: number; color: string };
  };
  valueKey: string;
}

export type TrailColorScheme =
  | StaticTrailColorScheme
  | GradientTrailColorScheme
  | SpeedBasedTrailColorScheme;

export interface TrailGradientConfig {
  enabled: boolean;
  fadeOldSegments?: boolean;
  fadeStartAge?: number;
  fadeEndAge?: number;
  minOpacity?: number;
}

export interface TrailValidationConfig {
  enableValidation?: boolean;
  minDistanceThreshold?: number;
  maxTimeBetweenPoints?: number;
}

export interface TrailPointsConfig {
  showHistoricalPoints?: boolean;
  pointInterval?: number;
  pointSize?: number;
  pointOpacity?: number;
  fadeWithAge?: boolean;
}

// ============================================================================
// LAYER PRINCIPAL
// ============================================================================
export interface VisualizationLayer {
  id: string;
  datasetId: string;
  name: string;
  description: string | null;
  enabled: boolean;
  order: number;
  
  // Asset type
  assetType: AssetType;
  
  // Render configuration
  renderType: RenderType;
  markerConfig: MarkerConfig | null;
  imageUrl: string | null;
  modelUrl: string | null;
  model3dConfig: Model3DConfig | null;
  shapeConfig: ShapeConfig | null;
  
  // Style
  colorScheme: ColorScheme | null;
  opacity: number;
  pointSize: number;
  borderConfig: BorderConfig | null;
  shadowConfig: ShadowConfig | null;
  
  // Dynamic behavior
  colorRules: ColorRule[] | null;
  scaleRules: ScaleRule[] | null;
  visibilityRules: VisibilityRule[] | null;
  
  // Trail configuration
  showTrail: boolean;
  trailLength: number;
  trailWidth: number;
  trailOpacity: number;
  trailColorMode: TrailColorMode;
  trailColorScheme: TrailColorScheme | null;
  trailColorRules: TrailColorRule[] | null;
  trailGradientConfig: TrailGradientConfig | null;
  trailValidationConfig: TrailValidationConfig | null;
  trailPointsConfig: TrailPointsConfig | null;
  
  // Filter
  filterQuery: string | null;
  
  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
}

// ============================================================================
// RESPONSES
// ============================================================================

export interface LayersData {
  datasetId: string;
  datasetName: string;
  viewType: string;
  layers: VisualizationLayer[];
  totalLayers: number;
  enabledLayers: number;
}

export interface LayersResponse {
  success: boolean;
  data: LayersData;
}

// ============================================================================
// PAYLOADS
// ============================================================================

export interface CreateLayerPayload {
  name: string;
  description?: string | null;
  enabled?: boolean;
  
  assetType?: AssetType;
  
  renderType?: RenderType;
  markerConfig?: MarkerConfig;
  imageUrl?: string | null;
  modelUrl?: string | null;
  model3dConfig?: Model3DConfig;
  shapeConfig?: ShapeConfig;
  
  colorScheme: ColorScheme;
  opacity?: number;
  pointSize?: number;
  borderConfig?: BorderConfig;
  shadowConfig?: ShadowConfig;
  
  colorRules?: ColorRule[] | null;
  scaleRules?: ScaleRule[] | null;
  visibilityRules?: VisibilityRule[] | null;
  
  showTrail?: boolean;
  trailLength?: number;
  trailWidth?: number;
  trailOpacity?: number;
  trailColorMode?: TrailColorMode;
  trailColorScheme?: TrailColorScheme;
  trailColorRules?: TrailColorRule[] | null;
  trailGradientConfig?: TrailGradientConfig;
  trailValidationConfig?: TrailValidationConfig;
  trailPointsConfig?: TrailPointsConfig;
  
  filterQuery?: string | null;
}

export interface UpdateLayerPayload extends Partial<CreateLayerPayload> {}

export interface ReorderLayer {
  id: string;
  order: number;
}

export interface UseVisualizationLayersOptions {
  autoFetch?: boolean;
  onLayersChanged?: (layers: VisualizationLayer[]) => void;
  onLayerToggled?: (layerId: string, enabled: boolean) => void;
  onError?: (error: string) => void;
}

// ============================================================================
// EVALUATED RESULT
// ============================================================================

export interface EvaluatedLayerStyle {
  colorScheme: ColorScheme | null;
  scale: number;
  visible: boolean;
  color?: string;
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
  const [viewType, setViewType] = useState<string>('gis');
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

      const layersWithDatasetId = result.data.layers.map(layer => ({
        ...layer,
        datasetId: result.data.datasetId,
      }));

      setLayers(layersWithDatasetId);
      setDatasetName(result.data.datasetName);
      setViewType(result.data.viewType);

      if (onLayersChanged) {
        onLayersChanged(layersWithDatasetId);
      }

      return {
        ...result.data,
        layers: layersWithDatasetId
      };
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

  const getLayerById = useCallback(
    (layerId: string): VisualizationLayer | null => {
      return layers.find(l => l.id === layerId) || null;
    },
    [layers]
  );

  const getEnabledLayers = useCallback(() => {
    return layers.filter(l => l.enabled);
  }, [layers]);

  const getMaxOrder = useCallback(() => {
    return layers.length > 0 ? Math.max(...layers.map(l => l.order)) : -1;
  }, [layers]);

  // ========== EVALUACIÓN DE CONDICIONES ==========

  const getValueByPath = useCallback((obj: any, path: string): any => {
    if (!path) return undefined;
    
    try {
      return path.split('.').reduce((curr, key) => {
        if (curr === null || curr === undefined) return undefined;
        return curr[key];
      }, obj);
    } catch {
      return undefined;
    }
  }, []);

  const evaluateCondition = useCallback(
    (condition: string, dataPoint: any): boolean => {
      try {
        const match = condition.match(/([a-zA-Z0-9_.]+)\s*(=|>|<|>=|<=|!=)\s*('([^']*)'|"([^"]*)"|(\d+\.?\d*))/);
        
        if (!match) return false;
        
        const [, field, operator, , strValue1, strValue2, numValue] = match;
        const value = strValue1 || strValue2 || parseFloat(numValue);
        const dataValue = getValueByPath(dataPoint, field);
        
        if (dataValue === undefined) return false;
        
        switch (operator) {
          case '=':
            return dataValue == value;
          case '!=':
            return dataValue != value;
          case '>':
            return parseFloat(dataValue) > parseFloat(value as any);
          case '<':
            return parseFloat(dataValue) < parseFloat(value as any);
          case '>=':
            return parseFloat(dataValue) >= parseFloat(value as any);
          case '<=':
            return parseFloat(dataValue) <= parseFloat(value as any);
          default:
            return false;
        }
      } catch (err) {
        console.warn('Error evaluating condition:', condition, err);
        return false;
      }
    },
    [getValueByPath]
  );

  const evaluateFilter = useCallback(
    (filterQuery: string | null, dataPoint: any): boolean => {
      if (!filterQuery) return true;

      try {
        const conditions = filterQuery.split(/\s+AND\s+/i);
        return conditions.every(condition => evaluateCondition(condition, dataPoint));
      } catch (err) {
        console.warn('Error evaluating filter:', err);
        return true;
      }
    },
    [evaluateCondition]
  );
  // ========== EVALUACIÓN DE COLOR ==========

  /**
   * Resuelve el color para un dataPoint según el ColorScheme
   */
  const resolveColor = useCallback(
    (colorScheme: ColorScheme | null, dataPoint: any): string => {
      if (!colorScheme) return '#ffffff';

      const { type, valueKey } = colorScheme;
      
      switch (type) {
        case 'solid':
          return colorScheme.color;

        case 'gradient': {
          if (!valueKey) return colorScheme.low;
          const value = getValueByPath(dataPoint, valueKey);
          if (value === undefined) return colorScheme.low;
          
          // Interpolación lineal simple (0-100 por defecto)
          const normalized = Math.max(0, Math.min(100, parseFloat(value))) / 100;
          return interpolateColor(colorScheme.low, colorScheme.high, normalized);
        }

        case 'heatmap': {
          if (!valueKey) return colorScheme.colors[0];
          const value = parseFloat(getValueByPath(dataPoint, valueKey));
          if (isNaN(value)) return colorScheme.colors[0];
          
          for (let i = 0; i < colorScheme.thresholds.length; i++) {
            if (value <= colorScheme.thresholds[i]) {
              return colorScheme.colors[i] || '#ffffff';
            }
          }
          return colorScheme.colors[colorScheme.colors.length - 1] || '#ffffff';
        }

        case 'categorical': {
          const category = getValueByPath(dataPoint, colorScheme.categoryKey);
          const index = colorScheme.categories.indexOf(category);
          return index >= 0 ? colorScheme.colors[index] : colorScheme.colors[0];
        }

        case 'threshold': {
          if (!valueKey) return colorScheme.thresholdRanges[0].color;
          const value = parseFloat(getValueByPath(dataPoint, valueKey));
          if (isNaN(value)) return colorScheme.thresholdRanges[0].color;
          
          for (const range of colorScheme.thresholdRanges) {
            if (value >= range.min && value <= range.max) {
              return range.color;
            }
          }
          return colorScheme.thresholdRanges[0].color;
        }

        default:
          return '#ffffff';
      }
    },
    [getValueByPath]
  );

  /**
   * Evalúa las reglas dinámicas para un data point
   */
  const evaluateRules = useCallback(
    (layer: VisualizationLayer, dataPoint: any): EvaluatedLayerStyle => {
      const result: EvaluatedLayerStyle = {
        colorScheme: layer.colorScheme,
        scale: layer.pointSize,
        visible: true,
        color: undefined,
      };

      // Evaluar visibility rules
      if (layer.visibilityRules && layer.visibilityRules.length > 0) {
        const sortedVisRules = [...layer.visibilityRules].sort(
          (a, b) => (b.priority || 0) - (a.priority || 0)
        );
        
        for (const rule of sortedVisRules) {
          if (evaluateCondition(rule.condition, dataPoint)) {
            result.visible = rule.visible;
            break;
          }
        }
      }

      if (!result.visible) return result;

      // Evaluar color rules
      if (layer.colorRules && layer.colorRules.length > 0) {
        const sortedColorRules = [...layer.colorRules].sort(
          (a, b) => (b.priority || 0) - (a.priority || 0)
        );
        
        for (const rule of sortedColorRules) {
          if (evaluateCondition(rule.condition, dataPoint)) {
            result.colorScheme = rule.colorScheme;
            break;
          }
        }
      }

      // Evaluar scale rules
      if (layer.scaleRules && layer.scaleRules.length > 0) {
        const sortedScaleRules = [...layer.scaleRules].sort(
          (a, b) => (b.priority || 0) - (a.priority || 0)
        );
        
        for (const rule of sortedScaleRules) {
          if (evaluateCondition(rule.condition, dataPoint)) {
            result.scale = rule.scale;
            break;
          }
        }
      }

      // Resolver color final
      result.color = resolveColor(result.colorScheme, dataPoint);

      return result;
    },
    [evaluateCondition, resolveColor]
  );

  /**
   * Resuelve el color del trail para un dataPoint
   */
  const resolveTrailColor = useCallback(
    (trailColorScheme: TrailColorScheme | null, dataPoint: any): string => {
      if (!trailColorScheme) return '#3b82f6';

      switch (trailColorScheme.type) {
        case 'static':
          return trailColorScheme.staticColor;

        case 'gradient': {
          const value = parseFloat(getValueByPath(dataPoint, trailColorScheme.valueKey));
          if (isNaN(value)) return trailColorScheme.gradient.stops[0].color;
          
          const stops = trailColorScheme.gradient.stops;
          for (let i = 0; i < stops.length - 1; i++) {
            if (value >= stops[i].value && value <= stops[i + 1].value) {
              const t = (value - stops[i].value) / (stops[i + 1].value - stops[i].value);
              return interpolateColor(stops[i].color, stops[i + 1].color, t);
            }
          }
          return stops[stops.length - 1].color;
        }

        case 'speed-based': {
          const speed = parseFloat(getValueByPath(dataPoint, trailColorScheme.valueKey));
          if (isNaN(speed)) return trailColorScheme.speedBased.lowSpeed.color;
          
          const { lowSpeed, mediumSpeed, highSpeed } = trailColorScheme.speedBased;
          
          if (speed <= lowSpeed.threshold) return lowSpeed.color;
          if (speed <= mediumSpeed.threshold) return mediumSpeed.color;
          return highSpeed.color;
        }

        default:
          return '#3b82f6';
      }
    },
    [getValueByPath]
  );

  /**
   * Filtra data points según las layers habilitadas
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

  // ========== OPERACIONES AVANZADAS ==========

  const toggleAllLayers = useCallback(
    async (enabled: boolean) => {
      setLayers(prev => prev.map(l => ({ ...l, enabled })));

      try {
        await Promise.all(
          layers.map(layer => updateLayer(layer.id, { enabled }))
        );

        toast.success(enabled ? 'All layers enabled' : 'All layers disabled');
      } catch (err) {
        await fetchLayers();
      }
    },
    [layers, updateLayer, fetchLayers]
  );

  const duplicateLayer = useCallback(
    async (layerId: string) => {
      const layer = getLayerById(layerId);
      if (!layer) return;

      const maxOrder = getMaxOrder();
      const payload: CreateLayerPayload = {
        name: `${layer.name} (Copy)`,
        description: layer.description,
        enabled: layer.enabled,
        assetType: layer.assetType,
        renderType: layer.renderType,
        markerConfig: layer.markerConfig || undefined,
        imageUrl: layer.imageUrl,
        modelUrl: layer.modelUrl,
        model3dConfig: layer.model3dConfig || undefined,
        shapeConfig: layer.shapeConfig || undefined,
        colorScheme: layer.colorScheme || { type: 'solid', color: '#ffffff' },
        opacity: layer.opacity,
        pointSize: layer.pointSize,
        borderConfig: layer.borderConfig || undefined,
        shadowConfig: layer.shadowConfig || undefined,
        colorRules: layer.colorRules,
        scaleRules: layer.scaleRules,
        visibilityRules: layer.visibilityRules,
        showTrail: layer.showTrail,
        trailLength: layer.trailLength,
        trailWidth: layer.trailWidth,
        trailOpacity: layer.trailOpacity,
        trailColorMode: layer.trailColorMode,
        trailColorScheme: layer.trailColorScheme || undefined,
        trailColorRules: layer.trailColorRules || undefined,
        trailGradientConfig: layer.trailGradientConfig || undefined,
        trailValidationConfig: layer.trailValidationConfig || undefined,
        trailPointsConfig: layer.trailPointsConfig || undefined,
        filterQuery: layer.filterQuery,
      };

      return createLayer(payload);
    },
    [getLayerById, getMaxOrder, createLayer]
  );

  const moveLayer = useCallback(
    async (layerId: string, direction: 'up' | 'down') => {
      const sortedLayers = [...layers].sort((a, b) => b.order - a.order);
      const currentIndex = sortedLayers.findIndex(l => l.id === layerId);
      
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      
      if (newIndex < 0 || newIndex >= sortedLayers.length) return;

      const reordered = [...sortedLayers];
      [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];

      const reorderPayload = reordered.map((layer, index) => ({
        id: layer.id,
        order: sortedLayers.length - 1 - index,
      }));

      return reorderLayers(reorderPayload);
    },
    [layers, reorderLayers]
  );

  // ========== UTILIDADES ESPECÍFICAS ==========

  /**
   * Obtiene layers por tipo de asset
   */
  const getLayersByAssetType = useCallback(
    (assetType: AssetType) => {
      return layers.filter(l => l.assetType === assetType);
    },
    [layers]
  );

  /**
   * Obtiene layers con trail habilitado
   */
  const getLayersWithTrail = useCallback(() => {
    return layers.filter(l => l.showTrail);
  }, [layers]);

  /**
   * Verifica si una layer tiene reglas dinámicas
   */
  const layerHasDynamicRules = useCallback(
    (layerId: string): boolean => {
      const layer = getLayerById(layerId);
      if (!layer) return false;

      return !!(
        (layer.colorRules && layer.colorRules.length > 0) ||
        (layer.scaleRules && layer.scaleRules.length > 0) ||
        (layer.visibilityRules && layer.visibilityRules.length > 0)
      );
    },
    [getLayerById]
  );

  // ========== RETURN ==========
  return {
    // Estado
    layers,
    datasetName,
    viewType,
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
    getMaxOrder,
    getLayersByAssetType,
    getLayersWithTrail,

    // Rules & filtering
    evaluateRules,
    evaluateCondition,
    evaluateFilter,
    filterDataPoints,
    layerHasDynamicRules,

    // Color resolution
    resolveColor,
    resolveTrailColor,
    getValueByPath,

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
    valueKey: 'value',
  },
  humidity: {
    type: 'gradient',
    low: '#ffff99',
    high: '#006699',
    valueKey: 'value',
  },
  pressure: {
    type: 'heatmap',
    colors: ['#00ff00', '#ffff00', '#ff9900', '#ff0000'],
    thresholds: [25, 50, 75, 100],
    valueKey: 'value',
  },
  categorical: {
    type: 'categorical',
    categories: ['type1', 'type2', 'type3', 'type4', 'type5'],
    colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'],
    categoryKey: 'metadata.type',
  },
  monochrome: {
    type: 'solid',
    color: '#888888',
  },
  greenToRed: {
    type: 'gradient',
    low: '#10b981',
    high: '#ef4444',
    valueKey: 'value',
  },
  blueScale: {
    type: 'gradient',
    low: '#dbeafe',
    high: '#1e40af',
    valueKey: 'value',
  },
};

// ============================================================================
// HELPER: Default layer payload
// ============================================================================

export const DEFAULT_LAYER: Omit<CreateLayerPayload, 'name'> = {
  enabled: true,
  assetType: 'point',
  renderType: 'marker',
  colorScheme: PRESET_COLOR_SCHEMES.temperature,
  opacity: 1.0,
  pointSize: 1.0,
  showTrail: false,
  trailLength: 50,
  trailWidth: 2.0,
  trailOpacity: 0.6,
  trailColorMode: 'static',
  filterQuery: null,
};

// ============================================================================
// PRESETS PARA TIPOS DE ASSETS
// ============================================================================

export const ASSET_PRESETS = {
  staticSensor: {
    assetType: 'point' as AssetType,
    renderType: 'marker' as RenderType,
    markerConfig: {
      iconName: 'CircleDot',
      iconLibrary: 'lucide' as IconLibrary,
    },
    imageUrl: null,
    modelUrl: null,
    model3dConfig: null,
    shapeConfig: null,
    showTrail: false,
    trailLength: 50,
    trailWidth: 2.0,
    trailOpacity: 0.6,
    trailColorMode: 'static' as TrailColorMode,
    trailColorScheme: null,
    trailColorRules: null,
    trailGradientConfig: null,
    trailValidationConfig: null,
    trailPointsConfig: null,
  },
  movingVehicle: {
    assetType: 'moving' as AssetType,
    renderType: 'icon' as RenderType,
    markerConfig: {
      iconName: 'Navigation',
      iconLibrary: 'lucide' as IconLibrary,
    },
    imageUrl: null,
    modelUrl: null,
    model3dConfig: null,
    shapeConfig: null,
    showTrail: true,
    trailLength: 100,
    trailWidth: 2.0,
    trailOpacity: 0.6,
    trailColorMode: 'speed-based' as TrailColorMode,
    trailColorScheme: {
      type: 'speed-based' as const,
      speedBased: {
        lowSpeed: { threshold: 30, color: '#10b981' },
        mediumSpeed: { threshold: 60, color: '#f59e0b' },
        highSpeed: { threshold: 100, color: '#ef4444' },
      },
      valueKey: 'metadata.movement.speed.current',
    } as SpeedBasedTrailColorScheme,
    trailColorRules: null,
    trailGradientConfig: {
      enabled: true,
      fadeOldSegments: true,
      fadeStartAge: 30,
      fadeEndAge: 100,
      minOpacity: 0.2,
    },
    trailValidationConfig: {
      enableValidation: true,
      minDistanceThreshold: 5,
      maxTimeBetweenPoints: 60000,
    },
    trailPointsConfig: {
      showHistoricalPoints: false,
      pointInterval: 10,
      pointSize: 3,
      pointOpacity: 0.8,
      fadeWithAge: true,
    },
  },
  coverageArea: {
    assetType: 'area' as AssetType,
    renderType: 'shape' as RenderType,
    markerConfig: null,
    imageUrl: null,
    modelUrl: null,
    model3dConfig: null,
    shapeConfig: {
      type: 'polygon' as ShapeType,
      fillColor: '#3b82f6',
      fillOpacity: 0.5,
      strokeColor: '#1e40af',
      strokeWidth: 2,
      strokeOpacity: 1.0,
    },
    showTrail: false,
    trailLength: 50,
    trailWidth: 2.0,
    trailOpacity: 0.6,
    trailColorMode: 'static' as TrailColorMode,
    trailColorScheme: null,
    trailColorRules: null,
    trailGradientConfig: null,
    trailValidationConfig: null,
    trailPointsConfig: null,
  },
};