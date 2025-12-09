import { useState, useCallback } from 'react';
import { 
  validateLayerConfig, 
  validateColorScheme, 
  validateTrailColorScheme,
  isValidHexColor,
  supportsTrail,
  supports3D,
  isRenderTypeCompatible
} from '../../../core/layersUtils';
import type { LayerFormState } from '../types/layerForm';

export const useLayerFormValidation = () => {
  const [validationError, setValidationError] = useState<string | null>(null);

  const validateForm = useCallback((formState: LayerFormState): boolean => {
    setValidationError(null);

    // ========== BASIC VALIDATION (usando layerUtils) ==========
    const error = validateLayerConfig({
      name: formState.name,
      opacity: formState.opacity / 100,
      pointSize: formState.pointSize / 10,
      order: formState.order,
      showTrail: formState.showTrail,
      trailLength: formState.trailLength,
      trailWidth: formState.trailWidth / 10,
      trailOpacity: formState.trailOpacity / 100,
      assetType: formState.assetType,
      renderType: formState.renderType,
      modelUrl: formState.modelUrl || null,
      model3dConfig: formState.model3dConfig,
      shapeConfig: formState.shapeConfig,
      borderConfig: formState.showBorder ? formState.borderConfig : null,
    });

    if (error) {
      setValidationError(error);
      return false;
    }

    // ========== COMPATIBILITY VALIDATIONS ==========
    if (!isRenderTypeCompatible(formState.renderType, formState.assetType)) {
      setValidationError(`${formState.renderType} render type is not compatible with ${formState.assetType} asset type`);
      return false;
    }

    // ========== RENDER TYPE VALIDATIONS ==========
    if (formState.renderType === 'icon') {
      if (!formState.markerConfig?.iconName) {
        setValidationError('Icon name is required when using icon render type');
        return false;
      }
    }

    if (formState.renderType === 'image') {
      if (!formState.imageUrl || !formState.imageUrl.trim()) {
        setValidationError('Image URL is required when using image render type');
        return false;
      }
      
      // Validate URL format
      try {
        new URL(formState.imageUrl);
      } catch {
        setValidationError('Image URL must be a valid URL');
        return false;
      }
    }

    if (formState.renderType === 'model3d') {
      if (!formState.modelUrl || !formState.modelUrl.trim()) {
        setValidationError('Model URL is required when using 3D model render type');
        return false;
      }

      // Validate URL format
      try {
        new URL(formState.modelUrl);
      } catch {
        setValidationError('Model URL must be a valid URL');
        return false;
      }

      // Validate model file extension
      const validExtensions = ['.glb', '.gltf'];
      const hasValidExtension = validExtensions.some(ext => 
        formState.modelUrl.toLowerCase().endsWith(ext)
      );
      if (!hasValidExtension) {
        setValidationError('Model URL must point to a .glb or .gltf file');
        return false;
      }

      // Validate model3dConfig
      if (formState.model3dConfig) {
        const { 
          scale, 
          rotation,
          translate,
          scaleRange, 
          minZoom, 
          maxZoom, 
          lodDistances,
          animations,
          metalness,
          roughness,
          emissiveIntensity
        } = formState.model3dConfig;
        
        if (scale && (scale[0] <= 0 || scale[1] <= 0 || scale[2] <= 0)) {
          setValidationError('Model scale values must be positive');
          return false;
        }

        if (rotation && (
          rotation[0] < 0 || rotation[0] > 360 ||
          rotation[1] < 0 || rotation[1] > 360 ||
          rotation[2] < 0 || rotation[2] > 360
        )) {
          setValidationError('Model rotation values must be between 0 and 360');
          return false;
        }

        if (scaleRange && (scaleRange[0] <= 0 || scaleRange[1] <= 0 || scaleRange[0] > scaleRange[1])) {
          setValidationError('Invalid scale range for model');
          return false;
        }

        if (minZoom !== undefined && maxZoom !== undefined && minZoom > maxZoom) {
          setValidationError('Model min zoom cannot be greater than max zoom');
          return false;
        }

        if (minZoom !== undefined && minZoom < 0) {
          setValidationError('Model min zoom must be non-negative');
          return false;
        }

        if (maxZoom !== undefined && maxZoom > 24) {
          setValidationError('Model max zoom cannot exceed 24');
          return false;
        }

        if (lodDistances && lodDistances.some(d => d <= 0)) {
          setValidationError('LOD distances must be positive');
          return false;
        }

        if (lodDistances && lodDistances.length > 0) {
          // Check if distances are in ascending order
          for (let i = 1; i < lodDistances.length; i++) {
            if (lodDistances[i] <= lodDistances[i - 1]) {
              setValidationError('LOD distances must be in ascending order');
              return false;
            }
          }
        }

        if (animations?.speed !== undefined && animations.speed <= 0) {
          setValidationError('Animation speed must be positive');
          return false;
        }

        if (metalness !== undefined && (metalness < 0 || metalness > 1)) {
          setValidationError('Metalness must be between 0 and 1');
          return false;
        }

        if (roughness !== undefined && (roughness < 0 || roughness > 1)) {
          setValidationError('Roughness must be between 0 and 1');
          return false;
        }

        if (emissiveIntensity !== undefined && emissiveIntensity < 0) {
          setValidationError('Emissive intensity must be non-negative');
          return false;
        }

        if (translate && !Array.isArray(translate)) {
          setValidationError('Model translate must be an array of 3 numbers');
          return false;
        }
      }

      // Check if asset type supports 3D
      if (!supports3D(formState.assetType)) {
        setValidationError(`3D models are not supported for ${formState.assetType} asset type`);
        return false;
      }
    }

    if (formState.renderType === 'shape') {
      if (!formState.shapeConfig) {
        setValidationError('Shape configuration is required for shape render type');
        return false;
      }

      const { 
        type, 
        radius, 
        width, 
        height, 
        coordinates,
        fillColor,
        strokeColor,
        fillOpacity,
        strokeOpacity,
        strokeWidth
      } = formState.shapeConfig;

      if (type === 'circle' && (!radius || radius <= 0)) {
        setValidationError('Circle radius must be positive');
        return false;
      }

      if (type === 'rectangle') {
        if (!width || width <= 0) {
          setValidationError('Rectangle width must be positive');
          return false;
        }
        if (!height || height <= 0) {
          setValidationError('Rectangle height must be positive');
          return false;
        }
      }

      if (type === 'polygon') {
        if (!coordinates || coordinates.length < 3) {
          setValidationError('Polygon must have at least 3 coordinates');
          return false;
        }
        // Validate coordinate format
        for (const coord of coordinates) {
          if (!Array.isArray(coord) || coord.length !== 2) {
            setValidationError('Each polygon coordinate must be [longitude, latitude]');
            return false;
          }
          if (coord[0] < -180 || coord[0] > 180) {
            setValidationError('Longitude must be between -180 and 180');
            return false;
          }
          if (coord[1] < -90 || coord[1] > 90) {
            setValidationError('Latitude must be between -90 and 90');
            return false;
          }
        }
      }

      if (fillColor && !isValidHexColor(fillColor)) {
        setValidationError('Fill color must be a valid hex color');
        return false;
      }

      if (strokeColor && !isValidHexColor(strokeColor)) {
        setValidationError('Stroke color must be a valid hex color');
        return false;
      }

      if (fillOpacity !== undefined && (fillOpacity < 0 || fillOpacity > 1)) {
        setValidationError('Fill opacity must be between 0 and 1');
        return false;
      }

      if (strokeOpacity !== undefined && (strokeOpacity < 0 || strokeOpacity > 1)) {
        setValidationError('Stroke opacity must be between 0 and 1');
        return false;
      }

      if (strokeWidth !== undefined && strokeWidth < 0) {
        setValidationError('Stroke width must be non-negative');
        return false;
      }
    }

    // ========== COLOR SCHEME VALIDATIONS (usando layerUtils) ==========
    if (formState.colorScheme) {
      const schemeError = validateColorScheme(formState.colorScheme);
      if (schemeError) {
        setValidationError(schemeError);
        return false;
      }

      // Additional hex color validation for colors in scheme
      const { type } = formState.colorScheme;

      if (type === 'solid') {
        const scheme = formState.colorScheme as any;
        if (!isValidHexColor(scheme.color)) {
          setValidationError('Solid color must be a valid hex color');
          return false;
        }
      }

      if (type === 'gradient') {
        const scheme = formState.colorScheme as any;
        if (!isValidHexColor(scheme.low) || !isValidHexColor(scheme.high)) {
          setValidationError('Gradient colors must be valid hex colors');
          return false;
        }
      }

      if (type === 'heatmap') {
        const scheme = formState.colorScheme as any;
        for (const color of scheme.colors) {
          if (!isValidHexColor(color)) {
            setValidationError('All heatmap colors must be valid hex colors');
            return false;
          }
        }
      }

      if (type === 'categorical') {
        const scheme = formState.colorScheme as any;
        for (const color of scheme.colors) {
          if (!isValidHexColor(color)) {
            setValidationError('All categorical colors must be valid hex colors');
            return false;
          }
        }
      }

      if (type === 'threshold') {
        const scheme = formState.colorScheme as any;
        for (const range of scheme.thresholdRanges) {
          if (!isValidHexColor(range.color)) {
            setValidationError('All threshold colors must be valid hex colors');
            return false;
          }
        }
      }
    }

    // ========== DYNAMIC RULES VALIDATIONS ==========
    if (formState.colorRules && formState.colorRules.length > 0) {
      for (let i = 0; i < formState.colorRules.length; i++) {
        const rule = formState.colorRules[i];
        if (!rule.condition || !rule.condition.trim()) {
          setValidationError(`Color rule ${i + 1}: condition cannot be empty`);
          return false;
        }
        if (!rule.colorScheme) {
          setValidationError(`Color rule ${i + 1}: must have a color scheme`);
          return false;
        }
        // Validate the color scheme within the rule
        const ruleSchemeError = validateColorScheme(rule.colorScheme);
        if (ruleSchemeError) {
          setValidationError(`Color rule ${i + 1}: ${ruleSchemeError}`);
          return false;
        }
      }
    }

    if (formState.scaleRules && formState.scaleRules.length > 0) {
      for (let i = 0; i < formState.scaleRules.length; i++) {
        const rule = formState.scaleRules[i];
        if (!rule.condition || !rule.condition.trim()) {
          setValidationError(`Scale rule ${i + 1}: condition cannot be empty`);
          return false;
        }
        if (rule.scale <= 0) {
          setValidationError(`Scale rule ${i + 1}: scale value must be positive`);
          return false;
        }
        if (rule.scale > 10) {
          setValidationError(`Scale rule ${i + 1}: scale value cannot exceed 10`);
          return false;
        }
      }
    }

    if (formState.visibilityRules && formState.visibilityRules.length > 0) {
      for (let i = 0; i < formState.visibilityRules.length; i++) {
        const rule = formState.visibilityRules[i];
        if (!rule.condition || !rule.condition.trim()) {
          setValidationError(`Visibility rule ${i + 1}: condition cannot be empty`);
          return false;
        }
      }
    }

    // ========== TRAIL VALIDATIONS ==========
    if (formState.showTrail) {
      // Check if asset type supports trails
      if (!supportsTrail(formState.assetType)) {
        setValidationError(`Trails are only available for ${formState.assetType} assets`);
        return false;
      }

      // Validate trail color scheme if present
      if (formState.trailColorScheme) {
        const trailSchemeError = validateTrailColorScheme(formState.trailColorScheme);
        if (trailSchemeError) {
          setValidationError(trailSchemeError);
          return false;
        }
      }

      // Trail color mode specific validations
      if (formState.trailColorMode === 'static' && formState.trailColorScheme) {
        const scheme = formState.trailColorScheme as any;
        if (scheme.type === 'static' && !isValidHexColor(scheme.staticColor)) {
          setValidationError('Static trail color must be a valid hex color');
          return false;
        }
      }

      if (formState.trailColorMode === 'gradient' && formState.trailColorScheme) {
        const scheme = formState.trailColorScheme as any;
        if (scheme.type === 'gradient') {
          if (!scheme.gradient || !scheme.gradient.stops || scheme.gradient.stops.length < 2) {
            setValidationError('Gradient trail requires at least 2 color stops');
            return false;
          }
          for (const stop of scheme.gradient.stops) {
            if (!isValidHexColor(stop.color)) {
              setValidationError('All gradient stop colors must be valid hex colors');
              return false;
            }
          }
        }
      }

      if (formState.trailColorMode === 'rules') {
        if (!formState.trailColorRules || formState.trailColorRules.length === 0) {
          setValidationError('Rules-based trail color mode requires at least one rule');
          return false;
        }
      }

      if (formState.trailColorRules && formState.trailColorRules.length > 0) {
        for (let i = 0; i < formState.trailColorRules.length; i++) {
          const rule = formState.trailColorRules[i];
          if (!rule.name || !rule.name.trim()) {
            setValidationError(`Trail color rule ${i + 1}: name cannot be empty`);
            return false;
          }
          if (!rule.condition || !rule.condition.trim()) {
            setValidationError(`Trail color rule ${i + 1}: condition cannot be empty`);
            return false;
          }
          if (!rule.color || !isValidHexColor(rule.color)) {
            setValidationError(`Trail color rule ${i + 1}: must have a valid hex color`);
            return false;
          }
          if (rule.priority !== undefined && rule.priority < 0) {
            setValidationError(`Trail color rule ${i + 1}: priority must be non-negative`);
            return false;
          }
        }
      }

      // Trail gradient config validations
      if (formState.trailGradientConfig?.enabled) {
        const { fadeStartAge, fadeEndAge, minOpacity } = formState.trailGradientConfig;
        
        if (fadeStartAge !== undefined && fadeStartAge < 0) {
          setValidationError('Trail fade start age must be non-negative');
          return false;
        }
        
        if (fadeEndAge !== undefined && fadeEndAge < 0) {
          setValidationError('Trail fade end age must be non-negative');
          return false;
        }
        
        if (fadeStartAge !== undefined && fadeEndAge !== undefined && fadeStartAge >= fadeEndAge) {
          setValidationError('Trail fade start age must be less than end age');
          return false;
        }
        
        if (minOpacity !== undefined && (minOpacity < 0 || minOpacity > 1)) {
          setValidationError('Trail min opacity must be between 0 and 1');
          return false;
        }
      }

      // Trail validation config
      if (formState.trailValidationConfig?.enableValidation) {
        const { minDistanceThreshold, maxTimeBetweenPoints } = formState.trailValidationConfig;
        
        if (minDistanceThreshold !== undefined && minDistanceThreshold < 0) {
          setValidationError('Trail min distance threshold must be non-negative');
          return false;
        }
        
        if (maxTimeBetweenPoints !== undefined && maxTimeBetweenPoints <= 0) {
          setValidationError('Trail max time between points must be positive');
          return false;
        }
      }

      // Trail points config
      if (formState.trailPointsConfig?.showHistoricalPoints) {
        const { pointInterval, pointSize, pointOpacity } = formState.trailPointsConfig;
        
        if (pointInterval !== undefined && pointInterval <= 0) {
          setValidationError('Trail point interval must be positive');
          return false;
        }
        
        if (pointSize !== undefined && (pointSize <= 0 || pointSize > 20)) {
          setValidationError('Trail point size must be between 0 and 20');
          return false;
        }
        
        if (pointOpacity !== undefined && (pointOpacity < 0 || pointOpacity > 1)) {
          setValidationError('Trail point opacity must be between 0 and 1');
          return false;
        }
      }
    }

    // ========== BORDER & SHADOW VALIDATIONS ==========
    if (formState.showBorder && formState.borderConfig) {
      if (formState.borderConfig.width <= 0) {
        setValidationError('Border width must be positive');
        return false;
      }
      
      if (formState.borderConfig.width > 20) {
        setValidationError('Border width cannot exceed 20');
        return false;
      }
      
      if (!isValidHexColor(formState.borderConfig.color)) {
        setValidationError('Border color must be a valid hex color');
        return false;
      }
      
      if (formState.borderConfig.opacity !== undefined && 
          (formState.borderConfig.opacity < 0 || formState.borderConfig.opacity > 1)) {
        setValidationError('Border opacity must be between 0 and 1');
        return false;
      }
    }

    if (formState.showShadow && formState.shadowConfig) {
      if (!formState.shadowConfig.enabled) {
        setValidationError('Shadow must be enabled when showShadow is true');
        return false;
      }
      
      if (formState.shadowConfig.blur < 0) {
        setValidationError('Shadow blur must be non-negative');
        return false;
      }
      
      if (formState.shadowConfig.blur > 100) {
        setValidationError('Shadow blur cannot exceed 100');
        return false;
      }
      
      if (!isValidHexColor(formState.shadowConfig.color)) {
        setValidationError('Shadow color must be a valid hex color');
        return false;
      }
    }

    // ========== FILTER QUERY VALIDATION ==========
    if (formState.filterQuery && formState.filterQuery.trim()) {
      // Basic SQL-like syntax check
      const validOperators = ['=', '!=', '>', '<', '>=', '<=', 'AND', 'OR', 'LIKE', 'IN'];
      const hasValidOperator = validOperators.some(op => 
        formState.filterQuery!.toUpperCase().includes(op)
      );
      
      if (!hasValidOperator) {
        setValidationError('Filter query must contain valid operators (=, !=, >, <, >=, <=, AND, OR, LIKE, IN)');
        return false;
      }
    }

    return true;
  }, []);

  const clearValidationError = useCallback(() => {
    setValidationError(null);
  }, []);

  return { validationError, validateForm, clearValidationError };
};