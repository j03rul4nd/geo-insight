// components/datasets/DatasetHeader.tsx
"use client";
import React from 'react';
import { Database, Plus, X, Filter, Archive, Trash2, Loader2 } from 'lucide-react';

interface DatasetHeaderProps {
  isPro: boolean;
  datasetUsed: number;
  datasetLimit: number;
  isDatasetLimitReached: boolean;
  filteredCount: number;
  activeFiltersCount: number;
  selectedCount: number;
  showBulkActions: boolean;
  bulkArchivePending: boolean;
  bulkDeletePending: boolean;
  onOpenNewDataset: () => void;
  onClearFilters: () => void;
  onToggleBulkActions: () => void;
  onBulkArchive: () => void;
  onBulkDelete: () => void;
}

export const DatasetHeader: React.FC<DatasetHeaderProps> = ({
  isPro,
  datasetUsed,
  datasetLimit,
  isDatasetLimitReached,
  filteredCount,
  activeFiltersCount,
  selectedCount,
  showBulkActions,
  bulkArchivePending,
  bulkDeletePending,
  onOpenNewDataset,
  onClearFilters,
  onToggleBulkActions,
  onBulkArchive,
  onBulkDelete,
}) => {
  return (
    <div className="mb-6">
      {/* Free Plan Banner */}
      {!isPro && (
        <div className="mb-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-gray-300">
              {datasetUsed}/{datasetLimit} datasets used
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-400">Upgrade for unlimited</span>
          </div>
          <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
            Upgrade to Pro
          </button>
        </div>
      )}

      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Datasets</h1>
          <span className="px-2 py-1 bg-gray-800 rounded text-sm text-gray-400 font-mono">
            ({filteredCount} active)
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-400 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {/* Bulk Actions Dropdown */}
          {selectedCount > 0 && (
            <div className="relative">
              <button
                onClick={onToggleBulkActions}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Bulk Actions ({selectedCount})
              </button>
              {showBulkActions && (
                <div className="absolute right-0 mt-2 w-48 bg-[#18181b] border border-gray-800 rounded-lg shadow-xl z-50">
                  <button 
                    onClick={onBulkArchive}
                    disabled={bulkArchivePending}
                    className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    {bulkArchivePending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Archive className="w-4 h-4" />
                    )}
                    Archive
                  </button>
                  <div className="border-t border-gray-800 my-1"></div>
                  <button 
                    onClick={onBulkDelete}
                    disabled={bulkDeletePending}
                    className="w-full px-4 py-2 hover:bg-red-900/20 text-red-400 flex items-center gap-2 text-sm disabled:opacity-50"
                  >
                    {bulkDeletePending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}

          {/* New Dataset Button */}
          <button
            onClick={onOpenNewDataset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isDatasetLimitReached}
            title={isDatasetLimitReached ? "Upgrade to Pro for unlimited datasets" : ""}
          >
            <Plus className="w-4 h-4" />
            New Dataset
          </button>
        </div>
      </div>
    </div>
  );
};