import React from 'react';
import type { AssetCardProps } from '../types';
import MetadataViewer from './MetadataViewer';

// ============================================
// COMPONENT: AssetCard
// ============================================

interface AssetCardInternalProps extends AssetCardProps {
  getTimeAgo: (date: Date | string) => string;
}

const AssetCard: React.FC<AssetCardInternalProps> = ({
  asset,
  isExpanded,
  onToggle,
  onViewOnMap,
  onFilterOnly,
  getTimeAgo
}) => {
  return (
    <div className="bg-[#27272a] rounded overflow-hidden">
      {/* Asset Header - Clickeable */}
      <button
        onClick={onToggle}
        className="w-full p-2 hover:bg-[#3f3f46] transition-colors text-left"
      >
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold">{asset.sensorId}</span>
          <span className="text-xs text-gray-400">
            {asset.dataPointCount} pts
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400 capitalize">
            {asset.sensorType}
          </span>
          <span className="text-xs text-[#10b981]">
            {asset.latestValue.toFixed(2)}
          </span>
        </div>
      </button>

      {/* Asset Details - Expandible */}
      {isExpanded && (
        <div className="p-3 bg-[#1a1a1a] border-t border-[#3f3f46] space-y-3">
          {/* Latest Value */}
          <div>
            <div className="text-xs text-gray-400 mb-1 font-bold">Latest Value</div>
            <div className="text-white text-sm font-bold">
              {asset.latestValue}
              {asset.latestMetadata?.unit && (
                <span className="text-gray-400 ml-1 text-xs">
                  {asset.latestMetadata.unit}
                </span>
              )}
            </div>
          </div>

          {/* Timestamp */}
          <div>
            <div className="text-xs text-gray-400 mb-1 font-bold">Last Updated</div>
            <div className="text-white text-xs">
              {getTimeAgo(asset.latestTimestamp)}
            </div>
          </div>

          {/* Coordinates (if available) - Quick View */}
          {(asset.latestMetadata?.x !== undefined || 
            asset.latestMetadata?.y !== undefined ||
            asset.latestMetadata?.z !== undefined) && (
            <div>
              <div className="text-xs text-gray-400 mb-1 font-bold">Position</div>
              <div className="text-white font-mono text-xs bg-[#27272a] rounded p-2">
                {asset.latestMetadata?.x !== undefined && (
                  <div>X: {asset.latestMetadata.x.toFixed(2)}</div>
                )}
                {asset.latestMetadata?.y !== undefined && (
                  <div>Y: {asset.latestMetadata.y.toFixed(2)}</div>
                )}
                {asset.latestMetadata?.z !== undefined && (
                  <div>Z: {asset.latestMetadata.z.toFixed(2)}</div>
                )}
              </div>
            </div>
          )}

          {/* Metadata Viewer - Recursive Tree */}
          {asset.latestMetadata && Object.keys(asset.latestMetadata).length > 0 && (
            <div>
              <div className="text-xs text-gray-400 mb-2 font-bold">Full Metadata</div>
              <div className="bg-[#27272a] rounded p-2 max-h-[300px] overflow-y-auto">
                <MetadataViewer data={asset.latestMetadata} />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onViewOnMap}
              className="flex-1 py-1.5 text-xs bg-[#3b82f6] hover:bg-[#2563eb] 
                         rounded transition-colors font-medium"
            >
              View on Map
            </button>
            <button
              onClick={onFilterOnly}
              className="flex-1 py-1.5 text-xs bg-[#27272a] hover:bg-[#3f3f46] 
                         rounded transition-colors font-medium"
            >
              Filter Only
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetCard;