'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback  } from 'react';
import { 
  Settings, Share2, FileDown, Image, Play, Pause, 
  ChevronLeft, ChevronRight, RotateCcw, AlertTriangle, Activity, 
  TrendingUp, Clock, Database, Zap
} from 'lucide-react';

import LoadingOverlay from './LoadingOverlay';
import DatasetLoader from './LoadingDataset';
import DatasetError from './LoadingDatasetError';


import { useDataset } from '@/hooks/useDataset';
import { useRealtimeDataPoints } from '@/hooks/useRealtimeDataPoints'; 
import Viewer3DPanel from '@/components/Viewer3DPanel/Viewer3DPanel';


import MappingConfigurator from '@/components/MappingConfigurator/MappingConfigurator';
import { useDatasetMapping } from '@/hooks/useDatasetMapping';


// ============================================
// TYPES 
// ============================================

interface Layer {
  id: string;
  datasetId: string;
  name: string;
  enabled: boolean;
  order: number;
  colorScheme: {
    type: 'solid' | 'gradient' | 'heatmap';
    color?: string;
    low?: string;
    high?: string;
  };
  opacity: number;
  pointSize: number;
  filterQuery?: string;
}

interface DataPoint {
  id: string;
  datasetId: string;
  value: number;
  sensorId: string;
  timestamp: Date | string;
  metadata?: {
    x?: number;
    y?: number;
    z?: number;
    sensorType?: string;
    unit?: string;
    [key: string]: any; // Otros campos custom
  };
}

interface Alert {
  id: string;
  datasetId: string;
  name: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'muted';
  message: string;
  currentValue: number;
  thresholdValue: number;
  triggeredAt: Date | string;
}


interface Insight {
  id: string;
  type: 'anomaly' | 'prediction' | 'optimization' | 'pattern';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  summary: string;
  recommendations?: string;
  confidence?: number;
  createdAt: Date;
  isResolved: boolean;
}

interface Activity {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  createdAt: Date;
  metadata?: any;
}

// ============================================
// MOCK HOOKS (Replace with real ones)
// ============================================

const useLayers = (datasetId: string) => {
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'layer-1',
      datasetId,
      name: 'All Sensors',
      enabled: true,
      order: 0,
      colorScheme: { type: 'heatmap', low: '#3b82f6', high: '#ef4444' },
      opacity: 1,
      pointSize: 1
    },
    {
      id: 'layer-2',
      datasetId,
      name: 'Temperature Only',
      enabled: false,
      order: 1,
      colorScheme: { type: 'solid', color: '#f59e0b' },
      opacity: 1,
      pointSize: 1.2
    },
    {
      id: 'layer-3',
      datasetId,
      name: 'Pressure Only',
      enabled: false,
      order: 2,
      colorScheme: { type: 'solid', color: '#8b5cf6' },
      opacity: 1,
      pointSize: 1.2
    }
  ]);

  return {
    data: layers,
    isLoading: false,
    error: null,
    setLayers
  };
};

const useLayerMutations = (datasetId: string) => {
  const { setLayers } = useLayers(datasetId);

  const toggleLayer = useCallback((layerId: string) => {
    setLayers((prev: Layer[]) => 
      prev.map(l => l.id === layerId ? { ...l, enabled: !l.enabled } : l)
    );
  }, [setLayers]); 

  const updateOpacity = useCallback((layerId: string, opacity: number) => {
    setLayers((prev: Layer[]) => 
      prev.map(l => l.id === layerId ? { ...l, opacity: opacity / 100 } : l)
    );
  }, [setLayers]);

  return {
    toggleLayer,
    updateOpacity,
    isPending: false
  };
};

const useAlerts = (datasetId?: string) => {
  return {
    data: [
      {
        id: 'alert-1',
        datasetId: datasetId || '',
        name: 'High Temperature',
        severity: 'warning' as const,
        status: 'active' as const,
        message: 'TEMP-A-007 reading 92°C (threshold: 85°C)',
        currentValue: 92,
        thresholdValue: 85,
        triggeredAt: new Date(Date.now() - 60000)
      }
    ],
    isLoading: false,
    error: null
  };
};

const useAlertMutations = () => {
  return {
    acknowledgeAlert: async (alertId: string) => console.log('Acknowledging:', alertId),
    resolveAlert: async (alertId: string) => console.log('Resolving:', alertId),
    isPending: false
  };
};

const useInsights = (datasetId: string) => {
  return {
    data: [{
      id: 'insight-1',
      type: 'anomaly' as const,
      severity: 'info' as const,
      title: 'Unusual Pattern Detected',
      summary: 'Temperature sensors in Zone B showing 15% higher variance than normal',
      confidence: 0.87,
      createdAt: new Date(Date.now() - 720000),
      isResolved: false
    }],
    isLoading: false,
    error: null
  };
};

const useInsightMutations = () => {
  return {
    triggerAnalysis: async (datasetId: string) => new Promise(resolve => setTimeout(resolve, 3000)),
    isPending: false
  };
};

const useActivities = (datasetId: string, limit: number = 5) => {
  return {
    data: [
      {
        id: 'act-1',
        action: 'sensor.calibrated',
        resource: 'Sensor',
        resourceId: 'TEMP-A-012',
        createdAt: new Date(Date.now() - 60000),
        metadata: { zone: 'A' }
      },
      {
        id: 'act-2',
        action: 'alert.triggered',
        resource: 'Alert',
        resourceId: 'alert-1',
        createdAt: new Date(Date.now() - 180000),
        metadata: { severity: 'warning' }
      }
    ],
    isLoading: false,
    error: null
  };
};


// ============================================
// MAIN COMPONENT
// ============================================

interface DatasetViewerProps {
  datasetId: string;
}

const DatasetViewer: React.FC<DatasetViewerProps> = ({ datasetId }) => {
  

  // ============================================
  // VALIDACIÓN TEMPRANA
  // ============================================
  if (!datasetId || datasetId === 'undefined') {
    console.error('❌ Validación falló con datasetId:', datasetId);
    return (
      <div className="h-screen w-full bg-[#0a0a0a] text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={48} />
          <div className="text-sm text-gray-400">
            Invalid dataset ID: {String(datasetId)}
          </div>
        </div>
      </div>
    );
  }
  

  // ============================================
  // HOOKS
  // ============================================

  const {
    mapping,
    isLoading: mappingLoading,
    isReady: mappingReady,
    saveMapping,
  } = useDatasetMapping(datasetId, {
    autoLoad: true,
  });

    // ✅ AÑADIR: Estado del configurador
  const [showMappingConfig, setShowMappingConfig] = useState(false);

  // ✅ AÑADIR: Buffer de mensajes raw (antes de normalizar)
  const [rawMessages, setRawMessages] = useState<any[]>([]);
  const [normalizedMessages, setNormalizedMessages] = useState<DataPoint[]>([]);

  const { dataset, loading: datasetLoading, error: datasetError } = useDataset(datasetId);

  const handleRawDataReceived = useCallback((rawData: any) => {
    console.log('📨 Raw data received for configurator:', rawData);
    
    setRawMessages(prev => {
      const updated = [rawData, ...prev];
      return updated.slice(0, 20); // Guardar solo los últimos 20
    });
  }, []);
  
  const handleDataReceived = useCallback((point: DataPoint) => {
    console.log('📊 New data point received:', point);
    setNormalizedMessages(prev => {
      const updated = [point, ...prev];
      return updated.slice(0, 20);
    });
  }, []);

  const handleAlertReceived = useCallback((alert: Alert) => {
    console.log('🚨 New alert received:', alert);
  }, []);

  const handleError = useCallback((error: string) => {
    console.error('❌ WebSocket error:', error);
  }, []);

  const handleConnectionChange = useCallback((status: string) => {
    console.log('🔌 Connection status:', status);
  }, []);

  const {
    dataPoints,
    alerts: realtimeAlerts,
    metadata: dataPointsMetadata,
    status: wsStatus,
    isLoading: dataPointsLoading,
    error: dataPointsError,
    isEmpty: dataPointsEmpty,
    isConnected,
    isAuthenticated,
    filters: dataPointsFilters,
    
    // Acciones
    connect: connectWS,
    disconnect: disconnectWS,
    reconnect: reconnectWS,
    getHistory,
    clearData,
    
    // Filtros
    updateFilters: updateDataPointsFilters,
    clearFilters: clearDataPointsFilters,
    updateLimit: updateDataPointsLimit,
    
    // Utilidades
    getPointsBySensorType,
    getPointsBySensorId,
    getStats: getDataPointsStats,
    hasData,
    hasAlerts,
  } = useRealtimeDataPoints(datasetId, {
    initialLimit: 1000,
    autoConnect: true,
    initialFilters: {},
    onDataReceived: handleDataReceived, 
    onRawDataReceived: handleRawDataReceived,
    onAlertReceived: handleAlertReceived,
    onError: handleError,
    onConnectionChange: handleConnectionChange,
    silentErrors: false,
    reconnectInterval: 3000,
    maxReconnectAttempts: 5,
  });


  // ✅ AÑADIR: Auto-abrir configurador si no hay mapping
  useEffect(() => {
    // Si no hay mapping Y hay mensajes raw Y el configurador no está abierto
    if (!mappingReady && rawMessages.length > 0 && !showMappingConfig) {
      // Esperar 2 segundos antes de abrir (para que vea los datos llegando)
      const timer = setTimeout(() => {
        setShowMappingConfig(true);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [mappingReady, rawMessages.length, showMappingConfig]);

  // ✅ AÑADIR: Handler para guardar mapping
  const handleSaveMapping = async (config: any) => {
    const success = await saveMapping(config);
    if (success) {
      // Cerrar configurador
      setShowMappingConfig(false);
      
      // Opcional: Reconectar WebSocket para aplicar nuevo mapping
      // reconnectWS();
      
      // O simplemente recargar la página
      window.location.reload();
    }
    return success;
  };

 
  const { data: layers } = useLayers(datasetId);
  const { toggleLayer, updateOpacity } = useLayerMutations(datasetId);
  const { data: alerts } = useAlerts(datasetId);
  const { acknowledgeAlert, resolveAlert } = useAlertMutations();
  const { data: insights } = useInsights(datasetId);
  const { triggerAnalysis } = useInsightMutations();
  const { data: activities } = useActivities(datasetId, 5);

  // ============================================
  // STATE
  // ============================================
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [isLive, setIsLive] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [sparklineData, setSparklineData] = useState<number[][]>([]);
  const [colorMode, setColorMode] = useState<'heatmap' | 'sensor-type'>('heatmap');

  // ============================================
  // COMPUTED VALUES
  // ============================================

  // Combinar alerts de diferentes fuentes si es necesario
  const allAlerts = [...(realtimeAlerts || []), ...(alerts || [])];
  
  // Sensor statistics from current data points
  const sensorStats = useMemo(() => {
    if (!dataPoints || dataPoints.length === 0) return null;
    
    const bySensorType: Record<string, { count: number; sum: number; values: number[] }> = {};
    
    dataPoints.forEach(point => {
      // sensorType ahora está en metadata
      const type = point.metadata?.sensorType || 'unknown';
      if (!bySensorType[type]) {
        bySensorType[type] = { count: 0, sum: 0, values: [] };
      }
      bySensorType[type].count++;
      bySensorType[type].sum += point.value;
      bySensorType[type].values.push(point.value);
    });

    return Object.entries(bySensorType).map(([type, data]) => ({
      type,
      count: data.count,
      avg: data.sum / data.count,
      min: Math.min(...data.values),
      max: Math.max(...data.values)
    }));
  }, [dataPoints]);

  // Value range for heatmap coloring
  const valueRange = useMemo(() => {
    if (!dataPoints || dataPoints.length === 0) return { min: 0, max: 100 };
    const values = dataPoints.map(p => p.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }, [dataPoints]);

  // ============================================
  // HANDLERS
  // ============================================

  const runAIAnalysis = async () => {
    setShowAIModal(true);
    setAiProgress(0);
    
    const progressInterval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setShowAIModal(false), 500);
          return 100;
        }
        return prev + 5;
      });
    }, 150);

    try {
      await triggerAnalysis(datasetId);
    } catch (error) {
      clearInterval(progressInterval);
      setShowAIModal(false);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // ============================================
  // ESTADOS DE LA UI
  // ============================================

  // ✅ AÑADIR: Mostrar alerta si no hay mapping
  const needsConfiguration = !mappingReady && rawMessages.length > 0;
  // ============================================
  // RENDER
  // ============================================

  if (datasetLoading || !dataset || !layers)  {
    return (
      <DatasetLoader
        datasetLoading={datasetLoading}
        dataset={dataset}
        layers={layers}
      />
    );
  }
  if (dataPointsLoading) {
      return (
    <LoadingOverlay
      dataPointsLoading={dataPointsLoading}
      wsStatus={wsStatus}
      dataset={dataset}
    />
  )}
  if (datasetError) {
    return (
      <DatasetError
        datasetError={datasetError}
        reconnectWS={reconnectWS}
      />
    );
  }

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-gray-100 flex flex-col overflow-hidden font-mono">
      {/* ============================================
          TOP BAR - Breadcrumb + Controls
          ============================================ */}
       <div className="h-14 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-sm">
          <Activity size={18} className="text-[#10b981]" />
          <span className="text-gray-500">{dataset.source.toUpperCase()}</span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-100">{dataset?.name}</span>

           <div className="flex items-center gap-2 ml-4">
            <div className={`h-2 w-2 rounded-full ${
              isConnected ? 'bg-[#10b981] animate-pulse' :
              wsStatus === 'connecting' ? 'bg-[#f59e0b] animate-pulse' :
              wsStatus === 'error' ? 'bg-[#ef4444]' :
              'bg-gray-500'
            }`}></div>
            <span className="text-xs text-gray-400">
              {isConnected ? 'Live' :
               wsStatus === 'connecting' ? 'Connecting...' :
               wsStatus === 'authenticating' ? 'Auth...' :
               wsStatus === 'error' ? 'Error' :
               'Disconnected'}
            </span>
          </div>

          {/* ✅ AÑADIR: Indicador de mapping */}
          {needsConfiguration && (
            <div className="flex items-center gap-2 ml-4">
              <AlertTriangle size={16} className="text-yellow-500" />
              <span className="text-xs text-yellow-500">
                Configuración requerida
              </span>
              <button
                onClick={() => setShowMappingConfig(true)}
                className="text-xs px-2 py-1 bg-yellow-600 hover:bg-yellow-700 
                           rounded transition-colors"
              >
                Configurar
              </button>
            </div>
          )}


        </div>
        <div className="flex items-center gap-2">
          <button 
             onClick={() => {
              getHistory();  // ← AÑADIR refresh de data points
            }}
            className="p-2 hover:bg-[#27272a] rounded transition-colors" 
            title="Refresh"
          >
            <RotateCcw size={18} />
          </button>
          <button 
             onClick={() => {
              const newLiveState = !isLive;
              setIsLive(newLiveState);
              
              // WebSocket: conectar o desconectar
              if (newLiveState) {
                if (!isConnected) {
                  connectWS();
                }
              } else {
                disconnectWS();
              }
            }}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${
              isLive ? 'bg-[#10b981] text-black' : 'bg-[#27272a]'
            }`}
          >
            {isLive ? <Pause size={16} /> : <Play size={16} />}
            <span className="text-sm">{isLive ? 'Live' : 'Paused'}</span>
          </button>
          {/* ✅ AÑADIR: Botón para reabrir configurador */}
          {mappingReady && (
            <button
              onClick={() => setShowMappingConfig(true)}
              className="p-2 hover:bg-[#27272a] rounded transition-colors"
              title="Editar Mapping"
            >
              <Settings size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* ============================================
            LEFT PANEL - Layers + Controls
            ============================================ */}
          <div className={`bg-[#18181b] border-r border-[#27272a] transition-all duration-300 overflow-y-auto ${
                    leftPanelCollapsed ? 'w-[60px]' : 'w-[300px]'
                  }`}>
                    <div className="p-4">
                      <button 
                        onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
                        className="absolute top-20 left-2 p-1 bg-[#27272a] rounded hover:bg-[#3f3f46] z-10"
                      >
                        {leftPanelCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                      </button>

                      {!leftPanelCollapsed && (
                        <>
                          {/* Dataset Info 
                          <div className="mb-6 p-3 bg-[#27272a] rounded">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`w-2 h-2 rounded-full animate-pulse ${
                                'bg-[#6b7280]'
                              }`}></div>
                              <h2 className="font-bold text-sm">{dataset?.name}</h2>
                            </div>
                            {dataset?.mqttTopic && (
                              <div className="text-xs text-gray-400 mb-2">
                                {dataset.mqttTopic}
                              </div>
                            )}
                            {healthStatus && (
                              <div className={`text-xs ${
                                healthStatus.status === 'healthy' ? 'text-[#10b981]' :
                                healthStatus.status === 'warning' ? 'text-[#f59e0b]' :
                                'text-[#ef4444]'
                              }`}>
                                {healthStatus.message}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-2">
                              {dataPoints.length} data points • {stats?.totals?.allTimeDataPoints || dataset?.stats?.totalDataPoints || 0} total
                              {dataPointsMetadata?.hasMore && (
                                <span className="text-[#f59e0b]"> • More available</span>
                              )}
                            </div>
                          </div>*/}

                          {/* Visualization Mode */}
                          <div className="mb-6">
                            <h3 className="text-sm font-bold mb-3">Color Mode</h3>
                            <div className="grid grid-cols-2 gap-2">
                              <button 
                                onClick={() => setColorMode('heatmap')}
                                className={`text-xs py-2 rounded ${
                                  colorMode === 'heatmap' ? 'bg-[#3b82f6] text-white' : 'bg-[#27272a]'
                                }`}
                              >
                                Heatmap
                              </button>
                              <button 
                                onClick={() => setColorMode('sensor-type')}
                                className={`text-xs py-2 rounded ${
                                  colorMode === 'sensor-type' ? 'bg-[#3b82f6] text-white' : 'bg-[#27272a]'
                                }`}
                              >
                                By Type
                              </button>
                            </div>
                          </div>

                          

                          {/* Layers */}
                          <div className="mb-6">
                            <h3 className="text-sm font-bold mb-3">Layers</h3>
                            <div className="space-y-2">
                              {layers.map(layer => (
                                <div key={layer.id} className="bg-[#27272a] rounded p-2">
                                  <div className="flex items-center gap-2 mb-2">
                                    <input 
                                      type="checkbox" 
                                      checked={layer.enabled}
                                      onChange={() => toggleLayer(layer.id)}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-xs flex-1">{layer.name}</span>
                                  </div>
                                  <input 
                                    type="range" 
                                    min="0" 
                                    max="100" 
                                    value={layer.opacity * 100}
                                    onChange={(e) => updateOpacity(layer.id, parseInt(e.target.value))}
                                    className="w-full h-1"
                                    disabled={!layer.enabled}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Time Range 
                          <div className="mb-6">
                            <h3 className="text-sm font-bold mb-3">Time Range</h3>
                            <div className="grid grid-cols-2 gap-2">
                              {TIME_RANGE_OPTIONS.map(option => (
                                <button 
                                  key={option.value}
                                  onClick={() => changeRange(option.value)}
                                  className={`text-xs py-2 rounded ${
                                    range === option.value ? 'bg-[#3b82f6] text-white' : 'bg-[#27272a]'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>*/}

                          {/* Sensor Filters */}
                          {!leftPanelCollapsed && (
                            <div className="mb-6">
                              <h3 className="text-sm font-bold mb-3">Sensor Filters</h3>
                              
                              {/* Filter by Sensor Type */}
                              <div className="mb-3">
                                <label className="text-xs text-gray-400 mb-1 block">Sensor Type</label>
                                <select
                                  value={dataPointsFilters.sensorType || ''}
                                  onChange={(e) => updateDataPointsFilters({ 
                                    sensorType: e.target.value || undefined 
                                  })}
                                  className="w-full bg-[#27272a] text-xs py-2 px-2 rounded border border-[#3f3f46] focus:border-[#3b82f6] outline-none"
                                >
                                  <option value="">All Types</option>
                                  {sensorStats?.map(sensor => (
                                    <option key={sensor.type} value={sensor.type}>
                                      {sensor.type} ({sensor.count})
                                    </option>
                                  ))}
                                </select>
                              </div>

                              {/* Clear Filters Button */}
                              {(dataPointsFilters.sensorType || dataPointsFilters.sensorId) && (
                                <button
                                  onClick={clearDataPointsFilters}
                                  className="w-full text-xs py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded transition-colors"
                                >
                                  Clear Filters
                                </button>
                              )}
                            </div>
                          )}

                          {/* Sensor Stats */}
                          {sensorStats && (
                            <div className="mb-6">
                              <h3 className="text-sm font-bold mb-3">Sensors by Type</h3>
                              <div className="space-y-2">
                                {sensorStats.map(sensor => (
                                  <div key={sensor.type} className="bg-[#27272a] rounded p-2">
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-xs font-bold capitalize">{sensor.type}</span>
                                      <span className="text-xs text-gray-400">{sensor.count}</span>
                                    </div>
                                    <div className="text-xs text-gray-400">
                                      Avg: {sensor.avg.toFixed(1)} | Range: {sensor.min.toFixed(1)} - {sensor.max.toFixed(1)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* AI Analysis */}
                          <div className="mb-6">
                            <button 
                              onClick={runAIAnalysis}
                              className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded font-bold text-sm mb-3 transition-colors"
                            >
                              🤖 Analyze Patterns
                            </button>
                            {insights && insights.length > 0 && (
                              <div className="bg-[#27272a] rounded p-3 text-xs">
                                <div className="text-gray-400 mb-1">
                                  Latest Insight ({getTimeAgo(insights[0].createdAt)})
                                </div>
                                <div className="flex items-start gap-2 mb-2">
                                  <TrendingUp size={14} className="text-[#10b981] mt-0.5" />
                                  <div className="flex-1">{insights[0].summary}</div>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Value Range Info */}
                          <div className="bg-[#27272a] rounded p-3">
                            <h3 className="text-xs font-bold mb-2">Value Range</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex-1 h-3 rounded" style={{
                                background: 'linear-gradient(to right, #3b82f6, #10b981, #f59e0b, #ef4444)'
                              }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                              <span>{valueRange.min.toFixed(1)}</span>
                              <span>{valueRange.max.toFixed(1)}</span>
                            </div>
                          </div>
                          
                          </>
                      )}
                    </div>
          </div>

        {/* ============================================
            CENTER PANEL - 3D Viewer
            ============================================ */}
        <Viewer3DPanel
          dataPoints={dataPoints}
          layers={layers}
          selectedPoint={selectedPoint}
          onPointSelect={setSelectedPoint}  // ← Callback simplificado
          colorMode={colorMode}
          valueRange={valueRange}
          isLive={isLive}
          onViewChange={(view) => {
            console.log('View changed to:', view);
          }}
        />

        {/* ============================================
            RIGHT PANEL - Alerts + Activity
            ============================================ */}
        <div className="w-[280px] bg-[#18181b] border-l border-[#27272a] overflow-y-auto p-4">
          {/* Real-time Metrics Sparklines */}
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Activity size={16} />
              Real-time Metrics
            </h3>
            <div className="space-y-3">
              {['Active AGVs', 'Deliveries/hour', 'Avg Speed'].map((metric, i) => (
                <div key={i} className="bg-[#27272a] rounded p-3">
                  <div className="text-xs text-gray-400 mb-2">{metric}</div>
                  <div className="h-12 flex items-end justify-between">
                    {sparklineData[i] && sparklineData[i].length > 0 ? (
                      sparklineData[i].map((height, j) => (
                        <div 
                          key={j} 
                          className="w-1 bg-[#10b981] rounded-t"
                          style={{ height: `${height}%` }}
                        />
                      ))
                    ) : (
                      // Placeholder durante SSR
                      [...Array(20)].map((_, j) => (
                        <div 
                          key={j} 
                          className="w-1 bg-[#27272a] rounded-t"
                          style={{ height: '50%' }}
                        />
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts Section */}
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#f59e0b]" />
              Alerts ({alerts?.length || 0})
            </h3>
            <div className="space-y-2">
              {alerts && alerts.length > 0 ? (
                alerts.map(alert => (
                  <div key={alert.id} className="bg-[#27272a] rounded p-3">
                    <div className="flex items-start gap-2 mb-2">
                      <AlertTriangle 
                        size={14} 
                        className={
                          alert.severity === 'warning'
                            ? 'text-[#f59e0b]'
                            : 'text-gray-500'
                        }
                      />
                      <div className="flex-1">
                        <div className="text-sm font-bold">{alert.name}</div>
                        <div className="text-xs text-gray-400">{alert.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {getTimeAgo(alert.triggeredAt)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="flex-1 text-xs py-1 bg-[#3b82f6] hover:bg-[#2563eb] rounded transition-colors"
                      >
                        Acknowledge
                      </button>
                      <button 
                        onClick={() => resolveAlert(alert.id)}
                        className="flex-1 text-xs py-1 bg-[#18181b] hover:bg-[#000] rounded transition-colors"
                      >
                        Resolve
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-[#27272a] rounded p-3 text-xs text-gray-400 text-center">
                  No active alerts
                </div>
              )}
            </div>
          </div>

          {/* Export Options */}
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3">Export Options</h3>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-2 text-xs py-2 px-3 bg-[#27272a] hover:bg-[#3f3f46] rounded transition-colors">
                <FileDown size={14} />
                Fleet Report PDF
              </button>
              <button className="w-full flex items-center gap-2 text-xs py-2 px-3 bg-[#27272a] hover:bg-[#3f3f46] rounded transition-colors">
                <Database size={14} />
                Export Telemetry CSV
              </button>
              <button 
                className="w-full flex items-center gap-2 text-xs py-2 px-3 bg-[#27272a] hover:bg-[#3f3f46] rounded transition-colors opacity-50 cursor-not-allowed" 
                title="Upgrade to Pro"
                disabled
              >
                <Share2 size={14} />
                Share Dashboard 🔒
              </button>
              <button className="w-full flex items-center gap-2 text-xs py-2 px-3 bg-[#27272a] hover:bg-[#3f3f46] rounded transition-colors">
                <Image size={14} />
                Screenshot View
              </button>
            </div>
          </div>
         
        </div>

        {/* ============================================
          MODAL: Configurador de Mapping
          ============================================ */}
          {showMappingConfig && (
            <MappingConfigurator
              rawMessages={rawMessages.length > 0 ? rawMessages : normalizedMessages}
              onSave={handleSaveMapping}
              onClose={() => setShowMappingConfig(false)}
              datasetId={datasetId}
              initialMapping={mapping}
            />
          )}
      
      </div>

    </div>
  );
};

export default DatasetViewer;
