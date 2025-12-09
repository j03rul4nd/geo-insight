/**
 * Utilidades para LayersList 
 * Colores, formateo, validaciones + soporte completo para todas las features
 */

import { 
  ColorScheme, 
  ColorSchemeType, 
  VisualizationLayer,
  TrailColorMode,
  TrailColorScheme,
  AssetType,
  RenderType,
  Model3DConfig,
  ShapeConfig,
  BorderConfig,
  ShadowConfig,
  TrailGradientConfig,
  TrailValidationConfig,
  TrailPointsConfig,
} from '../types';

// ============================================================================
// COLOR PREVIEW
// ============================================================================

/**
 * Obtener color CSS para previsualizar el scheme
 */
export function getColorPreview(scheme: ColorScheme | null): string {
  if (!scheme) return '#ffffff';
  
  switch (scheme.type) {
    case 'solid':
      return scheme.color || '#ffffff';
    
    case 'gradient':
      return `linear-gradient(to right, ${scheme.low || '#3b82f6'}, ${scheme.high || '#ef4444'})`;
    
    case 'heatmap':
      if (!scheme.colors || scheme.colors.length === 0) {
        return '#ffffff';
      }
      return `linear-gradient(to right, ${scheme.colors.join(', ')})`;
    
    case 'categorical':
      if (!scheme.colors || scheme.colors.length === 0) {
        return '#ffffff';
      }
      return scheme.colors[0];
    
    case 'threshold':
      if (!scheme.thresholdRanges || scheme.thresholdRanges.length === 0) {
        return '#ffffff';
      }
      const colors = scheme.thresholdRanges.map(r => r.color);
      return `linear-gradient(to right, ${colors.join(', ')})`;
    
    default:
      return '#ffffff';
  }
}

/**
 * Obtener preview para trail color scheme
 */
export function getTrailColorPreview(scheme: TrailColorScheme | null): string {
  if (!scheme) return '#3b82f6';
  
  switch (scheme.type) {
    case 'static':
      return scheme.staticColor;
    
    case 'gradient':
      const gradientColors = scheme.gradient.stops.map(s => s.color);
      return `linear-gradient(to right, ${gradientColors.join(', ')})`;
    
    case 'speed-based':
      const speedColors = [
        scheme.speedBased.lowSpeed.color,
        scheme.speedBased.mediumSpeed.color,
        scheme.speedBased.highSpeed.color,
      ];
      return `linear-gradient(to right, ${speedColors.join(', ')})`;
    
    default:
      return '#3b82f6';
  }
}

// ============================================================================
// NOMBRES Y DESCRIPCIONES
// ============================================================================

/**
 * Obtener nombre legible del tipo de scheme
 */
export function getSchemeTypeName(type: ColorSchemeType): string {
  const names: Record<ColorSchemeType, string> = {
    solid: 'Solid',
    gradient: 'Gradient',
    heatmap: 'Heatmap',
    categorical: 'Categorical',
    threshold: 'Threshold'
  };
  return names[type] || type;
}

/**
 * Obtener nombre legible del trail color mode
 */
export function getTrailColorModeName(mode: TrailColorMode): string {
  const names: Record<TrailColorMode, string> = {
    static: 'Static Color',
    dynamic: 'Dynamic (from data)',
    gradient: 'Gradient',
    rules: 'Rules-Based',
  };
  return names[mode] || mode;
}

/**
 * Obtener icono según el tipo de asset o render type
 */
export function getLayerIcon(layer: VisualizationLayer): string {
  switch (layer.assetType) {
    case 'point':
      return '📍';
    case 'moving':
      return '🚀';
    case 'area':
      return '🗺️';
    default:
      return '📊';
  }
}

/**
 * Obtener descripción corta del tipo de asset
 */
export function getAssetTypeDescription(assetType: AssetType): string {
  switch (assetType) {
    case 'point':
      return 'Static point';
    case 'moving':
      return 'Moving asset';
    case 'area':
      return 'Area/polygon';
    default:
      return 'Unknown';
  }
}

/**
 * Obtener descripción del tipo de renderizado
 */
export function getRenderTypeDescription(renderType: RenderType): string {
  switch (renderType) {
    case 'marker':
      return 'Marker pin';
    case 'icon':
      return 'Custom icon';
    case 'image':
      return 'Image overlay';
    case 'model3d':
      return '3D model';
    case 'shape':
      return 'Geometric shape';
    default:
      return 'Unknown';
  }
}

// ============================================================================
// VALIDACIONES
// ============================================================================

/**
 * Validar que un color hex sea válido
 */
export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

/**
 * Validar configuración de layer (ACTUALIZADO)
 */
export function validateLayerConfig(layer: Partial<VisualizationLayer>): string | null {
  if (!layer.name || layer.name.trim().length === 0) {
    return 'Layer name is required';
  }
  
  if (layer.name.length > 100) {
    return 'Layer name must be less than 100 characters';
  }
  
  if (layer.opacity !== undefined && (layer.opacity < 0 || layer.opacity > 1)) {
    return 'Opacity must be between 0 and 1';
  }
  
  if (layer.pointSize !== undefined && (layer.pointSize < 0.1 || layer.pointSize > 10)) {
    return 'Point size must be between 0.1 and 10';
  }

  if (layer.order !== undefined && layer.order < 0) {
    return 'Order cannot be negative';
  }

  // Validar trail configuration
  if (layer.showTrail) {
    if (layer.assetType !== 'moving') {
      return 'Trail is only supported for moving assets';
    }
    
    if (layer.trailLength !== undefined && layer.trailLength < 1) {
      return 'Trail length must be at least 1';
    }
    
    if (layer.trailWidth !== undefined && (layer.trailWidth < 0.1 || layer.trailWidth > 20)) {
      return 'Trail width must be between 0.1 and 20';
    }
    
    if (layer.trailOpacity !== undefined && (layer.trailOpacity < 0 || layer.trailOpacity > 1)) {
      return 'Trail opacity must be between 0 and 1';
    }
  }

  // Validar 3D model config
  if (layer.renderType === 'model3d') {
    if (!layer.modelUrl) {
      return '3D model URL is required for model3d render type';
    }
    
    if (layer.model3dConfig) {
      const config = layer.model3dConfig;
      
      if (config.scale) {
        if (config.scale.some(s => s <= 0)) {
          return 'Model scale values must be positive';
        }
      }
      
      if (config.minZoom !== undefined && config.maxZoom !== undefined) {
        if (config.minZoom > config.maxZoom) {
          return 'Min zoom must be less than max zoom';
        }
      }
    }
  }

  // Validar shape config
  if (layer.renderType === 'shape') {
    if (!layer.shapeConfig) {
      return 'Shape configuration is required for shape render type';
    }
    
    const shape = layer.shapeConfig;
    
    if (shape.fillOpacity !== undefined && (shape.fillOpacity < 0 || shape.fillOpacity > 1)) {
      return 'Fill opacity must be between 0 and 1';
    }
    
    if (shape.strokeOpacity !== undefined && (shape.strokeOpacity < 0 || shape.strokeOpacity > 1)) {
      return 'Stroke opacity must be between 0 and 1';
    }
    
    if (shape.strokeWidth !== undefined && shape.strokeWidth < 0) {
      return 'Stroke width cannot be negative';
    }
  }

  // Validar border config
  if (layer.borderConfig) {
    const border = layer.borderConfig;
    
    if (border.width < 0) {
      return 'Border width cannot be negative';
    }
    
    if (!isValidHexColor(border.color)) {
      return 'Border color must be a valid hex color';
    }
    
    if (border.opacity !== undefined && (border.opacity < 0 || border.opacity > 1)) {
      return 'Border opacity must be between 0 and 1';
    }
  }
  
  return null;
}

/**
 * Validar ColorScheme
 */
export function validateColorScheme(scheme: ColorScheme): string | null {
  if (!scheme) return 'Color scheme is required';
  
  switch (scheme.type) {
    case 'solid':
      if (!scheme.color || !isValidHexColor(scheme.color)) {
        return 'Valid hex color is required for solid scheme';
      }
      break;
      
    case 'gradient':
      if (!scheme.low || !isValidHexColor(scheme.low)) {
        return 'Valid low color is required for gradient';
      }
      if (!scheme.high || !isValidHexColor(scheme.high)) {
        return 'Valid high color is required for gradient';
      }
      if (!scheme.valueKey) {
        return 'Value key is required for gradient scheme';
      }
      break;
      
    case 'heatmap':
      if (!scheme.colors || scheme.colors.length === 0) {
        return 'At least one color is required for heatmap';
      }
      if (!scheme.thresholds || scheme.thresholds.length === 0) {
        return 'At least one threshold is required for heatmap';
      }
      if (scheme.colors.length !== scheme.thresholds.length) {
        return 'Colors and thresholds must have same length';
      }
      if (!scheme.valueKey) {
        return 'Value key is required for heatmap scheme';
      }
      break;
      
    case 'categorical':
      if (!scheme.categories || scheme.categories.length === 0) {
        return 'At least one category is required';
      }
      if (!scheme.colors || scheme.colors.length === 0) {
        return 'At least one color is required';
      }
      if (!scheme.categoryKey) {
        return 'Category key is required for categorical scheme';
      }
      break;
      
    case 'threshold':
      if (!scheme.thresholdRanges || scheme.thresholdRanges.length === 0) {
        return 'At least one threshold range is required';
      }
      if (!scheme.valueKey) {
        return 'Value key is required for threshold scheme';
      }
      for (let i = 0; i < scheme.thresholdRanges.length; i++) {
        const range = scheme.thresholdRanges[i];
        if (range.min >= range.max) {
          return `Threshold range ${i + 1}: min must be less than max`;
        }
      }
      break;
  }
  
  return null;
}

/**
 * Validar Trail Color Scheme
 */
export function validateTrailColorScheme(scheme: TrailColorScheme): string | null {
  if (!scheme) return 'Trail color scheme is required';
  
  switch (scheme.type) {
    case 'static':
      if (!scheme.staticColor || !isValidHexColor(scheme.staticColor)) {
        return 'Valid hex color is required for static trail';
      }
      break;
      
    case 'gradient':
      if (!scheme.gradient.stops || scheme.gradient.stops.length < 2) {
        return 'At least 2 gradient stops are required';
      }
      if (!scheme.valueKey) {
        return 'Value key is required for gradient trail';
      }
      for (const stop of scheme.gradient.stops) {
        if (!isValidHexColor(stop.color)) {
          return 'All gradient colors must be valid hex colors';
        }
      }
      break;
      
    case 'speed-based':
      if (!scheme.valueKey) {
        return 'Value key is required for speed-based trail';
      }
      const { lowSpeed, mediumSpeed, highSpeed } = scheme.speedBased;
      if (!isValidHexColor(lowSpeed.color) || 
          !isValidHexColor(mediumSpeed.color) || 
          !isValidHexColor(highSpeed.color)) {
        return 'All speed colors must be valid hex colors';
      }
      if (lowSpeed.threshold >= mediumSpeed.threshold || 
          mediumSpeed.threshold >= highSpeed.threshold) {
        return 'Speed thresholds must be in ascending order';
      }
      break;
  }
  
  return null;
}

/**
 * Validar expresión de filtro (básico)
 */
export function validateFilterExpression(filter: string): { valid: boolean; error?: string } {
  if (!filter || filter.trim().length === 0) {
    return { valid: true };
  }

  const validOperators = ['=', '!=', '>', '<', '>=', '<=', 'AND', 'OR'];
  const hasValidOperator = validOperators.some(op => filter.includes(op));
  
  if (!hasValidOperator) {
    return {
      valid: false,
      error: 'Filter must contain a valid operator (=, !=, >, <, >=, <=, AND, OR)'
    };
  }

  return { valid: true };
}

// ============================================================================
// VERIFICACIONES DE CARACTERÍSTICAS
// ============================================================================

/**
 * Verificar si una layer tiene configuración de trail
 */
export function hasTrailConfiguration(layer: VisualizationLayer): boolean {
  return layer.showTrail && layer.assetType === 'moving';
}

/**
 * Verificar si una layer tiene trail avanzado
 */
export function hasAdvancedTrailConfig(layer: VisualizationLayer): boolean {
  return !!(
    hasTrailConfiguration(layer) && (
      layer.trailGradientConfig?.enabled ||
      layer.trailValidationConfig?.enableValidation ||
      layer.trailPointsConfig?.showHistoricalPoints ||
      (layer.trailColorRules && layer.trailColorRules.length > 0)
    )
  );
}

/**
 * Verificar si una layer tiene reglas dinámicas
 */
export function hasDynamicRules(layer: VisualizationLayer): boolean {
  return !!(
    (layer.colorRules && layer.colorRules.length > 0) ||
    (layer.scaleRules && layer.scaleRules.length > 0) ||
    (layer.visibilityRules && layer.visibilityRules.length > 0)
  );
}

/**
 * Verificar si una layer es 3D
 */
export function is3DLayer(layer: VisualizationLayer): boolean {
  return layer.renderType === 'model3d' && !!layer.modelUrl;
}

/**
 * Verificar si una layer tiene configuración avanzada de estilo
 */
export function hasAdvancedStyling(layer: VisualizationLayer): boolean {
  return !!(
    layer.borderConfig ||
    layer.shadowConfig ||
    (layer.shapeConfig && layer.renderType === 'shape')
  );
}

/**
 * Verificar si una layer tiene filtros
 */
export function hasFilter(layer: VisualizationLayer): boolean {
  return !!(layer.filterQuery && layer.filterQuery.trim().length > 0);
}

// ============================================================================
// GENERADORES Y HELPERS
// ============================================================================

/**
 * Generar nombre sugerido para layer duplicada
 */
export function generateDuplicateName(originalName: string, existingNames: string[]): string {
  let counter = 1;
  let newName = `${originalName} (Copy)`;
  
  while (existingNames.includes(newName)) {
    counter++;
    newName = `${originalName} (Copy ${counter})`;
  }
  
  return newName;
}

/**
 * Formatear timestamp relativo
 */
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - dateObj.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

/**
 * Formatear información de layer para tooltip
 */
export function getLayerTooltip(layer: VisualizationLayer): string {
  const parts = [
    `Name: ${layer.name}`,
    `Type: ${getAssetTypeDescription(layer.assetType)}`,
    `Render: ${getRenderTypeDescription(layer.renderType)}`,
    `Order: ${layer.order}`,
    `Opacity: ${Math.round(layer.opacity * 100)}%`,
  ];

  if (layer.filterQuery) {
    parts.push(`Filter: Active`);
  }

  if (hasTrailConfiguration(layer)) {
    parts.push(`Trail: ${layer.trailLength} points`);
  }

  if (hasDynamicRules(layer)) {
    const ruleCount = 
      (layer.colorRules?.length || 0) +
      (layer.scaleRules?.length || 0) +
      (layer.visibilityRules?.length || 0);
    parts.push(`Dynamic rules: ${ruleCount}`);
  }

  if (is3DLayer(layer)) {
    parts.push('3D Model');
  }

  return parts.join('\n');
}

/**
 * Obtener resumen de ColorScheme para mostrar en UI
 */
export function getColorSchemeSummary(scheme: ColorScheme | null): string {
  if (!scheme) return 'No color scheme';
  
  switch (scheme.type) {
    case 'solid':
      return `Solid: ${scheme.color}`;
    case 'gradient':
      return `Gradient: ${scheme.low} → ${scheme.high}`;
    case 'heatmap':
      return `Heatmap: ${scheme.colors?.length || 0} colors`;
    case 'categorical':
      return `Categorical: ${scheme.categories?.length || 0} categories`;
    case 'threshold':
      return `Threshold: ${scheme.thresholdRanges?.length || 0} ranges`;
    default:
      return 'Unknown scheme';
  }
}

/**
 * Obtener resumen de Trail Color Scheme
 */
export function getTrailColorSchemeSummary(scheme: TrailColorScheme | null): string {
  if (!scheme) return 'No trail color';
  
  switch (scheme.type) {
    case 'static':
      return `Static: ${scheme.staticColor}`;
    case 'gradient':
      return `Gradient: ${scheme.gradient.stops.length} stops`;
    case 'speed-based':
      return 'Speed-based: 3 ranges';
    default:
      return 'Unknown';
  }
}

/**
 * Obtener resumen de características de layer
 */
export function getLayerFeaturesSummary(layer: VisualizationLayer): string[] {
  const features: string[] = [];
  
  if (hasTrailConfiguration(layer)) {
    features.push('Trail');
  }
  
  if (hasDynamicRules(layer)) {
    features.push('Dynamic Rules');
  }
  
  if (is3DLayer(layer)) {
    features.push('3D');
  }
  
  if (hasFilter(layer)) {
    features.push('Filtered');
  }
  
  if (hasAdvancedStyling(layer)) {
    features.push('Advanced Styling');
  }
  
  if (hasAdvancedTrailConfig(layer)) {
    features.push('Advanced Trail');
  }
  
  return features;
}

// ============================================================================
// VERIFICACIONES DE REQUISITOS
// ============================================================================

/**
 * Verificar si un ColorScheme requiere un valueKey
 */
export function requiresValueKey(type: ColorSchemeType): boolean {
  return ['gradient', 'heatmap', 'threshold'].includes(type);
}

/**
 * Verificar si un ColorScheme requiere un categoryKey
 */
export function requiresCategoryKey(type: ColorSchemeType): boolean {
  return type === 'categorical';
}

/**
 * Verificar si un asset type soporta trails
 */
export function supportsTrail(assetType: AssetType): boolean {
  return assetType === 'moving';
}

/**
 * Verificar si un asset type soporta 3D
 */
export function supports3D(assetType: AssetType): boolean {
  return assetType === 'point' || assetType === 'moving';
}

/**
 * Verificar compatibilidad render type con asset type
 */
export function isRenderTypeCompatible(renderType: RenderType, assetType: AssetType): boolean {
  const compatibility: Record<RenderType, AssetType[]> = {
    marker: ['point', 'moving'],
    icon: ['point', 'moving'],
    image: ['point', 'moving'],
    model3d: ['point', 'moving'],
    shape: ['point', 'moving', 'area'],
  };
  
  return compatibility[renderType]?.includes(assetType) ?? false;
}

// ============================================================================
// ESTADÍSTICAS Y MÉTRICAS
// ============================================================================

/**
 * Calcular complejidad de una layer (para performance warnings)
 */
export function calculateLayerComplexity(layer: VisualizationLayer): number {
  let complexity = 1;
  
  // Trail aumenta complejidad
  if (hasTrailConfiguration(layer)) {
    complexity += 2;
    if (hasAdvancedTrailConfig(layer)) {
      complexity += 2;
    }
  }
  
  // Reglas dinámicas aumentan complejidad
  if (hasDynamicRules(layer)) {
    const ruleCount = 
      (layer.colorRules?.length || 0) +
      (layer.scaleRules?.length || 0) +
      (layer.visibilityRules?.length || 0);
    complexity += ruleCount;
  }
  
  // 3D aumenta complejidad
  if (is3DLayer(layer)) {
    complexity += 3;
    if (layer.model3dConfig?.animations) {
      complexity += 2;
    }
  }
  
  // Filtros aumentan complejidad ligeramente
  if (hasFilter(layer)) {
    complexity += 1;
  }
  
  return complexity;
}

/**
 * Obtener nivel de complejidad como string
 */
export function getComplexityLevel(complexity: number): 'low' | 'medium' | 'high' | 'very-high' {
  if (complexity <= 3) return 'low';
  if (complexity <= 6) return 'medium';
  if (complexity <= 10) return 'high';
  return 'very-high';
}

/**
 * Obtener advertencia de performance si es necesario
 */
export function getPerformanceWarning(layer: VisualizationLayer): string | null {
  const complexity = calculateLayerComplexity(layer);
  const level = getComplexityLevel(complexity);
  
  if (level === 'very-high') {
    return 'This layer has very high complexity and may impact performance';
  }
  
  if (level === 'high') {
    return 'This layer has high complexity. Monitor performance with large datasets';
  }
  
  return null;
}