// ============================================
// TYPES for AssetsList Component
// ============================================

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

export interface Asset {
  sensorId: string;
  sensorType: string;
  dataPointCount: number;
  latestValue: number;
  latestTimestamp: Date | string;
  latestMetadata?: {
    x?: number;
    y?: number;
    z?: number;
    sensorType?: string;
    unit?: string;
    [key: string]: any;
  };
  allPoints: DataPoint[];
}

export interface AssetsListProps {
  dataPoints: DataPoint[];
  filters: {
    sensorType?: string;
    sensorId?: string;
  };
  onFilterChange: (filters: { sensorType?: string; sensorId?: string }) => void;
  onClearFilters: () => void;
  onPointSelect: (point: DataPoint) => void;
  collapsed?: boolean;
}

export interface AssetCardProps {
  asset: Asset;
  isExpanded: boolean;
  onToggle: () => void;
  onViewOnMap: () => void;
  onFilterOnly: () => void;
}

export interface AssetFiltersProps {
  selectedType: string;
  availableTypes: string[];
  hasActiveFilters: boolean;
  onTypeChange: (type: string) => void;
  onClearFilters: () => void;
}