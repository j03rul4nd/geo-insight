import React, { useState } from 'react';
import type { 
  TrailColorMode, 
  TrailColorScheme, 
  TrailApplicationType,
  TrailPointsConfig,
  TrailValidationConfig,
  TrailGradientConfig,
  TrailColorRule,
  StaticTrailColorScheme,
  SpeedBasedTrailColorScheme,
  GradientTrailColorScheme
} from '@/hooks/useVisualizationLayers';

import { ChevronDown, ChevronUp, Plus, X, Info } from 'lucide-react';

interface TrailConfigSectionProps {
  showTrail: boolean;
  trailLength: number;
  trailWidth: number;
  trailOpacity: number;
  trailColorMode: TrailColorMode;
  trailColorScheme: TrailColorScheme;
  trailColorRules: TrailColorRule[];
  trailGradientConfig: TrailGradientConfig;
  trailValidationConfig: TrailValidationConfig;
  trailPointsConfig: TrailPointsConfig;
  onShowTrailChange: (value: boolean) => void;
  onTrailLengthChange: (value: number) => void;
  onTrailWidthChange: (value: number) => void;
  onTrailOpacityChange: (value: number) => void;
  onTrailColorModeChange: (value: TrailColorMode) => void;
  onTrailColorSchemeChange: (value: TrailColorScheme) => void;
  onTrailColorRulesChange: (value: TrailColorRule[]) => void;
  onTrailGradientConfigChange: (value: TrailGradientConfig) => void;
  onTrailValidationConfigChange: (value: TrailValidationConfig) => void;
  onTrailPointsConfigChange: (value: TrailPointsConfig) => void;
  isLoading: boolean;
}

export const TrailConfigSection: React.FC<TrailConfigSectionProps> = ({
  showTrail,
  trailLength,
  trailWidth,
  trailOpacity,
  trailColorMode,
  trailColorScheme,
  trailColorRules,
  trailGradientConfig,
  trailValidationConfig,
  trailPointsConfig,
  onShowTrailChange,
  onTrailLengthChange,
  onTrailWidthChange,
  onTrailOpacityChange,
  onTrailColorModeChange,
  onTrailColorSchemeChange,
  onTrailColorRulesChange,
  onTrailGradientConfigChange,
  onTrailValidationConfigChange,
  onTrailPointsConfigChange,
  isLoading
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showRules, setShowRules] = useState(false);

  // Helper para obtener el color estático actual
  const getStaticColor = (): string => {
    if (trailColorScheme.type === 'static') {
      return trailColorScheme.staticColor;
    }
    return '#3b82f6';
  };

  // Helper para agregar nueva regla de color
  const addColorRule = () => {
    const newRule: TrailColorRule = {
      id: `rule_${Date.now()}`,
      name: 'New Rule',
      priority: trailColorRules.length + 1,
      applicationType: 'entire-trail',
      enabled: true,
      condition: 'speed > 50',
      color: '#ef4444'
    };
    onTrailColorRulesChange([...trailColorRules, newRule]);
  };

  // Helper para eliminar regla
  const removeColorRule = (ruleId: string) => {
    onTrailColorRulesChange(trailColorRules.filter(rule => rule.id !== ruleId));
  };

  // Helper para actualizar regla
  const updateColorRule = (ruleId: string, updates: Partial<TrailColorRule>) => {
    onTrailColorRulesChange(
      trailColorRules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    );
  };

  return (
    <div className="space-y-4 p-4 bg-[#27272a]/50 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-300">Trail Configuration</h3>
        <input
          type="checkbox"
          checked={showTrail}
          onChange={(e) => onShowTrailChange(e.target.checked)}
          disabled={isLoading}
          className="w-4 h-4 rounded cursor-pointer"
        />
      </div>
      
      {showTrail && (
        <div className="space-y-3 pt-2">
          {/* Trail Length */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Trail Length (points)</label>
            <input
              type="number"
              min="1"
              max="1000"
              value={trailLength}
              onChange={(e) => onTrailLengthChange(parseInt(e.target.value) || 50)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded text-gray-200
                         focus:border-[#3b82f6] focus:outline-none"
            />
          </div>
          
          {/* Trail Width */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between text-gray-300">
              <span>Trail Width</span>
              <span className="text-xs font-mono text-gray-400">
                {(trailWidth / 10).toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="200"
              value={trailWidth}
              onChange={(e) => onTrailWidthChange(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-[#18181b] rounded-full appearance-none cursor-pointer"
            />
          </div>
          
          {/* Trail Opacity */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center justify-between text-gray-300">
              <span>Trail Opacity</span>
              <span className="text-xs font-mono text-gray-400">{trailOpacity}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={trailOpacity}
              onChange={(e) => onTrailOpacityChange(parseInt(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-[#18181b] rounded-full appearance-none cursor-pointer"
            />
          </div>
          
          {/* Trail Color Mode */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Trail Color Mode</label>
            <select
              value={trailColorMode}
              onChange={(e) => onTrailColorModeChange(e.target.value as TrailColorMode)}
              disabled={isLoading}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded text-gray-200
                         focus:border-[#3b82f6] focus:outline-none"
            >
              <option value="static">Static Color</option>
              <option value="dynamic">Dynamic</option>
              <option value="gradient">Gradient</option>
              <option value="rules">Rules Based</option>
            </select>
          </div>
          
          {/* Static Color Configuration */}
          {trailColorMode === 'static' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Static Color</label>
              <input
                type="color"
                value={getStaticColor()}
                onChange={(e) => onTrailColorSchemeChange({ 
                  type: 'static', 
                  staticColor: e.target.value 
                } as StaticTrailColorScheme)}
                disabled={isLoading}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          )}

          {/* Speed-Based Configuration */}
          {trailColorMode === 'dynamic' && (
            <div className="space-y-3 p-3 bg-[#18181b]/50 rounded border border-[#3f3f46]">
              <label className="text-sm font-medium text-gray-300">Speed-Based Configuration</label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Value key (e.g., metadata.speed)"
                  value={(trailColorScheme as SpeedBasedTrailColorScheme).valueKey || ''}
                  onChange={(e) => {
                    const current = trailColorScheme as SpeedBasedTrailColorScheme;
                    onTrailColorSchemeChange({
                      type: 'speed-based',
                      valueKey: e.target.value,
                      speedBased: current?.speedBased || {
                        lowSpeed: { threshold: 30, color: '#10b981' },
                        mediumSpeed: { threshold: 60, color: '#f59e0b' },
                        highSpeed: { threshold: 100, color: '#ef4444' }
                      }
                    });
                  }}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded text-gray-200 text-sm"
                />
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-center">
                    <div className="text-gray-400 mb-1">Low</div>
                    <div 
                      className="h-6 rounded border border-[#3f3f46]"
                      style={{ backgroundColor: (trailColorScheme as SpeedBasedTrailColorScheme)?.speedBased?.lowSpeed?.color || '#10b981' }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 mb-1">Medium</div>
                    <div 
                      className="h-6 rounded border border-[#3f3f46]"
                      style={{ backgroundColor: (trailColorScheme as SpeedBasedTrailColorScheme)?.speedBased?.mediumSpeed?.color || '#f59e0b' }}
                    />
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400 mb-1">High</div>
                    <div 
                      className="h-6 rounded border border-[#3f3f46]"
                      style={{ backgroundColor: (trailColorScheme as SpeedBasedTrailColorScheme)?.speedBased?.highSpeed?.color || '#ef4444' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gradient Configuration */}
          {trailColorMode === 'gradient' && (
            <div className="space-y-3 p-3 bg-[#18181b]/50 rounded border border-[#3f3f46]">
              <label className="text-sm font-medium text-gray-300">Gradient Configuration</label>
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Value key (e.g., metadata.speed)"
                  value={(trailColorScheme as GradientTrailColorScheme)?.valueKey || ''}
                  onChange={(e) => {
                    const current = trailColorScheme as GradientTrailColorScheme;
                    onTrailColorSchemeChange({
                      type: 'gradient',
                      valueKey: e.target.value,
                      gradient: current?.gradient || {
                        stops: [
                          { value: 0, color: '#10b981' },
                          { value: 50, color: '#f59e0b' },
                          { value: 100, color: '#ef4444' }
                        ]
                      }
                    });
                  }}
                  disabled={isLoading}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded text-gray-200 text-sm"
                />
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Info size={14} />
                  <span>Gradient will interpolate between color stops based on the value</span>
                </div>
              </div>
            </div>
          )}

          {/* Rules Configuration */}
          {trailColorMode === 'rules' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowRules(!showRules)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-white"
                >
                  {showRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  Color Rules ({trailColorRules.length})
                </button>
                <button
                  onClick={addColorRule}
                  disabled={isLoading}
                  className="p-1 rounded hover:bg-[#3f3f46] text-gray-400 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>

              {showRules && (
                <div className="space-y-2">
                  {trailColorRules.length === 0 ? (
                    <div className="p-4 bg-[#18181b] rounded border border-[#3f3f46] text-center text-sm text-gray-400">
                      No rules defined. Click + to add a rule.
                    </div>
                  ) : (
                    trailColorRules.map((rule) => (
                      <div key={rule.id} className="p-3 bg-[#18181b] rounded border border-[#3f3f46] space-y-2">
                        <div className="flex items-center justify-between">
                          <input
                            type="text"
                            value={rule.name}
                            onChange={(e) => updateColorRule(rule.id, { name: e.target.value })}
                            className="flex-1 px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-sm text-gray-200"
                            disabled={isLoading}
                            placeholder="Rule name"
                          />
                          <button
                            onClick={() => removeColorRule(rule.id)}
                            className="ml-2 p-1 rounded hover:bg-[#3f3f46] text-gray-400 hover:text-red-400 transition-colors"
                            disabled={isLoading}
                          >
                            <X size={14} />
                          </button>
                        </div>

                        <input
                          type="text"
                          placeholder="Condition (e.g., speed > 50)"
                          value={rule.condition}
                          onChange={(e) => updateColorRule(rule.id, { condition: e.target.value })}
                          className="w-full px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-sm text-gray-200"
                          disabled={isLoading}
                        />

                        <div className="flex items-center gap-2">
                          <select
                            value={rule.applicationType}
                            onChange={(e) => updateColorRule(rule.id, { 
                              applicationType: e.target.value as TrailApplicationType 
                            })}
                            className="flex-1 px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-sm text-gray-200"
                            disabled={isLoading}
                          >
                            <option value="entire-trail">Entire Trail</option>
                            <option value="current-segment">Current Segment</option>
                            <option value="future-segments">Future Segments</option>
                            <option value="historical">Historical</option>
                          </select>

                          <input
                            type="color"
                            value={rule.color}
                            onChange={(e) => updateColorRule(rule.id, { color: e.target.value })}
                            className="w-12 h-8 rounded cursor-pointer"
                            disabled={isLoading}
                          />
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <label className="flex items-center gap-2 text-gray-400">
                            <input
                              type="checkbox"
                              checked={rule.enabled}
                              onChange={(e) => updateColorRule(rule.id, { enabled: e.target.checked })}
                              className="w-3 h-3 rounded"
                              disabled={isLoading}
                            />
                            Enabled
                          </label>
                          <span className="text-gray-500">Priority: {rule.priority}</span>
                        </div>

                        {rule.description && (
                          <div className="text-xs text-gray-400 italic">{rule.description}</div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Advanced Settings */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-300 mt-4 transition-colors"
          >
            {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            Advanced Settings
          </button>

          {showAdvanced && (
            <div className="space-y-4 p-3 bg-[#18181b]/50 rounded border border-[#3f3f46]">
              {/* Gradient Config */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <input
                    type="checkbox"
                    checked={trailGradientConfig.enabled}
                    onChange={(e) => onTrailGradientConfigChange({
                      ...trailGradientConfig,
                      enabled: e.target.checked
                    })}
                    className="w-4 h-4 rounded"
                    disabled={isLoading}
                  />
                  Fade Old Segments
                </label>
                
                {trailGradientConfig.enabled && (
                  <div className="pl-6 space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Fade Start Age (points)</label>
                      <input
                        type="number"
                        min="0"
                        value={trailGradientConfig.fadeStartAge || 30}
                        onChange={(e) => onTrailGradientConfigChange({
                          ...trailGradientConfig,
                          fadeStartAge: parseInt(e.target.value)
                        })}
                        className="w-full px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-sm text-gray-200"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Fade End Age (points)</label>
                      <input
                        type="number"
                        min="0"
                        value={trailGradientConfig.fadeEndAge || 100}
                        onChange={(e) => onTrailGradientConfigChange({
                          ...trailGradientConfig,
                          fadeEndAge: parseInt(e.target.value)
                        })}
                        className="w-full px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-sm text-gray-200"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Min Opacity</label>
                      <input
                        type="number"
                        min="0"
                        max="1"
                        step="0.1"
                        value={trailGradientConfig.minOpacity || 0.2}
                        onChange={(e) => onTrailGradientConfigChange({
                          ...trailGradientConfig,
                          minOpacity: parseFloat(e.target.value)
                        })}
                        className="w-full px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-sm text-gray-200"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Validation Config */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <input
                    type="checkbox"
                    checked={trailValidationConfig.enableValidation || false}
                    onChange={(e) => onTrailValidationConfigChange({
                      ...trailValidationConfig,
                      enableValidation: e.target.checked
                    })}
                    className="w-4 h-4 rounded"
                    disabled={isLoading}
                  />
                  Enable Trail Validation
                </label>
                
                {trailValidationConfig.enableValidation && (
                  <div className="pl-6 space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Min Distance Threshold (m)</label>
                      <input
                        type="number"
                        min="0"
                        value={trailValidationConfig.minDistanceThreshold || 5}
                        onChange={(e) => onTrailValidationConfigChange({
                          ...trailValidationConfig,
                          minDistanceThreshold: parseInt(e.target.value)
                        })}
                        className="w-full px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-sm text-gray-200"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Max Time Between Points (ms)</label>
                      <input
                        type="number"
                        min="0"
                        value={trailValidationConfig.maxTimeBetweenPoints || 60000}
                        onChange={(e) => onTrailValidationConfigChange({
                          ...trailValidationConfig,
                          maxTimeBetweenPoints: parseInt(e.target.value)
                        })}
                        className="w-full px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-sm text-gray-200"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Points Config */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <input
                    type="checkbox"
                    checked={trailPointsConfig.showHistoricalPoints || false}
                    onChange={(e) => onTrailPointsConfigChange({
                      ...trailPointsConfig,
                      showHistoricalPoints: e.target.checked
                    })}
                    className="w-4 h-4 rounded"
                    disabled={isLoading}
                  />
                  Show Historical Points
                </label>

                {trailPointsConfig.showHistoricalPoints && (
                  <div className="pl-6 space-y-3">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Point Interval</label>
                      <input
                        type="number"
                        min="1"
                        value={trailPointsConfig.pointInterval || 10}
                        onChange={(e) => onTrailPointsConfigChange({
                          ...trailPointsConfig,
                          pointInterval: parseInt(e.target.value)
                        })}
                        className="w-full px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-sm text-gray-200"
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Point Size</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={trailPointsConfig.pointSize || 3}
                        onChange={(e) => onTrailPointsConfigChange({
                          ...trailPointsConfig,
                          pointSize: parseInt(e.target.value)
                        })}
                        className="w-full px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-sm text-gray-200"
                        disabled={isLoading}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-400">
                      <input
                        type="checkbox"
                        checked={trailPointsConfig.fadeWithAge || false}
                        onChange={(e) => onTrailPointsConfigChange({
                          ...trailPointsConfig,
                          fadeWithAge: e.target.checked
                        })}
                        className="w-3 h-3 rounded"
                        disabled={isLoading}
                      />
                      Fade with age
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};