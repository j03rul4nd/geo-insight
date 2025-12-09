import React from 'react';

interface MapHeatmapLegendProps {
  valueRange: { min: number; max: number };
  isVisible: boolean;
}

const MapHeatmapLegend: React.FC<MapHeatmapLegendProps> = ({ 
  valueRange, 
  isVisible 
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute bottom-4 left-4 bg-[#18181b]/90 backdrop-blur-sm border border-[#27272a] rounded-lg p-3 shadow-lg">
      <div className="text-xs font-bold mb-2 text-gray-400">Value Range</div>
      <div className="flex items-center gap-2">
        <div 
          className="w-32 h-4 rounded" 
          style={{
            background: 'linear-gradient(to right, hsl(240, 80%, 50%), hsl(120, 80%, 50%), hsl(0, 80%, 50%))'
          }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{valueRange.min.toFixed(1)}</span>
        <span>{valueRange.max.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default MapHeatmapLegend;