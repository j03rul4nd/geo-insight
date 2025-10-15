import React from 'react';

interface DatasetLoaderProps {
  datasetLoading: boolean;
  dataset: unknown;
  layers: unknown;
}

const DatasetLoader: React.FC<DatasetLoaderProps> = ({ datasetLoading, dataset, layers }) => {
  if (datasetLoading || !dataset || !layers) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981] mx-auto mb-4"></div>
          <div className="text-sm text-gray-400">Loading dataset...</div>
        </div>
      </div>
    );
  }
  return null;
};

export default DatasetLoader;
