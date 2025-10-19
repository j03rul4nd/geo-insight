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

interface SelectedPointInfoProps {
  selectedPoint: DataPoint | null;
}

const SelectedPointInfo: React.FC<SelectedPointInfoProps> = ({ selectedPoint }) => {
  if (!selectedPoint) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#18181b]/90 backdrop-blur px-4 py-3 rounded text-xs border-2 border-[#3b82f6]">
      <div className="text-[#3b82f6] font-bold mb-2">
        Selected: {selectedPoint.metadata?.sensorType || 'Sensor'}
      </div>
      <div className="text-white">
        Value: {selectedPoint.value.toFixed(2)}
      </div>
      {selectedPoint.metadata?.sensorId && (
        <div className="text-gray-400 mt-1">
          ID: {selectedPoint.metadata.sensorId}
        </div>
      )}
      <div className="text-gray-400 mt-1">
        Position: ({selectedPoint.metadata?.x?.toFixed(1) || 0}, 
        {selectedPoint.metadata?.y?.toFixed(1) || 0}, 
        {selectedPoint.metadata?.z?.toFixed(1) || 0})
      </div>
    </div>
  );
};

export default SelectedPointInfo;