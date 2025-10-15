import React from 'react';

// Define la interfaz de las props
interface Dataset {
  source?: string;
  mqttTopic?: string;
  // Puedes agregar otros campos según sea necesario
}

interface LoadingOverlayProps {
  dataPointsLoading: boolean;
  wsStatus?: string;
  dataset?: Dataset;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  dataPointsLoading,
  wsStatus,
  dataset,
}) => {
  if (!dataPointsLoading) return null; // No mostrar nada si no está cargando

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-gray-100 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mx-auto mb-4"></div>
        <div className="text-sm text-gray-400 mb-2">
          {dataPointsLoading ? (
            <>
              Connecting to real-time stream...
              <div className="text-xs text-gray-500 mt-2">
                Status: <span className="text-[#10b981]">{wsStatus}</span>
              </div>
            </>
          ) : (
            'Loading statistics...'
          )}
        </div>
        {dataset?.source === 'mqtt_stream' && dataset?.mqttTopic && (
          <div className="text-xs text-gray-500 mt-4">
            MQTT: <code className="text-[#10b981]">{dataset.mqttTopic}</code>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadingOverlay;
