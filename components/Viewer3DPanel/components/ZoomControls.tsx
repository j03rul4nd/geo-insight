import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoom,
  onZoomChange,
  minZoom = 0.2,
  maxZoom = 5,
  zoomStep = 1.2
}) => {
  const handleZoomIn = () => {
    onZoomChange(Math.min(maxZoom, zoom * zoomStep));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(minZoom, zoom / zoomStep));
  };

  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2">
      <button 
        onClick={handleZoomIn}
        className="bg-[#18181b]/90 backdrop-blur p-2 rounded hover:bg-[#27272a] transition-colors"
        title="Zoom In"
        aria-label="Zoom In"
      >
        <ZoomIn size={16} />
      </button>
      <button 
        onClick={handleZoomOut}
        className="bg-[#18181b]/90 backdrop-blur p-2 rounded hover:bg-[#27272a] transition-colors"
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <ZoomOut size={16} />
      </button>
    </div>
  );
};

export default ZoomControls;