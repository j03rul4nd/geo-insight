import React, { useRef, useEffect, useState, useMemo, useCallback, useImperativeHandle, forwardRef } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

// Components
import MapboxTokenError from './components/MapboxTokenError';
import MapLoadingOverlay from './components/MapLoadingOverlay';
import MapInfoOverlay from './components/MapInfoOverlay';
import MapHeatmapLegend from './components/MapHeatmapLegend';
import MapSelectedPointCard from './components/MapSelectedPointCard';

// Core logic
import {
  AssetTrackerManager,
  MapManager,
  LayerRenderer,
  filterValidPoints,
  groupPointsByAsset,
  calculateBounds,
  getPointColor,
  validateMapboxToken,
  getMapboxToken,
  DEFAULT_MAP_CONFIG,
  type ViewerGISPanelProps,
  type DataPoint
} from './core';

// Tipo para el ref expuesto
export interface ViewerGISPanelRef {
  mapManager: MapManager | null;
}

const ViewerGISPanel = forwardRef<ViewerGISPanelRef, ViewerGISPanelProps>(({
  dataPoints,
  layers,
  selectedPoint,
  onPointSelect,
  colorMode,
  valueRange,
  isLive,
  onViewChange,
  mapboxToken,
  maxTrailLength = DEFAULT_MAP_CONFIG.maxTrailLength,
  animationDuration = DEFAULT_MAP_CONFIG.animationDuration,
  onMapReady 
}, ref) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapManagerRef = useRef<MapManager | null>(null);
  const assetTrackerRef = useRef<AssetTrackerManager | null>(null);
  const layerRendererRef = useRef<LayerRenderer | null>(null);
  
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [hasInitialZoom, setHasInitialZoom] = useState(false);
  const [renderMode, setRenderMode] = useState<'markers' | 'layers'>('layers');

  // Exponer mapManager a través del ref
  useImperativeHandle(ref, () => ({
    mapManager: mapManagerRef.current
  }), [mapLoaded]);

  // Obtener y validar token
  const accessToken = useMemo(() => getMapboxToken(mapboxToken), [mapboxToken]);
  const isValidToken = useMemo(() => validateMapboxToken(accessToken), [accessToken]);

  // Calcular bounds
  const bounds = useMemo(() => calculateBounds(dataPoints), [dataPoints]);

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || mapManagerRef.current) return;
    
    if (!isValidToken) {
      setTokenError(true);
      setIsInitializing(false);
      return;
    }

    try {
      // Crear MapManager
      const mapManager = new MapManager(DEFAULT_MAP_CONFIG, {
        onLoad: () => {
          setMapLoaded(true);
          setIsInitializing(false);
          setTokenError(false);
          if (onMapReady) {
            onMapReady();
          }
        },
        onError: (e) => {
          if (e.error?.message?.includes('token') || e.error?.message?.includes('401')) {
            setTokenError(true);
          }
          setIsInitializing(false);
        },
        onViewChange
      });

      // Inicializar mapa
      const map = mapManager.initialize(mapContainer.current, accessToken);
      mapManagerRef.current = mapManager;

      // Crear AssetTrackerManager (para markers interactivos)
      assetTrackerRef.current = new AssetTrackerManager(map, {
        maxTrailLength,
        animationDuration,
        onPointSelect
      });

      // Crear LayerRenderer (para layers de visualización)
      layerRendererRef.current = new LayerRenderer(map);

    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError(true);
      setIsInitializing(false);
    }

    return () => {
      // Cleanup
      if (assetTrackerRef.current) {
        assetTrackerRef.current.clearAll();
        assetTrackerRef.current = null;
      }
      if (layerRendererRef.current) {
        layerRendererRef.current.clearAll();
        layerRendererRef.current = null;
      }
      if (mapManagerRef.current) {
        mapManagerRef.current.destroy();
        mapManagerRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Ajustar vista inicial
  useEffect(() => {
    if (mapManagerRef.current && bounds && mapLoaded && !isInitializing && !hasInitialZoom) {
      mapManagerRef.current.fitBounds(bounds);
      setHasInitialZoom(true);
    }
  }, [bounds, mapLoaded, isInitializing, hasInitialZoom]);

  // Actualizar layers cuando cambian
  useEffect(() => {
    if (!layerRendererRef.current || !mapLoaded || renderMode !== 'layers') return;

    console.log('=== LAYERS DEBUG ===');
    console.log('🎨 Total layers recibidas:', layers.length);
    console.log('📋 Layers completas:', JSON.stringify(layers, null, 2));
    
    layers.forEach((layer, idx) => {
      console.log(`\n📍 Layer ${idx}: ${layer}`, {
        id: layer.id,
        name: layer.name,
      });
    });
    
    console.log('\n🗺️ DataPoints totales recibidos:', dataPoints.length);
    console.log('🎨 Color mode:', colorMode);
    console.log('📊 Value range:', valueRange);
    console.log('==================\n');
    
    layerRendererRef.current.updateLayers(
      layers,
      dataPoints,
      colorMode,
      valueRange
    );

  }, [layers, dataPoints, mapLoaded, colorMode, valueRange, renderMode]);

  // 🎯 MODIFICADO: Actualizar assets solo en modo 'markers'
  useEffect(() => {
    if (!assetTrackerRef.current || !mapLoaded || renderMode !== 'markers') return;

    const assetTracker = assetTrackerRef.current;
    const map = mapManagerRef.current?.getMap();
    if (!map) return;

    console.log('=== ViewerGISPanel DEBUG (Markers Mode) ===');
    console.log('📊 DataPoints recibidos:', dataPoints.length);

    // Filtrar y agrupar puntos
    const validPoints = filterValidPoints(dataPoints);
    const pointsByAsset = groupPointsByAsset(validPoints);
    const currentAssetIds = new Set(pointsByAsset.keys());

    // Remover assets que ya no existen
    assetTracker.getAllTrackers().forEach((tracker, assetId) => {
      if (!currentAssetIds.has(assetId)) {
        assetTracker.removeMarker(assetId);
      }
    });

    // Actualizar o crear assets
    pointsByAsset.forEach((point, assetId) => {
      const x = point.metadata!.x!;
      const y = point.metadata!.y!;
      
      const normalizeCoordinates = (x: number, y: number): [number, number] => {
        const isXValidLat = x >= -90 && x <= 90;
        const isYValidLat = y >= -90 && y <= 90;
        const isXValidLng = x >= -180 && x <= 180;
        const isYValidLng = y >= -180 && y <= 180;
        
        if (isXValidLat && isYValidLng && Math.abs(x) <= 90 && Math.abs(y) > 90) {
          return [y, x];
        }
        
        if (isXValidLng && isYValidLat && Math.abs(x) > 90 && Math.abs(y) <= 90) {
          return [x, y];
        }
        
        if (isXValidLat && isYValidLat) {
          return Math.abs(y) > Math.abs(x) ? [y, x] : [x, y];
        }
        
        if (isXValidLng && isYValidLng) {
          return [y, x];
        }
        
        console.warn(`⚠️ Coordenadas ambiguas para ${assetId}: x=${x}, y=${y}`);
        return [y, x];
      };
      
      const position = normalizeCoordinates(x, y);
      const color = getPointColor(point, colorMode, valueRange);
      
      const [lng, lat] = position;
      if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        console.error(`❌ Coordenadas inválidas para ${assetId}: [${lng}, ${lat}]`);
        return;
      }

      const existingTracker = assetTracker.getTracker(assetId);

      if (existingTracker) {
        const positionChanged = assetTracker.updateMarker(assetId, point, color, position);
        
        if (positionChanged) {
          assetTracker.updateTrailLayer(assetId, existingTracker.trail, color);
        }
      } else {
        assetTracker.createMarker(assetId, point, color, position);
      }
    });

    // Resaltar punto seleccionado
    assetTracker.highlightMarker(selectedPoint?.sensorId || null);

    console.log('📊 Assets activos:', assetTracker.getActiveCount());

  }, [dataPoints, mapLoaded, colorMode, valueRange, selectedPoint, onPointSelect, renderMode]);

  // Mostrar error de token
  if (tokenError || (!isValidToken && !isInitializing)) {
    return <MapboxTokenError accessToken={accessToken} />;
  }

  return (
    <div className="flex-1 relative bg-[#0a0a0a]">
      {/* Contenedor del mapa */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading overlay */}
      <MapLoadingOverlay isVisible={isInitializing} />

      {/* 🎯 NUEVO: Toggle entre modos de renderizado */}
      <div className="absolute top-4 left-4 bg-[#18181b]/90 backdrop-blur-sm border border-[#27272a] rounded-lg p-2 shadow-lg z-10">
        <div className="flex gap-2">
          <button
            onClick={() => {
              setRenderMode('layers');
              if (assetTrackerRef.current) {
                assetTrackerRef.current.clearAll();
              }
            }}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              renderMode === 'layers'
                ? 'bg-[#3b82f6] text-white'
                : 'bg-[#27272a] text-gray-400 hover:bg-[#3f3f46]'
            }`}
          >
            Layers Mode
          </button>
          <button
            onClick={() => {
              setRenderMode('markers');
              if (layerRendererRef.current) {
                layerRendererRef.current.clearAll();
              }
            }}
            className={`px-3 py-1 text-xs rounded transition-colors ${
              renderMode === 'markers'
                ? 'bg-[#3b82f6] text-white'
                : 'bg-[#27272a] text-gray-400 hover:bg-[#3f3f46]'
            }`}
          >
            Markers Mode
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {renderMode === 'layers' 
            ? `${layers.length} layers activas`
            : `${assetTrackerRef.current?.getActiveCount() || 0} markers`
          }
        </div>
      </div>


      {/* Overlay de información */}
      <MapInfoOverlay 
        isLive={isLive} 
        pointsCount={
          renderMode === 'markers' 
            ? assetTrackerRef.current?.getActiveCount() || 0
            : dataPoints.length
        }
        colorMode={colorMode} 
      />

      {/* Leyenda de colores */}
      <MapHeatmapLegend 
        valueRange={valueRange} 
        isVisible={colorMode === 'heatmap'} 
      />

      {/* Información del punto seleccionado */}
      {selectedPoint && (
        <MapSelectedPointCard 
          point={selectedPoint} 
          onClose={() => onPointSelect(null)} 
        />
      )}
    </div>
  );
});

ViewerGISPanel.displayName = 'ViewerGISPanel';

export default ViewerGISPanel;