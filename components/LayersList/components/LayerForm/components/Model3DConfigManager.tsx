import React, { useState } from 'react';
import type { 
  Model3DConfig 
} from '@/hooks/useVisualizationLayers';

// Subcomponente para configuración de modelos 3D
interface Model3DConfigManagerProps {
  modelUrl: string;
  config: Model3DConfig;
  onChange: (config: Model3DConfig) => void;
  isLoading: boolean;
}

export const Model3DConfigManager: React.FC<Model3DConfigManagerProps> = ({
  modelUrl,
  config,
  onChange,
  isLoading
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>('transform');

  const toggleSection = (section: string) => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  const updateConfig = (updates: Partial<Model3DConfig>) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-3 mt-3">
      <div className="text-xs font-semibold text-gray-400 uppercase flex items-center gap-2">
        <span>🎮 3D Model Configuration</span>
        {modelUrl && (
          <span className="text-green-400">✓ Model loaded</span>
        )}
      </div>

      {/* Transform Section */}
      <div className="bg-[#18181b]/50 rounded border border-[#3f3f46] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('transform')}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#27272a]/50 transition-colors"
        >
          <span className="text-sm font-medium">Transform</span>
          <span className="text-gray-400">{expandedSection === 'transform' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'transform' && (
          <div className="p-3 space-y-3 border-t border-[#3f3f46]">
            {/* Scale */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Scale (X, Y, Z)</label>
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((axis, idx) => (
                  <div key={axis}>
                    <input
                      type="number"
                      value={config.scale?.[idx] ?? 1}
                      onChange={(e) => {
                        const newScale = [...(config.scale || [1, 1, 1])];
                        newScale[idx] = parseFloat(e.target.value) || 1;
                        updateConfig({ scale: newScale as [number, number, number] });
                      }}
                      step="0.1"
                      min="0.01"
                      disabled={isLoading}
                      className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                                 focus:border-[#3b82f6] focus:outline-none"
                      placeholder={axis.toUpperCase()}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Rotation */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Rotation (X, Y, Z) degrees</label>
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((axis, idx) => (
                  <div key={axis}>
                    <input
                      type="number"
                      value={config.rotation?.[idx] ?? 0}
                      onChange={(e) => {
                        const newRotation = [...(config.rotation || [0, 0, 0])];
                        newRotation[idx] = parseFloat(e.target.value) || 0;
                        updateConfig({ rotation: newRotation as [number, number, number] });
                      }}
                      step="15"
                      min="0"
                      max="360"
                      disabled={isLoading}
                      className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                                 focus:border-[#3b82f6] focus:outline-none"
                      placeholder={axis.toUpperCase()}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Translate */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Translate (X, Y, Z) meters</label>
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((axis, idx) => (
                  <div key={axis}>
                    <input
                      type="number"
                      value={config.translate?.[idx] ?? 0}
                      onChange={(e) => {
                        const newTranslate = [...(config.translate || [0, 0, 0])];
                        newTranslate[idx] = parseFloat(e.target.value) || 0;
                        updateConfig({ translate: newTranslate as [number, number, number] });
                      }}
                      step="0.5"
                      disabled={isLoading}
                      className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                                 focus:border-[#3b82f6] focus:outline-none"
                      placeholder={axis.toUpperCase()}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orientation & Positioning */}
      <div className="bg-[#18181b]/50 rounded border border-[#3f3f46] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('orientation')}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#27272a]/50 transition-colors"
        >
          <span className="text-sm font-medium">Orientation & Positioning</span>
          <span className="text-gray-400">{expandedSection === 'orientation' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'orientation' && (
          <div className="p-3 space-y-3 border-t border-[#3f3f46]">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Orientation</label>
                <select
                  value={config.orientation || 'auto'}
                  onChange={(e) => updateConfig({ orientation: e.target.value as any })}
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                             focus:border-[#3b82f6] focus:outline-none"
                >
                  <option value="map">Map (North-aligned)</option>
                  <option value="viewport">Viewport (Camera-facing)</option>
                  <option value="auto">Auto</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Anchor Point</label>
                <select
                  value={config.anchor || 'center'}
                  onChange={(e) => updateConfig({ anchor: e.target.value as any })}
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                             focus:border-[#3b82f6] focus:outline-none"
                >
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                  <option value="top">Top</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Altitude Mode</label>
                <select
                  value={config.altitudeMode || 'clampToGround'}
                  onChange={(e) => updateConfig({ altitudeMode: e.target.value as any })}
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                             focus:border-[#3b82f6] focus:outline-none"
                >
                  <option value="clampToGround">Clamp to Ground</option>
                  <option value="relative">Relative to Ground</option>
                  <option value="absolute">Absolute</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Height Offset (m)</label>
                <input
                  type="number"
                  value={config.heightOffset || 0}
                  onChange={(e) => updateConfig({ heightOffset: parseFloat(e.target.value) || 0 })}
                  step="0.5"
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                             focus:border-[#3b82f6] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRotate"
                checked={config.autoRotate || false}
                onChange={(e) => updateConfig({ autoRotate: e.target.checked })}
                disabled={isLoading}
                className="rounded"
              />
              <label htmlFor="autoRotate" className="text-xs text-gray-300">
                Auto-rotate based on movement direction
              </label>
            </div>

            {config.autoRotate && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">
                  Rotation Offset (degrees)
                </label>
                <input
                  type="number"
                  value={config.autoRotateOffset || 0}
                  onChange={(e) => updateConfig({ autoRotateOffset: parseFloat(e.target.value) || 0 })}
                  step="15"
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                             focus:border-[#3b82f6] focus:outline-none"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Zoom & Scale */}
      <div className="bg-[#18181b]/50 rounded border border-[#3f3f46] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('zoom')}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#27272a]/50 transition-colors"
        >
          <span className="text-sm font-medium">Zoom & Scale</span>
          <span className="text-gray-400">{expandedSection === 'zoom' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'zoom' && (
          <div className="p-3 space-y-3 border-t border-[#3f3f46]">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Min Zoom Level</label>
                <input
                  type="number"
                  value={config.minZoom ?? 0}
                  onChange={(e) => updateConfig({ minZoom: parseFloat(e.target.value) || 0 })}
                  min="0"
                  max="24"
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                             focus:border-[#3b82f6] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Max Zoom Level</label>
                <input
                  type="number"
                  value={config.maxZoom ?? 24}
                  onChange={(e) => updateConfig({ maxZoom: parseFloat(e.target.value) || 24 })}
                  min="0"
                  max="24"
                  disabled={isLoading}
                  className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                             focus:border-[#3b82f6] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="scaleWithZoom"
                checked={config.scaleWithZoom || false}
                onChange={(e) => updateConfig({ scaleWithZoom: e.target.checked })}
                disabled={isLoading}
                className="rounded"
              />
              <label htmlFor="scaleWithZoom" className="text-xs text-gray-300">
                Scale model based on zoom level
              </label>
            </div>

            {config.scaleWithZoom && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">Scale Range (min, max)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={config.scaleRange?.[0] ?? 0.5}
                    onChange={(e) => {
                      const newRange = [...(config.scaleRange || [0.5, 2])];
                      newRange[0] = parseFloat(e.target.value) || 0.5;
                      updateConfig({ scaleRange: newRange as [number, number] });
                    }}
                    step="0.1"
                    min="0.1"
                    disabled={isLoading}
                    className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                               focus:border-[#3b82f6] focus:outline-none"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={config.scaleRange?.[1] ?? 2}
                    onChange={(e) => {
                      const newRange = [...(config.scaleRange || [0.5, 2])];
                      newRange[1] = parseFloat(e.target.value) || 2;
                      updateConfig({ scaleRange: newRange as [number, number] });
                    }}
                    step="0.1"
                    min="0.1"
                    disabled={isLoading}
                    className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                               focus:border-[#3b82f6] focus:outline-none"
                    placeholder="Max"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Material & Rendering */}
      <div className="bg-[#18181b]/50 rounded border border-[#3f3f46] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('material')}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#27272a]/50 transition-colors"
        >
          <span className="text-sm font-medium">Material & Rendering</span>
          <span className="text-gray-400">{expandedSection === 'material' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'material' && (
          <div className="p-3 space-y-3 border-t border-[#3f3f46]">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">
                  Metalness ({((config.metalness ?? 0.5) * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  value={config.metalness ?? 0.5}
                  onChange={(e) => updateConfig({ metalness: parseFloat(e.target.value) })}
                  min="0"
                  max="1"
                  step="0.1"
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-300">
                  Roughness ({((config.roughness ?? 0.5) * 100).toFixed(0)}%)
                </label>
                <input
                  type="range"
                  value={config.roughness ?? 0.5}
                  onChange={(e) => updateConfig({ roughness: parseFloat(e.target.value) })}
                  min="0"
                  max="1"
                  step="0.1"
                  disabled={isLoading}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Emissive Intensity</label>
              <input
                type="number"
                value={config.emissiveIntensity ?? 0}
                onChange={(e) => updateConfig({ emissiveIntensity: parseFloat(e.target.value) || 0 })}
                step="0.1"
                min="0"
                disabled={isLoading}
                className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                           focus:border-[#3b82f6] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="castShadows"
                  checked={config.castShadows ?? false}
                  onChange={(e) => updateConfig({ castShadows: e.target.checked })}
                  disabled={isLoading}
                  className="rounded"
                />
                <label htmlFor="castShadows" className="text-xs text-gray-300">
                  Cast shadows
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="receiveShadows"
                  checked={config.receiveShadows ?? false}
                  onChange={(e) => updateConfig({ receiveShadows: e.target.checked })}
                  disabled={isLoading}
                  className="rounded"
                />
                <label htmlFor="receiveShadows" className="text-xs text-gray-300">
                  Receive shadows
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance & Optimization */}
      <div className="bg-[#18181b]/50 rounded border border-[#3f3f46] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('performance')}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#27272a]/50 transition-colors"
        >
          <span className="text-sm font-medium">Performance & Optimization</span>
          <span className="text-gray-400">{expandedSection === 'performance' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'performance' && (
          <div className="p-3 space-y-3 border-t border-[#3f3f46]">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="frustumCulling"
                  checked={config.frustumCulling ?? true}
                  onChange={(e) => updateConfig({ frustumCulling: e.target.checked })}
                  disabled={isLoading}
                  className="rounded"
                />
                <label htmlFor="frustumCulling" className="text-xs text-gray-300">
                  Enable frustum culling
                </label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="lodEnabled"
                  checked={config.lodEnabled || false}
                  onChange={(e) => updateConfig({ lodEnabled: e.target.checked })}
                  disabled={isLoading}
                  className="rounded"
                />
                <label htmlFor="lodEnabled" className="text-xs text-gray-300">
                  Enable Level of Detail (LOD)
                </label>
              </div>

              {config.lodEnabled && (
                <div className="space-y-2 mt-2">
                  <label className="text-xs font-medium text-gray-300">
                    LOD Distances (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={config.lodDistances?.join(', ') || ''}
                    onChange={(e) => {
                      const distances = e.target.value
                        .split(',')
                        .map(d => parseFloat(d.trim()))
                        .filter(d => !isNaN(d));
                      updateConfig({ lodDistances: distances.length > 0 ? distances : undefined });
                    }}
                    placeholder="e.g., 100, 500, 1000"
                    disabled={isLoading}
                    className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                               focus:border-[#3b82f6] focus:outline-none font-mono"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Interactivity */}
      <div className="bg-[#18181b]/50 rounded border border-[#3f3f46] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('interactivity')}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#27272a]/50 transition-colors"
        >
          <span className="text-sm font-medium">Interactivity</span>
          <span className="text-gray-400">{expandedSection === 'interactivity' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'interactivity' && (
          <div className="p-3 space-y-2 border-t border-[#3f3f46]">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="clickable"
                checked={config.clickable ?? true}
                onChange={(e) => updateConfig({ clickable: e.target.checked })}
                disabled={isLoading}
                className="rounded"
              />
              <label htmlFor="clickable" className="text-xs text-gray-300">
                Clickable
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hoverable"
                checked={config.hoverable ?? true}
                onChange={(e) => updateConfig({ hoverable: e.target.checked })}
                disabled={isLoading}
                className="rounded"
              />
              <label htmlFor="hoverable" className="text-xs text-gray-300">
                Hoverable
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Animations */}
      <div className="bg-[#18181b]/50 rounded border border-[#3f3f46] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('animations')}
          className="w-full px-3 py-2 flex items-center justify-between hover:bg-[#27272a]/50 transition-colors"
        >
          <span className="text-sm font-medium">Animations</span>
          <span className="text-gray-400">{expandedSection === 'animations' ? '▼' : '▶'}</span>
        </button>
        
        {expandedSection === 'animations' && (
          <div className="p-3 space-y-3 border-t border-[#3f3f46]">
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Idle Animation</label>
              <input
                type="text"
                value={config.animations?.idle || ''}
                onChange={(e) => updateConfig({ 
                  animations: { 
                    ...config.animations, 
                    idle: e.target.value || undefined 
                  } 
                })}
                placeholder="Animation name"
                disabled={isLoading}
                className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                           focus:border-[#3b82f6] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Moving Animation</label>
              <input
                type="text"
                value={config.animations?.moving || ''}
                onChange={(e) => updateConfig({ 
                  animations: { 
                    ...config.animations, 
                    moving: e.target.value || undefined 
                  } 
                })}
                placeholder="Animation name"
                disabled={isLoading}
                className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                           focus:border-[#3b82f6] focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-300">Animation Speed</label>
              <input
                type="number"
                value={config.animations?.speed ?? 1}
                onChange={(e) => updateConfig({ 
                  animations: { 
                    ...config.animations, 
                    speed: parseFloat(e.target.value) || 1 
                  } 
                })}
                step="0.1"
                min="0.1"
                disabled={isLoading}
                className="w-full px-2 py-1.5 bg-[#09090b] border border-[#3f3f46] rounded text-xs
                           focus:border-[#3b82f6] focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};