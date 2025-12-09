import React from 'react';
import type { 
  ColorScheme, 
  BorderConfig, 
  ShadowConfig 
} from '@/hooks/useVisualizationLayers';
import { ColorSchemeEditor } from '../../ColorSchemeEditor';

interface StyleConfigSectionProps {
  colorScheme: ColorScheme;
  opacity: number;
  pointSize: number;
  showBorder: boolean;
  borderConfig: BorderConfig;
  showShadow: boolean;
  shadowConfig: ShadowConfig;
  onColorSchemeChange: (value: ColorScheme) => void;
  onOpacityChange: (value: number) => void;
  onPointSizeChange: (value: number) => void;
  onShowBorderChange: (value: boolean) => void;
  onBorderConfigChange: (value: BorderConfig) => void;
  onShowShadowChange: (value: boolean) => void;
  onShadowConfigChange: (value: ShadowConfig) => void;
  isLoading: boolean;
}

export const StyleConfigSection: React.FC<StyleConfigSectionProps> = ({
  colorScheme,
  opacity,
  pointSize,
  showBorder,
  borderConfig,
  showShadow,
  shadowConfig,
  onColorSchemeChange,
  onOpacityChange,
  onPointSizeChange,
  onShowBorderChange,
  onBorderConfigChange,
  onShowShadowChange,
  onShadowConfigChange,
  isLoading
}) => {
  return (
    <div className="space-y-4 p-4 bg-[#27272a]/50 rounded-lg">
      <h3 className="text-sm font-bold text-gray-300">Style Configuration</h3>
      
      {/* Color Scheme */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Color Scheme</label>
        <ColorSchemeEditor
          colorScheme={colorScheme}
          onChange={onColorSchemeChange}
          disabled={isLoading}
        />
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center justify-between">
          <span>Opacity</span>
          <span className="text-xs font-mono text-gray-400">{opacity}%</span>
        </label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacity}
          onChange={(e) => onOpacityChange(parseInt(e.target.value))}
          disabled={isLoading}
          className="w-full h-2 bg-[#18181b] rounded-full appearance-none cursor-pointer"
        />
      </div>

      {/* Point Size */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center justify-between">
          <span>Point Size</span>
          <span className="text-xs font-mono text-gray-400">
            {(pointSize / 10).toFixed(1)}x
          </span>
        </label>
        <input
          type="range"
          min="1"
          max="100"
          value={pointSize}
          onChange={(e) => onPointSizeChange(parseInt(e.target.value))}
          disabled={isLoading}
          className="w-full h-2 bg-[#18181b] rounded-full appearance-none cursor-pointer"
        />
      </div>

      {/* Border Configuration */}
      <div className="space-y-3 pt-2 border-t border-[#3f3f46]">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Border</label>
          <input
            type="checkbox"
            checked={showBorder}
            onChange={(e) => onShowBorderChange(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 rounded border-gray-600 bg-[#18181b] text-blue-600 focus:ring-blue-500"
          />
        </div>
        
        {showBorder && (
          <div className="space-y-3 pl-4 border-l-2 border-[#3f3f46]">
            {/* Border Width */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center justify-between">
                <span>Width</span>
                <span className="text-xs font-mono text-gray-400">{borderConfig.width}px</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={borderConfig.width}
                onChange={(e) => onBorderConfigChange({ 
                  ...borderConfig, 
                  width: parseInt(e.target.value) 
                })}
                disabled={isLoading}
                className="w-full h-2 bg-[#18181b] rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Border Color */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Color</label>
              <input
                type="color"
                value={borderConfig.color}
                onChange={(e) => onBorderConfigChange({ 
                  ...borderConfig, 
                  color: e.target.value 
                })}
                disabled={isLoading}
                className="w-full h-10 rounded border border-[#3f3f46] bg-[#18181b] cursor-pointer"
              />
            </div>

            {/* Border Style */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Style</label>
              <select
                value={borderConfig.style}
                onChange={(e) => onBorderConfigChange({ 
                  ...borderConfig, 
                  style: e.target.value as 'solid' | 'dashed' | 'dotted'
                })}
                disabled={isLoading}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>

            {/* Border Opacity */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center justify-between">
                <span>Opacity</span>
                <span className="text-xs font-mono text-gray-400">
                  {Math.round((borderConfig.opacity ?? 1) * 100)}%
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round((borderConfig.opacity  ?? 1)* 100)}
                onChange={(e) => onBorderConfigChange({ 
                  ...borderConfig, 
                  opacity: parseInt(e.target.value) / 100 
                })}
                disabled={isLoading}
                className="w-full h-2 bg-[#18181b] rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>

      {/* Shadow Configuration */}
      <div className="space-y-3 pt-2 border-t border-[#3f3f46]">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Shadow</label>
          <input
            type="checkbox"
            checked={showShadow}
            onChange={(e) => onShowShadowChange(e.target.checked)}
            disabled={isLoading}
            className="w-4 h-4 rounded border-gray-600 bg-[#18181b] text-blue-600 focus:ring-blue-500"
          />
        </div>
        
        {showShadow && (
          <div className="space-y-3 pl-4 border-l-2 border-[#3f3f46]">
            {/* Shadow Color */}
            <div className="space-y-2">
              <label className="text-xs font-medium">Color</label>
              <input
                type="color"
                value={shadowConfig.color}
                onChange={(e) => onShadowConfigChange({ 
                  ...shadowConfig, 
                  color: e.target.value 
                })}
                disabled={isLoading}
                className="w-full h-10 rounded border border-[#3f3f46] bg-[#18181b] cursor-pointer"
              />
            </div>

            {/* Shadow Blur */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center justify-between">
                <span>Blur</span>
                <span className="text-xs font-mono text-gray-400">{shadowConfig.blur}px</span>
              </label>
              <input
                type="range"
                min="0"
                max="50"
                value={shadowConfig.blur}
                onChange={(e) => onShadowConfigChange({ 
                  ...shadowConfig, 
                  blur: parseInt(e.target.value) 
                })}
                disabled={isLoading}
                className="w-full h-2 bg-[#18181b] rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Shadow Offset X */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center justify-between">
                <span>Offset X</span>
                <span className="text-xs font-mono text-gray-400">{shadowConfig.offsetX}px</span>
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                value={shadowConfig.offsetX}
                onChange={(e) => onShadowConfigChange({ 
                  ...shadowConfig, 
                  offsetX: parseInt(e.target.value) 
                })}
                disabled={isLoading}
                className="w-full h-2 bg-[#18181b] rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Shadow Offset Y */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center justify-between">
                <span>Offset Y</span>
                <span className="text-xs font-mono text-gray-400">{shadowConfig.offsetY}px</span>
              </label>
              <input
                type="range"
                min="-20"
                max="20"
                value={shadowConfig.offsetY}
                onChange={(e) => onShadowConfigChange({ 
                  ...shadowConfig, 
                  offsetY: parseInt(e.target.value) 
                })}
                disabled={isLoading}
                className="w-full h-2 bg-[#18181b] rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};