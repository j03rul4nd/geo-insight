import React from 'react';
import { Loader2 } from 'lucide-react';

interface FormActionsProps {
  onCancel: () => void;
  isLoading: boolean;
  isValid: boolean;
}

export const FormActions: React.FC<FormActionsProps> = ({ 
  onCancel, 
  isLoading, 
  isValid 
}) => {
  return (
    <div className="flex gap-3 pt-4 border-t border-[#27272a]">
      <button
        type="button"
        onClick={onCancel}
        disabled={isLoading}
        className="flex-1 px-4 py-2.5 bg-[#27272a] hover:bg-[#3f3f46] rounded
                   transition-colors disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isLoading || !isValid}
        className="flex-1 px-4 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] rounded
                   transition-colors disabled:opacity-50
                   flex items-center justify-center gap-2 font-medium"
      >
        {isLoading && <Loader2 size={16} className="animate-spin" />}
        {isLoading ? 'Creating...' : 'Create Layer'}
      </button>
    </div>
  );
};