import React from 'react';
import { RotateCcw } from 'lucide-react';

type ViewMode = 'perspective' | 'top' | 'front' | 'side';

interface ViewControlsProps {
  viewMode: ViewMode;
  onViewChange: (view: ViewMode) => void;
  onResetView: () => void;
}

const ViewControls: React.FC<ViewControlsProps> = ({
  viewMode,
  onViewChange,
  onResetView
}) => {
  const viewButtons: Array<{ mode: ViewMode; label: string; title: string }> = [
    { mode: 'perspective', label: '3D', title: 'Perspective View' },
    { mode: 'top', label: 'Top', title: 'Top View' },
    { mode: 'front', label: 'Front', title: 'Front View' },
    { mode: 'side', label: 'Side', title: 'Side View' }
  ];

  return (
    <div className="absolute bottom-4 left-4 flex gap-2">
      <button 
        onClick={onResetView}
        className="bg-[#18181b]/90 backdrop-blur p-2 rounded hover:bg-[#27272a] transition-colors"
        title="Reset View"
        aria-label="Reset View"
      >
        <RotateCcw size={16} />
      </button>

      {viewButtons.map(({ mode, label, title }) => (
        <button 
          key={mode}
          onClick={() => onViewChange(mode)}
          className={`bg-[#18181b]/90 backdrop-blur px-3 py-2 rounded hover:bg-[#27272a] text-xs transition-colors ${
            viewMode === mode ? 'bg-[#3b82f6] text-white' : ''
          }`}
          title={title}
          aria-label={title}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default ViewControls;