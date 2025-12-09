import { useMemo, useState, useCallback } from 'react';
import type { DataPoint, Asset } from '../types';

// ============================================
// CORE LOGIC: useAssetsList Hook
// ============================================

interface UseAssetsListProps {
  dataPoints: DataPoint[];
}

export const useAssetsList = ({ dataPoints }: UseAssetsListProps) => {
  const [expandedAssetId, setExpandedAssetId] = useState<string | null>(null);

  // Group data points by asset (sensorId)
  const assetsList = useMemo((): Asset[] => {
    if (!dataPoints || dataPoints.length === 0) return [];
    
    const byAsset: Record<string, DataPoint[]> = {};
    
    dataPoints.forEach(point => {
      const assetId = point.sensorId;
      if (!byAsset[assetId]) {
        byAsset[assetId] = [];
      }
      byAsset[assetId].push(point);
    });

    return Object.entries(byAsset).map(([sensorId, points]): Asset => {
      // Sort by timestamp descending to get the most recent
      const sortedPoints = [...points].sort((a, b) => {
        const timeA = typeof a.timestamp === 'string' 
          ? new Date(a.timestamp).getTime() 
          : a.timestamp.getTime();
        const timeB = typeof b.timestamp === 'string' 
          ? new Date(b.timestamp).getTime() 
          : b.timestamp.getTime();
        return timeB - timeA;
      });
      
      const latestPoint = sortedPoints[0];
      
      return {
        sensorId,
        sensorType: latestPoint.metadata?.sensorType || 'unknown',
        dataPointCount: points.length,
        latestValue: latestPoint.value,
        latestTimestamp: latestPoint.timestamp,
        latestMetadata: latestPoint.metadata,
        allPoints: sortedPoints
      };
    }).sort((a, b) => a.sensorId.localeCompare(b.sensorId));
  }, [dataPoints]);

  // Get unique sensor types for filter
  const uniqueSensorTypes = useMemo(() => {
    if (!assetsList || assetsList.length === 0) return [];
    const types = new Set(assetsList.map(asset => asset.sensorType));
    return Array.from(types).sort();
  }, [assetsList]);

  // Toggle asset expansion
  const toggleAsset = useCallback((assetId: string) => {
    setExpandedAssetId(prev => prev === assetId ? null : assetId);
  }, []);

  // Check if asset is expanded
  const isAssetExpanded = useCallback((assetId: string) => {
    return expandedAssetId === assetId;
  }, [expandedAssetId]);

  // Get time ago helper
  const getTimeAgo = useCallback((date: Date | string): string => {
    const timestamp = typeof date === 'string' ? new Date(date) : date;
    const seconds = Math.floor((Date.now() - timestamp.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }, []);

  return {
    assetsList,
    uniqueSensorTypes,
    expandedAssetId,
    toggleAsset,
    isAssetExpanded,
    getTimeAgo
  };
};