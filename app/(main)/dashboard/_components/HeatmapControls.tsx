import React, { useState } from 'react';
import { Flame, Wind, Thermometer, Users, Eye, EyeOff } from 'lucide-react';

interface HeatmapControlsProps {
  onToggle: (heatmapId: string, visible: boolean) => void;
}

interface HeatmapLayer {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const HeatmapControls: React.FC<HeatmapControlsProps> = ({ onToggle }) => {
  const [visibleLayers, setVisibleLayers] = useState<Record<string, boolean>>({
    'traffic-heatmap': false,
    'pollution-heatmap': false,
    'temperature-heatmap': false,
    'crowd-heatmap': true,
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const heatmapLayers: HeatmapLayer[] = [
    {
      id: 'traffic-heatmap',
      name: 'Traffic',
      icon: <Flame className="w-4 h-4" />,
      color: '#ef4444',
      description: 'Traffic congestion levels',
    },
    {
      id: 'pollution-heatmap',
      name: 'Pollution',
      icon: <Wind className="w-4 h-4" />,
      color: '#8b5cf6',
      description: 'Air quality index',
    },
    {
      id: 'temperature-heatmap',
      name: 'Temperature',
      icon: <Thermometer className="w-4 h-4" />,
      color: '#f59e0b',
      description: 'Urban heat distribution',
    },
    {
      id: 'crowd-heatmap',
      name: 'Crowd',
      icon: <Users className="w-4 h-4" />,
      color: '#3b82f6',
      description: 'People density',
    },
  ];

  const handleToggle = (layerId: string) => {
    const newVisibility = !visibleLayers[layerId];
    setVisibleLayers(prev => ({
      ...prev,
      [layerId]: newVisibility,
    }));
    onToggle(layerId, newVisibility);
  };

  return (
    <div className="fixed top-24 right-4 sm:right-6 md:right-8 z-30 w-64 sm:w-72">
      {/* Header */}
      <div 
        className="bg-gradient-to-br from-black/70 to-black/50 backdrop-blur-2xl rounded-2xl border border-white/20 px-5 py-3.5 cursor-pointer hover:border-white/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse"></div>
              <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-blue-400/50 animate-ping"></div>
            </div>
            <div>
              <span className="text-sm font-medium text-white/95 tracking-wide">Heatmap Layers</span>
              <div className="text-[9px] text-white/30 font-light mt-0.5">
                {Object.values(visibleLayers).filter(Boolean).length} active
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {heatmapLayers.map((layer) => (
                visibleLayers[layer.id] && (
                  <div 
                    key={layer.id}
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: layer.color }}
                  />
                )
              ))}
            </div>
            <div 
              className={`transform transition-all duration-500 ${isExpanded ? 'rotate-180' : 'rotate-0'} group-hover:scale-110`}
            >
              <svg className="w-4 h-4 text-white/60 group-hover:text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Layers List */}
      <div 
        className={`bg-black/60 backdrop-blur-2xl rounded-b-2xl border border-white/10 overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-2">
          {heatmapLayers.map((layer, index) => (
            <button
              key={layer.id}
              onClick={() => handleToggle(layer.id)}
              className={`w-full mb-2 last:mb-0 rounded-xl p-3 border transition-all duration-300 hover:scale-[1.02] ${
                visibleLayers[layer.id]
                  ? 'bg-white/5 border-white/20 shadow-lg'
                  : 'bg-transparent border-white/5 opacity-60 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Icon */}
                  <div 
                    className={`w-9 h-9 rounded-lg flex items-center justify-center backdrop-blur-xl border transition-all duration-300 ${
                      visibleLayers[layer.id]
                        ? 'bg-opacity-20 border-opacity-40 shadow-lg'
                        : 'bg-opacity-10 border-opacity-20'
                    }`}
                    style={{ 
                      backgroundColor: `${layer.color}33`,
                      borderColor: `${layer.color}66`,
                      boxShadow: visibleLayers[layer.id] ? `0 0 20px ${layer.color}40` : 'none'
                    }}
                  >
                    <div style={{ color: layer.color }}>
                      {layer.icon}
                    </div>
                  </div>

                  {/* Text */}
                  <div className="text-left">
                    <div className="text-sm font-light text-white/90 mb-0.5">
                      {layer.name}
                    </div>
                    <div className="text-[10px] text-white/40 font-light">
                      {layer.description}
                    </div>
                  </div>
                </div>

                {/* Toggle Indicator */}
                <div className={`transition-all duration-300 ${
                  visibleLayers[layer.id] ? 'opacity-100 scale-100' : 'opacity-40 scale-90'
                }`}>
                  {visibleLayers[layer.id] ? (
                    <Eye className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-white/30" />
                  )}
                </div>
              </div>

              {/* Active Indicator Bar */}
              {visibleLayers[layer.id] && (
                <div className="mt-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <div 
                      className="flex-1 h-1 rounded-full overflow-hidden"
                      style={{ backgroundColor: `${layer.color}20` }}
                    >
                      <div 
                        className="h-full rounded-full animate-pulse"
                        style={{ 
                          backgroundColor: layer.color,
                          width: '100%',
                          boxShadow: `0 0 10px ${layer.color}`
                        }}
                      />
                    </div>
                    <span className="text-[9px] text-white/40 font-light uppercase tracking-wider">
                      Active
                    </span>
                  </div>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer Stats */}
        <div className="px-4 py-3 border-t border-white/5 bg-black/20">
          <div className="flex items-center justify-between text-[10px] text-white/40">
            <span className="font-light">
              {Object.values(visibleLayers).filter(Boolean).length} / {heatmapLayers.length} active
            </span>
            <span className="font-light uppercase tracking-wider">
              Live Data
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};


export default HeatmapControls;