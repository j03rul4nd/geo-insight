
import React from 'react';
import { Loader2, RotateCcw } from 'lucide-react';

interface EditFormActionsProps {
  hasChanges: boolean;
  isLoading: boolean;
  isValid: boolean;
  onReset: () => void;
  onCancel: () => void;
}

export const EditFormActions: React.FC<EditFormActionsProps> = ({
  hasChanges,
  isLoading,
  isValid,
  onReset,
  onCancel
}) => {
  return (
    <div className="flex gap-3 pt-4 border-t border-[#27272a]">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="flex-1 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] rounded
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      
      {hasChanges && (
        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] rounded
                     transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2"
        >
          <RotateCcw size={14} />
          Reset
        </button>
      )}
      
      <button
        type="submit"
        disabled={isLoading || !isValid || !hasChanges}
        className="flex-1 px-4 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] rounded
                   transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                   flex items-center justify-center gap-2 font-medium"
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {isLoading ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}
      </button>
    </div>
  );
};