import React from 'react';

interface MapboxTokenErrorProps {
  accessToken: string;
}

const MapboxTokenError: React.FC<MapboxTokenErrorProps> = ({ accessToken }) => {
  const errorMessage = !accessToken || accessToken === 'TU_MAPBOX_TOKEN_AQUI'
    ? 'No Mapbox token configured'
    : 'Invalid Mapbox token';

  return (
    <div className="flex-1 relative bg-[#0a0a0a] flex items-center justify-center">
      <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-lg max-w-md text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <div className="font-bold text-lg mb-2">Mapbox Token Error</div>
        <div className="text-sm mb-4">{errorMessage}</div>
        
        <div className="text-xs text-red-300/70 space-y-2 text-left">
          <p>To fix this:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>
              Get a token from{' '}
              <a
                href="https://account.mapbox.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-red-300 transition-colors"
              >
                mapbox.com
              </a>
            </li>
            <li>
              Add to your <code className="bg-black/30 px-1 rounded">.env.local</code>:
            </li>
          </ol>
          
          <pre className="bg-black/30 p-2 rounded text-[10px] overflow-x-auto">
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
          </pre>
          
          <p className="text-[10px] mt-2">
            Or pass it as a prop:{' '}
            <code className="bg-black/30 px-1 rounded">mapboxToken="pk...."</code>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapboxTokenError;