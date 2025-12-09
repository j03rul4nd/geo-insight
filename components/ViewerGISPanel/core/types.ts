
import type { VisualizationLayer } from '@/hooks/useVisualizationLayers';

export interface DataPoint {
  id: string;
  datasetId: string;
  value: number;
  sensorId: string;
  timestamp: Date | string;
  metadata?: {
    x?: number;
    y?: number;
    z?: number;
    sensorType?: string;
    unit?: string;
    [key: string]: any;
  };
}

export interface AssetTracker {
  marker: mapboxgl.Marker;
  trail: [number, number][];
  lastUpdate: number;
  currentPoint: DataPoint;
}

export interface AssetTrackerOptions {
  maxTrailLength: number;
  animationDuration: number;
  onPointSelect: (point: DataPoint) => void;
}

export interface MapView {
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface ViewerGISPanelProps {
  dataPoints: DataPoint[];
  layers: VisualizationLayer[];
  selectedPoint: DataPoint | null;
  onPointSelect: (point: DataPoint | null) => void;
  colorMode: 'heatmap' | 'sensor-type';
  valueRange: { min: number; max: number };
  isLive: boolean;
  onViewChange?: (view: MapView) => void;
  mapboxToken?: string;
  maxTrailLength?: number;
  animationDuration?: number;
  onMapReady?: () => void;
}

export interface MapConfig {
  defaultCenter: [number, number];
  defaultZoom: number;
  defaultPitch: number;
  defaultBearing: number;
  style: string;
  maxTrailLength: number;
  animationDuration: number;
}

export const DEFAULT_MAP_CONFIG: MapConfig = {
  defaultCenter: [0, 0],
  defaultZoom: 2,
  defaultPitch: 0,
  defaultBearing: 0,
  style: 'mapbox://styles/mapbox/dark-v11',
  maxTrailLength: 50,
  animationDuration: 1000
};