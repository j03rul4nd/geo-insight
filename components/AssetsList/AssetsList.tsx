import React from 'react';
import { useAssetsList } from './core/useAssetsList';
import AssetFilters from './components/AssetFilters';
import AssetCard from './components/AssetCard';
import type { AssetsListProps } from './types';

// ============================================
// MAIN COMPONENT: AssetsList
// ============================================

const AssetsList: React.FC<AssetsListProps> = ({
  dataPoints,
  filters,
  onFilterChange,
  onClearFilters,
  onPointSelect,
  collapsed = false
}) => {
  const {
    assetsList,
    uniqueSensorTypes,
    toggleAsset,
    isAssetExpanded,
    getTimeAgo
  } = useAssetsList({ dataPoints });

  // Early return if collapsed
  if (collapsed) {
    return null;
  }

  // Early return if no assets
  if (assetsList.length === 0) {
    return (
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3">Assets (0)</h3>
        <div className="bg-[#27272a] rounded p-4 text-xs text-gray-400 text-center">
          No assets available
        </div>
      </div>
    );
  }

  // Handlers
  const handleTypeChange = (type: string) => {
    onFilterChange({ sensorType: type || undefined });
  };

  const handleViewOnMap = (asset: any) => {
    onPointSelect(asset.allPoints[0]);
  };

  const handleFilterOnly = (asset: any) => {
    onFilterChange({ sensorId: asset.sensorId });
  };

  const hasActiveFilters = !!(filters.sensorType || filters.sensorId);

  return (
    <>
      {/* Filters Section */}
      <AssetFilters
        selectedType={filters.sensorType || ''}
        availableTypes={uniqueSensorTypes}
        hasActiveFilters={hasActiveFilters}
        onTypeChange={handleTypeChange}
        onClearFilters={onClearFilters}
      />

      {/* Assets List */}
      <div className="mb-6">
        <h3 className="text-sm font-bold mb-3">
          Assets ({assetsList.length})
        </h3>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {assetsList.map(asset => (
            <AssetCard
              key={asset.sensorId}
              asset={asset}
              isExpanded={isAssetExpanded(asset.sensorId)}
              onToggle={() => toggleAsset(asset.sensorId)}
              onViewOnMap={() => handleViewOnMap(asset)}
              onFilterOnly={() => handleFilterOnly(asset)}
              getTimeAgo={getTimeAgo}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default AssetsList;