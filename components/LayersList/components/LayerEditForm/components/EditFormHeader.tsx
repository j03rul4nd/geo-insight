import React from 'react';
import { X, Save, RotateCcw } from 'lucide-react';

interface EditFormHeaderProps {
  hasChanges: boolean;
  isLoading: boolean;
  onReset: () => void;
  onCancel: () => void;
}

export const EditFormHeader: React.FC<EditFormHeaderProps> = ({
  hasChanges,
  isLoading,
  onReset,
  onCancel
}) => {
  return (
    <div className="sticky top-0 bg-[#18181b] border-b border-[#27272a] px-6 py-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-2">
        <Save size={18} className="text-blue-400" />
        <h2 className="text-lg font-bold">Edit Layer</h2>
        {hasChanges && (
          <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded text-[10px] text-yellow-400 font-medium">
            UNSAVED CHANGES
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {hasChanges && (
          <button
            onClick={onReset}
            disabled={isLoading}
            className="p-1.5 hover:bg-[#27272a] rounded transition-colors disabled:opacity-50"
            title="Reset all changes"
            type="button"
          >
            <RotateCcw size={16} className="text-gray-400" />
          </button>
        )}
        
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="p-1.5 hover:bg-[#27272a] rounded transition-colors disabled:opacity-50"
          title="Close"
          type="button"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};