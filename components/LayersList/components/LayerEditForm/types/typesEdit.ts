import {   
  VisualizationLayer, 
  PRESET_COLOR_SCHEMES,
  AssetType,
  RenderType,
  MarkerConfig,
  ShapeConfig,
  BorderConfig,
  ShadowConfig,
  ColorScheme,
  TrailColorMode,
  TrailColorScheme,
  Model3DConfig,
  ColorRule,
  ScaleRule,
  VisibilityRule,
  TrailColorRule,
  TrailGradientConfig,
  TrailValidationConfig,
  TrailPointsConfig,
} from '@/hooks/useVisualizationLayers';

export interface LayerFormState {
  // Basic
  name: string;
  description: string;
  enabled: boolean;
  order: number;
  
  // Asset
  assetType: AssetType;
  renderType: RenderType;
  markerConfig: MarkerConfig;
  imageUrl: string;
  modelUrl: string;
  model3dConfig: Model3DConfig | null; 
  shapeConfig: ShapeConfig;
  
  // Style
  colorScheme: ColorScheme;
  opacity: number; // 0-100 for UI
  pointSize: number; // 1-100 for UI
  borderConfig: BorderConfig;
  shadowConfig: ShadowConfig;
  showBorder: boolean;
  showShadow: boolean;
  
  // Dynamic Rules
  colorRules: ColorRule[];
  scaleRules: ScaleRule[];
  visibilityRules: VisibilityRule[];
  
  // Trail
  showTrail: boolean;
  trailLength: number;
  trailWidth: number; // 1-200 for UI
  trailOpacity: number; // 0-100 for UI
  trailColorMode: TrailColorMode;
  trailColorScheme: TrailColorScheme;
  trailColorRules: TrailColorRule[];
  trailGradientConfig: TrailGradientConfig | null; 
  trailValidationConfig: TrailValidationConfig | null; 
  trailPointsConfig: TrailPointsConfig | null; 
  
  // Filter
  filterQuery: string;
}

export interface LayerFormHandlers {
  // Basic
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  setEnabled: (value: boolean) => void;
  setOrder: (value: number) => void;
  
  // Asset
  setAssetType: (value: AssetType) => void;
  setRenderType: (value: RenderType) => void;
  setMarkerConfig: (value: MarkerConfig) => void;
  setImageUrl: (value: string) => void;
  setModelUrl: (value: string) => void;
  setModel3dConfig: (value: Model3DConfig | null) => void;
  setShapeConfig: (value: ShapeConfig) => void;
  
  // Style
  setColorScheme: (value: ColorScheme) => void;
  setOpacity: (value: number) => void;
  setPointSize: (value: number) => void;
  setBorderConfig: (value: BorderConfig) => void;
  setShadowConfig: (value: ShadowConfig) => void;
  setShowBorder: (value: boolean) => void;
  setShowShadow: (value: boolean) => void;
  
  // Dynamic Rules
  setColorRules: (value: ColorRule[]) => void;
  addColorRule: (rule: ColorRule) => void;
  updateColorRule: (id: string, rule: Partial<ColorRule>) => void;
  removeColorRule: (id: string) => void;
  
  setScaleRules: (value: ScaleRule[]) => void;
  addScaleRule: (rule: ScaleRule) => void;
  updateScaleRule: (id: string, rule: Partial<ScaleRule>) => void;
  removeScaleRule: (id: string) => void;
  
  setVisibilityRules: (value: VisibilityRule[]) => void;
  addVisibilityRule: (rule: VisibilityRule) => void;
  updateVisibilityRule: (id: string, rule: Partial<VisibilityRule>) => void;
  removeVisibilityRule: (id: string) => void;
  
  // Trail
  setShowTrail: (value: boolean) => void;
  setTrailLength: (value: number) => void;
  setTrailWidth: (value: number) => void;
  setTrailOpacity: (value: number) => void;
  setTrailColorMode: (value: TrailColorMode) => void;
  setTrailColorScheme: (value: TrailColorScheme) => void;
  
  setTrailColorRules: (value: TrailColorRule[]) => void;
  addTrailColorRule: (rule: TrailColorRule) => void;
  updateTrailColorRule: (id: string, rule: Partial<TrailColorRule>) => void;
  removeTrailColorRule: (id: string) => void;
  
  setTrailGradientConfig: (value: TrailGradientConfig | null) => void;
  setTrailValidationConfig: (value: TrailValidationConfig | null) => void;
  setTrailPointsConfig: (value: TrailPointsConfig | null) => void;
  
  // Filter
  setFilterQuery: (value: string) => void;
}