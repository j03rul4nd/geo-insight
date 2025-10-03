'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, Settings, Share2, FileDown, Image, Play, Pause, ChevronLeft, ChevronRight, RotateCcw, AlertTriangle, Activity, Zap, TrendingUp, Clock, Database, Navigation, Battery, Package, Truck } from 'lucide-react';

interface Layer {
  id: number;
  name: string;
  count: number;
  enabled: boolean;
  color: string;
  opacity: number;
}

interface DataPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  temp: number;
  type: 'agv' | 'station' | 'loading';
  lastUpdate: number;
  status?: 'moving' | 'idle' | 'charging' | 'loading';
  battery?: number;
  speed?: number;
  destination?: string;
  cargo?: string;
  route?: string;
}

interface Anomaly {
  id: number;
  zone: string;
  type: string;
  detail: string;
  severity: 'warning' | 'critical';
}

interface Activity {
  time: string;
  event: string;
  type: 'info' | 'warning' | 'success';
}

type TimeRange = 'hour' | 'today' | 'week' | 'custom';

const DatasetViewer: React.FC = () => {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('hour');
  const [autoUpdate, setAutoUpdate] = useState<boolean>(true);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [aiProgress, setAiProgress] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  const [layers, setLayers] = useState<Layer[]>([
    { id: 1, name: 'AGV Fleet', count: 12, enabled: true, color: '#10b981', opacity: 100 },
    { id: 2, name: 'Charging Stations', count: 4, enabled: true, color: '#f59e0b', opacity: 100 },
    { id: 3, name: 'Loading Zones', count: 8, enabled: true, color: '#3b82f6', opacity: 75 },
    { id: 4, name: 'AGV Routes', count: 0, enabled: false, color: '#8b5cf6', opacity: 50 }
  ]);

  const anomalies: Anomaly[] = [
    { id: 1, zone: 'AGV-007', type: 'Low Battery', detail: '12% remaining', severity: 'warning' },
    { id: 2, zone: 'Zone C', type: 'Path Blocked', detail: 'AGV-003 waiting', severity: 'critical' }
  ];

  const activities: Activity[] = [
    { time: '1m ago', event: 'AGV-005 completed delivery', type: 'success' },
    { time: '3m ago', event: 'AGV-007 battery low alert', type: 'warning' },
    { time: '8m ago', event: 'AGV-012 started charging', type: 'info' },
    { time: '15m ago', event: 'Route optimization applied', type: 'success' },
    { time: '22m ago', event: 'AGV-003 arrived at Zone B', type: 'info' }
  ];

  // Simulated AGV and station data
  const generateDataPoints = (): DataPoint[] => {
    const points: DataPoint[] = [];
    const statuses: ('moving' | 'idle' | 'charging' | 'loading')[] = ['moving', 'idle', 'charging', 'loading'];
    const routes = ['Route A→B', 'Route C→D', 'Route E→F', 'Warehouse Loop'];
    const cargos = ['Pallet-Steel', 'Box-Electronics', 'Container-Parts', 'Empty'];
    
    // AGVs
    for (let i = 1; i <= 12; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      points.push({
        id: `AGV-${String(i).padStart(3, '0')}`,
        x: (Math.random() - 0.5) * 90,
        y: (Math.random() - 0.5) * 70,
        z: 0,
        temp: 35 + Math.random() * 15,
        type: 'agv',
        status,
        battery: Math.floor(Math.random() * 100),
        speed: status === 'moving' ? Math.random() * 5 : 0,
        destination: status === 'moving' ? `Zone ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}` : undefined,
        cargo: cargos[Math.floor(Math.random() * cargos.length)],
        route: routes[Math.floor(Math.random() * routes.length)],
        lastUpdate: Math.floor(Math.random() * 60)
      });
    }
    
    // Charging Stations
    for (let i = 1; i <= 4; i++) {
      points.push({
        id: `CHG-${i}`,
        x: -80 + (i - 1) * 53,
        y: 60,
        z: 0,
        temp: 25,
        type: 'station',
        status: Math.random() > 0.5 ? 'idle' : 'charging',
        lastUpdate: Math.floor(Math.random() * 120)
      });
    }
    
    // Loading Zones
    for (let i = 1; i <= 8; i++) {
      points.push({
        id: `LOAD-${String.fromCharCode(64 + i)}`,
        x: -90 + (i - 1) * 25,
        y: -60,
        z: 0,
        temp: 22,
        type: 'loading',
        status: Math.random() > 0.6 ? 'loading' : 'idle',
        lastUpdate: Math.floor(Math.random() * 180)
      });
    }
    
    return points;
  };

  const [dataPoints, setDataPoints] = useState<DataPoint[]>(generateDataPoints());

  // Animate AGVs
  useEffect(() => {
    if (!isLive || !autoUpdate) return;
    
    const interval = setInterval(() => {
      setDataPoints(prev => prev.map(point => {
        if (point.type === 'agv' && point.status === 'moving') {
          return {
            ...point,
            x: point.x + (Math.random() - 0.5) * 2,
            y: point.y + (Math.random() - 0.5) * 2,
            lastUpdate: 0
          };
        }
        return point;
      }));
    }, 100);
    
    return () => clearInterval(interval);
  }, [isLive, autoUpdate]);

  // Canvas 3D rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    const height = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = width / (2 * window.devicePixelRatio);
    const centerY = height / (2 * window.devicePixelRatio);

    const draw = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 0.5;
      const gridSize = 20;
      for (let i = -5; i <= 5; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + i * gridSize - 100, centerY - 80);
        ctx.lineTo(centerX + i * gridSize - 100, centerY + 80);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - 100, centerY + i * gridSize);
        ctx.lineTo(centerX + 100, centerY + i * gridSize);
        ctx.stroke();
      }

      // Draw axes
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 120, centerY);
      ctx.lineTo(centerX + 120, centerY);
      ctx.stroke();
      
      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 100);
      ctx.lineTo(centerX, centerY + 100);
      ctx.stroke();

      // Draw data points
      dataPoints.forEach((point) => {
        let layer;
        if (point.type === 'agv') layer = layers[0];
        else if (point.type === 'station') layer = layers[1];
        else layer = layers[2];
        
        if (!layer.enabled) return;

        const scale = 1 + Math.sin(rotation.y * 0.01) * 0.2;
        const projX = centerX + point.x * scale * Math.cos(rotation.y * 0.01) + rotation.x * 0.3;
        const projY = centerY + point.y * scale + point.z * 0.5 * Math.sin(rotation.y * 0.01);

        // Draw marker based on type
        if (point.type === 'agv') {
          const size = 8;
          ctx.fillStyle = layer.color + Math.floor(layer.opacity * 2.55).toString(16).padStart(2, '0');
          
          // AGV triangle pointing in direction of movement
          ctx.beginPath();
          ctx.moveTo(projX, projY - size);
          ctx.lineTo(projX - size, projY + size);
          ctx.lineTo(projX + size, projY + size);
          ctx.closePath();
          ctx.fill();
          
          // Status indicator
          if (point.status === 'moving') {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(projX, projY - size - 3, 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (point.status === 'charging') {
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(projX, projY - size - 3, 2, 0, Math.PI * 2);
            ctx.fill();
          }
          
          // ID label
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(point.id, projX, projY + size + 12);
          
        } else if (point.type === 'station') {
          const size = 10;
          ctx.fillStyle = layer.color + Math.floor(layer.opacity * 2.55).toString(16).padStart(2, '0');
          ctx.fillRect(projX - size/2, projY - size/2, size, size);
          
          // Charging icon
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(projX + 2, projY - 4);
          ctx.lineTo(projX - 2, projY);
          ctx.lineTo(projX + 1, projY);
          ctx.lineTo(projX - 2, projY + 4);
          ctx.stroke();
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(point.id, projX, projY + size + 10);
          
        } else if (point.type === 'loading') {
          const size = 7;
          ctx.fillStyle = layer.color + Math.floor(layer.opacity * 2.55).toString(16).padStart(2, '0');
          ctx.beginPath();
          ctx.arc(projX, projY, size, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = '#ffffff';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(point.id, projX, projY + size + 10);
        }

        // Highlight if hovered or selected
        if (hoveredPoint?.id === point.id || selectedPoint?.id === point.id) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(projX, projY, 15, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    };

    draw();

    const interval = setInterval(() => {
      if (isLive && autoUpdate) {
        setRotation(prev => ({ ...prev, y: prev.y + 0.3 }));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [dataPoints, layers, rotation, hoveredPoint, selectedPoint, isLive, autoUpdate]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Find closest point to click
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    let closestPoint: DataPoint | null = null;
    let minDist = Infinity;
    
    dataPoints.forEach(point => {
      const scale = 1 + Math.sin(rotation.y * 0.01) * 0.2;
      const projX = centerX + point.x * scale * Math.cos(rotation.y * 0.01) + rotation.x * 0.3;
      const projY = centerY + point.y * scale + point.z * 0.5 * Math.sin(rotation.y * 0.01);
      
      const dist = Math.sqrt((projX - x) ** 2 + (projY - y) ** 2);
      if (dist < 20 && dist < minDist) {
        minDist = dist;
        closestPoint = point;
      }
    });
    
    setSelectedPoint(closestPoint);
  };

  const toggleLayer = (id: number) => {
    setLayers(layers.map(l => l.id === id ? { ...l, enabled: !l.enabled } : l));
  };

  const updateOpacity = (id: number, opacity: number) => {
    setLayers(layers.map(l => l.id === id ? { ...l, opacity } : l));
  };

  const runAIAnalysis = () => {
    setShowAIModal(true);
    setAiProgress(0);
    const interval = setInterval(() => {
      setAiProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setShowAIModal(false);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
  };

  const getTimeRangeLabel = (range: TimeRange): string => {
    const labels: Record<TimeRange, string> = {
      hour: 'Last Hour',
      today: 'Today',
      week: 'Last 7 Days',
      custom: 'Custom'
    };
    return labels[range];
  };

  const getActivityColor = (type: Activity['type']): string => {
    const colors: Record<Activity['type'], string> = {
      warning: 'bg-[#f59e0b]',
      success: 'bg-[#10b981]',
      info: 'bg-[#3b82f6]'
    };
    return colors[type];
  };

  const getStatusColor = (status?: string): string => {
    const colors: Record<string, string> = {
      moving: '#10b981',
      idle: '#6b7280',
      charging: '#f59e0b',
      loading: '#3b82f6'
    };
    return colors[status || 'idle'] || '#6b7280';
  };

  const getStatusIcon = (status?: string) => {
    switch(status) {
      case 'moving': return <Navigation size={14} className="text-[#10b981]" />;
      case 'charging': return <Battery size={14} className="text-[#f59e0b]" />;
      case 'loading': return <Package size={14} className="text-[#3b82f6]" />;
      default: return <Pause size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-gray-100 flex flex-col overflow-hidden font-mono">
      {/* Top Bar */}
      <div className="h-14 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-4">
        <div className="flex items-center gap-2 text-sm">
          <Truck size={18} className="text-[#10b981]" />
          <span className="text-gray-500">AGV Fleet</span>
          <span className="text-gray-500">/</span>
          <span className="text-gray-100">Factory Floor - Warehouse A</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#27272a] rounded transition-colors" title="Configure Dataset">
            <Settings size={18} />
          </button>
          <button 
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-3 py-2 rounded transition-colors ${isLive ? 'bg-[#10b981] text-black' : 'bg-[#27272a]'}`}
          >
            {isLive ? <Pause size={16} /> : <Play size={16} />}
            <span className="text-sm">{isLive ? 'Live' : 'Paused'}</span>
          </button>
          <button className="p-2 hover:bg-[#27272a] rounded transition-colors">
            <span className="text-sm">⋮</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel */}
        <div className={`bg-[#18181b] border-r border-[#27272a] transition-all duration-300 overflow-y-auto ${leftPanelCollapsed ? 'w-[60px]' : 'w-[300px]'}`}>
          <div className="p-4">
            <button 
              onClick={() => setLeftPanelCollapsed(!leftPanelCollapsed)}
              className="absolute top-20 left-2 p-1 bg-[#27272a] rounded hover:bg-[#3f3f46] z-10"
            >
              {leftPanelCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            {!leftPanelCollapsed && (
              <>
                {/* Dataset Info */}
                <div className="mb-6 p-3 bg-[#27272a] rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse"></div>
                    <h2 className="font-bold">AGV Fleet Monitor</h2>
                  </div>
                  <div className="text-xs text-gray-400 mb-3">
                    Source: MQTT • agv-control.factory.local
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-400">Active AGVs</div>
                      <div className="text-lg font-bold text-[#10b981]">12/12</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Last Update</div>
                      <div className="text-[#10b981]">Live</div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    Avg Fleet Efficiency: <span className="text-gray-100">94.2%</span>
                  </div>
                </div>

                {/* Layers */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold">Layers</h3>
                    <button className="text-xs text-[#3b82f6] hover:underline">Show/Hide All</button>
                  </div>
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
                          <div className="w-3 h-3 rounded" style={{ backgroundColor: layer.color }}></div>
                          <span className="text-xs flex-1">{layer.name}</span>
                          <span className="text-xs text-gray-500">({layer.count})</span>
                          <Settings size={12} className="text-gray-500 cursor-pointer hover:text-gray-300" />
                        </div>
                        <input 
                          type="range" 
                          min="0" 
                          max="100" 
                          value={layer.opacity}
                          onChange={(e) => updateOpacity(layer.id, parseInt(e.target.value))}
                          className="w-full h-1"
                          disabled={!layer.enabled}
                        />
                        <div className="text-xs text-gray-500 text-right">{layer.opacity}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Time Controls */}
                <div className="mb-6">
                  <h3 className="text-sm font-bold mb-3">Time Controls</h3>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {(['hour', 'today', 'week', 'custom'] as TimeRange[]).map(range => (
                      <button 
                        key={range}
                        onClick={() => setTimeRange(range)}
                        className={`text-xs py-2 rounded ${timeRange === range ? 'bg-[#3b82f6] text-white' : 'bg-[#27272a]'}`}
                      >
                        {getTimeRangeLabel(range)}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-xs">
                    <input 
                      type="checkbox" 
                      checked={autoUpdate}
                      onChange={(e) => setAutoUpdate(e.target.checked)}
                      className="w-4 h-4"
                    />
                    Auto-update (real-time)
                  </label>
                </div>

                {/* AI Analysis */}
                <div className="mb-6">
                  <button 
                    onClick={runAIAnalysis}
                    className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white py-3 rounded font-bold text-sm mb-3 transition-colors"
                  >
                    🤖 Optimize Routes
                  </button>
                  <div className="bg-[#27272a] rounded p-3 text-xs">
                    <div className="text-gray-400 mb-1">Latest Insight (12m ago)</div>
                    <div className="flex items-start gap-2 mb-2">
                      <TrendingUp size={14} className="text-[#10b981] mt-0.5" />
                      <div className="flex-1">Route efficiency improved by 8% with new algorithm</div>
                    </div>
                    <button className="text-[#3b82f6] hover:underline">View Full Report →</button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">5/10 optimizations this month</div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold mb-3">Fleet Stats</h3>
                  <div className="bg-[#27272a] rounded p-3">
                    <div className="text-xs text-gray-400">Avg Battery</div>
                    <div className="text-xl font-bold">76% <span className="text-[#10b981] text-sm">↑5%</span></div>
                  </div>
                  <div className="bg-[#27272a] rounded p-3">
                    <div className="text-xs text-gray-400">Active Deliveries</div>
                    <div className="text-xl font-bold">7/12</div>
                  </div>
                  <div className="bg-[#27272a] rounded p-3">
                    <div className="text-xs text-gray-400">Alerts</div>
                    <div className="text-xl font-bold text-[#f59e0b]">2 warnings</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center Panel - 3D Viewer */}
        <div className="flex-1 relative">
          <canvas 
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="w-full h-full cursor-crosshair"
          />
          
          {/* Controls Overlay */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <button 
              onClick={() => setRotation({ x: 0, y: 0 })}
              className="bg-[#18181b]/90 backdrop-blur p-2 rounded hover:bg-[#27272a] transition-colors"
              title="Reset View"
            >
              <RotateCcw size={16} />
            </button>
            <button className="bg-[#18181b]/90 backdrop-blur px-3 py-2 rounded hover:bg-[#27272a] text-xs transition-colors">Top</button>
            <button className="bg-[#18181b]/90 backdrop-blur px-3 py-2 rounded hover:bg-[#27272a] text-xs transition-colors">Front</button>
            <button className="bg-[#18181b]/90 backdrop-blur px-3 py-2 rounded hover:bg-[#27272a] text-xs transition-colors">Side</button>
          </div>

          {/* Legend */}
          <div className="absolute top-4 right-4 bg-[#18181b]/90 backdrop-blur p-3 rounded">
            <div className="text-xs font-bold mb-2">Legend</div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#10b981] rotate-45"></div>
                <span>AGV</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#f59e0b]"></div>
                <span>Charging Station</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[#3b82f6] rounded-full"></div>
                <span>Loading Zone</span>
              </div>
            </div>
          </div>

          {/* Detailed Info Panel */}
          {selectedPoint && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-[#18181b]/95 backdrop-blur border border-[#27272a] rounded-lg p-5 min-w-[400px] shadow-2xl">
              <button 
                onClick={() => setSelectedPoint(null)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-300 text-lg"
              >
                ✕
              </button>

              {selectedPoint.type === 'agv' ? (
                <>
                  {/* AGV Header */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#27272a]">
                    <div className="w-12 h-12 bg-[#10b981] rounded-lg flex items-center justify-center">
                      <Truck size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-bold">{selectedPoint.id}</div>
                      <div className="flex items-center gap-2 text-xs">
                        {getStatusIcon(selectedPoint.status)}
                        <span className="capitalize" style={{ color: getStatusColor(selectedPoint.status) }}>
                          {selectedPoint.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Last Update</div>
                      <div className="text-sm font-bold">{selectedPoint.lastUpdate}s ago</div>
                    </div>
                  </div>

                  {/* AGV Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#27272a] rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Battery size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-400">Battery Level</span>
                      </div>
                      <div className="text-2xl font-bold">{selectedPoint.battery}%</div>
                      <div className="w-full bg-[#18181b] rounded-full h-2 mt-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            (selectedPoint.battery || 0) > 50 ? 'bg-[#10b981]' : 
                            (selectedPoint.battery || 0) > 20 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'
                          }`}
                          style={{ width: `${selectedPoint.battery}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-[#27272a] rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Activity size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-400">Speed</span>
                      </div>
                      <div className="text-2xl font-bold">{selectedPoint.speed?.toFixed(1)} m/s</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {selectedPoint.status === 'moving' ? 'In motion' : 'Stationary'}
                      </div>
                    </div>

                    <div className="bg-[#27272a] rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Package size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-400">Current Load</span>
                      </div>
                      <div className="text-sm font-bold">{selectedPoint.cargo}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        Weight: {Math.floor(Math.random() * 500 + 100)}kg
                      </div>
                    </div>

                    <div className="bg-[#27272a] rounded p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Navigation size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-400">Destination</span>
                      </div>
                      <div className="text-sm font-bold">{selectedPoint.destination || 'None'}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        ETA: {selectedPoint.destination ? '3m 24s' : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Route Information */}
                  <div className="bg-[#27272a] rounded p-3 mb-4">
                    <div className="text-xs text-gray-400 mb-2">Current Route</div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-sm font-bold">{selectedPoint.route}</div>
                      <div className="flex-1 h-1 bg-[#18181b] rounded-full overflow-hidden">
                        <div className="h-full bg-[#3b82f6] rounded-full" style={{ width: '67%' }}></div>
                      </div>
                      <span className="text-xs text-gray-400">67%</span>
                    </div>
                    <div className="text-xs text-gray-400">
                      Distance traveled: 234m / Total: 350m
                    </div>
                  </div>

                  {/* Position */}
                  <div className="bg-[#27272a] rounded p-3 mb-4">
                    <div className="text-xs text-gray-400 mb-2">Position (X, Y, Z)</div>
                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-gray-400">X:</span> {selectedPoint.x.toFixed(1)}m
                      </div>
                      <div>
                        <span className="text-gray-400">Y:</span> {selectedPoint.y.toFixed(1)}m
                      </div>
                      <div>
                        <span className="text-gray-400">Z:</span> {selectedPoint.z.toFixed(1)}m
                      </div>
                    </div>
                  </div>

                  {/* Recent History */}
                  <div className="bg-[#27272a] rounded p-3">
                    <div className="text-xs font-bold mb-2">Recent Activity</div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">2m ago</span>
                        <span>Picked up cargo at LOAD-C</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">8m ago</span>
                        <span>Completed delivery to Zone B</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">15m ago</span>
                        <span>Charging completed (100%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <button className="bg-[#3b82f6] hover:bg-[#2563eb] py-2 rounded text-xs transition-colors">
                      Track Live
                    </button>
                    <button className="bg-[#27272a] hover:bg-[#3f3f46] py-2 rounded text-xs transition-colors">
                      View History
                    </button>
                    <button className="bg-[#27272a] hover:bg-[#3f3f46] py-2 rounded text-xs transition-colors">
                      Send Command
                    </button>
                  </div>
                </>
              ) : selectedPoint.type === 'station' ? (
                <>
                  {/* Charging Station */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#27272a]">
                    <div className="w-12 h-12 bg-[#f59e0b] rounded-lg flex items-center justify-center">
                      <Battery size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-bold">{selectedPoint.id}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="capitalize" style={{ color: getStatusColor(selectedPoint.status) }}>
                          {selectedPoint.status === 'charging' ? 'In Use' : 'Available'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-[#27272a] rounded p-3">
                      <div className="text-xs text-gray-400 mb-1">Status</div>
                      <div className="text-lg font-bold">
                        {selectedPoint.status === 'charging' ? 'Charging AGV-003' : 'Available'}
                      </div>
                      {selectedPoint.status === 'charging' && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-400">Progress</span>
                            <span>78%</span>
                          </div>
                          <div className="w-full bg-[#18181b] rounded-full h-2">
                            <div className="h-2 bg-[#10b981] rounded-full" style={{ width: '78%' }}></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#27272a] rounded p-3">
                      <div className="text-xs text-gray-400 mb-2">Today's Usage</div>
                      <div className="text-xl font-bold">6 charges</div>
                      <div className="text-xs text-gray-400 mt-1">Avg charge time: 18m</div>
                    </div>

                    <div className="bg-[#27272a] rounded p-3">
                      <div className="text-xs text-gray-400 mb-2">Power Output</div>
                      <div className="text-xl font-bold">7.2 kW</div>
                      <div className="text-xs text-gray-400 mt-1">Efficiency: 96.5%</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Loading Zone */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#27272a]">
                    <div className="w-12 h-12 bg-[#3b82f6] rounded-lg flex items-center justify-center">
                      <Package size={24} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="text-lg font-bold">Loading Zone {selectedPoint.id}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="capitalize" style={{ color: getStatusColor(selectedPoint.status) }}>
                          {selectedPoint.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-[#27272a] rounded p-3">
                      <div className="text-xs text-gray-400 mb-1">Current Operation</div>
                      <div className="text-lg font-bold">
                        {selectedPoint.status === 'loading' ? 'Loading AGV-005' : 'Ready'}
                      </div>
                      {selectedPoint.status === 'loading' && (
                        <div className="text-xs text-gray-400 mt-1">Est. completion: 2m 15s</div>
                      )}
                    </div>

                    <div className="bg-[#27272a] rounded p-3">
                      <div className="text-xs text-gray-400 mb-2">Today's Activity</div>
                      <div className="text-xl font-bold">23 loads</div>
                      <div className="text-xs text-gray-400 mt-1">Avg loading time: 4m 32s</div>
                    </div>

                    <div className="bg-[#27272a] rounded p-3">
                      <div className="text-xs text-gray-400 mb-2">Queue Status</div>
                      <div className="text-xl font-bold">
                        {selectedPoint.status === 'loading' ? '1 waiting' : 'No queue'}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">Next: AGV-009 in 5m</div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-[280px] bg-[#18181b] border-l border-[#27272a] overflow-y-auto p-4">
          {/* Live Metrics */}
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
                    {[...Array(20)].map((_, j) => (
                      <div 
                        key={j} 
                        className="w-1 bg-[#10b981] rounded-t"
                        style={{ height: `${20 + Math.random() * 80}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Anomalies */}
          <div className="mb-6">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#f59e0b]" />
              Alerts
            </h3>
            <div className="space-y-2">
              {anomalies.map(anomaly => (
                <div key={anomaly.id} className="bg-[#27272a] rounded p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertTriangle size={14} className={anomaly.severity === 'critical' ? 'text-[#ef4444]' : 'text-[#f59e0b]'} />
                    <div className="flex-1">
                      <div className="text-sm font-bold">{anomaly.zone}</div>
                      <div className="text-xs text-gray-400">{anomaly.type}: {anomaly.detail}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 text-xs py-1 bg-[#3b82f6] hover:bg-[#2563eb] rounded transition-colors">Locate</button>
                    <button className="flex-1 text-xs py-1 bg-[#18181b] hover:bg-[#000] rounded transition-colors">Resolve</button>
                  </div>
                </div>
              ))}
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
              <button className="w-full flex items-center gap-2 text-xs py-2 px-3 bg-[#27272a] hover:bg-[#3f3f46] rounded transition-colors opacity-50 cursor-not-allowed" title="Upgrade to Pro">
                <Share2 size={14} />
                Share Dashboard 🔒
              </button>
              <button className="w-full flex items-center gap-2 text-xs py-2 px-3 bg-[#27272a] hover:bg-[#3f3f46] rounded transition-colors">
                <Image size={14} />
                Screenshot View
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <Clock size={16} />
              Recent Activity
            </h3>
            <div className="space-y-2 text-xs">
              {activities.map((activity, i) => (
                <div key={i} className="flex items-start gap-2 pb-2 border-b border-[#27272a] last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-1 ${getActivityColor(activity.type)}`}></div>
                  <div className="flex-1">
                    <div className="text-gray-400">{activity.time}</div>
                    <div>{activity.event}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">🤖 Optimizing Routes</h3>
            <p className="text-sm text-gray-400 mb-4">Analyzing fleet movements and optimizing paths...</p>
            <div className="w-full bg-[#27272a] rounded-full h-2 mb-2">
              <div 
                className="bg-[#3b82f6] h-2 rounded-full transition-all duration-300"
                style={{ width: `${aiProgress}%` }}
              ></div>
            </div>
            <div className="text-right text-sm text-gray-400">{aiProgress}%</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetViewer;