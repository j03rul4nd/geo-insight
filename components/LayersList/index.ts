/**
 * Barrel export para LayersList (ACTUALIZADO)
 * Re-exporta todos los componentes, tipos y utilidades
 */

// ============================================================================
// COMPONENTES
// ============================================================================
export { LayersList as default } from './LayersList';
export { LayerCard } from './components/LayerCard';
export { LayerControls } from './components/LayerControls';
export { ColorSchemeEditor } from './components/ColorSchemeEditor';
export { LayerCreateForm } from './components/LayerForm';
export { LayerEditForm } from './components/LayerEditForm';
export { OrderExplainer } from './components/OrderExplainer';
export { LayerStats } from './components/LayerStats'; 

// ============================================================================
// TIPOS DEL COMPONENTE
// ============================================================================
export type {
  LayersListProps,
  LayerCardProps,
  LayerControlsProps,
  ColorSchemeEditorProps,
  LayerCreateFormProps,
  LayerEditFormProps,
  OrderExplainerProps,
  LayerStatsProps // NEW
} from './types';

// ============================================================================
// RE-EXPORTAR TIPOS DEL HOOK
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
  MarkerConfig,
  ShapeConfig,
  BorderConfig,
  ShadowConfig,
  ColorScheme,
  GradientColorScheme,
  SolidColorScheme,
  HeatmapColorScheme,
  CategoricalColorScheme,
  ThresholdColorScheme, // NEW
  ColorRule,
  ScaleRule,
  VisibilityRule,
  TrailColorScheme,
  StaticTrailColorScheme,
  GradientTrailColorScheme,
  SpeedBasedTrailColorScheme,
  CreateLayerPayload,
  UpdateLayerPayload,
  ReorderLayer,
  EvaluatedLayerStyle, // NEW
  Layer // Alias
} from './types';

// ============================================================================
// UTILIDADES
// ============================================================================
export {
  getColorPreview,
  getSchemeTypeName,
  isValidHexColor,
  formatTimeAgo,
  validateLayerConfig,
  getLayerIcon,
  getAssetTypeDescription,
  getRenderTypeDescription,
  hasTrailConfiguration,
  hasDynamicRules,
  generateDuplicateName,
  validateFilterExpression,
  getLayerTooltip,
  getColorSchemeSummary, // NEW
  requiresValueKey, // NEW
  requiresCategoryKey, // NEW
  validateColorScheme // NEW
} from './core/layersUtils';

// ============================================================================
// HOOK DE CONTEXTO
// ============================================================================
export { useLayersListContext } from './LayersList';