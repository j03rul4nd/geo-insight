// utils/datasetUtils.ts
import type { ViewType } from '@/types/Datasets';

export const getHealthColor = (health?: number): string => {
  if (!health) return 'bg-gray-500';
  if (health >= 95) return 'bg-green-500';
  if (health >= 80) return 'bg-yellow-500';
  return 'bg-red-500';
};

export const getHealthTextColor = (health?: number): string => {
  if (!health || health < 80) return 'text-red-500';
  if (health < 95) return 'text-yellow-500';
  return 'text-green-500';
};

export const getViewTypeIcon = (viewType: ViewType): string => {
  return viewType === 'threejs' ? '🎨' : '🗺️';
};

export const getViewTypeLabel = (viewType: ViewType): string => {
  return viewType === 'threejs' ? '3D View' : 'GIS Map';
};

export const formatLastUpdated = (date?: Date): string => {
  if (!date) return 'Never';
  
  const now = new Date();
  const lastUpdate = new Date(date);
  const diffMs = now.getTime() - lastUpdate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return lastUpdate.toLocaleDateString();
};