/**
 * LayersList - Componente auto-contenido ACTUALIZADO
 * Aprovecha todas las nuevas capacidades del hook useVisualizationLayers
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Plus, 
  Layers as LayersIcon, 
  RefreshCw, 
  AlertCircle, 
  Loader2, 
  Info,
  Eye,
  EyeOff,
  Filter,
  Zap,
  TrendingUp
} from 'lucide-react';
import { LayersListProps } from './types';
import { useVisualizationLayers, type VisualizationLayer } from '@/hooks/useVisualizationLayers';
import { LayerCard } from './components/LayerCard';
import { LayerCreateForm } from './components/LayerForm';
import { LayerEditForm } from './components/LayerEditForm';
import { OrderExplainer } from './components/OrderExplainer';
import { LayerStats } from './components/LayerStats';

// ✅ RE-EXPORTAR el tipo para que sea accesible desde el componente
export type { VisualizationLayer } from '@/hooks/useVisualizationLayers';

/**
 * Interfaz extendida con callbacks para exponer funcionalidad interna
 */
export interface LayersListExtendedProps extends LayersListProps {
  onLayersUpdate?: (layers: VisualizationLayer[]) => void;
  onEnabledLayersChange?: (enabledLayers: VisualizationLayer[]) => void;
  onLayerToggle?: (layerId: string, enabled: boolean) => void;
  showStats?: boolean; // NEW: Mostrar estadísticas de layers
  showAdvancedFilters?: boolean; // NEW: Mostrar filtros por tipo de asset
}

export const LayersList: React.FC<LayersListExtendedProps> = ({
  datasetId,
  collapsed = false,
  onLayerSelect,
  onLayersUpdate,
  onEnabledLayersChange,
  onLayerToggle,
  showStats = false,
  showAdvancedFilters = false,
  className = ''
}) => {
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLayer, setEditingLayer] = useState<VisualizationLayer | null>(null);
  const [showOrderExplainer, setShowOrderExplainer] = useState(false);
  
  // NEW: Filtros avanzados
  const [filterByAssetType, setFilterByAssetType] = useState<'all' | 'point' | 'moving' | 'area'>('all');
  const [showOnlyWithTrail, setShowOnlyWithTrail] = useState(false);
  const [showOnlyWithRules, setShowOnlyWithRules] = useState(false);

  // ============================================
  // HOOK INTERNO - Encapsulado con TODAS las capacidades
  // ============================================
  const {
    layers,
    isLoading,
    error,
    datasetName,
    viewType,
    
    // CRUD operations
    toggleLayer,
    updateLayer,
    deleteLayer,
    duplicateLayer,
    fetchLayers,
    createLayer,
    moveLayer,
    
    // Queries mejoradas
    hasLayers,
    layerCount,
    enabledLayerCount,
    disabledLayerCount,
    getMaxOrder,
    getLayersByAssetType,
    getLayersWithTrail,
    
    // NEW: Capacidades de evaluación
    evaluateRules,
    evaluateCondition,
    evaluateFilter,
    filterDataPoints,
    layerHasDynamicRules,
    resolveColor,
    resolveTrailColor,
    getValueByPath,
    
  } = useVisualizationLayers(datasetId, {
    autoFetch: true,
    onLayersChanged: useCallback((updatedLayers: VisualizationLayer[]) => {
      console.log('✅ Layers updated internally:', updatedLayers.length);
      
      onLayersUpdate?.(updatedLayers);
      
      const enabled = updatedLayers.filter(l => l.enabled);
      onEnabledLayersChange?.(enabled);
    }, [onLayersUpdate, onEnabledLayersChange]),
    
    onLayerToggled: useCallback((layerId: string, enabled: boolean) => {
      console.log('🔄 Layer toggled:', layerId, enabled);
      onLayerToggle?.(layerId, enabled);
    }, [onLayerToggle])
  });

  // ============================================
  // COMPUTED VALUES - usando las nuevas capacidades
  // ============================================
  
  const pointLayers = getLayersByAssetType('point');
  const movingLayers = getLayersByAssetType('moving');
  const areaLayers = getLayersByAssetType('area');
  const trailLayers = getLayersWithTrail();
  
  const layersWithDynamicRules = layers.filter(l => layerHasDynamicRules(l.id));
  const layersWithFilters = layers.filter(l => l.filterQuery !== null);

  // ============================================
  // FILTERED LAYERS - aplicar filtros avanzados
  // ============================================
  
  const filteredLayers = layers.filter(layer => {
    // Filtro por asset type
    if (filterByAssetType !== 'all' && layer.assetType !== filterByAssetType) {
      return false;
    }
    
    // Filtro por trail
    if (showOnlyWithTrail && !layer.showTrail) {
      return false;
    }
    
    // Filtro por reglas dinámicas
    if (showOnlyWithRules && !layerHasDynamicRules(layer.id)) {
      return false;
    }
    
    return true;
  });

  // ============================================
  // HANDLERS
  // ============================================

  const handleEdit = (layer: VisualizationLayer) => {
    setEditingLayer(layer);
    if (onLayerSelect) {
      onLayerSelect(layer);
    }
  };

  const handleEditSuccess = (layer: VisualizationLayer) => {
    setEditingLayer(null);
    fetchLayers();
    if (onLayerSelect) {
      onLayerSelect(layer);
    }
  };

  const handleOpacityChange = async (layerId: string, opacityPercent: number) => {
    const opacity = opacityPercent / 100;
    try {
      await updateLayer(layerId, { opacity });
    } catch (err) {
      console.error('Error updating opacity:', err);
    }
  };

  const handleDuplicate = async (layerId: string) => {
    try {
      await duplicateLayer(layerId);
    } catch (err) {
      console.error('Error duplicating layer:', err);
    }
  };

  const handleCreateSuccess = (layer: VisualizationLayer) => {
    setShowCreateForm(false);
    if (onLayerSelect) {
      onLayerSelect(layer);
    }
  };

  const handleMoveLayer = async (layerId: string, direction: 'up' | 'down') => {
    try {
      await moveLayer(layerId, direction);
    } catch (err) {
      console.error('Error moving layer:', err);
    }
  };

  // ============================================
  // TOGGLE ALL
  // ============================================
  
  const handleToggleAll = async () => {
    const allEnabled = enabledLayerCount === layerCount;
    const newState = !allEnabled;
    
    try {
      await Promise.all(
        layers.map(layer => updateLayer(layer.id, { enabled: newState }))
      );
      await fetchLayers();
    } catch (err) {
      console.error('Error toggling all layers:', err);
    }
  };

  // ============================================
  // CREATE DEFAULT LAYERS
  // ============================================
  
  const [isCreatingDefaults, setIsCreatingDefaults] = useState(false);
  
  const handleCreateDefaults = async () => {
    setIsCreatingDefaults(true);
    
    try {
      const { DEFAULT_LAYERS } = await import('@/lib/defaultLayers');
      
      await Promise.all(
        DEFAULT_LAYERS.map(layer =>
          createLayer({
            name: layer.name,
            description: layer.description,
            enabled: layer.enabled,
            colorScheme: layer.colorScheme,
            opacity: layer.opacity,
            pointSize: layer.pointSize,
            filterQuery: layer.filterQuery,
          })
        )
      );

      console.log(`✅ Created ${DEFAULT_LAYERS.length} default layers`);
      
    } catch (err) {
      console.error('Error creating default layers:', err);
    } finally {
      setIsCreatingDefaults(false);
    }
  };

  // ============================================
  // RESET FILTERS
  // ============================================
  
  const resetFilters = () => {
    setFilterByAssetType('all');
    setShowOnlyWithTrail(false);
    setShowOnlyWithRules(false);
  };
  
  const hasActiveFilters = filterByAssetType !== 'all' || showOnlyWithTrail || showOnlyWithRules;

  // ============================================
  // RENDER: Collapsed View
  // ============================================
  
  if (collapsed) {
    return (
      <div className={`${className}`}>
        <div className="p-2 flex flex-col items-center gap-2">
          <LayersIcon size={20} className="text-gray-400" />
          <div className="text-xs text-gray-500 rotate-90 origin-center whitespace-nowrap">
            {layerCount}
          </div>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER: Full View
  // ============================================

  return (
    <div className={`${className}`}>
      
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LayersIcon size={16} className="text-gray-400" />
          <h3 className="text-sm font-bold">Layers</h3>
          <span className="text-xs text-gray-500">
            ({enabledLayerCount}/{layerCount})
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Info button */}
          <button
            onClick={() => setShowOrderExplainer(!showOrderExplainer)}
            className="p-1 hover:bg-[#3f3f46] rounded transition-colors"
            title="Learn about layer ordering"
          >
            <Info size={14} className="text-blue-400" />
          </button>
          
          {/* Toggle all */}
          {hasLayers && (
            <button
              onClick={handleToggleAll}
              disabled={isLoading}
              className="p-1 hover:bg-[#3f3f46] rounded transition-colors disabled:opacity-50"
              title={enabledLayerCount === layerCount ? "Hide all layers" : "Show all layers"}
            >
              {enabledLayerCount === layerCount ? (
                <EyeOff size={14} className="text-gray-400" />
              ) : (
                <Eye size={14} className="text-green-400" />
              )}
            </button>
          )}
          
          {/* Refresh */}
          <button
            onClick={() => fetchLayers()}
            disabled={isLoading}
            className="p-1 hover:bg-[#3f3f46] rounded transition-colors disabled:opacity-50"
            title="Refresh layers"
          >
            <RefreshCw 
              size={14} 
              className={isLoading ? 'animate-spin' : ''} 
            />
          </button>
          
          {/* Create */}
          <button
            onClick={() => setShowCreateForm(true)}
            className="p-1 hover:bg-[#3f3f46] rounded transition-colors"
            title="Create new layer"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      {/* Order Explainer */}
      <OrderExplainer 
        visible={showOrderExplainer}
        onClose={() => setShowOrderExplainer(false)}
      />

      {/* NEW: Stats Panel */}
      {showStats && hasLayers && (
        <LayerStats
          totalLayers={layerCount}
          enabledLayers={enabledLayerCount}
          disabledLayers={disabledLayerCount}
          pointLayers={pointLayers.length}
          movingLayers={movingLayers.length}
          areaLayers={areaLayers.length}
          trailLayers={trailLayers.length}
          layersWithRules={layersWithDynamicRules.length}
          layersWithFilters={layersWithFilters.length}
          className="mb-4"
        />
      )}

      {/* NEW: Advanced Filters */}
      {showAdvancedFilters && hasLayers && (
        <div className="mb-4 p-3 bg-[#27272a]/50 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-gray-400" />
              <span className="text-xs font-medium">Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Reset
              </button>
            )}
          </div>
          
          {/* Asset Type Filter */}
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Asset Type</label>
            <div className="grid grid-cols-4 gap-1">
              {(['all', 'point', 'moving', 'area'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilterByAssetType(type)}
                  className={`px-2 py-1 text-xs rounded transition-all ${
                    filterByAssetType === type
                      ? 'bg-[#3b82f6] text-white'
                      : 'bg-[#18181b] hover:bg-[#3f3f46] text-gray-400'
                  }`}
                >
                  {type === 'all' && '📊 All'}
                  {type === 'point' && '📍'}
                  {type === 'moving' && '🚀'}
                  {type === 'area' && '🗺️'}
                </button>
              ))}
            </div>
          </div>
          
          {/* Toggle Filters */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={showOnlyWithTrail}
                onChange={(e) => setShowOnlyWithTrail(e.target.checked)}
                className="w-3 h-3 rounded"
              />
              <TrendingUp size={12} className="text-green-400" />
              <span>Only with trails</span>
              <span className="text-gray-500">({trailLayers.length})</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={showOnlyWithRules}
                onChange={(e) => setShowOnlyWithRules(e.target.checked)}
                className="w-3 h-3 rounded"
              />
              <Zap size={12} className="text-yellow-400" />
              <span>Only with dynamic rules</span>
              <span className="text-gray-500">({layersWithDynamicRules.length})</span>
            </label>
          </div>
          
          {/* Active filters count */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-[#18181b]">
              <div className="text-xs text-gray-400">
                Showing {filteredLayers.length} of {layerCount} layers
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-red-500 mb-1">
                Error loading layers
              </div>
              <div className="text-xs text-red-400">
                {error}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !hasLayers && (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div 
              key={i} 
              className="bg-[#27272a] rounded-lg p-3 animate-pulse"
            >
              <div className="h-4 bg-[#3f3f46] rounded w-3/4 mb-2" />
              <div className="h-2 bg-[#3f3f46] rounded w-full mb-2" />
              <div className="h-2 bg-[#3f3f46] rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !hasLayers && (
        <div className="text-center py-8 px-4">
          <LayersIcon size={32} className="mx-auto mb-3 text-gray-600" />
          <div className="text-sm text-gray-400 mb-1">
            No layers configured
          </div>
          <div className="text-xs text-gray-500 mb-4">
            Create layers to visualize and filter your data
          </div>
          
          <div className="space-y-2">
            <button
              onClick={handleCreateDefaults}
              disabled={isCreatingDefaults}
              className="w-full text-xs px-4 py-2.5 bg-[#3b82f6] hover:bg-[#2563eb] 
                         rounded transition-colors disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isCreatingDefaults ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <LayersIcon size={14} />
                  Create Default Layers
                </>
              )}
            </button>
            
            <button
              onClick={() => setShowCreateForm(true)}
              disabled={isCreatingDefaults}
              className="w-full text-xs px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] 
                         rounded transition-colors disabled:opacity-50"
            >
              Create Custom Layer
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-[#27272a]">
            <div className="text-xs text-gray-500 text-left space-y-1">
              <div className="font-medium text-gray-400 mb-2">Default layers include:</div>
              <div>• All Sensors (gradient visualization)</div>
              <div>• Temperature Sensors (filtered)</div>
              <div>• High Values (threshold-based)</div>
            </div>
          </div>
        </div>
      )}

      {/* Layers list - sorted by order DESC */}
      {hasLayers && (
        <div className="space-y-2">
          {filteredLayers.length === 0 ? (
            <div className="text-center py-6 px-4">
              <Filter size={24} className="mx-auto mb-2 text-gray-600" />
              <div className="text-sm text-gray-400 mb-1">
                No layers match the current filters
              </div>
              <button
                onClick={resetFilters}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Reset filters
              </button>
            </div>
          ) : (
            [...filteredLayers]
              .sort((a, b) => b.order - a.order)
              .map(layer => (
                <LayerCard
                  key={layer.id}
                  layer={layer}
                  onToggle={toggleLayer}
                  onOpacityChange={handleOpacityChange}
                  onEdit={handleEdit}
                  onDelete={deleteLayer}
                  onDuplicate={handleDuplicate}
                  onMoveUp={() => handleMoveLayer(layer.id, 'up')}
                  onMoveDown={() => handleMoveLayer(layer.id, 'down')}
                  isLoading={isLoading}
                  hasDynamicRules={layerHasDynamicRules(layer.id)}
                />
              ))
          )}
        </div>
      )}

      {/* Create form modal */}
      {showCreateForm && (
        <LayerCreateForm
          datasetId={datasetId}
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Edit form modal */}
      {editingLayer && (
        <LayerEditForm
          layer={editingLayer}
          maxOrder={getMaxOrder()}
          onSuccess={handleEditSuccess}
          onCancel={() => setEditingLayer(null)}
        />
      )}

    </div>
  );
};

/**
 * Hook de conveniencia para acceder a las layers desde fuera
 * Útil si necesitas acceder a las layers en otros componentes
 */
export function useLayersListContext(datasetId: string) {
  return useVisualizationLayers(datasetId, {
    autoFetch: false
  });
}

export default LayersList;