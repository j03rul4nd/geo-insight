import React from 'react';

interface BasicInfoSectionProps {
  name: string;
  description: string;
  enabled: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onEnabledChange: (value: boolean) => void;
  isLoading: boolean;
}

export const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  name,
  description,
  enabled,
  onNameChange,
  onDescriptionChange,
  onEnabledChange,
  isLoading
}) => {
  return (
    <div className="space-y-4 p-4 bg-[#27272a]/50 rounded-lg">
      <h3 className="text-sm font-bold text-gray-300">Basic Information</h3>
      
      {/* Name */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-1">
          Layer Name 
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Metro Trains"
          disabled={isLoading}
          maxLength={100}
          required
          autoFocus
          className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                     focus:border-[#3b82f6] focus:outline-none transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <div className="text-xs text-gray-500">
          {name.length}/100 characters
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Optional description..."
          disabled={isLoading}
          maxLength={500}
          rows={2}
          className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded
                     focus:border-[#3b82f6] focus:outline-none resize-none transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Enabled toggle */}
      <div className="flex items-center gap-3 p-3 bg-[#18181b] rounded-lg">
        <input
          type="checkbox"
          id="enabled"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 rounded cursor-pointer"
        />
        <label htmlFor="enabled" className="text-sm cursor-pointer flex-1">
          Enable layer immediately
        </label>
      </div>
    </div>
  );
};
