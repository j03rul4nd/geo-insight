import React from 'react';
import { Layers, Navigation, Square } from 'lucide-react';
import { ASSET_PRESETS } from '@/hooks/useVisualizationLayers';

interface QuickPresetsProps {
  onApplyPreset: (presetName: keyof typeof ASSET_PRESETS) => void;
  isLoading: boolean;
}

export const QuickPresets: React.FC<QuickPresetsProps> = ({ 
  onApplyPreset, 
  isLoading 
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Quick Start</label>
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onApplyPreset('staticSensor')}
          disabled={isLoading}
          className="p-3 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors
                     disabled:opacity-50 flex flex-col items-center gap-2"
        >
          <Layers size={20} className="text-blue-400" />
          <span className="text-xs">Static Point</span>
        </button>
        
        <button
          type="button"
          onClick={() => onApplyPreset('movingVehicle')}
          disabled={isLoading}
          className="p-3 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors
                     disabled:opacity-50 flex flex-col items-center gap-2"
        >
          <Navigation size={20} className="text-green-400" />
          <span className="text-xs">Moving Asset</span>
        </button>
        
        <button
          type="button"
          onClick={() => onApplyPreset('coverageArea')}
          disabled={isLoading}
          className="p-3 bg-[#27272a] hover:bg-[#3f3f46] rounded-lg transition-colors
                     disabled:opacity-50 flex flex-col items-center gap-2"
        >
          <Square size={20} className="text-purple-400" />
          <span className="text-xs">Coverage Area</span>
        </button>
      </div>
    </div>
  );
};