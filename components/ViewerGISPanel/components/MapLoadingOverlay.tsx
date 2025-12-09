import React from 'react';

interface MapLoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const MapLoadingOverlay: React.FC<MapLoadingOverlayProps> = ({ 
  isVisible, 
  message = 'Loading map...' 
}) => {
  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[#27272a] border-t-[#10b981] rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-gray-400 text-sm">{message}</div>
      </div>
    </div>
  );
};

export default MapLoadingOverlay;