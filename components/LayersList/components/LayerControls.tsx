/**
 * LayerControls - Controles avanzados para layer
 * Opacidad, Point Size, y visualización de metadata
 */

'use client';

import React from 'react';
import { Layers, Eye, Navigation } from 'lucide-react';
import { LayerControlsProps } from '../types';
import { 
  getAssetTypeDescription, 
  getRenderTypeDescription,
  hasTrailConfiguration 
} from '../core/layersUtils';

export const LayerControls: React.FC<LayerControlsProps> = ({
  layer,
  onOpacityChange,
  onPointSizeChange,
  disabled = false
}) => {
  
  return (
    <div className="space-y-4">
      {/* Layer Info Badge */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="px-2 py-1 bg-[#27272a] rounded text-xs flex items-center gap-1">
          <Layers size={12} className="text-gray-400" />
          <span className="text-gray-400">Order:</span>
          <span className="text-white font-mono">{layer.order}</span>
        </div>
        
        <div className="px-2 py-1 bg-[#27272a] rounded text-xs flex items-center gap-1">
          <Eye size={12} className="text-gray-400" />
          <span className="text-gray-400">{getAssetTypeDescription(layer.assetType)}</span>
        </div>

        {hasTrailConfiguration(layer) && (
          <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs flex items-center gap-1">
            <Navigation size={12} className="text-blue-400" />
            <span className="text-blue-400">Trail Active</span>
          </div>
        )}
      </div>

      {/* Opacity Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Opacity</span>
          <span className="text-xs font-mono text-white">
            {Math.round(layer.opacity * 100)}%
          </span>
        </div>
        
        <input
          type="range"
          min="0"
          max="100"
          value={layer.opacity * 100}
          onChange={(e) => onOpacityChange(parseInt(e.target.value) / 100)}
          disabled={disabled}
          className="w-full h-2 bg-[#27272a] rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-[#10b981]
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-all
                     [&::-webkit-slider-thumb]:hover:scale-110
                     disabled:opacity-30 disabled:cursor-not-allowed"
        />

        {/* Opacity presets */}
        <div className="flex gap-1">
          {[0, 25, 50, 75, 100].map(preset => (
            <button
              key={preset}
              onClick={() => onOpacityChange(preset / 100)}
              disabled={disabled}
              className="flex-1 px-2 py-1 bg-[#27272a] hover:bg-[#3f3f46] rounded text-xs
                         transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {preset}%
            </button>
          ))}
        </div>
      </div>

      {/* Point Size Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">Point Size</span>
          <span className="text-xs font-mono text-white">
            {layer.pointSize.toFixed(1)}x
          </span>
        </div>
        
        <input
          type="range"
          min="1"
          max="100"
          step="1"
          value={layer.pointSize * 10}
          onChange={(e) => onPointSizeChange(parseInt(e.target.value) / 10)}
          disabled={disabled}
          className="w-full h-2 bg-[#27272a] rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-4
                     [&::-webkit-slider-thumb]:h-4
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-[#3b82f6]
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:transition-all
                     [&::-webkit-slider-thumb]:hover:scale-110
                     disabled:opacity-30 disabled:cursor-not-allowed"
        />

        {/* Size presets */}
        <div className="flex gap-1">
          {[0.5, 1.0, 1.5, 2.0, 3.0].map(preset => (
            <button
              key={preset}
              onClick={() => onPointSizeChange(preset)}
              disabled={disabled}
              className="flex-1 px-2 py-1 bg-[#27272a] hover:bg-[#3f3f46] rounded text-xs
                         transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {preset}x
            </button>
          ))}
        </div>
      </div>

      {/* Render Info */}
      <div className="pt-2 border-t border-[#27272a]">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>Render Type:</span>
            <span className="text-gray-400">{getRenderTypeDescription(layer.renderType)}</span>
          </div>
          
          {layer.filterQuery && (
            <div className="flex items-start justify-between gap-2">
              <span className="flex-shrink-0">Filter:</span>
              <span className="text-gray-400 font-mono text-[10px] text-right truncate">
                {layer.filterQuery}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};