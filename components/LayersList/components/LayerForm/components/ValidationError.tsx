import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationErrorProps {
  error: string | null;
}

export const ValidationError: React.FC<ValidationErrorProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
      <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-red-400">{error}</div>
    </div>
  );
};
