import React from 'react';

interface MapInfoOverlayProps {
  isLive: boolean;
  pointsCount: number;
  colorMode: 'heatmap' | 'sensor-type';
}

const MapInfoOverlay: React.FC<MapInfoOverlayProps> = ({ 
  isLive, 
  pointsCount, 
  colorMode 
}) => {
  return (
    <div className="absolute top-[88px] left-4 bg-[#18181b]/90 backdrop-blur-sm border border-[#27272a] rounded-lg p-3 text-xs space-y-2 shadow-lg">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-[#10b981] animate-pulse' : 'bg-gray-500'}`}></div>
        <span className="text-gray-400">
          {isLive ? 'Live View' : 'Paused'}
        </span>
      </div>
      <div className="text-gray-400">
        Points: <span className="text-white font-bold">{pointsCount}</span>
      </div>
      <div className="text-gray-400">
        Mode: <span className="text-white font-bold capitalize">{colorMode}</span>
      </div>
    </div>
  );
};

export default MapInfoOverlay;