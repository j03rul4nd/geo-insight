/**
 * LayerStats - Componente de estadísticas de layers
 * Muestra métricas sobre la composición de layers
 */

'use client';

import React from 'react';
import { 
  Layers, 
  Eye, 
  EyeOff,
  MapPin,
  Navigation,
  Square,
  TrendingUp,
  Zap,
  Filter
} from 'lucide-react';

export interface LayerStatsProps {
  totalLayers: number;
  enabledLayers: number;
  disabledLayers: number;
  pointLayers: number;
  movingLayers: number;
  areaLayers: number;
  trailLayers: number;
  layersWithRules: number;
  layersWithFilters: number;
  className?: string;
}

export const LayerStats: React.FC<LayerStatsProps> = ({
  totalLayers,
  enabledLayers,
  disabledLayers,
  pointLayers,
  movingLayers,
  areaLayers,
  trailLayers,
  layersWithRules,
  layersWithFilters,
  className = ''
}) => {
  
  const enabledPercentage = totalLayers > 0 
    ? Math.round((enabledLayers / totalLayers) * 100) 
    : 0;

  return (
    <div className={`p-3 bg-[#27272a]/50 rounded-lg space-y-3 ${className}`}>
      
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-[#18181b]">
        <Layers size={14} className="text-gray-400" />
        <span className="text-xs font-medium text-gray-300">Layer Statistics</span>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 bg-[#18181b] rounded text-center">
          <div className="text-xs text-gray-500 mb-1">Total</div>
          <div className="text-lg font-bold">{totalLayers}</div>
        </div>
        
        <div className="p-2 bg-[#18181b] rounded text-center">
          <div className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
            <Eye size={10} />
            Enabled
          </div>
          <div className="text-lg font-bold text-green-400">{enabledLayers}</div>
        </div>
        
        <div className="p-2 bg-[#18181b] rounded text-center">
          <div className="text-xs text-gray-500 mb-1 flex items-center justify-center gap-1">
            <EyeOff size={10} />
            Disabled
          </div>
          <div className="text-lg font-bold text-gray-500">{disabledLayers}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">Enabled</span>
          <span className="font-mono text-gray-400">{enabledPercentage}%</span>
        </div>
        <div className="h-2 bg-[#18181b] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300"
            style={{ width: `${enabledPercentage}%` }}
          />
        </div>
      </div>

      {/* Asset Types */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-gray-400">By Asset Type</div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-blue-400" />
              <span className="text-gray-300">Point Assets</span>
            </div>
            <span className="font-mono text-gray-400">{pointLayers}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Navigation size={12} className="text-green-400" />
              <span className="text-gray-300">Moving Assets</span>
            </div>
            <span className="font-mono text-gray-400">{movingLayers}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Square size={12} className="text-purple-400" />
              <span className="text-gray-300">Area Assets</span>
            </div>
            <span className="font-mono text-gray-400">{areaLayers}</span>
          </div>
        </div>
      </div>

      {/* Advanced Features */}
      <div className="space-y-2 pt-2 border-t border-[#18181b]">
        <div className="text-xs font-medium text-gray-400">Advanced Features</div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <TrendingUp size={12} className="text-yellow-400" />
              <span className="text-gray-300">With Trails</span>
            </div>
            <span className="font-mono text-gray-400">{trailLayers}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-orange-400" />
              <span className="text-gray-300">Dynamic Rules</span>
            </div>
            <span className="font-mono text-gray-400">{layersWithRules}</span>
          </div>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Filter size={12} className="text-cyan-400" />
              <span className="text-gray-300">With Filters</span>
            </div>
            <span className="font-mono text-gray-400">{layersWithFilters}</span>
          </div>
        </div>
      </div>
    </div>
  );
};