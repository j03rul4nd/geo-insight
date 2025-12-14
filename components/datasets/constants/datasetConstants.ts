// constants/datasetConstants.ts
import { Upload, Wifi, Globe, Webhook } from 'lucide-react';

// 🆕 Definimos TabType aquí ya que no existe en types/Datasets
export type TabType = 'file' | 'mqtt' | 'api' | 'webhook';

export interface StatusConfig {
  color: string;
  label: string;
  glow: string;
}

export interface FilterButton {
  id: string;
  label: string;
  icon: string | null;
}

export interface TabConfig {
  id: TabType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  active: { color: 'bg-green-500', label: 'Live', glow: 'shadow-green-500/50' },
  idle: { color: 'bg-yellow-500', label: 'Idle', glow: 'shadow-yellow-500/50' },
  error: { color: 'bg-red-500', label: 'Error', glow: 'shadow-red-500/50' },
  archived: { color: 'bg-gray-500', label: 'Archived', glow: '' },
  processing: { color: 'bg-blue-500', label: 'Processing', glow: 'shadow-blue-500/50' }
};

export const STATUS_FILTER_BUTTONS: FilterButton[] = [
  { id: 'all', label: 'All', icon: null },
  { id: 'active', label: 'Live', icon: '🟢' },
  { id: 'idle', label: 'Idle', icon: '🟡' },
  { id: 'error', label: 'Error', icon: '🔴' },
  { id: 'archived', label: 'Archived', icon: '📦' }
];

export const VIEW_TYPE_FILTER_BUTTONS: FilterButton[] = [
  { id: 'all', label: 'All Views', icon: null },
  { id: 'gis', label: 'GIS Map', icon: '🗺️' },
  { id: 'threejs', label: '3D View', icon: '🎨' }
];

export const TAB_CONFIGS: TabConfig[] = [
  { id: 'file', icon: Upload, label: 'Upload File' },
  { id: 'mqtt', icon: Wifi, label: 'Connect MQTT' },
  { id: 'api', icon: Globe, label: 'API Endpoint' },
  { id: 'webhook', icon: Webhook, label: 'Webhook' }
];