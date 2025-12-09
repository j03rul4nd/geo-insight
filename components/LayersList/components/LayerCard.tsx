/**
 * LayerCard - Card individual para cada layer (ACTUALIZADO)
 * Incluye botones de mover arriba/abajo y badges de features
 */

'use client';

import React, { useState } from 'react';
import { 
  MoreVertical, 
  Eye, 
  EyeOff, 
  Copy, 
  Trash2, 
  Edit2,
  ChevronUp,
  ChevronDown,
  Zap,
  Filter as FilterIcon,
  TrendingUp
} from 'lucide-react';
import { LayerCardProps } from '../types';
import { getColorPreview, getLayerIcon } from '../core/layersUtils';

// Extender props para incluir nuevas acciones
export interface LayerCardExtendedProps extends LayerCardProps {
  onMoveUp?: (layerId: string) => void;
  onMoveDown?: (layerId: string) => void;
  hasDynamicRules?: boolean;
}

export const LayerCard: React.FC<LayerCardExtendedProps> = ({
  layer,
  onToggle,
  onOpacityChange,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  isLoading = false,
  hasDynamicRules = false
}) => {
  const [showMenu, setShowMenu] = useState(false);
  
  const colorPreview = getColorPreview(layer.colorScheme);
  const layerIcon = getLayerIcon(layer);
  
  return (
    <div className="bg-[#27272a] rounded-lg p-3 transition-all hover:bg-[#2d2d30] group">
      {/* Header con checkbox y nombre */}
      <div className="flex items-center gap-2 mb-2">
        <button
          onClick={() => onToggle(layer.id)}
          disabled={isLoading}
          className="flex items-center justify-center w-5 h-5 rounded border-2 transition-colors flex-shrink-0"
          style={{
            borderColor: layer.enabled ? '#10b981' : '#52525b',
            backgroundColor: layer.enabled ? '#10b981' : 'transparent'
          }}
        >
          {layer.enabled && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
        
        <span className="text-xs mr-1">{layerIcon}</span>
        
        <span className="text-sm flex-1 font-medium truncate">
          {layer.name}
        </span>
        
        {/* Icono de visibilidad */}
        {layer.enabled ? (
          <Eye size={14} className="text-[#10b981] flex-shrink-0" />
        ) : (
          <EyeOff size={14} className="text-gray-500 flex-shrink-0" />
        )}
        
        {/* Botones de mover arriba/abajo */}
        {(onMoveUp || onMoveDown) && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {onMoveUp && (
              <button
                onClick={() => onMoveUp(layer.id)}
                disabled={isLoading}
                className="p-1 hover:bg-[#3f3f46] rounded transition-colors disabled:opacity-30"
                title="Move layer up"
              >
                <ChevronUp size={12} />
              </button>
            )}
            {onMoveDown && (
              <button
                onClick={() => onMoveDown(layer.id)}
                disabled={isLoading}
                className="p-1 hover:bg-[#3f3f46] rounded transition-colors disabled:opacity-30"
                title="Move layer down"
              >
                <ChevronDown size={12} />
              </button>
            )}
          </div>
        )}
        
        {/* Menu desplegable */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-[#3f3f46] rounded opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical size={14} />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-6 z-20 bg-[#18181b] border border-[#27272a] rounded-lg shadow-xl py-1 min-w-[140px]">
                {onEdit && (
                  <button
                    onClick={() => {
                      onEdit(layer);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-[#27272a] flex items-center gap-2"
                  >
                    <Edit2 size={12} />
                    Edit Layer
                  </button>
                )}
                {onDuplicate && (
                  <button
                    onClick={() => {
                      onDuplicate(layer.id);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-[#27272a] flex items-center gap-2"
                  >
                    <Copy size={12} />
                    Duplicate
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm(`Delete layer "${layer.name}"?`)) {
                        onDelete(layer.id);
                      }
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-xs text-left hover:bg-[#27272a] text-red-400 flex items-center gap-2"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Feature badges */}
      <div className="flex items-center gap-1 mb-2 flex-wrap">
        <div className="px-1.5 py-0.5 bg-[#18181b] rounded text-[10px] text-gray-500 font-mono">
          Z:{layer.order}
        </div>
        
        {hasDynamicRules && (
          <div className="px-1.5 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-400 flex items-center gap-1">
            <Zap size={10} />
            Rules
          </div>
        )}
        
        {layer.filterQuery && (
          <div className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] text-cyan-400 flex items-center gap-1">
            <FilterIcon size={10} />
            Filtered
          </div>
        )}
        
        {layer.showTrail && (
          <div className="px-1.5 py-0.5 bg-green-500/10 border border-green-500/20 rounded text-[10px] text-green-400 flex items-center gap-1">
            <TrendingUp size={10} />
            Trail
          </div>
        )}
      </div>
      
      {/* Color preview */}
      <div 
        className="h-2 rounded-full mb-3"
        style={{ 
          background: colorPreview,
          opacity: layer.enabled ? 1 : 0.3
        }}
      />
      
      {/* Opacity slider */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 min-w-[50px]">
          Opacity
        </span>
        <input
          type="range"
          min="0"
          max="100"
          value={layer.opacity * 100}
          onChange={(e) => onOpacityChange(layer.id, parseInt(e.target.value))}
          disabled={!layer.enabled || isLoading}
          className="flex-1 h-1 bg-[#3f3f46] rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-3
                     [&::-webkit-slider-thumb]:h-3
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-[#10b981]
                     disabled:opacity-30 disabled:cursor-not-allowed"
        />
        <span className="text-xs text-gray-400 min-w-[35px] text-right">
          {Math.round(layer.opacity * 100)}%
        </span>
      </div>
      
      {/* Description (si existe) */}
      {layer.description && (
        <div className="mt-2 text-xs text-gray-500 line-clamp-2">
          {layer.description}
        </div>
      )}
      
      {/* Filter indicator (expandido) */}
      {layer.filterQuery && (
        <div className="mt-2 px-2 py-1 bg-[#18181b] border border-[#3f3f46] rounded">
          <div className="text-[10px] text-gray-500 mb-0.5">Filter Query:</div>
          <div className="text-xs text-gray-400 font-mono truncate">
            {layer.filterQuery}
          </div>
        </div>
      )}
    </div>
  );
};