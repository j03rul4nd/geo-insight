'use client';

import React from 'react';
import { LayerCreateFormProps } from '../../types';
import { useVisualizationLayers } from '@/hooks/useVisualizationLayers';
import { useLayerFormState } from './hooks/useLayerFormState';
import { useLayerPresets } from './hooks/useLayerPresets';
import { useLayerFormValidation } from './hooks/useLayerFormValidation';

// Import sub-components
import { FormHeader } from './components/FormHeader';
import { ValidationError } from './components/ValidationError';
import { QuickPresets } from './components/QuickPresets';
import { BasicInfoSection } from './components/BasicInfoSection';
import { AssetConfigSection } from './components/AssetConfigSection';
import { StyleConfigSection } from './components/StyleConfigSection';
import { TrailConfigSection } from './components/TrailConfigSection';
import { AdvancedOptionsSection } from './components/AdvancedOptionsSection';
import { FormActions } from './components/FormActions';

export const LayerCreateForm: React.FC<LayerCreateFormProps> = ({
  datasetId,
  onSuccess,
  onCancel
}) => {
  
  const { createLayer, isLoading, layers } = useVisualizationLayers(datasetId, {
    autoFetch: true
  });

  const { formState, handlers, defaultOrder } = useLayerFormState({ 
    existingLayers: layers 
  });
  
  const { applyPreset } = useLayerPresets(handlers);
  
  const { validationError, validateForm } = useLayerFormValidation();

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!validateForm(formState)) {
      return;
    }

    try {
      const result = await createLayer({
        name: formState.name.trim(),
        description: formState.description.trim() || null,
        enabled: formState.enabled,
        
        // Asset config
        assetType: formState.assetType,
        renderType: formState.renderType,
        markerConfig: formState.renderType === 'marker' || formState.renderType === 'icon' 
          ? formState.markerConfig 
          : undefined,
        imageUrl: formState.renderType === 'image' ? formState.imageUrl.trim() : null,
        modelUrl: formState.renderType === 'model3d' ? formState.modelUrl.trim() : null,
        model3dConfig: formState.renderType === 'model3d' ? formState.model3dConfig : undefined,
        shapeConfig: formState.renderType === 'shape' ? formState.shapeConfig : undefined,
        
        // Style
        colorScheme: formState.colorScheme,
        opacity: formState.opacity / 100,
        pointSize: formState.pointSize / 10,
        borderConfig: formState.showBorder ? formState.borderConfig : undefined,
        shadowConfig: formState.showShadow ? { ...formState.shadowConfig, enabled: true } : undefined,
        
        // Dynamic rules
        colorRules: formState.colorRules && formState.colorRules.length > 0 ? formState.colorRules : null,
        scaleRules: formState.scaleRules && formState.scaleRules.length > 0 ? formState.scaleRules : null,
        visibilityRules: formState.visibilityRules && formState.visibilityRules.length > 0 ? formState.visibilityRules : null,
        
        // Trail configuration (solo para moving assets)
        showTrail: formState.assetType === 'moving' ? formState.showTrail : false,
        trailLength: formState.showTrail ? formState.trailLength : 50,
        trailWidth: formState.showTrail ? formState.trailWidth / 10 : 2.0,
        trailOpacity: formState.showTrail ? formState.trailOpacity / 100 : 0.6,
        trailColorMode: formState.showTrail ? formState.trailColorMode : 'static',
        trailColorScheme: formState.showTrail ? formState.trailColorScheme : undefined,
        trailColorRules: formState.showTrail && formState.trailColorRules && formState.trailColorRules.length > 0 
          ? formState.trailColorRules 
          : null,
        trailGradientConfig: formState.showTrail ? formState.trailGradientConfig : undefined,
        trailValidationConfig: formState.showTrail ? formState.trailValidationConfig : undefined,
        trailPointsConfig: formState.showTrail ? formState.trailPointsConfig : undefined,
        
        // Filter
        filterQuery: formState.filterQuery.trim() || null
      });

      if (onSuccess && result) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Error creating layer:', err);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#18181b] border border-[#27272a] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        <FormHeader 
          onCancel={onCancel || (() => {})}
          isLoading={isLoading} 
        />

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <ValidationError error={validationError} />

          <QuickPresets 
            onApplyPreset={applyPreset}
            isLoading={isLoading}
          />

          <BasicInfoSection
            name={formState.name}
            description={formState.description}
            enabled={formState.enabled}
            onNameChange={handlers.setName}
            onDescriptionChange={handlers.setDescription}
            onEnabledChange={handlers.setEnabled}
            isLoading={isLoading}
          />

          <AssetConfigSection
            assetType={formState.assetType}
            renderType={formState.renderType}
            markerConfig={formState.markerConfig}
            imageUrl={formState.imageUrl}
            modelUrl={formState.modelUrl}
            model3dConfig={formState.model3dConfig}
            shapeConfig={formState.shapeConfig}
            onAssetTypeChange={handlers.setAssetType}
            onRenderTypeChange={handlers.setRenderType}
            onMarkerConfigChange={handlers.setMarkerConfig}
            onImageUrlChange={handlers.setImageUrl}
            onModelUrlChange={handlers.setModelUrl}
            onModel3dConfigChange={handlers.setModel3dConfig}
            onShapeConfigChange={handlers.setShapeConfig}
            isLoading={isLoading}
          />

          <StyleConfigSection
            colorScheme={formState.colorScheme}
            opacity={formState.opacity}
            pointSize={formState.pointSize}
            showBorder={formState.showBorder}
            borderConfig={formState.borderConfig}
            showShadow={formState.showShadow}
            shadowConfig={formState.shadowConfig}
            onColorSchemeChange={handlers.setColorScheme}
            onOpacityChange={handlers.setOpacity}
            onPointSizeChange={handlers.setPointSize}
            onShowBorderChange={handlers.setShowBorder}
            onBorderConfigChange={handlers.setBorderConfig}
            onShowShadowChange={handlers.setShowShadow}
            onShadowConfigChange={handlers.setShadowConfig}
            isLoading={isLoading}
          />

          {formState.assetType === 'moving' && (
            <TrailConfigSection
              showTrail={formState.showTrail}
              trailLength={formState.trailLength}
              trailWidth={formState.trailWidth}
              trailOpacity={formState.trailOpacity}
              trailColorMode={formState.trailColorMode}
              trailColorScheme={formState.trailColorScheme}
              trailColorRules={formState.trailColorRules}
              trailGradientConfig={formState.trailGradientConfig}
              trailValidationConfig={formState.trailValidationConfig}
              trailPointsConfig={formState.trailPointsConfig}
              onShowTrailChange={handlers.setShowTrail}
              onTrailLengthChange={handlers.setTrailLength}
              onTrailWidthChange={handlers.setTrailWidth}
              onTrailOpacityChange={handlers.setTrailOpacity}
              onTrailColorModeChange={handlers.setTrailColorMode}
              onTrailColorSchemeChange={handlers.setTrailColorScheme}
              onTrailColorRulesChange={handlers.setTrailColorRules}
              onTrailGradientConfigChange={handlers.setTrailGradientConfig}
              onTrailValidationConfigChange={handlers.setTrailValidationConfig}
              onTrailPointsConfigChange={handlers.setTrailPointsConfig}
              isLoading={isLoading}
            />
          )}

          <AdvancedOptionsSection
            order={formState.order}
            filterQuery={formState.filterQuery}
            colorRules={formState.colorRules}
            scaleRules={formState.scaleRules}
            visibilityRules={formState.visibilityRules}
            maxOrder={defaultOrder}
            onOrderChange={handlers.setOrder}
            onFilterQueryChange={handlers.setFilterQuery}
            onColorRulesChange={handlers.setColorRules}
            onScaleRulesChange={handlers.setScaleRules}
            onVisibilityRulesChange={handlers.setVisibilityRules}
            isLoading={isLoading}
          />

          <FormActions
            onCancel={onCancel || (() => {})}
            isLoading={isLoading}
            isValid={!!formState.name.trim()}
          />
        </form>
      </div>
    </div>
  );
};