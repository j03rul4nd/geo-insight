import React from 'react';

type ViewMode = 'perspective' | 'top' | 'front' | 'side';

interface ViewInfoProps {
  viewMode: ViewMode;
  zoom: number;
}

const ViewInfo: React.FC<ViewInfoProps> = ({ viewMode, zoom }) => {
  return (
    <div className="absolute top-4 left-4 bg-[#18181b]/90 backdrop-blur px-3 py-2 rounded text-xs text-gray-400">
      <div>View: {viewMode}</div>
      <div>Zoom: {zoom.toFixed(2)}x</div>
    </div>
  );
};

export default ViewInfo;