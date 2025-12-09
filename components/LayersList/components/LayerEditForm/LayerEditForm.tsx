'use client';

import React from 'react';
import { LayerEditFormProps } from '../../types';
import { useVisualizationLayers } from '@/hooks/useVisualizationLayers';
import { useLayerEditState } from './hooks/useLayerEditState';
import { useLayerFormValidation } from './hooks/useLayerFormValidation';

// Import sub-components (reutilizados del CreateForm)
import { ValidationError } from '../LayerForm/components/ValidationError';
import { BasicInfoSection } from '../LayerForm/components/BasicInfoSection';
import { AssetConfigSection } from '../LayerForm/components/AssetConfigSection';
import { StyleConfigSection } from '../LayerForm/components/StyleConfigSection';
import { TrailConfigSection } from '../LayerForm/components/TrailConfigSection';
import { AdvancedOptionsSection } from '../LayerForm/components/AdvancedOptionsSection';

// Import edit-specific components
import { EditFormHeader } from './components/EditFormHeader';
import { EditFormActions } from './components/EditFormActions';
import { ChangesSummary } from './components/ChangesSummary';

export const LayerEditForm: React.FC<LayerEditFormProps> = ({
  layer,
  maxOrder = 100,
  onSuccess,
  onCancel
}) => {
  const { updateLayer, isLoading } = useVisualizationLayers(layer.datasetId, {
    autoFetch: false
  });

  const { formState, handlers, hasChanges, resetForm } = useLayerEditState(layer);
  const { validationError, validateForm, clearValidationError } = useLayerFormValidation();

  // ============================================================================
  // FORM SUBMISSION
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm(formState)) {
      return;
    }

    try {
      const result = await updateLayer(layer.id, {
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
        model3dConfig: formState.renderType === 'model3d' 
          ? (formState.model3dConfig ?? undefined) 
          : undefined,
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
        trailGradientConfig: formState.showTrail 
          ? (formState.trailGradientConfig ?? undefined) 
          : undefined,
        trailValidationConfig: formState.showTrail 
          ? (formState.trailValidationConfig ?? undefined) 
          : undefined,
        trailPointsConfig: formState.showTrail 
          ? (formState.trailPointsConfig ?? undefined) 
          : undefined,
        
        // Filter
        filterQuery: formState.filterQuery.trim() || null
      });

      if (onSuccess && result) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Error updating layer:', err);
    }
  };

  // ============================================================================
  // RESET HANDLER
  // ============================================================================
  const handleReset = () => {
    resetForm();
    clearValidationError();
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#18181b] border border-[#27272a] rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        <EditFormHeader
          hasChanges={hasChanges}
          isLoading={isLoading}
          onReset={handleReset}
          onCancel={onCancel || (() => {})}
        />

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <ValidationError error={validationError} />

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
            model3dConfig={formState.model3dConfig ?? {}}
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
              trailGradientConfig={formState.trailGradientConfig ?? { enabled: false }}
              trailValidationConfig={formState.trailValidationConfig ?? {}}
              trailPointsConfig={formState.trailPointsConfig ?? {}}
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
            maxOrder={maxOrder}
            onOrderChange={handlers.setOrder}
            onFilterQueryChange={handlers.setFilterQuery}
            onColorRulesChange={handlers.setColorRules}
            onScaleRulesChange={handlers.setScaleRules}
            onVisibilityRulesChange={handlers.setVisibilityRules}
            isLoading={isLoading}
          />

          <EditFormActions
            hasChanges={hasChanges}
            isLoading={isLoading}
            isValid={!!formState.name.trim()}
            onReset={handleReset}
            onCancel={onCancel || (() => {})}
          />

          <ChangesSummary hasChanges={hasChanges} />
        </form>
      </div>
    </div>
  );
};