import React, { useState } from 'react';
import { Info, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { ColorRule, ScaleRule, VisibilityRule } from '@/hooks/useVisualizationLayers';

interface AdvancedOptionsSectionProps {
  order: number;
  filterQuery: string;
  colorRules: ColorRule[];
  scaleRules: ScaleRule[];
  visibilityRules: VisibilityRule[];
  maxOrder: number;
  onOrderChange: (value: number) => void;
  onFilterQueryChange: (value: string) => void;
  onColorRulesChange: (rules: ColorRule[]) => void;
  onScaleRulesChange: (rules: ScaleRule[]) => void;
  onVisibilityRulesChange: (rules: VisibilityRule[]) => void;
  isLoading: boolean;
}

export const AdvancedOptionsSection: React.FC<AdvancedOptionsSectionProps> = ({
  order,
  filterQuery,
  colorRules,
  scaleRules,
  visibilityRules,
  maxOrder,
  onOrderChange,
  onFilterQueryChange,
  onColorRulesChange,
  onScaleRulesChange,
  onVisibilityRulesChange,
  isLoading
}) => {
  const [expandedSections, setExpandedSections] = useState({
    colorRules: false,
    scaleRules: false,
    visibilityRules: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Color Rules handlers
  const addColorRule = () => {
    const newRule: ColorRule = {
      id: `color-${Date.now()}`,
      condition: '',
      colorScheme: { type: 'solid', color: '#3b82f6' },
      priority: colorRules.length
    };
    onColorRulesChange([...colorRules, newRule]);
  };

  const updateColorRule = (id: string, updates: Partial<ColorRule>) => {
    onColorRulesChange(
      colorRules.map(rule => rule.id === id ? { ...rule, ...updates } : rule)
    );
  };

  const removeColorRule = (id: string) => {
    onColorRulesChange(colorRules.filter(rule => rule.id !== id));
  };

  // Scale Rules handlers
  const addScaleRule = () => {
    const newRule: ScaleRule = {
      id: `scale-${Date.now()}`,
      condition: '',
      scale: 50,
      priority: scaleRules.length
    };
    onScaleRulesChange([...scaleRules, newRule]);
  };

  const updateScaleRule = (id: string, updates: Partial<ScaleRule>) => {
    onScaleRulesChange(
      scaleRules.map(rule => rule.id === id ? { ...rule, ...updates } : rule)
    );
  };

  const removeScaleRule = (id: string) => {
    onScaleRulesChange(scaleRules.filter(rule => rule.id !== id));
  };

  // Visibility Rules handlers
  const addVisibilityRule = () => {
    const newRule: VisibilityRule = {
      id: `visibility-${Date.now()}`,
      condition: '',
      visible: true,
      priority: visibilityRules.length
    };
    onVisibilityRulesChange([...visibilityRules, newRule]);
  };

  const updateVisibilityRule = (id: string, updates: Partial<VisibilityRule>) => {
    onVisibilityRulesChange(
      visibilityRules.map(rule => rule.id === id ? { ...rule, ...updates } : rule)
    );
  };

  const removeVisibilityRule = (id: string) => {
    onVisibilityRulesChange(visibilityRules.filter(rule => rule.id !== id));
  };

  return (
    <div className="space-y-6 p-6 bg-zinc-900 rounded-lg">
      {/* Layer Order */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200 flex items-center gap-2">
          Layer Order (Z-Index)
          <span 
            className="text-xs text-zinc-500 cursor-help" 
            title="Higher numbers render on top"
          >
            <Info size={14} />
          </span>
        </label>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min={0}
            value={order}
            onChange={(e) => onOrderChange(parseInt(e.target.value) || 0)}
            disabled={isLoading}
            className="w-20 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded
                       focus:border-blue-500 focus:outline-none text-center font-mono text-zinc-100
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <input
            type="range"
            min={0}
            max={Math.max(maxOrder, 100)}
            value={order}
            onChange={(e) => onOrderChange(parseInt(e.target.value))}
            disabled={isLoading}
            className="flex-1 h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer
                       accent-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <span className="text-sm text-zinc-400 font-mono min-w-[3rem] text-right">
            {order}
          </span>
        </div>
      </div>

      {/* Filter Query */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-200">Filter Query (Optional)</label>
        <input
          type="text"
          value={filterQuery}
          onChange={(e) => onFilterQueryChange(e.target.value)}
          placeholder="e.g., value > 90 AND metadata.type = 'temperature'"
          disabled={isLoading}
          maxLength={1000}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded
                     font-mono text-xs text-zinc-100 placeholder-zinc-500
                     focus:border-blue-500 focus:outline-none
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <p className="text-xs text-zinc-500">
          Use conditions like: value &gt; 50, metadata.type = 'sensor', etc.
        </p>
      </div>

      {/* Dynamic Rules Section */}
      <div className="border-t border-zinc-700 pt-4">
        <h3 className="text-sm font-semibold mb-4 text-zinc-300">Dynamic Rules</h3>

        {/* Color Rules */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('colorRules')}
            className="w-full flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 
                       rounded hover:bg-zinc-750 transition-colors text-zinc-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <span className="text-sm font-medium">
              Color Rules ({colorRules.length})
            </span>
            {expandedSections.colorRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expandedSections.colorRules && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-zinc-700">
              {colorRules.length === 0 ? (
                <p className="text-xs text-zinc-500 p-3">No color rules defined</p>
              ) : (
                colorRules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-zinc-800 border border-zinc-700 rounded space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={rule.condition}
                        onChange={(e) => updateColorRule(rule.id, { condition: e.target.value })}
                        placeholder="e.g., value > 50"
                        className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono
                                   text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                        disabled={isLoading}
                      />
                      <button
                        onClick={() => removeColorRule(rule.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                        disabled={isLoading}
                        title="Remove rule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-zinc-400">Color:</label>
                      <input
                        type="color"
                        value={rule.colorScheme.type === 'solid' ? rule.colorScheme.color : '#3b82f6'}
                        onChange={(e) => updateColorRule(rule.id, { 
                          colorScheme: { type: 'solid', color: e.target.value }
                        })}
                        className="w-10 h-6 rounded cursor-pointer border border-zinc-700"
                        disabled={isLoading}
                      />
                      <label className="text-xs text-zinc-400 ml-auto">Priority:</label>
                      <input
                        type="number"
                        value={rule.priority || 0}
                        onChange={(e) => updateColorRule(rule.id, { priority: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100
                                   focus:border-blue-500 focus:outline-none text-center"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ))
              )}
              <button
                onClick={addColorRule}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded
                           flex items-center justify-center gap-2 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <Plus size={14} />
                Add Color Rule
              </button>
            </div>
          )}
        </div>

        {/* Scale Rules */}
        <div className="mb-4">
          <button
            onClick={() => toggleSection('scaleRules')}
            className="w-full flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 
                       rounded hover:bg-zinc-750 transition-colors text-zinc-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <span className="text-sm font-medium">
              Scale Rules ({scaleRules.length})
            </span>
            {expandedSections.scaleRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expandedSections.scaleRules && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-zinc-700">
              {scaleRules.length === 0 ? (
                <p className="text-xs text-zinc-500 p-3">No scale rules defined</p>
              ) : (
                scaleRules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-zinc-800 border border-zinc-700 rounded space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={rule.condition}
                        onChange={(e) => updateScaleRule(rule.id, { condition: e.target.value })}
                        placeholder="e.g., value < 30"
                        className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono
                                   text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                        disabled={isLoading}
                      />
                      <button
                        onClick={() => removeScaleRule(rule.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                        disabled={isLoading}
                        title="Remove rule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-zinc-400">Scale:</label>
                      <input
                        type="number"
                        min={1}
                        max={200}
                        value={rule.scale}
                        onChange={(e) => updateScaleRule(rule.id, { scale: parseInt(e.target.value) || 50 })}
                        className="w-20 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100
                                   focus:border-blue-500 focus:outline-none text-center"
                        disabled={isLoading}
                      />
                      <label className="text-xs text-zinc-400 ml-auto">Priority:</label>
                      <input
                        type="number"
                        value={rule.priority || 0}
                        onChange={(e) => updateScaleRule(rule.id, { priority: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100
                                   focus:border-blue-500 focus:outline-none text-center"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ))
              )}
              <button
                onClick={addScaleRule}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded
                           flex items-center justify-center gap-2 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <Plus size={14} />
                Add Scale Rule
              </button>
            </div>
          )}
        </div>

        {/* Visibility Rules */}
        <div>
          <button
            onClick={() => toggleSection('visibilityRules')}
            className="w-full flex items-center justify-between p-3 bg-zinc-800 border border-zinc-700 
                       rounded hover:bg-zinc-750 transition-colors text-zinc-200
                       disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            <span className="text-sm font-medium">
              Visibility Rules ({visibilityRules.length})
            </span>
            {expandedSections.visibilityRules ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {expandedSections.visibilityRules && (
            <div className="mt-2 space-y-2 pl-3 border-l-2 border-zinc-700">
              {visibilityRules.length === 0 ? (
                <p className="text-xs text-zinc-500 p-3">No visibility rules defined</p>
              ) : (
                visibilityRules.map((rule) => (
                  <div key={rule.id} className="p-3 bg-zinc-800 border border-zinc-700 rounded space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={rule.condition}
                        onChange={(e) => updateVisibilityRule(rule.id, { condition: e.target.value })}
                        placeholder="e.g., metadata.active = true"
                        className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs font-mono
                                   text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:outline-none"
                        disabled={isLoading}
                      />
                      <button
                        onClick={() => removeVisibilityRule(rule.id)}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                        disabled={isLoading}
                        title="Remove rule"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="text-xs text-zinc-400">Visible:</label>
                      <input
                        type="checkbox"
                        checked={rule.visible}
                        onChange={(e) => updateVisibilityRule(rule.id, { visible: e.target.checked })}
                        className="w-4 h-4 rounded border-zinc-700 bg-zinc-900 cursor-pointer
                                   checked:bg-blue-600 checked:border-blue-600"
                        disabled={isLoading}
                      />
                      <label className="text-xs text-zinc-400 ml-auto">Priority:</label>
                      <input
                        type="number"
                        value={rule.priority || 0}
                        onChange={(e) => updateVisibilityRule(rule.id, { priority: parseInt(e.target.value) || 0 })}
                        className="w-16 px-2 py-1 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-100
                                   focus:border-blue-500 focus:outline-none text-center"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                ))
              )}
              <button
                onClick={addVisibilityRule}
                className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded
                           flex items-center justify-center gap-2 transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                <Plus size={14} />
                Add Visibility Rule
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};