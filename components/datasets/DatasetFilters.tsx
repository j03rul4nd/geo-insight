// components/datasets/DatasetFilters.tsx
"use client";
import React from 'react';
import { Search } from 'lucide-react';
import { STATUS_FILTER_BUTTONS, VIEW_TYPE_FILTER_BUTTONS } from './constants/datasetConstants';
import type { FilterStatus, FilterViewType } from '@/hooks/useDatasetFilters'; // ✅ Importar

interface SelectionStats {
  gisCount: number;
  threejsCount: number;
  hasMixedTypes: boolean;
}

interface DatasetFiltersProps {
  statusFilter: FilterStatus;  // ✅ Usar tipo importado
  viewTypeFilter: FilterViewType;  // ✅ Usar tipo importado
  searchQuery: string;
  selectedCount: number;
  selectionStats: SelectionStats;
  onStatusFilterChange: (status: FilterStatus) => void;
  onViewTypeFilterChange: (viewType: FilterViewType) => void;
  onSearchChange: (query: string) => void;
}

export const DatasetFilters: React.FC<DatasetFiltersProps> = ({
  statusFilter,
  viewTypeFilter,
  searchQuery,
  selectedCount,
  selectionStats,
  onStatusFilterChange,
  onViewTypeFilterChange,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {/* Status Filters */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 uppercase tracking-wide mr-2">Status:</span>
        {STATUS_FILTER_BUTTONS.map(filter => (
          <button
            key={filter.id}
            onClick={() => onStatusFilterChange(filter.id as FilterStatus)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              statusFilter === filter.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {filter.icon && <span className="mr-1">{filter.icon}</span>}
            {filter.label}
          </button>
        ))}
      </div>

      {/* View Type Filters + Search */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 uppercase tracking-wide mr-2">View:</span>
          {VIEW_TYPE_FILTER_BUTTONS.map(filter => (
            <button
              key={filter.id}
              onClick={() => onViewTypeFilterChange(filter.id as FilterViewType)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                viewTypeFilter === filter.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {filter.icon && <span className="mr-1">{filter.icon}</span>}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Selection Stats */}
        {selectedCount > 0 && selectionStats.hasMixedTypes && (
          <div className="px-3 py-1 bg-yellow-900/20 border border-yellow-800/30 rounded text-xs text-yellow-400">
            Mixed: {selectionStats.gisCount} GIS, {selectionStats.threejsCount} 3D
          </div>
        )}

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or source..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};