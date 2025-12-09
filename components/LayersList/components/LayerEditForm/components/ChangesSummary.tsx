
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ChangesSummaryProps {
  hasChanges: boolean;
}

export const ChangesSummary: React.FC<ChangesSummaryProps> = ({ hasChanges }) => {
  if (!hasChanges) return null;

  return (
    <div className="pt-4 border-t border-[#27272a]">
      <div className="flex items-start gap-2 text-xs text-gray-400">
        <AlertCircle size={12} className="flex-shrink-0 mt-0.5 text-blue-400" />
        <div>
          You have unsaved changes. Click <strong className="text-white">Save Changes</strong> to apply them,
          or <strong className="text-white">Reset</strong> to discard.
        </div>
      </div>
    </div>
  );
};
