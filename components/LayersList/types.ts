/**
 * Types for LayersList component (ACTUALIZADO CON TODAS LAS CONFIGURACIONES)
 * Interfaces compartidas entre componentes + soporte completo para trails, 3D, y reglas
 */

// ============================================================================
// RE-EXPORTAR TIPOS DESDE EL HOOK
// ============================================================================
export type {
  VisualizationLayer,
  AssetType,
  RenderType,
  IconLibrary,
  ShapeType,
  BorderStyle,
  ColorSchemeType,
  TrailColorMode,
  TrailApplicationType,
  Orientation3D,
  Anchor3D,
  AltitudeMode,
  MarkerConfig,
  Model3DConfig,
  ShapeConfig,
  BorderConfig,
  ShadowConfig,
  ColorScheme,
  GradientColorScheme,
  SolidColorScheme,
  HeatmapColorScheme,
  CategoricalColorScheme,
  ThresholdColorScheme,
  ColorRule,
  ScaleRule,
  VisibilityRule,
  TrailColorRule,
  TrailColorScheme,
  StaticTrailColorScheme,
  GradientTrailColorScheme,
  SpeedBasedTrailColorScheme,
  TrailGradientConfig,
  TrailValidationConfig,
  TrailPointsConfig,
  CreateLayerPayload,
  UpdateLayerPayload,
  ReorderLayer,
  EvaluatedLayerStyle,
  LayersData,
  LayersResponse
} from '@/hooks/useVisualizationLayers';

// ============================================================================
// IMPORTS PARA TIPOS LOCALES (COMPLETO)
// ============================================================================
import type { 
  VisualizationLayer, 
  ColorScheme,
  TrailColorScheme,
  TrailColorMode,
  TrailApplicationType,
  ShapeConfig,
  Model3DConfig,
  ColorRule,
  ScaleRule,
  VisibilityRule,
  TrailColorRule,
  TrailGradientConfig,
  TrailValidationConfig,
  TrailPointsConfig,
  AssetType,
  RenderType,
  Orientation3D,
  Anchor3D,
  AltitudeMode,
  CreateLayerPayload,
  BorderConfig,        // ✅ Importado para usar en interfaces locales
  ShadowConfig,        // ✅ Importado para usar en interfaces locales
  MarkerConfig,  
} from '@/hooks/useVisualizationLayers';

// ============================================================================
// ALIAS PARA COMPATIBILIDAD
// ============================================================================
export type Layer = VisualizationLayer; 

// ============================================================================
// TIPOS LOCALES DEL COMPONENTE
// ============================================================================

/**
 * Props principales del componente LayersList
 */
export interface LayersListProps {
  datasetId: string;
  collapsed?: boolean;
  onLayerSelect?: (layer: VisualizationLayer) => void;
  className?: string;
  
  // Callbacks para sincronización externa
  onLayersUpdate?: (layers: VisualizationLayer[]) => void;
  onEnabledLayersChange?: (enabledLayers: VisualizationLayer[]) => void;
  onLayerToggle?: (layerId: string, enabled: boolean) => void;
  
  // Opciones de visualización
  showStats?: boolean;
  showAdvancedFilters?: boolean;
  showPreview?: boolean;
}

/**
 * Props del LayerCard (actualizado con nuevas acciones)
 */
export interface LayerCardProps {
  layer: VisualizationLayer;
  onToggle: (layerId: string) => void;
  onOpacityChange: (layerId: string, opacity: number) => void;
  onEdit?: (layer: VisualizationLayer) => void;
  onDelete?: (layerId: string) => void;
  onDuplicate?: (layerId: string) => void;
  onMoveUp?: (layerId: string) => void;
  onMoveDown?: (layerId: string) => void;
  isLoading?: boolean;
  hasDynamicRules?: boolean;
  showPreview?: boolean;
}

/**
 * Props del LayerControls
 */
export interface LayerControlsProps {
  layer: VisualizationLayer;
  onOpacityChange: (opacity: number) => void;
  onPointSizeChange: (size: number) => void;
  disabled?: boolean;
}

/**
 * Props del ColorSchemeEditor
 * ACTUALIZADO: ColorScheme nunca es null aquí (se maneja con fallback)
 */
export interface ColorSchemeEditorProps {
  colorScheme: ColorScheme;
  onChange: (scheme: ColorScheme) => void;
  disabled?: boolean;
  showPresets?: boolean;
  allowCustom?: boolean;
}

/**
 * Props del LayerCreateForm
 */
export interface LayerCreateFormProps {
  datasetId: string;
  onSuccess?: (layer: VisualizationLayer) => void;
  onCancel?: () => void;
  defaultAssetType?: AssetType;
  defaultRenderType?: RenderType;
}

/**
 * Props del LayerEditForm
 */
export interface LayerEditFormProps {
  layer: VisualizationLayer;
  maxOrder?: number;
  onSuccess?: (layer: VisualizationLayer) => void;
  onCancel?: () => void;
  allowAssetTypeChange?: boolean;
}

/**
 * Props del OrderExplainer
 */
export interface OrderExplainerProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Props del LayerStats
 */
export interface LayerStatsProps {
  totalLayers: number;
  enabledLayers: number;
  disabledLayers: number;
  pointLayers: number;
  movingLayers: number;
  areaLayers: number;
  trailLayers: number;
  layersWithRules: number;
  layersWithFilters: number;
  layers3D: number;
  className?: string;
}

/**
 * Props para Trail Configuration Editor (ACTUALIZADO)
 */
export interface TrailConfigEditorProps {
  // Trail básico
  showTrail: boolean;
  trailLength: number;
  trailWidth: number;
  trailOpacity: number;
  
  // Trail color
  trailColorMode: TrailColorMode;
  trailColorScheme: TrailColorScheme | null;
  trailColorRules: TrailColorRule[] | null;
  
  // Trail gradient config
  trailGradientConfig: TrailGradientConfig | null;
  
  // Trail validation
  trailValidationConfig: TrailValidationConfig | null;
  
  // Trail points
  trailPointsConfig: TrailPointsConfig | null;
  
  // Callback de cambios
  onChange: (config: {
    showTrail?: boolean;
    trailLength?: number;
    trailWidth?: number;
    trailOpacity?: number;
    trailColorMode?: TrailColorMode;
    trailColorScheme?: TrailColorScheme | null;
    trailColorRules?: TrailColorRule[] | null;
    trailGradientConfig?: TrailGradientConfig | null;
    trailValidationConfig?: TrailValidationConfig | null;
    trailPointsConfig?: TrailPointsConfig | null;
  }) => void;
  
  disabled?: boolean;
}

/**
 * Props para Trail Color Rules Editor (NUEVO)
 */
export interface TrailColorRulesEditorProps {
  rules: TrailColorRule[] | null;
  onChange: (rules: TrailColorRule[]) => void;
  disabled?: boolean;
  availableFields?: string[];
}

/**
 * Props para Shape Configuration Editor
 */
export interface ShapeConfigEditorProps {
  shapeConfig: ShapeConfig | null;
  onChange: (config: ShapeConfig) => void;
  disabled?: boolean;
  showPreview?: boolean;
}

/**
 * Props para Model 3D Configuration Editor (NUEVO)
 */
export interface Model3DConfigEditorProps {
  modelUrl: string | null;
  model3dConfig: Model3DConfig | null;
  onChange: (config: {
    modelUrl?: string | null;
    model3dConfig?: Model3DConfig | null;
  }) => void;
  disabled?: boolean;
  showPreview?: boolean;
}

/**
 * Props para Dynamic Rules Editor
 */
export interface DynamicRulesEditorProps {
  colorRules?: ColorRule[] | null;
  scaleRules?: ScaleRule[] | null;
  visibilityRules?: VisibilityRule[] | null;
  onChange: (rules: {
    colorRules?: ColorRule[];
    scaleRules?: ScaleRule[];
    visibilityRules?: VisibilityRule[];
  }) => void;
  disabled?: boolean;
  availableFields?: string[];
  showConditionBuilder?: boolean;
}

/**
 * Props para Border Configuration Editor (NUEVO)
 */
export interface BorderConfigEditorProps {
  borderConfig: BorderConfig | null;
  onChange: (config: BorderConfig | null) => void;
  disabled?: boolean;
}

/**
 * Props para Shadow Configuration Editor (NUEVO)
 */
export interface ShadowConfigEditorProps {
  shadowConfig: ShadowConfig | null;
  onChange: (config: ShadowConfig | null) => void;
  disabled?: boolean;
}

/**
 * Props para Marker Configuration Editor (NUEVO)
 */
export interface MarkerConfigEditorProps {
  markerConfig: MarkerConfig | null;
  onChange: (config: MarkerConfig) => void;
  disabled?: boolean;
  showIconPicker?: boolean;
}

/**
 * Tipo de utilidad para validación de layers
 */
export interface LayerValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Opciones de filtrado para LayersList (ACTUALIZADO)
 */
export interface LayerFilterOptions {
  assetTypes?: AssetType[];
  renderTypes?: RenderType[];
  enabledOnly?: boolean;
  withTrailOnly?: boolean;
  withRulesOnly?: boolean;
  with3DOnly?: boolean;
  withColorRulesOnly?: boolean;
  withScaleRulesOnly?: boolean;
  withVisibilityRulesOnly?: boolean;
  searchQuery?: string;
  hasFilter?: boolean;
}

/**
 * Configuración de ordenamiento
 */
export interface LayerSortConfig {
  field: 'name' | 'order' | 'createdAt' | 'updatedAt' | 'assetType' | 'renderType';
  direction: 'asc' | 'desc';
}

/**
 * Estado del drag & drop
 */
export interface DragState {
  isDragging: boolean;
  draggedLayerId: string | null;
  dropTargetIndex: number | null;
  draggedLayer?: VisualizationLayer;
}

/**
 * Resultado de operaciones batch
 */
export interface BatchOperationResult {
  success: boolean;
  affectedLayers: number;
  errors: Array<{ layerId: string; error: string }>;
}

/**
 * Props para Layer Preview Component (NUEVO)
 */
export interface LayerPreviewProps {
  layer: VisualizationLayer;
  width?: number;
  height?: number;
  showControls?: boolean;
  interactive?: boolean;
}

/**
 * Props para Filter Query Builder (NUEVO)
 */
export interface FilterQueryBuilderProps {
  filterQuery: string | null;
  onChange: (query: string | null) => void;
  availableFields?: string[];
  disabled?: boolean;
  showPreview?: boolean;
}

/**
 * Información de campo disponible para filtros y reglas (NUEVO)
 */
export interface FieldInfo {
  path: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date';
  description?: string;
  examples?: any[];
}

/**
 * Props para Condition Builder (NUEVO)
 */
export interface ConditionBuilderProps {
  condition: string;
  onChange: (condition: string) => void;
  availableFields?: FieldInfo[];
  disabled?: boolean;
  showHelp?: boolean;
}

/**
 * Configuración de preset de layer (NUEVO)
 */
export interface LayerPreset {
  id: string;
  name: string;
  description: string;
  icon?: string;
  assetType: AssetType;
  renderType: RenderType;
  config: Partial<CreateLayerPayload>;
}

/**
 * Props para Layer Preset Selector (NUEVO)
 */
export interface LayerPresetSelectorProps {
  onSelect: (preset: LayerPreset) => void;
  availablePresets?: LayerPreset[];
  showCustom?: boolean;
}

/**
 * Estadísticas detalladas de una layer (NUEVO)
 */
export interface LayerDetailedStats {
  layerId: string;
  layerName: string;
  assetType: AssetType;
  renderType: RenderType;
  enabled: boolean;
  
  // Estadísticas de uso
  totalDataPoints: number;
  visibleDataPoints: number;
  filteredDataPoints: number;
  
  // Reglas aplicadas
  hasColorRules: boolean;
  hasScaleRules: boolean;
  hasVisibilityRules: boolean;
  activeRulesCount: number;
  
  // Trail info
  hasTrail: boolean;
  trailColorMode?: TrailColorMode;
  trailColorRulesCount?: number;
  
  // 3D info
  is3D: boolean;
  has3DAnimations?: boolean;
  
  // Performance
  renderTime?: number;
  updateFrequency?: number;
}

/**
 * Props para Layer Diagnostics Panel (NUEVO)
 */
export interface LayerDiagnosticsProps {
  layer: VisualizationLayer;
  stats?: LayerDetailedStats;
  onRefresh?: () => void;
}

/**
 * Configuración de exportación de layers (NUEVO)
 */
export interface LayerExportConfig {
  includeDisabled?: boolean;
  includeRules?: boolean;
  includeTrailConfig?: boolean;
  format: 'json' | 'yaml' | 'csv';
}

/**
 * Configuración de importación de layers (NUEVO)
 */
export interface LayerImportConfig {
  overwriteExisting?: boolean;
  validateBeforeImport?: boolean;
  skipInvalid?: boolean;
}

/**
 * Tipo para historial de cambios de layer (NUEVO)
 */
export interface LayerChangeHistoryEntry {
  timestamp: Date;
  userId?: string;
  action: 'create' | 'update' | 'delete' | 'reorder' | 'toggle';
  layerId: string;
  layerName: string;
  changes?: Record<string, { old: any; new: any }>;
}

/**
 * Props para Layer History Viewer (NUEVO)
 */
export interface LayerHistoryViewerProps {
  layerId: string;
  history: LayerChangeHistoryEntry[];
  onRevert?: (entry: LayerChangeHistoryEntry) => void;
}

// ============================================================================
// CONSTANTES Y ENUMS ÚTILES
// ============================================================================

/**
 * Tipos de assets disponibles con metadata
 */
export const ASSET_TYPE_INFO: Record<AssetType, {
  label: string;
  description: string;
  icon: string;
  supportsTrail: boolean;
  supports3D: boolean;
}> = {
  point: {
    label: 'Point',
    description: 'Static point on the map',
    icon: 'MapPin',
    supportsTrail: false,
    supports3D: true,
  },
  moving: {
    label: 'Moving',
    description: 'Moving asset with trajectory',
    icon: 'Navigation',
    supportsTrail: true,
    supports3D: true,
  },
  area: {
    label: 'Area',
    description: 'Polygon or coverage area',
    icon: 'Pentagon',
    supportsTrail: false,
    supports3D: false,
  },
};

/**
 * Tipos de render disponibles con metadata
 */
export const RENDER_TYPE_INFO: Record<RenderType, {
  label: string;
  description: string;
  icon: string;
  compatibleAssets: AssetType[];
}> = {
  marker: {
    label: 'Marker',
    description: 'Simple marker pin',
    icon: 'MapPin',
    compatibleAssets: ['point', 'moving'],
  },
  icon: {
    label: 'Icon',
    description: 'Icon from library',
    icon: 'Shapes',
    compatibleAssets: ['point', 'moving'],
  },
  image: {
    label: 'Image',
    description: 'Custom image',
    icon: 'Image',
    compatibleAssets: ['point', 'moving'],
  },
  model3d: {
    label: '3D Model',
    description: '3D model (GLB/GLTF)',
    icon: 'Box',
    compatibleAssets: ['point', 'moving'],
  },
  shape: {
    label: 'Shape',
    description: 'Geometric shape',
    icon: 'Pentagon',
    compatibleAssets: ['point', 'moving', 'area'],
  },
};

/**
 * Modos de color de trail disponibles
 */
export const TRAIL_COLOR_MODE_INFO: Record<TrailColorMode, {
  label: string;
  description: string;
  icon: string;
}> = {
  static: {
    label: 'Static',
    description: 'Single color for entire trail',
    icon: 'Palette',
  },
  dynamic: {
    label: 'Dynamic',
    description: 'Color based on data values',
    icon: 'Wand2',
  },
  gradient: {
    label: 'Gradient',
    description: 'Gradient based on values',
    icon: 'GalleryVertical',
  },
  rules: {
    label: 'Rules',
    description: 'Color based on conditions',
    icon: 'Braces',
  },
};