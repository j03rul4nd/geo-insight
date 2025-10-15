import React from 'react';

interface DatasetErrorProps {
  datasetError: string | null;
  reconnectWS: () => void;
  // Puedes agregar más props si lo necesitas
}

const DatasetError: React.FC<DatasetErrorProps> = ({ datasetError, reconnectWS }) => {
  if (!datasetError) return null;
  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-gray-100 flex items-center justify-center">
      <div className="text-center">
        {/* Sustituye por tu icono preferido */}
        <svg
          className="mx-auto mb-4 text-red-500"
          width={48}
          height={48}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-.01 3.14A9.7 9.7 0 1 1 21.71 7.29 9.71 9.71 0 0 1 12 21.14zm0-8.14V9"
          />
        </svg>
        <div className="text-sm text-gray-400 mb-4">{datasetError}</div>
        <button
          onClick={reconnectWS}
          className="px-4 py-2 bg-[#3b82f6] hover:bg-[#2563eb] rounded text-sm"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};

export default DatasetError;
