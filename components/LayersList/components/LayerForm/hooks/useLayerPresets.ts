import { useCallback } from 'react';
import { ASSET_PRESETS } from '@/hooks/useVisualizationLayers';
import type { LayerFormHandlers } from '../types/layerForm';

export const useLayerPresets = (handlers: LayerFormHandlers) => {
  const applyPreset = useCallback((presetName: keyof typeof ASSET_PRESETS) => {
    const preset = ASSET_PRESETS[presetName];
    
    // ========== ASSET CONFIGURATION ==========
    handlers.setAssetType(preset.assetType);
    handlers.setRenderType(preset.renderType);
    
    // ========== MARKER/ICON CONFIG ==========
    if (preset.markerConfig) {
      handlers.setMarkerConfig(preset.markerConfig);
    }
    
    // ========== IMAGE URL ==========
    if (preset.imageUrl) {
      handlers.setImageUrl(preset.imageUrl);
    } else {
      handlers.setImageUrl('');
    }
    
    // ========== MODEL URL & 3D CONFIG ==========
    if (preset.modelUrl) {
      handlers.setModelUrl(preset.modelUrl);
    } else {
      handlers.setModelUrl('');
    }
    
    if (preset.model3dConfig) {
      handlers.setModel3dConfig(preset.model3dConfig);
    }
    
    // ========== SHAPE CONFIG ==========
    if (preset.shapeConfig) {
      handlers.setShapeConfig(preset.shapeConfig);
    }
    
    // ========== TRAIL CONFIGURATION ==========
    handlers.setShowTrail(preset.showTrail);
    handlers.setTrailLength(preset.trailLength);
    handlers.setTrailWidth(preset.trailWidth * 10); // Convert to slider value (0-100)
    handlers.setTrailOpacity(preset.trailOpacity * 100); // Convert to percentage (0-100)
    handlers.setTrailColorMode(preset.trailColorMode);
    
    // ========== TRAIL COLOR SCHEME ==========
    if (preset.trailColorScheme) {
      handlers.setTrailColorScheme(preset.trailColorScheme);
    } else {
      // Default static color scheme
      handlers.setTrailColorScheme({
        type: 'static',
        staticColor: '#3b82f6'
      });
    }
    
    // ========== TRAIL COLOR RULES ==========
    if (preset.trailColorRules) {
      handlers.setTrailColorRules(preset.trailColorRules);
    } else {
      handlers.setTrailColorRules([]);
    }
    
    // ========== TRAIL GRADIENT CONFIG ==========
    if (preset.trailGradientConfig) {
      handlers.setTrailGradientConfig(preset.trailGradientConfig);
    } else {
      handlers.setTrailGradientConfig({
        enabled: false,
        fadeOldSegments: true,
        fadeStartAge: 30,
        fadeEndAge: 100,
        minOpacity: 0.2
      });
    }
    
    // ========== TRAIL VALIDATION CONFIG ==========
    if (preset.trailValidationConfig) {
      handlers.setTrailValidationConfig(preset.trailValidationConfig);
    } else {
      handlers.setTrailValidationConfig({
        enableValidation: false,
        minDistanceThreshold: 5,
        maxTimeBetweenPoints: 60000
      });
    }
    
    // ========== TRAIL POINTS CONFIG ==========
    if (preset.trailPointsConfig) {
      handlers.setTrailPointsConfig(preset.trailPointsConfig);
    } else {
      handlers.setTrailPointsConfig({
        showHistoricalPoints: false,
        pointInterval: 10,
        pointSize: 3,
        pointOpacity: 0.8,
        fadeWithAge: true
      });
    }
  }, [handlers]);

  /**
   * Apply a quick style preset independent of asset type
   */
  const applyStylePreset = useCallback((styleName: 'minimal' | 'vibrant' | 'professional') => {
    switch (styleName) {
      case 'minimal':
        handlers.setPointSize(8);
        handlers.setOpacity(80);
        handlers.setShowBorder(false);
        handlers.setShowShadow(false);
        break;
      
      case 'vibrant':
        handlers.setPointSize(12);
        handlers.setOpacity(100);
        handlers.setShowBorder(true);
        handlers.setBorderConfig({
          width: 2,
          color: '#ffffff',
          style: 'solid',
          opacity: 0.8
        });
        handlers.setShowShadow(true);
        handlers.setShadowConfig({
          enabled: true,
          color: '#000000',
          blur: 8,
          offsetX: 2,
          offsetY: 2
        });
        break;
      
      case 'professional':
        handlers.setPointSize(10);
        handlers.setOpacity(90);
        handlers.setShowBorder(true);
        handlers.setBorderConfig({
          width: 1,
          color: '#1e293b',
          style: 'solid',
          opacity: 0.6
        });
        handlers.setShowShadow(false);
        break;
    }
  }, [handlers]);

  /**
   * Apply trail-specific presets
   */
  const applyTrailPreset = useCallback((trailType: 'basic' | 'advanced' | 'performance') => {
    switch (trailType) {
      case 'basic':
        handlers.setShowTrail(true);
        handlers.setTrailLength(50);
        handlers.setTrailWidth(20);
        handlers.setTrailOpacity(60);
        handlers.setTrailColorMode('static');
        handlers.setTrailColorScheme({
          type: 'static',
          staticColor: '#3b82f6'
        });
        handlers.setTrailGradientConfig({
          enabled: false,
          fadeOldSegments: false,
          fadeStartAge: 30,
          fadeEndAge: 100,
          minOpacity: 0.2
        });
        handlers.setTrailValidationConfig({
          enableValidation: false,
          minDistanceThreshold: 5,
          maxTimeBetweenPoints: 60000
        });
        handlers.setTrailPointsConfig({
          showHistoricalPoints: false,
          pointInterval: 10,
          pointSize: 3,
          pointOpacity: 0.8,
          fadeWithAge: false
        });
        break;
      
      case 'advanced':
        handlers.setShowTrail(true);
        handlers.setTrailLength(100);
        handlers.setTrailWidth(25);
        handlers.setTrailOpacity(70);
        handlers.setTrailColorMode('gradient');
        handlers.setTrailColorScheme({
          type: 'gradient',
          gradient: {
            stops: [
              { value: 0, color: '#10b981' },
              { value: 50, color: '#f59e0b' },
              { value: 100, color: '#ef4444' }
            ]
          },
          valueKey: 'value'
        });
        handlers.setTrailGradientConfig({
          enabled: true,
          fadeOldSegments: true,
          fadeStartAge: 30,
          fadeEndAge: 100,
          minOpacity: 0.2
        });
        handlers.setTrailValidationConfig({
          enableValidation: true,
          minDistanceThreshold: 5,
          maxTimeBetweenPoints: 60000
        });
        handlers.setTrailPointsConfig({
          showHistoricalPoints: true,
          pointInterval: 10,
          pointSize: 3,
          pointOpacity: 0.8,
          fadeWithAge: true
        });
        break;
      
      case 'performance':
        handlers.setShowTrail(true);
        handlers.setTrailLength(30);
        handlers.setTrailWidth(15);
        handlers.setTrailOpacity(50);
        handlers.setTrailColorMode('static');
        handlers.setTrailColorScheme({
          type: 'static',
          staticColor: '#6366f1'
        });
        handlers.setTrailGradientConfig({
          enabled: false,
          fadeOldSegments: false,
          fadeStartAge: 30,
          fadeEndAge: 100,
          minOpacity: 0.2
        });
        handlers.setTrailValidationConfig({
          enableValidation: false,
          minDistanceThreshold: 10,
          maxTimeBetweenPoints: 30000
        });
        handlers.setTrailPointsConfig({
          showHistoricalPoints: false,
          pointInterval: 15,
          pointSize: 2,
          pointOpacity: 0.6,
          fadeWithAge: false
        });
        break;
    }
  }, [handlers]);

  /**
   * Reset form to default values
   */
  const resetToDefaults = useCallback(() => {
    handlers.setAssetType('point');
    handlers.setRenderType('marker');
    handlers.setMarkerConfig({
      iconName: 'CircleDot',
      iconLibrary: 'lucide'
    });
    handlers.setImageUrl('');
    handlers.setModelUrl('');
    handlers.setModel3dConfig({
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
    handlers.setShapeConfig({
      type: 'circle',
      radius: 50,
      fillColor: '#3b82f6',
      fillOpacity: 0.5,
      strokeColor: '#1e40af',
      strokeWidth: 2,
      strokeOpacity: 1.0
    });
    handlers.setOpacity(100);
    handlers.setPointSize(10);
    handlers.setShowBorder(false);
    handlers.setShowShadow(false);
    handlers.setColorRules([]);
    handlers.setScaleRules([]);
    handlers.setVisibilityRules([]);
    handlers.setShowTrail(false);
    handlers.setTrailLength(50);
    handlers.setTrailWidth(20);
    handlers.setTrailOpacity(60);
    handlers.setTrailColorMode('static');
    handlers.setTrailColorScheme({
      type: 'static',
      staticColor: '#3b82f6'
    });
    handlers.setTrailColorRules([]);
    handlers.setTrailGradientConfig({
      enabled: false,
      fadeOldSegments: true,
      fadeStartAge: 30,
      fadeEndAge: 100,
      minOpacity: 0.2
    });
    handlers.setTrailValidationConfig({
      enableValidation: false,
      minDistanceThreshold: 5,
      maxTimeBetweenPoints: 60000
    });
    handlers.setTrailPointsConfig({
      showHistoricalPoints: false,
      pointInterval: 10,
      pointSize: 3,
      pointOpacity: 0.8,
      fadeWithAge: true
    });
    handlers.setFilterQuery('');
  }, [handlers]);

  return {
    applyPreset,
    applyStylePreset,
    applyTrailPreset,
    resetToDefaults
  };
};