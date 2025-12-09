import React from 'react';
import { Map, Mountain, Loader2 } from 'lucide-react';

export interface MapStyle {
  id: string;
  name: string;
  url: string;
  icon: string;
  is3D?: boolean;
}

export const MAP_STYLES: MapStyle[] = [
  { 
    id: 'streets',
    name: 'Calles', 
    url: 'mapbox://styles/mapbox/streets-v12',
    icon: '🗺️'
  },
  { 
    id: 'satellite',
    name: 'Satélite', 
    url: 'mapbox://styles/mapbox/satellite-streets-v12',
    icon: '🛰️'
  },
  { 
    id: 'dark',
    name: 'Oscuro', 
    url: 'mapbox://styles/mapbox/dark-v11',
    icon: '🌙'
  },
  { 
    id: 'standard-3d',
    name: '3D Terreno', 
    url: 'mapbox://styles/mapbox/standard',
    icon: '🏔️',
    is3D: true
  },
  { 
    id: 'navigation',
    name: 'Navegación', 
    url: 'mapbox://styles/mapbox/navigation-day-v1',
    icon: '🧭'
  },
  { 
    id: 'outdoors',
    name: 'Exterior', 
    url: 'mapbox://styles/mapbox/outdoors-v12',
    icon: '🌲'
  }
];

interface MapStyleControlProps {
  currentStyleId: string;
  onStyleChange: (style: MapStyle) => void;
  is3DEnabled: boolean;
  onToggle3D: (enabled: boolean) => void;
  disabled?: boolean;
}

const MapStyleControl: React.FC<MapStyleControlProps> = ({
  currentStyleId,
  onStyleChange,
  is3DEnabled,
  onToggle3D,
  disabled = false
}) => {
  const currentStyle = MAP_STYLES.find(s => s.id === currentStyleId) || MAP_STYLES[0];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
        <Map size={16} />
        Estilo de Mapa
        {disabled && (
          <Loader2 size={12} className="animate-spin text-gray-400" />
        )}
      </h3>

      {/* Mensaje de carga */}
      {disabled && (
        <div className="mb-2 text-xs text-gray-400 bg-[#27272a] rounded p-2">
          Cargando mapa...
        </div>
      )}

      {/* Grid de estilos */}
      <div className={`grid grid-cols-2 gap-2 mb-3 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {MAP_STYLES.map(style => (
          <button
            key={style.id}
            onClick={() => !disabled && onStyleChange(style)}
            disabled={disabled}
            className={`
              flex items-center gap-2 text-xs py-2 px-3 rounded transition-colors
              ${currentStyleId === style.id 
                ? 'bg-[#3b82f6] text-white' 
                : 'bg-[#27272a] hover:bg-[#3f3f46]'
              }
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
            title={disabled ? 'Espera a que el mapa cargue...' : style.name}
          >
            <span className="text-base">{style.icon}</span>
            <span className="flex-1 text-left truncate">{style.name}</span>
          </button>
        ))}
      </div>

      {/* Toggle 3D Terrain (solo para estilos compatibles) */}
      {currentStyle.is3D !== undefined && (
        <div className={`bg-[#27272a] rounded p-3 ${disabled ? 'opacity-50' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Mountain size={14} />
              <span className="text-xs font-bold">Terreno 3D</span>
            </div>
            <button
              onClick={() => !disabled && onToggle3D(!is3DEnabled)}
              disabled={disabled}
              className={`
                relative inline-flex h-5 w-9 items-center rounded-full transition-colors
                ${is3DEnabled ? 'bg-[#10b981]' : 'bg-[#3f3f46]'}
                ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
              title={disabled ? 'Espera a que el mapa cargue...' : ''}
            >
              <span
                className={`
                  inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                  ${is3DEnabled ? 'translate-x-5' : 'translate-x-1'}
                `}
              />
            </button>
          </div>
          <p className="text-xs text-gray-400">
            {is3DEnabled 
              ? 'Elevación de terreno activada con exageración 1.5x' 
              : 'Mapa plano sin elevación'
            }
          </p>
        </div>
      )}

      {/* Info adicional */}
      <div className="mt-2 text-xs text-gray-400">
        <p>
          Estilo actual: <span className="text-gray-200">{currentStyle.name}</span>
        </p>
        {disabled && (
          <p className="text-yellow-500 mt-1">
            ⏳ Esperando inicialización del mapa...
          </p>
        )}
      </div>
    </div>
  );
};

export default MapStyleControl;