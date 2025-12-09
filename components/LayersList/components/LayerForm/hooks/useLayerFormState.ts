import { useState, useMemo } from 'react';
import { PRESET_COLOR_SCHEMES } from '@/hooks/useVisualizationLayers';
import type { LayerFormState, LayerFormHandlers } from '../types/layerForm';
import type { VisualizationLayer } from '@/hooks/useVisualizationLayers';

interface UseLayerFormStateParams {
  existingLayers: VisualizationLayer[];
}

export const useLayerFormState = ({ existingLayers }: UseLayerFormStateParams) => {
  // Calculate default order
  const defaultOrder = useMemo(() => {
    if (existingLayers.length === 0) return 0;
    return Math.max(...existingLayers.map(l => l.order)) + 1;
  }, [existingLayers]);

  // ========== BASIC ==========
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [order, setOrder] = useState(defaultOrder);
  
  // ========== ASSET ==========
  const [assetType, setAssetType] = useState<LayerFormState['assetType']>('point');
  const [renderType, setRenderType] = useState<LayerFormState['renderType']>('marker');
  const [markerConfig, setMarkerConfig] = useState<LayerFormState['markerConfig']>({
    iconName: 'CircleDot',
    iconLibrary: 'lucide'
  });
  const [imageUrl, setImageUrl] = useState('');
  const [modelUrl, setModelUrl] = useState('');
  const [model3dConfig, setModel3dConfig] = useState<LayerFormState['model3dConfig']>({
    scale: [1, 1, 1],
    rotation: [0, 0, 0],
    translate: [0, 0, 0],
    orientation: 'auto',
    anchor: 'center',
    autoRotate: false,
    autoRotateOffset: 0,
    minZoom: 0,
    maxZoom: 24,
    scaleWithZoom: true,
    scaleRange: [0.5, 2],
    castShadows: false,
    receiveShadows: false,
    metalness: 0.5,
    roughness: 0.5,
    emissiveIntensity: 0,
    frustumCulling: true,
    lodEnabled: false,
    clickable: true,
    hoverable: true,
    altitudeMode: 'clampToGround',
    heightOffset: 0
  });
  const [shapeConfig, setShapeConfig] = useState<LayerFormState['shapeConfig']>({
    type: 'circle',
    radius: 50,
    fillColor: '#3b82f6',
    fillOpacity: 0.5,
    strokeColor: '#1e40af',
    strokeWidth: 2,
    strokeOpacity: 1.0
  });
  
  // ========== STYLE ==========
  const [colorScheme, setColorScheme] = useState<LayerFormState['colorScheme']>(
    PRESET_COLOR_SCHEMES.temperature
  );
  const [opacity, setOpacity] = useState(100);
  const [pointSize, setPointSize] = useState(10);
  const [showBorder, setShowBorder] = useState(false);
  const [borderConfig, setBorderConfig] = useState<LayerFormState['borderConfig']>({
    width: 2,
    color: '#000000',
    style: 'solid',
    opacity: 1.0
  });
  const [showShadow, setShowShadow] = useState(false);
  const [shadowConfig, setShadowConfig] = useState<LayerFormState['shadowConfig']>({
    enabled: false,
    color: '#000000',
    blur: 10,
    offsetX: 2,
    offsetY: 2
  });
  
  // ========== DYNAMIC RULES ==========
  const [colorRules, setColorRules] = useState<LayerFormState['colorRules']>([]);
  const [scaleRules, setScaleRules] = useState<LayerFormState['scaleRules']>([]);
  const [visibilityRules, setVisibilityRules] = useState<LayerFormState['visibilityRules']>([]);
  
  // ========== TRAIL ==========
  const [showTrail, setShowTrail] = useState(false);
  const [trailLength, setTrailLength] = useState(50);
  const [trailWidth, setTrailWidth] = useState(20);
  const [trailOpacity, setTrailOpacity] = useState(60);
  const [trailColorMode, setTrailColorMode] = useState<LayerFormState['trailColorMode']>('static');
  const [trailColorScheme, setTrailColorScheme] = useState<LayerFormState['trailColorScheme']>({
    type: 'static',
    staticColor: '#3b82f6'
  });
  const [trailColorRules, setTrailColorRules] = useState<LayerFormState['trailColorRules']>([]);
  const [trailGradientConfig, setTrailGradientConfig] = useState<LayerFormState['trailGradientConfig']>({
    enabled: false,
    fadeOldSegments: true,
    fadeStartAge: 30,
    fadeEndAge: 100,
    minOpacity: 0.2
  });
  const [trailValidationConfig, setTrailValidationConfig] = useState<LayerFormState['trailValidationConfig']>({
    enableValidation: false,
    minDistanceThreshold: 5,
    maxTimeBetweenPoints: 60000
  });
  const [trailPointsConfig, setTrailPointsConfig] = useState<LayerFormState['trailPointsConfig']>({
    showHistoricalPoints: false,
    pointInterval: 10,
    pointSize: 3,
    pointOpacity: 0.8,
    fadeWithAge: true
  });
  
  // ========== FILTER ==========
  const [filterQuery, setFilterQuery] = useState('');

  // Aggregate state
  const formState: LayerFormState = {
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
    borderConfig,
    shadowConfig,
    showBorder,
    showShadow,
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
  };

  // Aggregate handlers
 // Aggregate handlers
  const handlers: LayerFormHandlers = {
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
    setBorderConfig,
    setShadowConfig,
    setShowBorder,
    setShowShadow,
    
    // Color Rules
    setColorRules,
    addColorRule: (rule) => setColorRules(prev => [...prev, rule]),
    updateColorRule: (id, updates) => setColorRules(prev => 
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    ),
    removeColorRule: (id) => setColorRules(prev => prev.filter(r => r.id !== id)),
    
    // Scale Rules
    setScaleRules,
    addScaleRule: (rule) => setScaleRules(prev => [...prev, rule]),
    updateScaleRule: (id, updates) => setScaleRules(prev => 
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    ),
    removeScaleRule: (id) => setScaleRules(prev => prev.filter(r => r.id !== id)),
    
    // Visibility Rules
    setVisibilityRules,
    addVisibilityRule: (rule) => setVisibilityRules(prev => [...prev, rule]),
    updateVisibilityRule: (id, updates) => setVisibilityRules(prev => 
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    ),
    removeVisibilityRule: (id) => setVisibilityRules(prev => prev.filter(r => r.id !== id)),
    
    // Trail
    setShowTrail,
    setTrailLength,
    setTrailWidth,
    setTrailOpacity,
    setTrailColorMode,
    setTrailColorScheme,
    
    // Trail Color Rules
    setTrailColorRules,
    addTrailColorRule: (rule) => setTrailColorRules(prev => [...prev, rule]),
    updateTrailColorRule: (id, updates) => setTrailColorRules(prev => 
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    ),
    removeTrailColorRule: (id) => setTrailColorRules(prev => prev.filter(r => r.id !== id)),
    
    setTrailGradientConfig,
    setTrailValidationConfig,
    setTrailPointsConfig,
    setFilterQuery
  };

  return { formState, handlers, defaultOrder };
};