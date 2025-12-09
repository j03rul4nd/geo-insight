/**
 * Default layers seed
 * Layers por defecto que se crean cuando un dataset no tiene ninguna
 */

import type { ColorScheme } from '@/hooks/useVisualizationLayers';

export interface DefaultLayerSeed {
  name: string;
  description: string | null;
  enabled: boolean;
  order: number;
  colorScheme: ColorScheme;
  opacity: number;
  pointSize: number;
  filterQuery: string | null;
}

export const DEFAULT_LAYERS: DefaultLayerSeed[] = [
  {
    name: 'All Sensors',
    description: 'Shows all sensor data points',
    enabled: true,
    order: 0,
    colorScheme: {
      type: 'gradient',
      low: '#0066ff',
      high: '#ff0000',
    },
    opacity: 1.0,
    pointSize: 1.0,
    filterQuery: null,
  },
  {
    name: 'Temperature Sensors',
    description: 'Only temperature readings',
    enabled: false,
    order: 1,
    colorScheme: {
      type: 'solid',
      color: '#f59e0b',
    },
    opacity: 1.0,
    pointSize: 1.2,
    filterQuery: "sensorType = 'temperature'",
  },
  {
    name: 'High Values',
    description: 'Values above threshold',
    enabled: false,
    order: 2,
    colorScheme: {
      type: 'solid',
      color: '#ef4444',
    },
    opacity: 0.8,
    pointSize: 1.5,
    filterQuery: 'value > 70',
  },
];