"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Database, MapPin, Bell, TrendingUp, ArrowUpRight } from 'lucide-react';
import { staticAssets, datasets, alerts, parks } from './types';
import type { Asset } from './types';

import { MapboxManager, renderMapboxError } from './mapbox-manager';

export function DigitalTwinDashboard() {
  const mapManager = useRef<MapboxManager | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [time, setTime] = useState<Date>(new Date());
  const [activeAssets, setActiveAssets] = useState<number>(1247);
  const [messageRate, setMessageRate] = useState<number>(3821);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [sidebarWidth, setSidebarWidth] = useState<number>(420);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const mapContainer = useRef<HTMLDivElement | null>(null);

  // Detectar si es mobile (solo en el cliente)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const statsTimer = setInterval(() => {
      setActiveAssets(prev => prev + Math.floor(Math.random() * 10 - 5));
      setMessageRate(prev => prev + Math.floor(Math.random() * 200 - 100));
    }, 2000);
    return () => {
      clearInterval(timer);
      clearInterval(statsTimer);
    };
  }, []);

  // Inicializar mapa usando MapboxManager
  useEffect(() => {
    if (mapManager.current || !mapContainer.current) return;

    const script = document.createElement('script');
    script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
    script.async = true;
    
    const link = document.createElement('link');
    link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
    link.rel = 'stylesheet';
    
    document.head.appendChild(link);
    document.head.appendChild(script);

    script.onload = async () => {
      if (!mapContainer.current) return;

      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
      if (!mapboxToken || mapboxToken.includes('example')) {
        console.error('Mapbox token not configured. Please set a valid token.');
        renderMapboxError(mapContainer.current);
        return;
      }

      try {
        // Inyectar estilos CSS
        MapboxManager.injectStyles();

        // Crear instancia del manager
        mapManager.current = new MapboxManager(mapboxToken);

        // Inicializar el mapa
        mapManager.current.initMap({
          container: mapContainer.current,
          center: [2.1686, 41.3874],
          zoom: 12.5,
          pitch: 60,
          bearing: -17.6
        });

        // Agregar edificios 3D
        mapManager.current.add3DBuildings();

        // Fleet assets con rutas reales
        const fleetAssets: Asset[] = await Promise.all([
          mapManager.current.createFleetAsset({
            id: 'fleet-1',
            name: 'TMB Bus L17',
            type: 'fleet',
            color: '#10b981',
            start: [2.1346, 41.3854],
            end: [2.1734, 41.3851]
          }),
          mapManager.current.createFleetAsset({
            id: 'fleet-2',
            name: 'Metro L3',
            type: 'fleet',
            color: '#10b981',
            start: [2.1218, 41.3809],
            end: [2.1540, 41.3888]
          }),
          mapManager.current.createFleetAsset({
            id: 'fleet-3',
            name: 'Barcelona Taxi',
            type: 'fleet',
            color: '#10b981',
            start: [2.1896, 41.3773],
            end: [2.1540, 41.3773]
          })
        ]);

        const allAssets: Asset[] = [
        ...fleetAssets,
        ...staticAssets
        ];

        // Agregar trails de los assets
        mapManager.current.addAssetTrails(allAssets);

        // Agregar marcadores
        mapManager.current.addAssetMarkers(allAssets);

        mapManager.current.addParkAreas(parks);


      } catch (error) {
        console.error('Error initializing map:', error);
        if (mapContainer.current) {
          renderMapboxError(mapContainer.current);
        }
      }
    };

    return () => {
      mapManager.current?.destroy();
      mapManager.current = null;
    };
  }, []);

  // Manejar resize del mapa OPTIMIZADO - solo al finalizar el resize
  useEffect(() => {
    // Limpiar timeout anterior si existe
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    // Solo hacer resize cuando NO estamos en medio del resize
    if (!isResizing) {
      resizeTimeoutRef.current = setTimeout(() => {
        mapManager.current?.resize();
      }, 300); // Delay reducido para mejor UX
    }

    return () => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, [sidebarCollapsed, sidebarWidth, isResizing]);

  // Calcular si estamos cerca de un snap point
  const nearSnapPoint = [320, 420, 520].some(snap => Math.abs(sidebarWidth - snap) < 15);

  // Manejar el resize del sidebar
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      
      // Snap points
      const snapPoints = [320, 420, 520];
      const snapThreshold = 15;
      
      let finalWidth = newWidth;
      
      // Buscar snap point más cercano
      for (const snapPoint of snapPoints) {
        if (Math.abs(newWidth - snapPoint) < snapThreshold) {
          finalWidth = snapPoint;
          break;
        }
      }
      
      // Limitar el ancho entre 280px y 650px
      if (finalWidth >= 280 && finalWidth <= 650) {
        setSidebarWidth(finalWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  return (
    <div className="fixed inset-0 bg-black text-white font-sans antialiased overflow-hidden">
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
        }
        
        @keyframes resize-pulse {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.2); }
        }
        
        .resize-active {
          animation: resize-pulse 0.6s ease-in-out infinite;
        }
      `}</style>

      {/* Sidebar - Resizable - Floating style */}
      <div 
        className={`fixed left-4 sm:left-6 bottom-4 sm:bottom-6 rounded-2xl sm:rounded-3xl border border-white/[0.08] z-20 ${
          sidebarCollapsed ? 'w-0' : ''
        } ${
          isMobile
            ? 'bg-black/80 backdrop-blur-2xl top-20' // Mobile: empieza después del header
            : 'bg-black/40 backdrop-blur-3xl top-20 sm:top-24' // Desktop: flotante con espacio superior
        }`}
        style={{ 
          boxShadow: sidebarCollapsed ? 'none' : '0 20px 60px -10px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          width: sidebarCollapsed ? '0' : isMobile ? 'calc(100% - 2rem)' : `${sidebarWidth}px`,
          transition: isResizing ? 'none' : 'all 700ms ease-out',
          willChange: isResizing ? 'width' : 'auto' // Optimización de rendimiento
        }}
      >
        {/* Contenedor de scroll - Con margen derecho para separar del resize handle */}
        <div 
          className={`h-full overflow-y-auto overflow-x-hidden transition-opacity duration-500 custom-scrollbar ${sidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}
          style={{
            marginRight: isMobile ? '0' : '32px' // Margen para separar del resize handle en desktop
          }}
        >
          <div className="p-6 sm:p-8 md:p-10">
            {/* Header - Responsive */}
            <div className="mb-8 sm:mb-12 md:mb-16">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <div className="w-0.5 h-4 sm:h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/25 font-light">
                  {time.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tight leading-none mb-2 sm:mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                Overview
              </h1>
              <p className="text-xs sm:text-sm text-white/30 font-light leading-relaxed">
                Real-time digital twin
              </p>
            </div>

            {/* Hero Metric - Responsive */}
            <div className={`mb-6 sm:mb-8 md:mb-12 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 border hover:border-white/[0.08] transition-all duration-700 group relative overflow-hidden ${
              isMobile
                ? 'bg-black/60 backdrop-blur-xl border-white/[0.08]' // Mobile: más opaco para legibilidad
                : 'bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-xl border-white/[0.05]' // Desktop
            }`}>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <div className="relative">
                <div className="flex items-center gap-2 sm:gap-2.5 mb-4 sm:mb-6 md:mb-8">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl bg-emerald-500/10 flex items-center justify-center backdrop-blur-xl border border-emerald-500/20">
                    <Activity className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-emerald-400" />
                  </div>
                  <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.3em] text-white/25 font-light">Live</span>
                </div>
                <div className="mb-4 sm:mb-6">
                  <div className="text-4xl sm:text-5xl md:text-6xl font-extralight tracking-tighter mb-2 sm:mb-3 tabular-nums">{activeAssets.toLocaleString()}</div>
                  <div className="text-xs sm:text-sm text-white/40 font-light">Assets streaming</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-emerald-400 font-light">All systems operational</span>
                </div>
              </div>
            </div>

            {/* Secondary Metrics - Responsive */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8 md:mb-12">
              <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border hover:border-white/[0.08] transition-all duration-700 ${
                isMobile
                  ? 'bg-black/60 backdrop-blur-xl border-white/[0.08]' // Mobile
                  : 'bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl border-white/[0.05]' // Desktop
              }`}>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-500/10 flex items-center justify-center backdrop-blur-xl border border-blue-500/20 mb-3 sm:mb-4 md:mb-6">
                  <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extralight tracking-tighter mb-1 sm:mb-2 tabular-nums">{messageRate.toLocaleString()}</div>
                <div className="text-[9px] sm:text-[10px] text-white/40 font-light uppercase tracking-wider">msg/hour</div>
              </div>
              <div className={`rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 border hover:border-white/[0.08] transition-all duration-700 ${
                isMobile
                  ? 'bg-black/60 backdrop-blur-xl border-white/[0.08]' // Mobile
                  : 'bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl border-white/[0.05]' // Desktop
              }`}>
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/10 flex items-center justify-center backdrop-blur-xl border border-purple-500/20 mb-3 sm:mb-4 md:mb-6">
                  <Database className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                </div>
                <div className="text-2xl sm:text-3xl font-extralight tracking-tighter mb-1 sm:mb-2 tabular-nums">3</div>
                <div className="text-[9px] sm:text-[10px] text-white/40 font-light uppercase tracking-wider">Datasets</div>
              </div>
            </div>

            {/* Datasets - Responsive */}
            <div className="mb-6 sm:mb-8 md:mb-12">
              <h2 className="text-base sm:text-lg font-light tracking-tight mb-3 sm:mb-4 text-white/60">Datasets</h2>
              <div className="space-y-2 sm:space-y-3">
                {datasets.map((dataset, i) => (
                  <div
                    key={i}
                    className={`rounded-lg sm:rounded-xl p-4 sm:p-5 border hover:border-white/[0.08] transition-all duration-700 cursor-pointer group relative overflow-hidden ${
                      isMobile
                        ? 'bg-black/60 backdrop-blur-xl border-white/[0.08]' // Mobile
                        : 'bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl border-white/[0.05]' // Desktop
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-r ${dataset.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700`}></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${dataset.color} shadow-lg flex-shrink-0`}></div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-light mb-0.5 sm:mb-1 truncate">{dataset.name}</div>
                          <div className="text-[9px] sm:text-[10px] text-white/30 font-light">{dataset.assets} assets</div>
                        </div>
                      </div>
                      <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg text-[8px] sm:text-[9px] font-light uppercase tracking-wider border flex-shrink-0 ${
                        dataset.status === 'active' 
                          ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/5 text-amber-400 border-amber-500/20'
                      }`}>
                        {dataset.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts - Responsive */}
            <div>
              <h2 className="text-base sm:text-lg font-light tracking-tight mb-3 sm:mb-4 text-white/60">Alerts</h2>
              <div className="space-y-2 sm:space-y-3">
                {alerts.map((alert, i) => (
                  <div
                    key={i}
                    className={`rounded-lg sm:rounded-xl p-3 sm:p-4 border hover:border-white/[0.08] transition-all duration-700 cursor-pointer group ${
                      isMobile
                        ? 'bg-black/60 backdrop-blur-xl border-white/[0.08]' // Mobile
                        : 'bg-gradient-to-br from-white/[0.03] to-transparent backdrop-blur-xl border-white/[0.05]' // Desktop
                    }`}
                  >
                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 backdrop-blur-xl border ${
                        alert.type === 'critical'
                          ? 'bg-red-500/10 border-red-500/20'
                          : 'bg-amber-500/10 border-amber-500/20'
                      }`}>
                        <Bell className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                          alert.type === 'critical' ? 'text-red-400' : 'text-amber-400'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] sm:text-xs font-light mb-1 sm:mb-1.5 leading-relaxed">{alert.message}</div>
                        <div className="flex items-center gap-2 text-[8px] sm:text-[9px] text-white/30 font-light">
                          <span className="truncate">{alert.dataset}</span>
                          <span>·</span>
                          <span>{alert.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Resize Handle - Posicionado fuera del contenedor de scroll */}
        {!sidebarCollapsed && (
          <>
            {/* Snap point indicators - visible durante resize */}
            {isResizing && (
              <>
                <div className="hidden sm:block absolute top-0 bottom-0 left-0 right-0 pointer-events-none z-30">
                  {[320, 420, 520].map((snapPoint) => (
                    <div
                      key={snapPoint}
                      className="absolute top-0 bottom-0 w-0.5 bg-blue-400/20 transition-all duration-200"
                      style={{
                        left: `${snapPoint}px`,
                        opacity: Math.abs(sidebarWidth - snapPoint) < 15 ? 1 : 0.3,
                        transform: Math.abs(sidebarWidth - snapPoint) < 15 ? 'scaleY(1)' : 'scaleY(0.5)',
                      }}
                    >
                      {/* Snap point dot */}
                      <div 
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50 transition-all duration-200"
                        style={{
                          transform: Math.abs(sidebarWidth - snapPoint) < 15 
                            ? 'translate(-50%, -50%) scale(1.5)' 
                            : 'translate(-50%, -50%) scale(1)',
                        }}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Width indicator tooltip */}
                <div 
                  className="hidden sm:block absolute top-8 pointer-events-none z-30 transition-all duration-200"
                  style={{ left: `${sidebarWidth - 50}px` }}
                >
                  <div className={`bg-black/90 backdrop-blur-xl px-4 py-2 rounded-lg border transition-all duration-200 ${
                    nearSnapPoint 
                      ? 'border-blue-400/40 shadow-lg shadow-blue-400/20 scale-105' 
                      : 'border-white/10'
                  }`}>
                    <div className="text-xs font-light text-white/90 tabular-nums">
                      {sidebarWidth}px
                    </div>
                  </div>
                </div>
              </>
            )}
            
            <div
              onMouseDown={handleMouseDown}
              className="hidden sm:block absolute top-0 bottom-0 cursor-ew-resize group z-40 pointer-events-auto"
              style={{ 
                right: '0',
                width: '32px', // Ancho aumentado para mejor área de agarre
                transform: 'translateX(0)',
              }}
            >
              {/* Zona de interacción invisible expandida */}
              <div className="absolute inset-0 pointer-events-auto" />
              
              {/* Visual feedback bar */}
              <div 
                className={`absolute inset-y-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-300 pointer-events-none ${
                  isResizing 
                    ? 'w-1 bg-blue-500 shadow-lg shadow-blue-500/50' 
                    : 'w-0.5 bg-transparent group-hover:bg-blue-400/40 group-hover:w-0.5'
                }`}
              />
              
              {/* Handle indicator */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
                isResizing 
                  ? 'opacity-100 scale-100' 
                  : 'opacity-0 scale-75 group-hover:opacity-100 group-hover:scale-100'
              }`}>
                <div className="flex flex-col gap-1 items-center">
                  <div className={`w-1 h-2 rounded-full transition-all duration-200 ${
                    isResizing ? 'bg-blue-400' : 'bg-white/40'
                  }`}></div>
                  <div className={`w-1 h-2 rounded-full transition-all duration-200 ${
                    isResizing ? 'bg-blue-400' : 'bg-white/40'
                  }`}></div>
                  <div className={`w-1 h-2 rounded-full transition-all duration-200 ${
                    isResizing ? 'bg-blue-400' : 'bg-white/40'
                  }`}></div>
                </div>
              </div>

              {/* Glow effect cuando está activo */}
              {isResizing && (
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-8 bg-blue-500/10 blur-xl animate-pulse" />
              )}
            </div>
          </>
        )}
      </div>

      {/* Map Container - Responsive */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          left: sidebarCollapsed ? '0' : isMobile ? '0' : `${sidebarWidth}px`,
          transition: isResizing ? 'none' : 'all 700ms ease-out',
          willChange: isResizing ? 'left' : 'auto' // Optimización de rendimiento
        }}
      >
        <div ref={mapContainer} className="w-full h-full relative">
          {/* Map Legend - Floating - Responsive */}
          <div className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-4 sm:left-6 md:left-8 z-10">
            <div className="bg-black/60 backdrop-blur-2xl px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-3 sm:gap-4 md:gap-6">
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50"></div>
                <span className="text-[10px] sm:text-xs text-white/70 font-light">Fleet</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-400 shadow-lg shadow-blue-500/50"></div>
                <span className="text-[10px] sm:text-xs text-white/70 font-light">Industrial</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400 shadow-lg shadow-amber-500/50"></div>
                <span className="text-[10px] sm:text-xs text-white/70 font-light">City</span>
              </div>
            </div>
          </div>

          {/* Live Indicator - Top Right - Responsive */}
          <div className="absolute top-4 sm:top-6 md:top-8 right-4 sm:right-6 md:right-8 z-10">
            <div className="bg-black/60 backdrop-blur-2xl px-3.5 sm:px-4 md:px-5 py-2 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl border border-white/10 flex items-center gap-2 sm:gap-2.5 md:gap-3">
              <div className="relative">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div className="absolute inset-0 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping"></div>
              </div>
              <span className="text-[10px] sm:text-xs text-white/70 font-light uppercase tracking-wider">Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Toggle Button - Responsive */}
      <button
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        className="fixed top-1/2 -translate-y-1/2 z-30 w-7 h-14 sm:w-8 sm:h-16 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-r-xl flex items-center justify-center hover:bg-white/5 transition-all duration-300 group"
        style={{ left: sidebarCollapsed ? '0' : 'calc(100vw - 28px)', display: sidebarCollapsed ? 'flex' : 'none' }}
        aria-label={sidebarCollapsed ? 'Open sidebar' : 'Close sidebar'}
      >
        <div className={`w-1 h-6 sm:h-8 bg-white/30 rounded-full transition-transform duration-300 ${sidebarCollapsed ? 'rotate-0' : 'rotate-180'}`}></div>
      </button>

      {/* Mobile: Show toggle on right when sidebar is open */}
      {!sidebarCollapsed && (
        <button
          onClick={() => setSidebarCollapsed(true)}
          className="sm:hidden fixed top-1/2 -translate-y-1/2 right-0 z-30 w-7 h-14 bg-black/60 backdrop-blur-2xl border border-white/10 rounded-l-xl flex items-center justify-center hover:bg-white/5 transition-all duration-300"
          aria-label="Close sidebar"
        >
          <div className="w-1 h-6 bg-white/30 rounded-full rotate-180"></div>
        </button>
      )}
    </div>
  );
}