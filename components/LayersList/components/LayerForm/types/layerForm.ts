import {
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
  model3dConfig: Model3DConfig;
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
  trailGradientConfig: TrailGradientConfig;
  trailValidationConfig: TrailValidationConfig;
  trailPointsConfig: TrailPointsConfig;
  
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
  setModel3dConfig: (value: Model3DConfig) => void;
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
  
  setTrailGradientConfig: (value: TrailGradientConfig) => void;
  setTrailValidationConfig: (value: TrailValidationConfig) => void;
  setTrailPointsConfig: (value: TrailPointsConfig) => void;
  
  // Filter
  setFilterQuery: (value: string) => void;
}

// Helper: valores por defecto para inicializar el formulario
export const DEFAULT_LAYER_FORM_STATE: LayerFormState = {
  // Basic
  name: '',
  description: '',
  enabled: true,
  order: 0,
  
  // Asset
  assetType: 'point',
  renderType: 'marker',
  markerConfig: {
    iconName: 'MapPin',
    iconLibrary: 'lucide',
  },
  imageUrl: '',
  modelUrl: '',
  model3dConfig: {
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    translate: [0, 0, 0],
    orientation: 'map',
    anchor: 'center',
    autoRotate: false,
    autoRotateOffset: 0,
    minZoom: 0,
    maxZoom: 24,
    scaleWithZoom: false,
    scaleRange: [0.5, 2],
    castShadows: true,
    receiveShadows: true,
    metalness: 0.5,
    roughness: 0.5,
    emissiveIntensity: 0,
    frustumCulling: true,
    lodEnabled: false,
    clickable: true,
    hoverable: true,
    altitudeMode: 'clampToGround',
    heightOffset: 0,
  },
  shapeConfig: {
    type: 'circle',
    radius: 100,
    fillColor: '#3b82f6',
    fillOpacity: 0.5,
    strokeColor: '#1e40af',
    strokeWidth: 2,
    strokeOpacity: 1.0,
  },
  
  // Style
  colorScheme: {
    type: 'solid',
    color: '#3b82f6',
  },
  opacity: 100,
  pointSize: 50,
  borderConfig: {
    width: 2,
    color: '#000000',
    style: 'solid',
    opacity: 1.0,
  },
  shadowConfig: {
    enabled: false,
    color: '#000000',
    blur: 10,
    offsetX: 0,
    offsetY: 0,
  },
  showBorder: false,
  showShadow: false,
  
  // Dynamic Rules
  colorRules: [],
  scaleRules: [],
  visibilityRules: [],
  
  // Trail
  showTrail: false,
  trailLength: 50,
  trailWidth: 100,
  trailOpacity: 60,
  trailColorMode: 'static',
  trailColorScheme: {
    type: 'static',
    staticColor: '#3b82f6',
  },
  trailColorRules: [],
  trailGradientConfig: {
    enabled: false,
    fadeOldSegments: false,
    fadeStartAge: 30,
    fadeEndAge: 100,
    minOpacity: 0.2,
  },
  trailValidationConfig: {
    enableValidation: false,
    minDistanceThreshold: 5,
    maxTimeBetweenPoints: 60000,
  },
  trailPointsConfig: {
    showHistoricalPoints: false,
    pointInterval: 10,
    pointSize: 3,
    pointOpacity: 0.8,
    fadeWithAge: false,
  },
  
  // Filter
  filterQuery: '',
};

// Helper: convertir de API (0-1) a UI (0-100)
export const convertFromAPI = (layer: any): Partial<LayerFormState> => ({
  opacity: Math.round(layer.opacity * 100),
  pointSize: Math.round(layer.pointSize * 100),
  trailWidth: Math.round(layer.trailWidth * 100),
  trailOpacity: Math.round(layer.trailOpacity * 100),
  colorRules: layer.colorRules || [],
  scaleRules: layer.scaleRules || [],
  visibilityRules: layer.visibilityRules || [],
  trailColorRules: layer.trailColorRules || [],
  trailGradientConfig: layer.trailGradientConfig || DEFAULT_LAYER_FORM_STATE.trailGradientConfig,
  trailValidationConfig: layer.trailValidationConfig || DEFAULT_LAYER_FORM_STATE.trailValidationConfig,
  trailPointsConfig: layer.trailPointsConfig || DEFAULT_LAYER_FORM_STATE.trailPointsConfig,
  model3dConfig: layer.model3dConfig || DEFAULT_LAYER_FORM_STATE.model3dConfig,
});

// Helper: convertir de UI (0-100) a API (0-1)
export const convertToAPI = (formState: LayerFormState): any => ({
  ...formState,
  opacity: formState.opacity / 100,
  pointSize: formState.pointSize / 100,
  trailWidth: formState.trailWidth / 100,
  trailOpacity: formState.trailOpacity / 100,
  description: formState.description || null,
  imageUrl: formState.imageUrl || null,
  modelUrl: formState.modelUrl || null,
  model3dConfig: formState.modelUrl ? formState.model3dConfig : null,
  shapeConfig: formState.renderType === 'shape' ? formState.shapeConfig : null,
  borderConfig: formState.showBorder ? formState.borderConfig : null,
  shadowConfig: formState.showShadow ? formState.shadowConfig : null,
  colorRules: formState.colorRules.length > 0 ? formState.colorRules : null,
  scaleRules: formState.scaleRules.length > 0 ? formState.scaleRules : null,
  visibilityRules: formState.visibilityRules.length > 0 ? formState.visibilityRules : null,
  trailColorRules: formState.trailColorRules.length > 0 ? formState.trailColorRules : null,
  trailGradientConfig: formState.showTrail ? formState.trailGradientConfig : null,
  trailValidationConfig: formState.showTrail ? formState.trailValidationConfig : null,
  trailPointsConfig: formState.showTrail ? formState.trailPointsConfig : null,
  filterQuery: formState.filterQuery || null,
});