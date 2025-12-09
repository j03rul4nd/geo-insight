import React from 'react';
import type { AssetFiltersProps } from '../types';

// ============================================
// COMPONENT: AssetFilters
// ============================================

const AssetFilters: React.FC<AssetFiltersProps> = ({
  selectedType,
  availableTypes,
  hasActiveFilters,
  onTypeChange,
  onClearFilters
}) => {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold mb-3">Asset Filters</h3>
      
      {/* Filter by Sensor Type */}
      <div className="mb-3">
        <label className="text-xs text-gray-400 mb-1 block">Sensor Type</label>
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full bg-[#27272a] text-xs py-2 px-2 rounded border border-[#3f3f46] 
                     focus:border-[#3b82f6] outline-none"
        >
          <option value="">All Types</option>
          {availableTypes.map(type => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="w-full text-xs py-2 bg-[#27272a] hover:bg-[#3f3f46] 
                     rounded transition-colors"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default AssetFilters;