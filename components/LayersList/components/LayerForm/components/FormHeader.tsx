import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface FormHeaderProps {
  onCancel: () => void;
  isLoading: boolean;
}

export const FormHeader: React.FC<FormHeaderProps> = ({ 
  onCancel, 
  isLoading 
}) => {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="sticky top-0 z-10 bg-[#18181b] border-b border-[#27272a] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Create New Layer</h2>
            <p className="text-sm text-gray-400 mt-0.5">Configure your visualization layer</p>
          </div>
        </div>
        
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="p-2 hover:bg-[#27272a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed group"
          aria-label="Cancel"
        >
          <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
};