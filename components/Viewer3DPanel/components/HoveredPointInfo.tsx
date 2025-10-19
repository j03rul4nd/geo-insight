import React from 'react';

interface DataPoint {
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
    sensorId?: string;
    [key: string]: any;
  };
}

interface HoveredPointInfoProps {
  hoveredPoint: DataPoint | null;
  selectedPoint: DataPoint | null;
}

const HoveredPointInfo: React.FC<HoveredPointInfoProps> = ({ 
  hoveredPoint, 
  selectedPoint 
}) => {
  if (!hoveredPoint || selectedPoint) return null;

  return (
    <div className="absolute top-4 right-4 bg-[#18181b]/90 backdrop-blur px-3 py-2 rounded text-xs">
      <div className="text-gray-400 mb-1">
        {hoveredPoint.metadata?.sensorType || 'Sensor'}
      </div>
      <div className="text-white font-bold">
        Value: {hoveredPoint.value.toFixed(2)}
      </div>
      {hoveredPoint.metadata?.sensorId && (
        <div className="text-gray-500 text-xs mt-1">
          ID: {hoveredPoint.metadata.sensorId}
        </div>
      )}
      <div className="text-gray-500 text-xs mt-1">
        Position: ({hoveredPoint.metadata?.x?.toFixed(1) || 0}, 
        {hoveredPoint.metadata?.y?.toFixed(1) || 0}, 
        {hoveredPoint.metadata?.z?.toFixed(1) || 0})
      </div>
    </div>
  );
};

export default HoveredPointInfo;