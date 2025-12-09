
import React from 'react';
import type { 
  AssetType, 
  RenderType, 
  MarkerConfig, 
  ShapeConfig ,
  Model3DConfig
} from '@/hooks/useVisualizationLayers';
import { PolygonPreview } from './PolygonPreview';
import { Model3DConfigManager } from './Model3DConfigManager';


interface AssetConfigSectionProps {
  assetType: AssetType;
  renderType: RenderType;
  markerConfig: MarkerConfig;
  imageUrl: string;
  modelUrl: string;
  model3dConfig: Model3DConfig;
  shapeConfig: ShapeConfig;
  onAssetTypeChange: (value: AssetType) => void;
  onRenderTypeChange: (value: RenderType) => void;
  onMarkerConfigChange: (value: MarkerConfig) => void;
  onImageUrlChange: (value: string) => void;
  onModelUrlChange: (value: string) => void;
  onModel3dConfigChange: (value: Model3DConfig) => void;
  onShapeConfigChange: (value: ShapeConfig) => void;
  isLoading: boolean;
}


export const AssetConfigSection: React.FC<AssetConfigSectionProps> = ({
  assetType,
  renderType,
  markerConfig,
  imageUrl,
  modelUrl,
  model3dConfig,
  shapeConfig,
  onAssetTypeChange,
  onRenderTypeChange,
  onMarkerConfigChange,
  onImageUrlChange,
  onModelUrlChange,
  onModel3dConfigChange,
  onShapeConfigChange,
  isLoading
}) => {
  return (
    <div className="space-y-4 p-4 bg-[#27272a]/50 rounded-lg">
      <h3 className="text-sm font-bold text-gray-300">Asset Configuration</h3>
      
      {/* Asset Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Asset Type</label>
        <div className="grid grid-cols-3 gap-2">
          {(['point', 'moving', 'area'] as AssetType[]).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => onAssetTypeChange(type)}
              disabled={isLoading}
              className={`px-3 py-2 rounded text-sm transition-all ${
                assetType === type
                  ? 'bg-[#3b82f6] text-white'
                  : 'bg-[#18181b] hover:bg-[#3f3f46] text-gray-400'
              } disabled:opacity-50`}
            >
              {type === 'point' && '📍 Point'}
              {type === 'moving' && '🚀 Moving'}
              {type === 'area' && '🗺️ Area'}
            </button>
          ))}
        </div>
      </div>

      {/* Render Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Render Type</label>
        <select
          value={renderType}
          onChange={(e) => onRenderTypeChange(e.target.value as RenderType)}
          disabled={isLoading}
          className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                     focus:border-[#3b82f6] focus:outline-none
                     disabled:opacity-50"
        >
          <option value="marker">Marker Pin</option>
          <option value="icon">Custom Icon</option>
          <option value="image">Image Overlay</option>
          <option value="model3d">3D Model</option>
          <option value="shape">Geometric Shape</option>
        </select>
      </div>

      {/* Render Type Specific Fields */}
      {(renderType === 'marker' || renderType === 'icon') && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Icon Name</label>
          <input
            type="text"
            value={markerConfig.iconName || ''}
            onChange={(e) => onMarkerConfigChange({ 
              ...markerConfig, 
              iconName: e.target.value 
            })}
            placeholder="e.g., CircleDot, Train, AlertCircle"
            disabled={isLoading}
            className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                       focus:border-[#3b82f6] focus:outline-none"
          />
          <div className="text-xs text-gray-500">
            From Lucide icons library
          </div>
        </div>
      )}

      {renderType === 'image' && (
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-1">
            Image URL
            <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => onImageUrlChange(e.target.value)}
            placeholder="https://example.com/image.png"
            disabled={isLoading}
            className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                       focus:border-[#3b82f6] focus:outline-none"
          />
        </div>
      )}

      {renderType === 'model3d' && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    Model URL (.glb / .gltf)
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={modelUrl}
                    onChange={(e) => onModelUrlChange(e.target.value)}
                    placeholder="https://example.com/model.glb"
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                               focus:border-[#3b82f6] focus:outline-none"
                  />
                  <div className="text-xs text-gray-500">
                    Supported formats: GLB, GLTF
                  </div>
                </div>
      
                {/* Model 3D Configuration Manager */}
                {modelUrl && (
                  <Model3DConfigManager
                    modelUrl={modelUrl}
                    config={model3dConfig}
                    onChange={onModel3dConfigChange}
                    isLoading={isLoading}
                  />
                )}
              </div>
      )}

      
      
      {renderType === 'shape' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">Shape Type</label>
            <select
              value={shapeConfig.type}
              onChange={(e) => onShapeConfigChange({ 
                ...shapeConfig, 
                type: e.target.value as ShapeConfig['type'] 
              })}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                         focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="circle">Circle</option>
              <option value="polygon">Polygon</option>
              <option value="rectangle">Rectangle</option>
            </select>
          </div>

          {/* Geometry Configuration */}
          <div className="space-y-3 p-3 bg-[#18181b]/50 rounded border border-[#3f3f46]">
            <h4 className="text-xs font-semibold text-gray-400 uppercase">Geometry</h4>
            
            {shapeConfig.type === 'circle' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Radius (meters)</label>
                <input
                  type="number"
                  value={shapeConfig.radius || 100}
                  onChange={(e) => onShapeConfigChange({ 
                    ...shapeConfig, 
                    radius: parseFloat(e.target.value) || 100
                  })}
                  min="1"
                  step="10"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                             focus:border-[#3b82f6] focus:outline-none"
                />
              </div>
            )}

            {shapeConfig.type === 'rectangle' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Width (meters)</label>
                  <input
                    type="number"
                    value={shapeConfig.width || 100}
                    onChange={(e) => onShapeConfigChange({ 
                      ...shapeConfig, 
                      width: parseFloat(e.target.value) || 100
                    })}
                    min="1"
                    step="10"
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                               focus:border-[#3b82f6] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Height (meters)</label>
                  <input
                    type="number"
                    value={shapeConfig.height || 100}
                    onChange={(e) => onShapeConfigChange({ 
                      ...shapeConfig, 
                      height: parseFloat(e.target.value) || 100
                    })}
                    min="1"
                    step="10"
                    disabled={isLoading}
                    className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                               focus:border-[#3b82f6] focus:outline-none"
                  />
                </div>
              </div>
            )}

            {shapeConfig.type === 'polygon' && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Coordinates (GeoJSON format)</label>
                <textarea
                  value={JSON.stringify(shapeConfig.coordinates || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      onShapeConfigChange({ 
                        ...shapeConfig, 
                        coordinates: parsed
                      });
                    } catch {
                      // Invalid JSON, ignore
                    }
                  }}
                  placeholder='[[lon1, lat1], [lon2, lat2], ...]'
                  rows={4}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                             focus:border-[#3b82f6] focus:outline-none font-mono text-xs"
                />
                <div className="text-xs text-gray-500">
                  Array of [longitude, latitude] pairs
                </div>
                
                {/* Preview Map */}
                {shapeConfig.coordinates && shapeConfig.coordinates.length > 0 && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-gray-400 uppercase">Preview</label>
                      <button
                        type="button"
                        onClick={() => {
                          const mapElement = document.getElementById('polygon-preview-map');
                          if (mapElement) {
                            mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        📍 Center map
                      </button>
                    </div>
                    <div 
                      id="polygon-preview-map"
                      className="w-full h-64 bg-[#09090b] rounded border border-[#3f3f46] overflow-hidden relative"
                    >
                      <PolygonPreview 
                        coordinates={shapeConfig.coordinates}
                        fillColor={shapeConfig.fillColor || '#3b82f6'}
                        fillOpacity={shapeConfig.fillOpacity || 0.5}
                        strokeColor={shapeConfig.strokeColor || '#1e40af'}
                        strokeWidth={shapeConfig.strokeWidth || 2}
                      />
                    </div>
                    <div className="text-xs text-gray-500 flex items-center justify-between">
                      <span>{shapeConfig.coordinates.length} vertices</span>
                      <span>
                        {shapeConfig.coordinates.length >= 3 && 
                         shapeConfig.coordinates[0][0] === shapeConfig.coordinates[shapeConfig.coordinates.length - 1][0] &&
                         shapeConfig.coordinates[0][1] === shapeConfig.coordinates[shapeConfig.coordinates.length - 1][1]
                          ? '✓ Closed polygon'
                          : '⚠️ Polygon not closed'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Fill Configuration */}
          <div className="space-y-3 p-3 bg-[#18181b]/50 rounded border border-[#3f3f46]">
            <h4 className="text-xs font-semibold text-gray-400 uppercase">Fill Style</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fill Color</label>
                <input
                  type="color"
                  value={shapeConfig.fillColor || '#3b82f6'}
                  onChange={(e) => onShapeConfigChange({ 
                    ...shapeConfig, 
                    fillColor: e.target.value 
                  })}
                  disabled={isLoading}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Fill Opacity</label>
                <input
                  type="range"
                  value={shapeConfig.fillOpacity || 0.5}
                  onChange={(e) => onShapeConfigChange({ 
                    ...shapeConfig, 
                    fillOpacity: parseFloat(e.target.value)
                  })}
                  min="0"
                  max="1"
                  step="0.1"
                  disabled={isLoading}
                  className="w-full"
                />
                <div className="text-xs text-gray-500 text-right">
                  {((shapeConfig.fillOpacity || 0.5) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Stroke Configuration */}
          <div className="space-y-3 p-3 bg-[#18181b]/50 rounded border border-[#3f3f46]">
            <h4 className="text-xs font-semibold text-gray-400 uppercase">Stroke Style</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stroke Color</label>
                <input
                  type="color"
                  value={shapeConfig.strokeColor || '#1e40af'}
                  onChange={(e) => onShapeConfigChange({ 
                    ...shapeConfig, 
                    strokeColor: e.target.value 
                  })}
                  disabled={isLoading}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Stroke Width</label>
                <input
                  type="number"
                  value={shapeConfig.strokeWidth || 2}
                  onChange={(e) => onShapeConfigChange({ 
                    ...shapeConfig, 
                    strokeWidth: parseFloat(e.target.value) || 2
                  })}
                  min="0"
                  max="10"
                  step="0.5"
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                             focus:border-[#3b82f6] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stroke Opacity</label>
              <input
                type="range"
                value={shapeConfig.strokeOpacity || 1.0}
                onChange={(e) => onShapeConfigChange({ 
                  ...shapeConfig, 
                  strokeOpacity: parseFloat(e.target.value)
                })}
                min="0"
                max="1"
                step="0.1"
                disabled={isLoading}
                className="w-full"
              />
              <div className="text-xs text-gray-500 text-right">
                {((shapeConfig.strokeOpacity || 1.0) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};
