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
    [key: string]: any;
  };
}

interface MapSelectedPointCardProps {
  point: DataPoint;
  onClose: () => void;
}

const MapSelectedPointCard: React.FC<MapSelectedPointCardProps> = ({ point, onClose }) => {
  return (
    <div className="absolute top-4 right-16 bg-[#18181b]/90 backdrop-blur-sm border border-[#27272a] rounded-lg p-4 max-w-xs shadow-lg">      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-sm text-white">Selected Point</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {/* Sensor ID */}
        <div>
          <span className="text-gray-400">Sensor ID:</span>
          <span className="text-white ml-2 font-mono">{point.sensorId}</span>
        </div>

        {/* Type */}
        <div>
          <span className="text-gray-400">Type:</span>
          <span className="text-white ml-2 capitalize">
            {point.metadata?.sensorType || 'N/A'}
          </span>
        </div>

        {/* Value */}
        <div>
          <span className="text-gray-400">Value:</span>
          <span className="text-white ml-2 font-mono">
            {point.value.toFixed(2)} {point.metadata?.unit || ''}
          </span>
        </div>

        {/* Position (si existe) */}
        {typeof point.metadata?.x === 'number' && (
          <div>
            <span className="text-gray-400">Position:</span>
            <div className="text-white ml-2 font-mono text-[10px] leading-relaxed">
              Lng: {point.metadata.x.toFixed(6)}<br/>
              Lat: {point.metadata.y?.toFixed(6)}<br/>
              {point.metadata.z && `Alt: ${point.metadata.z.toFixed(1)}m`}
            </div>
          </div>
        )}

        {/* Timestamp */}
        <div>
          <span className="text-gray-400">Timestamp:</span>
          <span className="text-white ml-2 font-mono text-[10px]">
            {new Date(point.timestamp).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MapSelectedPointCard;