import { useState, useMemo, useCallback } from 'react';
import {   
  VisualizationLayer, 
  PRESET_COLOR_SCHEMES,
  Model3DConfig,
  ColorRule,
  ScaleRule,
  VisibilityRule,
  TrailColorRule,
} from '@/hooks/useVisualizationLayers';
import type { LayerFormState, LayerFormHandlers } from '../types/typesEdit';


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



export interface UseLayerEditStateReturn {
  formState: LayerFormState;
  handlers: LayerFormHandlers;
  hasChanges: boolean;
  resetForm: () => void;
  isDirty: boolean;
  getChangedFields: () => string[];
  applyPreset: (preset: Partial<LayerFormState>) => void;
  validateForm: () => { valid: boolean; errors: string[] };
}

// ============================================================================
// DEFAULTS
// ============================================================================

const DEFAULT_MARKER_CONFIG = {
  iconName: 'CircleDot',
  iconLibrary: 'lucide' as const
};

const DEFAULT_SHAPE_CONFIG = {
  type: 'circle' as const,
  fillColor: '#3b82f6',
  fillOpacity: 0.5,
  strokeColor: '#1e40af',
  strokeWidth: 2,
  strokeOpacity: 1.0
};

const DEFAULT_BORDER_CONFIG = {
  width: 2,
  color: '#ffffff',
  style: 'solid' as const,
  opacity: 1.0
};

const DEFAULT_SHADOW_CONFIG = {
  enabled: false,
  color: '#000000',
  blur: 10,
  offsetX: 0,
  offsetY: 0
};

const DEFAULT_TRAIL_COLOR_SCHEME = {
  type: 'static' as const,
  staticColor: '#3b82f6'
};

// ============================================================================
// HELPER: Serialización segura
// ============================================================================

const safeStringify = (value: any): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export const useLayerEditState = (layer: VisualizationLayer): UseLayerEditStateReturn => {
  // ========== BASIC INFO ==========
  const [name, setName] = useState(layer.name);
  const [description, setDescription] = useState(layer.description || '');
  const [enabled, setEnabled] = useState(layer.enabled);
  const [order, setOrder] = useState(layer.order);

  // ========== ASSET CONFIG ==========
  const [assetType, setAssetType] = useState(layer.assetType);
  const [renderType, setRenderType] = useState(layer.renderType);
  const [markerConfig, setMarkerConfig] = useState(
    layer.markerConfig || DEFAULT_MARKER_CONFIG
  );
  const [imageUrl, setImageUrl] = useState(layer.imageUrl || '');
  const [modelUrl, setModelUrl] = useState(layer.modelUrl || '');
  const [model3dConfig, setModel3dConfig] = useState(layer.model3dConfig || null);
  const [shapeConfig, setShapeConfig] = useState(
    layer.shapeConfig || DEFAULT_SHAPE_CONFIG
  );

  // ========== STYLE ==========
  const [colorScheme, setColorScheme] = useState(
    layer.colorScheme || PRESET_COLOR_SCHEMES.temperature
  );
  const [opacity, setOpacity] = useState(Math.round(layer.opacity * 100));
  const [pointSize, setPointSize] = useState(Math.round(layer.pointSize * 100));
  const [showBorder, setShowBorder] = useState(!!layer.borderConfig);
  const [borderConfig, setBorderConfig] = useState(
    layer.borderConfig || DEFAULT_BORDER_CONFIG
  );
  const [showShadow, setShowShadow] = useState(!!layer.shadowConfig);
  const [shadowConfig, setShadowConfig] = useState(
    layer.shadowConfig || DEFAULT_SHADOW_CONFIG
  );

  // ========== DYNAMIC RULES ==========
  const [colorRules, setColorRules] = useState<ColorRule[]>(layer.colorRules || []);
  const [scaleRules, setScaleRules] = useState<ScaleRule[]>(layer.scaleRules || []);
  const [visibilityRules, setVisibilityRules] = useState<VisibilityRule[]>(layer.visibilityRules || []);

  // ========== TRAIL CONFIG ==========
  const [showTrail, setShowTrail] = useState(layer.showTrail);
  const [trailLength, setTrailLength] = useState(layer.trailLength);
  const [trailWidth, setTrailWidth] = useState(Math.round(layer.trailWidth * 100));
  const [trailOpacity, setTrailOpacity] = useState(Math.round(layer.trailOpacity * 100));
  const [trailColorMode, setTrailColorMode] = useState(layer.trailColorMode);
  const [trailColorScheme, setTrailColorScheme] = useState(
    layer.trailColorScheme || DEFAULT_TRAIL_COLOR_SCHEME
  );
  const [trailColorRules, setTrailColorRules] = useState<TrailColorRule[]>(layer.trailColorRules || []);
  const [trailGradientConfig, setTrailGradientConfig] = useState(layer.trailGradientConfig || null);
  const [trailValidationConfig, setTrailValidationConfig] = useState(layer.trailValidationConfig || null);
  const [trailPointsConfig, setTrailPointsConfig] = useState(layer.trailPointsConfig || null);

  // ========== ADVANCED ==========
  const [filterQuery, setFilterQuery] = useState(layer.filterQuery || '');

  // ========== VALORES INICIALES (memoizados) ==========
  const initialValues = useMemo(() => ({
    name: layer.name,
    description: layer.description || '',
    enabled: layer.enabled,
    order: layer.order,
    assetType: layer.assetType,
    renderType: layer.renderType,
    markerConfig: safeStringify(layer.markerConfig),
    imageUrl: layer.imageUrl || '',
    modelUrl: layer.modelUrl || '',
    model3dConfig: safeStringify(layer.model3dConfig),
    shapeConfig: safeStringify(layer.shapeConfig),
    colorScheme: safeStringify(layer.colorScheme),
    opacity: Math.round(layer.opacity * 100),
    pointSize: Math.round(layer.pointSize * 100),
    showBorder: !!layer.borderConfig,
    borderConfig: safeStringify(layer.borderConfig),
    showShadow: !!layer.shadowConfig,
    shadowConfig: safeStringify(layer.shadowConfig),
    colorRules: safeStringify(layer.colorRules),
    scaleRules: safeStringify(layer.scaleRules),
    visibilityRules: safeStringify(layer.visibilityRules),
    showTrail: layer.showTrail,
    trailLength: layer.trailLength,
    trailWidth: Math.round(layer.trailWidth * 100),
    trailOpacity: Math.round(layer.trailOpacity * 100),
    trailColorMode: layer.trailColorMode,
    trailColorScheme: safeStringify(layer.trailColorScheme),
    trailColorRules: safeStringify(layer.trailColorRules),
    trailGradientConfig: safeStringify(layer.trailGradientConfig),
    trailValidationConfig: safeStringify(layer.trailValidationConfig),
    trailPointsConfig: safeStringify(layer.trailPointsConfig),
    filterQuery: layer.filterQuery || ''
  }), [layer]);

  // ========== DETECCIÓN DE CAMBIOS (optimizada) ==========
  const hasChanges = useMemo(() => {
    return (
      name !== initialValues.name ||
      description !== initialValues.description ||
      enabled !== initialValues.enabled ||
      order !== initialValues.order ||
      assetType !== initialValues.assetType ||
      renderType !== initialValues.renderType ||
      safeStringify(markerConfig) !== initialValues.markerConfig ||
      imageUrl !== initialValues.imageUrl ||
      modelUrl !== initialValues.modelUrl ||
      safeStringify(model3dConfig) !== initialValues.model3dConfig ||
      safeStringify(shapeConfig) !== initialValues.shapeConfig ||
      safeStringify(colorScheme) !== initialValues.colorScheme ||
      opacity !== initialValues.opacity ||
      pointSize !== initialValues.pointSize ||
      showBorder !== initialValues.showBorder ||
      safeStringify(borderConfig) !== initialValues.borderConfig ||
      showShadow !== initialValues.showShadow ||
      safeStringify(shadowConfig) !== initialValues.shadowConfig ||
      safeStringify(colorRules) !== initialValues.colorRules ||
      safeStringify(scaleRules) !== initialValues.scaleRules ||
      safeStringify(visibilityRules) !== initialValues.visibilityRules ||
      showTrail !== initialValues.showTrail ||
      trailLength !== initialValues.trailLength ||
      trailWidth !== initialValues.trailWidth ||
      trailOpacity !== initialValues.trailOpacity ||
      trailColorMode !== initialValues.trailColorMode ||
      safeStringify(trailColorScheme) !== initialValues.trailColorScheme ||
      safeStringify(trailColorRules) !== initialValues.trailColorRules ||
      safeStringify(trailGradientConfig) !== initialValues.trailGradientConfig ||
      safeStringify(trailValidationConfig) !== initialValues.trailValidationConfig ||
      safeStringify(trailPointsConfig) !== initialValues.trailPointsConfig ||
      filterQuery !== initialValues.filterQuery
    );
  }, [
    name, description, enabled, order, assetType, renderType,
    markerConfig, imageUrl, modelUrl, model3dConfig, shapeConfig,
    colorScheme, opacity, pointSize, showBorder, borderConfig,
    showShadow, shadowConfig, colorRules, scaleRules, visibilityRules,
    showTrail, trailLength, trailWidth, trailOpacity, trailColorMode,
    trailColorScheme, trailColorRules, trailGradientConfig,
    trailValidationConfig, trailPointsConfig, filterQuery,
    initialValues
  ]);

  // ========== RESET FUNCTION (memoizada) ==========
  const resetForm = useCallback(() => {
    setName(layer.name);
    setDescription(layer.description || '');
    setEnabled(layer.enabled);
    setOrder(layer.order);
    setAssetType(layer.assetType);
    setRenderType(layer.renderType);
    setMarkerConfig(layer.markerConfig || DEFAULT_MARKER_CONFIG);
    setImageUrl(layer.imageUrl || '');
    setModelUrl(layer.modelUrl || '');
    setModel3dConfig(layer.model3dConfig || null);
    setShapeConfig(layer.shapeConfig || DEFAULT_SHAPE_CONFIG);
    setColorScheme(layer.colorScheme || PRESET_COLOR_SCHEMES.temperature);
    setOpacity(Math.round(layer.opacity * 100));
    setPointSize(Math.round(layer.pointSize * 100));
    setShowBorder(!!layer.borderConfig);
    setBorderConfig(layer.borderConfig || DEFAULT_BORDER_CONFIG);
    setShowShadow(!!layer.shadowConfig);
    setShadowConfig(layer.shadowConfig || DEFAULT_SHADOW_CONFIG);
    setColorRules(layer.colorRules || []);
    setScaleRules(layer.scaleRules || []);
    setVisibilityRules(layer.visibilityRules || []);
    setShowTrail(layer.showTrail);
    setTrailLength(layer.trailLength);
    setTrailWidth(Math.round(layer.trailWidth * 100));
    setTrailOpacity(Math.round(layer.trailOpacity * 100));
    setTrailColorMode(layer.trailColorMode);
    setTrailColorScheme(layer.trailColorScheme || DEFAULT_TRAIL_COLOR_SCHEME);
    setTrailColorRules(layer.trailColorRules || []);
    setTrailGradientConfig(layer.trailGradientConfig || null);
    setTrailValidationConfig(layer.trailValidationConfig || null);
    setTrailPointsConfig(layer.trailPointsConfig || null);
    setFilterQuery(layer.filterQuery || '');
  }, [layer]);

  // ========== HANDLERS FOR RULES ==========
  const addColorRule = useCallback((rule: ColorRule) => {
    setColorRules(prev => [...prev, rule]);
  }, []);

  const updateColorRule = useCallback((id: string, updates: Partial<ColorRule>) => {
    setColorRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  }, []);

  const removeColorRule = useCallback((id: string) => {
    setColorRules(prev => prev.filter(rule => rule.id !== id));
  }, []);

  const addScaleRule = useCallback((rule: ScaleRule) => {
    setScaleRules(prev => [...prev, rule]);
  }, []);

  const updateScaleRule = useCallback((id: string, updates: Partial<ScaleRule>) => {
    setScaleRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  }, []);

  const removeScaleRule = useCallback((id: string) => {
    setScaleRules(prev => prev.filter(rule => rule.id !== id));
  }, []);

  const addVisibilityRule = useCallback((rule: VisibilityRule) => {
    setVisibilityRules(prev => [...prev, rule]);
  }, []);

  const updateVisibilityRule = useCallback((id: string, updates: Partial<VisibilityRule>) => {
    setVisibilityRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  }, []);

  const removeVisibilityRule = useCallback((id: string) => {
    setVisibilityRules(prev => prev.filter(rule => rule.id !== id));
  }, []);

  const addTrailColorRule = useCallback((rule: TrailColorRule) => {
    setTrailColorRules(prev => [...prev, rule]);
  }, []);

  const updateTrailColorRule = useCallback((id: string, updates: Partial<TrailColorRule>) => {
    setTrailColorRules(prev => prev.map(rule => 
      rule.id === id ? { ...rule, ...updates } : rule
    ));
  }, []);

  const removeTrailColorRule = useCallback((id: string) => {
    setTrailColorRules(prev => prev.filter(rule => rule.id !== id));
  }, []);

  // ========== GET CHANGED FIELDS ==========
  const getChangedFields = useCallback((): string[] => {
    const changed: string[] = [];

    if (name !== initialValues.name) changed.push('name');
    if (description !== initialValues.description) changed.push('description');
    if (enabled !== initialValues.enabled) changed.push('enabled');
    if (order !== initialValues.order) changed.push('order');
    if (assetType !== initialValues.assetType) changed.push('assetType');
    if (renderType !== initialValues.renderType) changed.push('renderType');
    if (safeStringify(markerConfig) !== initialValues.markerConfig) changed.push('markerConfig');
    if (imageUrl !== initialValues.imageUrl) changed.push('imageUrl');
    if (modelUrl !== initialValues.modelUrl) changed.push('modelUrl');
    if (safeStringify(model3dConfig) !== initialValues.model3dConfig) changed.push('model3dConfig');
    if (safeStringify(shapeConfig) !== initialValues.shapeConfig) changed.push('shapeConfig');
    if (safeStringify(colorScheme) !== initialValues.colorScheme) changed.push('colorScheme');
    if (opacity !== initialValues.opacity) changed.push('opacity');
    if (pointSize !== initialValues.pointSize) changed.push('pointSize');
    if (showBorder !== initialValues.showBorder) changed.push('showBorder');
    if (safeStringify(borderConfig) !== initialValues.borderConfig) changed.push('borderConfig');
    if (showShadow !== initialValues.showShadow) changed.push('showShadow');
    if (safeStringify(shadowConfig) !== initialValues.shadowConfig) changed.push('shadowConfig');
    if (safeStringify(colorRules) !== initialValues.colorRules) changed.push('colorRules');
    if (safeStringify(scaleRules) !== initialValues.scaleRules) changed.push('scaleRules');
    if (safeStringify(visibilityRules) !== initialValues.visibilityRules) changed.push('visibilityRules');
    if (showTrail !== initialValues.showTrail) changed.push('showTrail');
    if (trailLength !== initialValues.trailLength) changed.push('trailLength');
    if (trailWidth !== initialValues.trailWidth) changed.push('trailWidth');
    if (trailOpacity !== initialValues.trailOpacity) changed.push('trailOpacity');
    if (trailColorMode !== initialValues.trailColorMode) changed.push('trailColorMode');
    if (safeStringify(trailColorScheme) !== initialValues.trailColorScheme) changed.push('trailColorScheme');
    if (safeStringify(trailColorRules) !== initialValues.trailColorRules) changed.push('trailColorRules');
    if (safeStringify(trailGradientConfig) !== initialValues.trailGradientConfig) changed.push('trailGradientConfig');
    if (safeStringify(trailValidationConfig) !== initialValues.trailValidationConfig) changed.push('trailValidationConfig');
    if (safeStringify(trailPointsConfig) !== initialValues.trailPointsConfig) changed.push('trailPointsConfig');
    if (filterQuery !== initialValues.filterQuery) changed.push('filterQuery');

    return changed;
  }, [
    name, description, enabled, order, assetType, renderType,
    markerConfig, imageUrl, modelUrl, model3dConfig, shapeConfig,
    colorScheme, opacity, pointSize, showBorder, borderConfig,
    showShadow, shadowConfig, colorRules, scaleRules, visibilityRules,
    showTrail, trailLength, trailWidth, trailOpacity, trailColorMode,
    trailColorScheme, trailColorRules, trailGradientConfig,
    trailValidationConfig, trailPointsConfig, filterQuery,
    initialValues
  ]);

  // ========== APPLY PRESET ==========
  const applyPreset = useCallback((preset: Partial<LayerFormState>) => {
    if (preset.name !== undefined) setName(preset.name);
    if (preset.description !== undefined) setDescription(preset.description);
    if (preset.enabled !== undefined) setEnabled(preset.enabled);
    if (preset.assetType !== undefined) setAssetType(preset.assetType);
    if (preset.renderType !== undefined) setRenderType(preset.renderType);
    if (preset.markerConfig !== undefined) setMarkerConfig(preset.markerConfig);
    if (preset.imageUrl !== undefined) setImageUrl(preset.imageUrl);
    if (preset.modelUrl !== undefined) setModelUrl(preset.modelUrl);
    if (preset.model3dConfig !== undefined) setModel3dConfig(preset.model3dConfig);
    if (preset.shapeConfig !== undefined) setShapeConfig(preset.shapeConfig);
    if (preset.colorScheme !== undefined) setColorScheme(preset.colorScheme);
    if (preset.opacity !== undefined) setOpacity(preset.opacity);
    if (preset.pointSize !== undefined) setPointSize(preset.pointSize);
    if (preset.showBorder !== undefined) setShowBorder(preset.showBorder);
    if (preset.borderConfig !== undefined) setBorderConfig(preset.borderConfig);
    if (preset.showShadow !== undefined) setShowShadow(preset.showShadow);
    if (preset.shadowConfig !== undefined) setShadowConfig(preset.shadowConfig);
    if (preset.showTrail !== undefined) setShowTrail(preset.showTrail);
    if (preset.trailLength !== undefined) setTrailLength(preset.trailLength);
    if (preset.trailWidth !== undefined) setTrailWidth(preset.trailWidth);
    if (preset.trailOpacity !== undefined) setTrailOpacity(preset.trailOpacity);
    if (preset.trailColorMode !== undefined) setTrailColorMode(preset.trailColorMode);
    if (preset.trailColorScheme !== undefined) setTrailColorScheme(preset.trailColorScheme);
  }, []);

  // ========== VALIDATE FORM ==========
  const validateForm = useCallback((): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validar nombre
    if (!name.trim()) {
      errors.push('Layer name is required');
    }

    // Validar opacity range
    if (opacity < 0 || opacity > 100) {
      errors.push('Opacity must be between 0 and 100');
    }

    // Validar pointSize range
    if (pointSize < 1 || pointSize > 100) {
      errors.push('Point size must be between 1 and 100');
    }

    // Validar trail config si está habilitado
    if (showTrail) {
      if (trailLength < 1) {
        errors.push('Trail length must be at least 1');
      }
      if (trailWidth < 1 || trailWidth > 200) {
        errors.push('Trail width must be between 1 and 200');
      }
      if (trailOpacity < 0 || trailOpacity > 100) {
        errors.push('Trail opacity must be between 0 and 100');
      }
    }

    // Validar URLs si están presentes
    if (imageUrl && !isValidUrl(imageUrl)) {
      errors.push('Image URL is not valid');
    }
    if (modelUrl && !isValidUrl(modelUrl)) {
      errors.push('Model URL is not valid');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }, [name, opacity, pointSize, showTrail, trailLength, trailWidth, trailOpacity, imageUrl, modelUrl]);

  // ========== RETURN ==========
  return {
    formState: {
      name,
      description,
      enabled,
      order,
      assetType,
      renderType,
      markerConfig,
      imageUrl,
      modelUrl,
      model3dConfig,
      shapeConfig,
      colorScheme,
      opacity,
      pointSize,
      showBorder,
      borderConfig,
      showShadow,
      shadowConfig,
      colorRules,
      scaleRules,
      visibilityRules,
      showTrail,
      trailLength,
      trailWidth,
      trailOpacity,
      trailColorMode,
      trailColorScheme,
      trailColorRules,
      trailGradientConfig,
      trailValidationConfig,
      trailPointsConfig,
      filterQuery
    },
    handlers: {
      setName,
      setDescription,
      setEnabled,
      setOrder,
      setAssetType,
      setRenderType,
      setMarkerConfig,
      setImageUrl,
      setModelUrl,
      setModel3dConfig,
      setShapeConfig,
      setColorScheme,
      setOpacity,
      setPointSize,
      setShowBorder,
      setBorderConfig,
      setShowShadow,
      setShadowConfig,
      setColorRules,
      addColorRule,
      updateColorRule,
      removeColorRule,
      setScaleRules,
      addScaleRule,
      updateScaleRule,
      removeScaleRule,
      setVisibilityRules,
      addVisibilityRule,
      updateVisibilityRule,
      removeVisibilityRule,
      setShowTrail,
      setTrailLength,
      setTrailWidth,
      setTrailOpacity,
      setTrailColorMode,
      setTrailColorScheme,
      setTrailColorRules,
      addTrailColorRule,
      updateTrailColorRule,
      removeTrailColorRule,
      setTrailGradientConfig,
      setTrailValidationConfig,
      setTrailPointsConfig,
      setFilterQuery
    },
    hasChanges,
    isDirty: hasChanges,
    resetForm,
    getChangedFields,
    applyPreset,
    validateForm
  };
};
// ============================================================================
// HELPERS
// ============================================================================

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}