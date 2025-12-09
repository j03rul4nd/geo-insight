/**
 * ColorSchemeEditor - Editor de esquemas de color
 * Gradient, Solid, Heatmap, Categorical, Threshold
 * FIXED: No auto-guarda al cambiar de tipo, solo al modificar valores
 */

'use client';

import React from 'react';
import { Palette, Droplet, Flame, Grid, TrendingUp, Plus, Trash2, GripVertical } from 'lucide-react';
import { ColorSchemeEditorProps, ColorSchemeType } from '../types';
import { getSchemeTypeName } from '../core/layersUtils';
import { PRESET_COLOR_SCHEMES, ColorScheme, HeatmapColorScheme, CategoricalColorScheme, ThresholdColorScheme } from '@/hooks/useVisualizationLayers';

export const ColorSchemeEditor: React.FC<ColorSchemeEditorProps> = ({
  colorScheme,
  onChange,
  disabled = false
}) => {

  // ============================================================================
  // ESTADO LOCAL - No propagar cambios de tipo inmediatamente
  // ============================================================================
  const [localScheme, setLocalScheme] = React.useState<ColorScheme>(colorScheme);

  // Sincronizar cuando cambie desde fuera (props)
  React.useEffect(() => {
    setLocalScheme(colorScheme);
  }, [colorScheme]);

  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  // Cambio de tipo: Solo actualiza local, NO propaga
  const handleTypeChange = (type: ColorSchemeType) => {
    let preset: ColorScheme;
    
    switch (type) {
      case 'solid':
        preset = { ...PRESET_COLOR_SCHEMES.monochrome } as ColorScheme;
        break;
      case 'gradient':
        preset = { ...PRESET_COLOR_SCHEMES.temperature } as ColorScheme;
        break;
      case 'heatmap':
        preset = { ...PRESET_COLOR_SCHEMES.pressure } as ColorScheme;
        break;
      case 'categorical':
        preset = { ...PRESET_COLOR_SCHEMES.categorical } as ColorScheme;
        break;
      case 'threshold':
        preset = {
          type: 'threshold' as const,
          valueKey: 'value',
          thresholdRanges: [
            { min: 0, max: 25, color: '#10b981', label: 'Low' },
            { min: 25, max: 50, color: '#f59e0b', label: 'Medium' },
            { min: 50, max: 75, color: '#ef4444', label: 'High' },
            { min: 75, max: 100, color: '#7c3aed', label: 'Critical' },
          ]
        };
        break;
      default:
        preset = { type: 'solid' as const, color: '#888888' };
    }
    
    // Solo actualizar estado local, NO propagar al formulario
    setLocalScheme(preset);
  };

  // Cambio de valores: Actualiza local Y propaga al formulario
  const handleValueChange = (newScheme: ColorScheme) => {
    setLocalScheme(newScheme);
    onChange(newScheme);
  };

  // Iconos para cada tipo
  const typeIcons = {
    solid: Droplet,
    gradient: Palette,
    heatmap: Flame,
    categorical: Grid,
    threshold: TrendingUp
  };

  return (
    <div className="space-y-3">
      
      {/* Type selector con iconos */}
      <div className="grid grid-cols-5 gap-1 bg-[#18181b] p-1 rounded-lg">
        {(['solid', 'gradient', 'heatmap', 'categorical', 'threshold'] as const).map(type => {
          const Icon = typeIcons[type];
          const isActive = localScheme.type === type;
          
          return (
            <button
              key={type}
              onClick={() => handleTypeChange(type)}
              disabled={disabled}
              title={getSchemeTypeName(type)}
              className={`text-xs py-2 px-2 rounded transition-all ${
                isActive
                  ? 'bg-[#3b82f6] text-white shadow-lg'
                  : 'hover:bg-[#27272a] text-gray-400 hover:text-gray-300'
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1`}
            >
              <Icon size={12} />
              <span className="hidden lg:inline text-[10px]">{getSchemeTypeName(type)}</span>
            </button>
          );
        })}
      </div>

      {/* Editor según tipo */}
      <div className="bg-[#27272a] rounded-lg p-4">
        
        {/* Solid color editor */}
        {localScheme.type === 'solid' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <Droplet size={14} />
              <span>Single solid color for all points</span>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-medium">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={localScheme.color || '#888888'}
                  onChange={(e) => handleValueChange({ ...localScheme, color: e.target.value })}
                  disabled={disabled}
                  className="w-full h-12 rounded-lg cursor-pointer disabled:opacity-50 
                             border-2 border-[#3f3f46] hover:border-[#52525b] transition-colors"
                />
                <input
                  type="text"
                  value={localScheme.color || '#888888'}
                  onChange={(e) => handleValueChange({ ...localScheme, color: e.target.value })}
                  disabled={disabled}
                  maxLength={7}
                  className="w-28 px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-lg
                             text-xs font-mono text-center
                             focus:border-[#3b82f6] focus:outline-none
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="#888888"
                />
              </div>
            </div>
          </div>
        )}

        {/* Gradient editor */}
        {localScheme.type === 'gradient' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <Palette size={14} />
              <span>Interpolate between two colors based on value</span>
            </div>
            
            <div className="space-y-3">
              {/* Value Key */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-medium">Value Field (JSONPath)</label>
                <input
                  type="text"
                  value={localScheme.valueKey || 'value'}
                  onChange={(e) => handleValueChange({ ...localScheme, valueKey: e.target.value })}
                  disabled={disabled}
                  placeholder="e.g., value, metadata.temperature"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-lg
                             text-xs font-mono
                             focus:border-[#3b82f6] focus:outline-none
                             disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Low color */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-medium">Low Value Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localScheme.low || '#0066ff'}
                    onChange={(e) => handleValueChange({ ...localScheme, low: e.target.value })}
                    disabled={disabled}
                    className="w-full h-10 rounded-lg cursor-pointer disabled:opacity-50
                               border-2 border-[#3f3f46] hover:border-[#52525b] transition-colors"
                  />
                  <input
                    type="text"
                    value={localScheme.low || '#0066ff'}
                    onChange={(e) => handleValueChange({ ...localScheme, low: e.target.value })}
                    disabled={disabled}
                    maxLength={7}
                    className="w-28 px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-lg
                               text-xs font-mono text-center
                               focus:border-[#3b82f6] focus:outline-none
                               disabled:opacity-50"
                    placeholder="#0066ff"
                  />
                </div>
              </div>

              {/* High color */}
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-medium">High Value Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={localScheme.high || '#ff0000'}
                    onChange={(e) => handleValueChange({ ...localScheme, high: e.target.value })}
                    disabled={disabled}
                    className="w-full h-10 rounded-lg cursor-pointer disabled:opacity-50
                               border-2 border-[#3f3f46] hover:border-[#52525b] transition-colors"
                  />
                  <input
                    type="text"
                    value={localScheme.high || '#ff0000'}
                    onChange={(e) => handleValueChange({ ...localScheme, high: e.target.value })}
                    disabled={disabled}
                    maxLength={7}
                    className="w-28 px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-lg
                               text-xs font-mono text-center
                               focus:border-[#3b82f6] focus:outline-none
                               disabled:opacity-50"
                    placeholder="#ff0000"
                  />
                </div>
              </div>

              {/* Preview gradient */}
              <div className="pt-2">
                <label className="text-xs text-gray-400 font-medium mb-2 block">Preview</label>
                <div
                  className="h-8 rounded-lg border-2 border-[#3f3f46]"
                  style={{
                    background: `linear-gradient(to right, ${localScheme.low || '#0066ff'}, ${localScheme.high || '#ff0000'})`
                  }}
                />
              </div>
            </div>
          </div>
        )}


        {/* Heatmap editor */}
        {localScheme.type === 'heatmap' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <Flame size={14} />
              <span>Multi-stop color gradient with thresholds</span>
            </div>
            
            {/* Value Key */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-medium">Value Field (JSONPath)</label>
              <input
                type="text"
                value={localScheme.valueKey || 'value'}
                onChange={(e) => handleValueChange({ ...localScheme, valueKey: e.target.value })}
                disabled={disabled}
                placeholder="e.g., value, metadata.humidity"
                className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-lg
                           text-xs font-mono
                           focus:border-[#3b82f6] focus:outline-none
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            {/* Color stops editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400 font-medium">Color Stops & Thresholds</label>
                <button
                  type="button"
                  onClick={() => {
                    const scheme = localScheme as HeatmapColorScheme;
                    const colors = [...(scheme.colors || [])];
                    const thresholds = [...(scheme.thresholds || [])];
                    const lastThreshold = thresholds.length > 0 ? thresholds[thresholds.length - 1] : 0;
                    const newThreshold = lastThreshold + 25;
                    colors.push('#ffffff');
                    thresholds.push(newThreshold);
                    handleValueChange({ ...scheme, colors, thresholds });
                  }}
                  disabled={disabled}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-[#3b82f6] hover:bg-[#2563eb] 
                             text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={12} />
                  Add Stop
                </button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(localScheme.colors || []).map((color: string, index: number) => {
                  const scheme = localScheme as HeatmapColorScheme;
                  const threshold = scheme.thresholds?.[index] ?? 0;
                  
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                      <GripVertical size={14} className="text-gray-500 flex-shrink-0" />
                      
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...(scheme.colors || [])];
                              newColors[index] = e.target.value;
                              handleValueChange({ ...scheme, colors: newColors });
                            }}
                            disabled={disabled}
                            className="w-10 h-8 rounded cursor-pointer disabled:opacity-50 border border-[#3f3f46]"
                          />
                          <input
                            type="text"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...(scheme.colors || [])];
                              newColors[index] = e.target.value;
                              handleValueChange({ ...scheme, colors: newColors });
                            }}
                            disabled={disabled}
                            maxLength={7}
                            className="flex-1 px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-xs font-mono
                                       focus:border-[#3b82f6] focus:outline-none disabled:opacity-50"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-500 whitespace-nowrap">Threshold:</label>
                          <input
                            type="number"
                            value={threshold}
                            onChange={(e) => {
                              const newThresholds = [...(scheme.thresholds || [])];
                              newThresholds[index] = parseFloat(e.target.value) || 0;
                              handleValueChange({ ...scheme, thresholds: newThresholds });
                            }}
                            disabled={disabled}
                            className="w-20 px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-xs
                                       focus:border-[#3b82f6] focus:outline-none disabled:opacity-50"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const scheme = localScheme as HeatmapColorScheme;
                          const colors = [...(scheme.colors || [])];
                          const thresholds = [...(scheme.thresholds || [])];
                          if (colors.length > 1) {
                            colors.splice(index, 1);
                            thresholds.splice(index, 1);
                            handleValueChange({ ...scheme, colors, thresholds });
                          }
                        }}
                        disabled={disabled || (localScheme.colors?.length || 0) <= 1}
                        className="p-1 text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Remove stop"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Preview */}
              {localScheme.colors && localScheme.colors.length > 0 && (
                <div className="pt-2">
                  <label className="text-xs text-gray-400 font-medium mb-2 block">Preview</label>
                  <div
                    className="h-8 rounded-lg border-2 border-[#3f3f46]"
                    style={{
                      background: `linear-gradient(to right, ${localScheme.colors.join(', ')})`
                    }}
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1">
                    <span>0</span>
                    {localScheme.thresholds?.map((t: number, i: number) => (
                      <span key={i}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categorical editor */}
        {localScheme.type === 'categorical' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <Grid size={14} />
              <span>Distinct colors for different categories</span>
            </div>
            
            {/* Category Key */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-medium">Category Field (JSONPath)</label>
              <input
                type="text"
                value={localScheme.categoryKey || 'metadata.type'}
                onChange={(e) => handleValueChange({ ...localScheme, categoryKey: e.target.value } as CategoricalColorScheme)}
                disabled={disabled}
                placeholder="e.g., metadata.type, status"
                className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-lg
                           text-xs font-mono
                           focus:border-[#3b82f6] focus:outline-none
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            {/* Categories editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400 font-medium">Category Mappings</label>
                <button
                  type="button"
                  onClick={() => {
                    const scheme = localScheme as CategoricalColorScheme;
                    const categories = [...(scheme.categories || [])];
                    const colors = [...(scheme.colors || [])];
                    categories.push(`Category ${categories.length + 1}`);
                    colors.push('#888888');
                    handleValueChange({ ...scheme, categories, colors });
                  }}
                  disabled={disabled}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-[#3b82f6] hover:bg-[#2563eb] 
                             text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={12} />
                  Add Category
                </button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(localScheme.categories || []).map((category: string, index: number) => {
                  const scheme = localScheme as CategoricalColorScheme;
                  const color = scheme.colors?.[index] || '#888888';
                  
                  return (
                    <div key={index} className="flex items-center gap-2 p-2 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                      <GripVertical size={14} className="text-gray-500 flex-shrink-0" />
                      
                      <div className="flex-1 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={category}
                            onChange={(e) => {
                              const newCategories = [...(scheme.categories || [])];
                              newCategories[index] = e.target.value;
                              handleValueChange({ ...scheme, categories: newCategories });
                            }}
                            disabled={disabled}
                            placeholder="Category name"
                            className="flex-1 px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-xs
                                       focus:border-[#3b82f6] focus:outline-none disabled:opacity-50"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...(scheme.colors || [])];
                              newColors[index] = e.target.value;
                              handleValueChange({ ...scheme, colors: newColors });
                            }}
                            disabled={disabled}
                            className="w-10 h-8 rounded cursor-pointer disabled:opacity-50 border border-[#3f3f46]"
                          />
                          <input
                            type="text"
                            value={color}
                            onChange={(e) => {
                              const newColors = [...(scheme.colors || [])];
                              newColors[index] = e.target.value;
                              handleValueChange({ ...scheme, colors: newColors });
                            }}
                            disabled={disabled}
                            maxLength={7}
                            className="flex-1 px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-xs font-mono
                                       focus:border-[#3b82f6] focus:outline-none disabled:opacity-50"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const scheme = localScheme as CategoricalColorScheme;
                          const categories = [...(scheme.categories || [])];
                          const colors = [...(scheme.colors || [])];
                          if (categories.length > 1) {
                            categories.splice(index, 1);
                            colors.splice(index, 1);
                            handleValueChange({ ...scheme, categories, colors });
                          }
                        }}
                        disabled={disabled || (localScheme.categories?.length || 0) <= 1}
                        className="p-1 text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        title="Remove category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </div>
              
              {/* Preview */}
              {localScheme.colors && localScheme.colors.length > 0 && (
                <div className="pt-2">
                  <label className="text-xs text-gray-400 font-medium mb-2 block">Preview</label>
                  <div className="flex gap-1 mb-2">
                    {localScheme.colors.map((color: string, i: number) => (
                      <div
                        key={i}
                        className="flex-1 h-8 rounded border border-[#3f3f46]"
                        style={{ backgroundColor: color }}
                        title={`${localScheme.categories?.[i] || `Category ${i + 1}`}: ${color}`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500">
                    {localScheme.categories?.map((cat: string, i: number) => (
                      <span key={i} className="truncate max-w-[80px]" title={cat}>{cat}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Threshold editor */}
        {localScheme.type === 'threshold' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
              <TrendingUp size={14} />
              <span>Color ranges with specific min/max thresholds</span>
            </div>
            
            {/* Value Key */}
            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-medium">Value Field (JSONPath)</label>
              <input
                type="text"
                value={localScheme.valueKey || 'value'}
                onChange={(e) => handleValueChange({ ...localScheme, valueKey: e.target.value } as ThresholdColorScheme)}
                disabled={disabled}
                placeholder="e.g., value, metadata.score"
                className="w-full px-3 py-2 bg-[#18181b] border border-[#3f3f46] rounded-lg
                           text-xs font-mono
                           focus:border-[#3b82f6] focus:outline-none
                           disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            
            {/* Threshold ranges editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-400 font-medium">Threshold Ranges</label>
                <button
                  type="button"
                  onClick={() => {
                    const scheme = localScheme as ThresholdColorScheme;
                    const ranges = [...(scheme.thresholdRanges || [])];
                    const lastRange = ranges.length > 0 ? ranges[ranges.length - 1] : { min: 0, max: 25 };
                    const newRange = {
                      min: lastRange.max,
                      max: lastRange.max + 25,
                      color: '#888888',
                      label: `Range ${ranges.length + 1}`
                    };
                    ranges.push(newRange);
                    handleValueChange({ ...scheme, thresholdRanges: ranges });
                  }}
                  disabled={disabled}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-[#3b82f6] hover:bg-[#2563eb] 
                             text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={12} />
                  Add Range
                </button>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {(localScheme.thresholdRanges || []).map((range: { min: number; max: number; color: string; label?: string }, index: number) => {
                  const scheme = localScheme as ThresholdColorScheme;
                  
                  return (
                    <div key={index} className="p-2 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                      <div className="flex items-center gap-2 mb-2">
                        <GripVertical size={14} className="text-gray-500 flex-shrink-0" />
                        <input
                          type="text"
                          value={range.label || `Range ${index + 1}`}
                          onChange={(e) => {
                            const newRanges = [...(scheme.thresholdRanges || [])];
                            newRanges[index] = { ...newRanges[index], label: e.target.value };
                            handleValueChange({ ...scheme, thresholdRanges: newRanges });
                          }}
                          disabled={disabled}
                          placeholder="Range label"
                          className="flex-1 px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-xs
                                     focus:border-[#3b82f6] focus:outline-none disabled:opacity-50"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newRanges = [...(scheme.thresholdRanges || [])];
                            if (newRanges.length > 1) {
                              newRanges.splice(index, 1);
                              handleValueChange({ ...scheme, thresholdRanges: newRanges });
                            }
                          }}
                          disabled={disabled || (localScheme.thresholdRanges?.length || 0) <= 1}
                          className="p-1 text-red-400 hover:text-red-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Remove range"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500">Min</label>
                          <input
                            type="number"
                            value={range.min}
                            onChange={(e) => {
                              const newRanges = [...(scheme.thresholdRanges || [])];
                              newRanges[index] = { ...newRanges[index], min: parseFloat(e.target.value) || 0 };
                              handleValueChange({ ...scheme, thresholdRanges: newRanges });
                            }}
                            disabled={disabled}
                            className="w-full px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-xs
                                       focus:border-[#3b82f6] focus:outline-none disabled:opacity-50"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500">Max</label>
                          <input
                            type="number"
                            value={range.max}
                            onChange={(e) => {
                              const newRanges = [...(scheme.thresholdRanges || [])];
                              newRanges[index] = { ...newRanges[index], max: parseFloat(e.target.value) || 0 };
                              handleValueChange({ ...scheme, thresholdRanges: newRanges });
                            }}
                            disabled={disabled}
                            className="w-full px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-xs
                                       focus:border-[#3b82f6] focus:outline-none disabled:opacity-50"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500">Color</label>
                          <input
                            type="color"
                            value={range.color}
                            onChange={(e) => {
                              const newRanges = [...(scheme.thresholdRanges || [])];
                              newRanges[index] = { ...newRanges[index], color: e.target.value };
                              handleValueChange({ ...scheme, thresholdRanges: newRanges });
                            }}
                            disabled={disabled}
                            className="w-full h-8 rounded cursor-pointer disabled:opacity-50 border border-[#3f3f46]"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-500">Hex</label>
                          <input
                            type="text"
                            value={range.color}
                            onChange={(e) => {
                              const newRanges = [...(scheme.thresholdRanges || [])];
                              newRanges[index] = { ...newRanges[index], color: e.target.value };
                              handleValueChange({ ...scheme, thresholdRanges: newRanges });
                            }}
                            disabled={disabled}
                            maxLength={7}
                            className="w-full px-2 py-1 bg-[#27272a] border border-[#3f3f46] rounded text-xs font-mono
                                       focus:border-[#3b82f6] focus:outline-none disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Preview */}
              {localScheme.thresholdRanges && localScheme.thresholdRanges.length > 0 && (
                <div className="pt-2">
                  <label className="text-xs text-gray-400 font-medium mb-2 block">Preview</label>
                  <div className="space-y-1">
                    {localScheme.thresholdRanges.map((range: { min: number; max: number; color: string; label?: string }, i: number) => (
                      <div key={i} className="flex items-center gap-2">
                        <div
                          className="w-8 h-6 rounded border border-[#3f3f46]"
                          style={{ backgroundColor: range.color }}
                        />
                        <div className="flex-1 text-xs">
                          <span className="text-gray-300">{range.label || `Range ${i + 1}`}</span>
                          <span className="text-gray-500 ml-2">
                            {range.min} - {range.max}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick presets */}
      <div className="space-y-2">
        <label className="text-xs text-gray-400 font-medium">Quick Presets</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleValueChange(PRESET_COLOR_SCHEMES.temperature)}
            disabled={disabled}
            className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded text-xs
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to right, #0066ff, #ff0000)' }} />
            Temperature
          </button>
          
          <button
            onClick={() => handleValueChange(PRESET_COLOR_SCHEMES.greenToRed)}
            disabled={disabled}
            className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded text-xs
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to right, #10b981, #ef4444)' }} />
            Status
          </button>
          
          <button
            onClick={() => handleValueChange(PRESET_COLOR_SCHEMES.blueScale)}
            disabled={disabled}
            className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded text-xs
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            <div className="w-4 h-4 rounded" style={{ background: 'linear-gradient(to right, #dbeafe, #1e40af)' }} />
            Blue Scale
          </button>
          
          <button
            onClick={() => handleValueChange(PRESET_COLOR_SCHEMES.monochrome)}
            disabled={disabled}
            className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded text-xs
                       transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center gap-2"
          >
            <div className="w-4 h-4 rounded bg-gray-500" />
            Monochrome
          </button>
        </div>
      </div>
    </div>
  );
};