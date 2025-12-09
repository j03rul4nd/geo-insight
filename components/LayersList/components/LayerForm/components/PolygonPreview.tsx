import React, { useEffect, useRef, useState, useCallback } from 'react';


// --- 1. Prop Type Definition ---
interface PolygonPreviewProps {
  coordinates: number[][]; // Array of [longitude, latitude] pairs
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
}


// --- 2. Mapbox Token Placeholder ---
// IMPORTANT: Replace this with your actual Mapbox Public Access Token
const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ;


// --- 3. PolygonPreview Component ---
export const PolygonPreview: React.FC<PolygonPreviewProps> = ({ 
  coordinates, 
  fillColor = '#3b82f6',
  fillOpacity = 0.5,
  strokeColor = '#1e40af',
  strokeWidth = 2
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null); // Mapbox map instance
  const markerRefs = useRef<any[]>([]); // Array to hold Mapbox markers
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);


  // Function to remove map and related elements
  const cleanupMap = useCallback(() => {
    if (mapRef.current) {
      // Remove layers and source if they exist
      const map = mapRef.current;
      if (map.getLayer('polygon-fill')) map.removeLayer('polygon-fill');
      if (map.getLayer('polygon-outline')) map.removeLayer('polygon-outline');
      if (map.getSource('polygon')) map.removeSource('polygon');
      
      // Remove all markers
      markerRefs.current.forEach(marker => marker.remove());
      markerRefs.current = [];


      // Remove the map instance
      map.remove();
      mapRef.current = null;
    }
    setMapLoaded(false);
  }, []);


  // --- Core Map Logic (Initialization and Data Loading) ---
  useEffect(() => {
    if (!mapContainerRef.current) return;


    // 1. Token Check
    if (MAPBOX_ACCESS_TOKEN === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
      setError('ERROR: Please set your Mapbox Access Token.');
      cleanupMap();
      return;
    }


    // 2. Initial Validation and Cleanup for empty/invalid input
    if (!coordinates || coordinates.length === 0) {
      setError(null);
      cleanupMap();
      return;
    }


    const validCoords: number[][] = coordinates.filter(
      coord => Array.isArray(coord) && coord.length >= 2 && 
      typeof coord[0] === 'number' && typeof coord[1] === 'number' &&
      !isNaN(coord[0]) && !isNaN(coord[1]) &&
      coord[0] >= -180 && coord[0] <= 180 && // Valid longitude
      coord[1] >= -90 && coord[1] <= 90 // Valid latitude
    );


    if (validCoords.length === 0) {
      setError('No valid coordinates found');
      cleanupMap();
      return;
    }


    if (validCoords.length < 3) {
      setError(`Need at least 3 valid coordinates (found ${validCoords.length}) to draw a polygon.`);
      cleanupMap();
      return;
    }
    
    // CRITICAL FIX: Create clean, explicit [lng, lat] arrays for Mapbox.
    // Mapbox expects [longitude, latitude].
    const mapboxCoords: [number, number][] = validCoords.map(c => [Number(c[0]), Number(c[1])] as [number, number]);
    setError(null);


    // --- Dynamic Mapbox Loader ---
    const loadMapbox = async () => {
      try {
        // @ts-ignore: mapboxgl is a global variable
        if (typeof mapboxgl === 'undefined') {
          // Load CSS
          const link = document.createElement('link');
          link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
          link.rel = 'stylesheet';
          document.head.appendChild(link);


          // Load JS
          const script = document.createElement('script');
          script.src = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.js';
          script.async = true;
          document.body.appendChild(script);


          await new Promise((resolve) => {
            script.onload = resolve;
          });
        }


        // --- Map Initialization ---
        // Cleanup any existing map instance before creating a new one
        cleanupMap(); 


        // @ts-ignore
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;


        // @ts-ignore
        const map = new mapboxgl.Map({
          container: mapContainerRef.current!,
          style: 'mapbox://styles/mapbox/dark-v11', // Dark style for better contrast
          center: mapboxCoords[0], // Temporary center
          zoom: 10,
          attributionControl: false,
          preserveDrawingBuffer: true // Good practice for rendering libraries
        });


        mapRef.current = map;


        map.on('load', () => {
          setMapLoaded(true);
          
          // 4. Add GeoJSON Source
          map.addSource('polygon', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                // Mapbox GeoJSON expects an array of rings, where the first is the exterior
                coordinates: [mapboxCoords] 
              }
            }
          });


          // 5. Add Fill Layer
          map.addLayer({
            id: 'polygon-fill',
            type: 'fill',
            source: 'polygon',
            paint: {
              'fill-color': fillColor,
              'fill-opacity': fillOpacity
            }
          });


          // 6. Add Outline Layer
          map.addLayer({
            id: 'polygon-outline',
            type: 'line',
            source: 'polygon',
            paint: {
              'line-color': strokeColor,
              'line-width': strokeWidth
            }
          });


          // 7. Add Markers for Vertices
          markerRefs.current = []; // Reset marker array
          mapboxCoords.forEach((coord, i) => {
            const el = document.createElement('div');
            el.className = 'polygon-vertex';
            el.style.cssText = `
              width: 12px;
              height: 12px;
              border-radius: 50%;
              background-color: ${i === 0 ? '#10b981' : i === mapboxCoords.length - 1 ? '#ef4444' : '#3b82f6'};
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              cursor: default;
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 8px;
              color: white;
              font-weight: bold;
            `;
            el.textContent = i.toString();
            
            // @ts-ignore
            const marker = new mapboxgl.Marker({ element: el })
              .setLngLat(coord)
              .addTo(map);


            markerRefs.current.push(marker);
          });
          
          // 8. Fit map bounds to the polygon
          // @ts-ignore
          const bounds = new mapboxgl.LngLatBounds();
          mapboxCoords.forEach(coord => bounds.extend(coord));
          
          if (!bounds.isEmpty()) {
             map.fitBounds(bounds, { padding: 40, duration: 1000 });
          }

          // 9. Handle window resize with ResizeObserver
          if (resizeObserverRef.current) {
            resizeObserverRef.current.disconnect();
          }

          resizeObserverRef.current = new ResizeObserver(() => {
            map.resize();
          });

          if (mapContainerRef.current) {
            resizeObserverRef.current.observe(mapContainerRef.current);
          }
        });


      } catch (err) {
        console.error('Error loading Mapbox:', err);
        setError('Failed to load map. Check console for details.');
        cleanupMap();
      }
    };


    loadMapbox();


    // Cleanup on component unmount
    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      cleanupMap();
    };
  }, [coordinates, cleanupMap]);


  // --- Update Styles Logic (Separate Effect for Performance) ---
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    const map = mapRef.current;


    if (map.getLayer('polygon-fill')) {
      map.setPaintProperty('polygon-fill', 'fill-color', fillColor);
      map.setPaintProperty('polygon-fill', 'fill-opacity', fillOpacity);
    }
    if (map.getLayer('polygon-outline')) {
      map.setPaintProperty('polygon-outline', 'line-color', strokeColor);
      map.setPaintProperty('polygon-outline', 'line-width', strokeWidth);
    }


  }, [fillColor, fillOpacity, strokeColor, strokeWidth, mapLoaded]);


  // --- UI Logic ---
  const filteredCoords = coordinates.filter(
    coord => Array.isArray(coord) && coord.length >= 2 && 
    typeof coord[0] === 'number' && typeof coord[1] === 'number'
  );
  
  const isClosed = filteredCoords.length >= 3 && 
    filteredCoords[0][0] === filteredCoords[filteredCoords.length - 1][0] &&
    filteredCoords[0][1] === filteredCoords[filteredCoords.length - 1][1];


  if (!coordinates || coordinates.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#09090b] text-gray-500 text-sm font-inter">
        <div className="text-center">
          <div className="text-4xl mb-2">🗺️</div>
          <div className="text-lg font-semibold text-gray-400">Enter coordinates to preview</div>
          <div className="text-sm text-gray-500">Longitude (X) must come before Latitude (Y) in each pair.</div>
        </div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-red-900/20 text-red-400 text-sm font-inter p-4">
        <div className="text-center bg-red-900/50 p-6 rounded-xl shadow-2xl border border-red-700/50">
          <div className="text-4xl mb-2">⚠️</div>
          <div className="font-bold text-lg mb-1">Map Error</div>
          <div>{error}</div>
          <p className="mt-3 text-xs text-red-300">
            If the token error persists, check the console for Mapbox loading issues.
          </p>
        </div>
      </div>
    );
  }


  return (
    <div className="relative w-full h-full bg-[#09090b] rounded-lg overflow-hidden">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Metadata Panel */}
      <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl text-xs space-y-2 shadow-lg pointer-events-none z-10 border border-gray-700/50">
        <div className="font-bold text-gray-200 text-sm mb-1">Polygon Stats</div>
        <div className="flex items-center gap-3">
          <svg className={`w-3 h-3 ${isClosed ? 'text-green-400' : 'text-yellow-400'}`} fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z" clipRule="evenodd" /></svg>
          <span className="text-gray-300">Status: <span className={`font-semibold ${isClosed ? 'text-green-400' : 'text-yellow-400'}`}>{isClosed ? 'Closed' : 'Open'}</span></span>
        </div>
        <div className="flex items-center gap-3">
          <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 13a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2v-2zM10 3a1 1 0 00-1 1v2a1 1 0 102 0V4a1 1 0 00-1-1z" /><path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm-7 8a7 7 0 1114 0 7 7 0 01-14 0z" clipRule="evenodd" /></svg>
          <span className="text-gray-300">Vertices: <span className="font-semibold text-blue-300">{filteredCoords.length}</span></span>
        </div>
      </div>


      {/* Legend Panel */}
      <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-4 py-3 rounded-xl text-xs space-y-2 shadow-lg pointer-events-none z-10 border border-gray-700/50">
        <div className="text-gray-400 font-semibold mb-1">Legend</div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
          <span className="text-gray-300">Start vertex (0)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
          <span className="text-gray-300">End vertex ({filteredCoords.length - 1})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white" />
          <span className="text-gray-300">Intermediate vertex</span>
        </div>
      </div>



      {!mapLoaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#09090b]/90 backdrop-blur-sm z-20">
          <div className="text-center">
            <div className="animate-spin text-5xl mb-2 text-blue-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l3-1.5m-3-15l3 1.5m-3 15V6m3 0v15m0 0l-3-1.5m3 1.5l3-1.5" />
              </svg>
            </div>
            <div className="text-gray-400 text-sm">Loading Mapbox libraries...</div>
          </div>
        </div>
      )}
    </div>
  );
};
