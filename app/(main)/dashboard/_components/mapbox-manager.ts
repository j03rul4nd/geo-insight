import mapboxgl from 'mapbox-gl';
import type { ParkArea, Asset, HeatmapPoint } from './types';


interface MapConfig {
  container: HTMLElement;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

interface AnimatedAssetState {
  asset: Asset;
  marker: mapboxgl.Marker;
  currentIndex: number;

  // Movimiento realista
  segmentDistance: number;   // metros del segmento actual
  traveledDistance: number;  // metros recorridos en el segmento

  speed: number; // metros / segundo
  loop: boolean;
  paused: boolean;
}


export class MapboxManager {
  private map: mapboxgl.Map | null = null;
  private markers: mapboxgl.Marker[] = [];
  private resizeObserver: ResizeObserver | null = null;
  private parkPopups: Map<string, mapboxgl.Popup> = new Map();
  private animatedAssets: Map<string, AnimatedAssetState> = new Map();


  private animationFrameId: number | null = null;
  private lastFrameTime = 0;


  constructor(private mapboxToken: string) {
    if (!mapboxToken || mapboxToken.includes('example')) {
      throw new Error('Invalid Mapbox token');
    }
    mapboxgl.accessToken = mapboxToken;
  }

  /**
   * Inicializa el mapa con la configuración proporcionada
   */
  initMap(config: MapConfig): mapboxgl.Map {
    this.map = new mapboxgl.Map({
      container: config.container,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: config.center,
      zoom: config.zoom,
      pitch: config.pitch,
      bearing: config.bearing,
      attributionControl: false,
    });

    // Configurar el resize observer para hacer el mapa responsive
    this.setupResizeObserver(config.container);

    return this.map;
  }

  /**
   * Configura el ResizeObserver para actualizar el mapa cuando cambia el tamaño del contenedor
   */
  private setupResizeObserver(container: HTMLElement): void {
    this.resizeObserver = new ResizeObserver(() => {
      if (this.map) {
        // Esperar un frame para asegurar que el DOM se ha actualizado
        requestAnimationFrame(() => {
          this.map?.resize();
        });
      }
    });

    this.resizeObserver.observe(container);
  }

  /**
   * Agrega edificios 3D al mapa
   */
  add3DBuildings(): void {
    if (!this.map) return;

    this.map.on('load', () => {
      if (!this.map) return;

      const layers = this.map.getStyle().layers;
      const labelLayerId = layers?.find(
        (layer: any) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      this.map.addLayer(
        {
          id: 'add-3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#1a1a1a',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.8,
          },
        },
        labelLayerId
      );
    });
  }

  /**
   * Agrega las rutas (trails) de los assets al mapa
   */
  addAssetTrails(assets: Asset[]): void {
    if (!this.map) return;

    this.map.on('load', () => {
      assets.forEach((asset) => {
        if (!this.map || asset.type !== 'fleet' || !asset.trail) return;

        // Agregar source para el trail
        this.map.addSource(`trail-${asset.id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: asset.trail,
            },
          },
        });

        // Capa principal del trail
        this.map.addLayer({
          id: `trail-${asset.id}`,
          type: 'line',
          source: `trail-${asset.id}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': asset.color,
            'line-width': 3,
            'line-opacity': 0.7,
            'line-blur': 0.5,
          },
        });

        // Capa de glow para el trail
        this.map.addLayer({
          id: `trail-glow-${asset.id}`,
          type: 'line',
          source: `trail-${asset.id}`,
          layout: {
            'line-join': 'round',
            'line-cap': 'round',
          },
          paint: {
            'line-color': asset.color,
            'line-width': 8,
            'line-opacity': 0.4,
            'line-blur': 4,
          },
        });
      });
    });
  }

  /**
   * Agrega marcadores para los assets
   */
  addAssetMarkers(assets: Asset[]): void {
    if (!this.map) return;

    // Esperar a que el mapa esté cargado
    this.map.on('load', () => {
      // Pequeño delay para asegurar que los layers estén listos
      setTimeout(() => {
        assets.forEach((asset) => {
          if (!this.map) return;

          const el = this.createMarkerElement(asset);
          const popup = this.createMarkerPopup(asset);

          const marker = new mapboxgl.Marker(el)
            .setLngLat(asset.position)
            .setPopup(popup)
            .addTo(this.map);

          this.markers.push(marker);
        });
      }, 500);
    });
  }

  /**
   * Crea el elemento HTML para un marcador
   */
  private createMarkerElement(asset: Asset): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'custom-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.cursor = 'pointer';

    el.innerHTML = `
      <div style="position: relative; width: 100%; height: 100%;">
        <div style="
          position: absolute;
          width: 20px;
          height: 20px;
          background: ${asset.color}20;
          border: 2px solid ${asset.color};
          border-radius: 50%;
          box-shadow: 0 0 15px ${asset.color}80, 0 0 30px ${asset.color}40;
          animation: pulse-marker 2s ease-in-out infinite;
        "></div>
        <div style="
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 8px;
          height: 8px;
          background: ${asset.color};
          border-radius: 50%;
          box-shadow: 0 0 8px ${asset.color};
        "></div>
      </div>
    `;

    return el;
  }

  /**
   * Crea el popup para un marcador
   */
  private createMarkerPopup(asset: Asset): mapboxgl.Popup {
    return new mapboxgl.Popup({
      offset: 25,
      closeButton: false,
      className: 'custom-popup',
    }).setHTML(`
      <div style="
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(20px);
        padding: 16px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        font-family: system-ui, -apple-system, sans-serif;
        min-width: 200px;
      ">
        <div style="
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        ">
          <div style="
            width: 12px;
            height: 12px;
            background: ${asset.color};
            border-radius: 50%;
            box-shadow: 0 0 10px ${asset.color};
          "></div>
          <div style="
            color: white;
            font-size: 16px;
            font-weight: 300;
            letter-spacing: -0.01em;
          ">${asset.name}</div>
        </div>
        <div style="
          color: rgba(255, 255, 255, 0.5);
          font-size: 12px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        ">${asset.type}</div>
      </div>
    `);
  }

  /**
   * Crea el popup para un park area
   */
  private createParkPopup(park: ParkArea): string {
  const statusEmoji = {
    ok: '✓',
    warning: '⚠',
    critical: '✕'
  }[park.status];

  const statusText = {
    ok: 'Operational',
    warning: 'Attention Required',
    critical: 'Critical Issue'
  }[park.status];

  return `
    <div style="
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(20px);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-family: system-ui, -apple-system, sans-serif;
      min-width: 220px;
      max-width: 300px;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      ">
        <div style="
          width: 12px;
          height: 12px;
          background: ${park.color};
          border-radius: 3px;
          box-shadow: 0 0 10px ${park.color};
        "></div>
        <div style="
          color: white;
          font-size: 16px;
          font-weight: 300;
          letter-spacing: -0.01em;
        ">${park.name}</div>
      </div>
      
      ${park.description ? `
        <div style="
          color: rgba(255, 255, 255, 0.7);
          font-size: 13px;
          line-height: 1.5;
          margin-bottom: 12px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        ">${park.description}</div>
      ` : ''}
      
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: ${park.color}15;
        border-radius: 8px;
        border: 1px solid ${park.color}30;
      ">
        <div style="
          color: ${park.color};
          font-size: 14px;
          font-weight: 500;
        ">${statusEmoji}</div>
        <div style="
          color: ${park.color};
          font-size: 12px;
          font-weight: 300;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        ">${statusText}</div>
      </div>
    </div>
  `;
}

  /**
   * Agrega áreas de parques (polígonos) al mapa con interactividad completa
   */
  addParkAreas(parks: ParkArea[]): void {
    if (!this.map) return;

    this.map.on('load', () => {
      parks.forEach((park) => {
        if (!this.map) return;

        this.map.addSource(`park-${park.id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              name: park.name,
              status: park.status,
              color: park.color
            },
            geometry: {
              type: 'Polygon',
              coordinates: park.polygon
            }
          }
        });

        // Relleno con opacidad base
        this.map.addLayer({
          id: `park-fill-${park.id}`,
          type: 'fill',
          source: `park-${park.id}`,
          paint: {
            'fill-color': park.color,
            'fill-opacity': 0.25
          }
        });

        // Borde exterior
        this.map.addLayer({
          id: `park-outline-${park.id}`,
          type: 'line',
          source: `park-${park.id}`,
          paint: {
            'line-color': park.color,
            'line-width': 2,
            'line-opacity': 0.8
          }
        });

        // Borde con efecto glow
        this.map.addLayer({
          id: `park-glow-${park.id}`,
          type: 'line',
          source: `park-${park.id}`,
          paint: {
            'line-color': park.color,
            'line-width': 6,
            'line-opacity': 0.3,
            'line-blur': 4
          }
        });

        // Configurar interactividad
        this.setupParkInteractivity(park);
      });
    });
  }

  /**
   * Configura la interactividad para un park area
   */
  private setupParkInteractivity(park: ParkArea): void {
    if (!this.map) return;

    const fillLayerId = `park-fill-${park.id}`;
    const outlineLayerId = `park-outline-${park.id}`;

    // Cambiar el cursor al pasar sobre el área
    this.map.on('mouseenter', fillLayerId, () => {
      if (this.map) {
        this.map.getCanvas().style.cursor = 'pointer';
        
        // Aumentar opacidad en hover
        this.map.setPaintProperty(fillLayerId, 'fill-opacity', 0.45);
        this.map.setPaintProperty(outlineLayerId, 'line-width', 3);
      }
    });

    this.map.on('mouseleave', fillLayerId, () => {
      if (this.map) {
        this.map.getCanvas().style.cursor = '';
        
        // Restaurar opacidad original
        this.map.setPaintProperty(fillLayerId, 'fill-opacity', 0.25);
        this.map.setPaintProperty(outlineLayerId, 'line-width', 2);
        
        // Cerrar popup si existe
        const popup = this.parkPopups.get(park.id);
        if (popup) {
          popup.remove();
        }
      }
    });

    // Mostrar popup al hacer hover
    this.map.on('mousemove', fillLayerId, (e) => {
      if (!this.map || !e.lngLat) return;

      // Remover popup anterior si existe
      const existingPopup = this.parkPopups.get(park.id);
      if (existingPopup) {
        existingPopup.remove();
      }

      // Crear nuevo popup
      const popup = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'custom-popup',
        offset: 10
      })
        .setLngLat(e.lngLat)
        .setHTML(this.createParkPopup(park))
        .addTo(this.map);

      this.parkPopups.set(park.id, popup);
    });

    // Click para zoom al área
    this.map.on('click', fillLayerId, (e) => {
      if (!this.map || !e.features || !e.features[0]) return;

      const feature = e.features[0];
      
      // Calcular bounds del polígono
      const coordinates = park.polygon[0];
      const bounds = coordinates.reduce(
        (bounds, coord) => bounds.extend(coord as [number, number]),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );

      // Hacer zoom al área con padding
      this.map.fitBounds(bounds, {
        padding: 100,
        duration: 1000
      });
    });
  }

  /**
   * Inyecta los estilos CSS necesarios
   */
  static injectStyles(): void {
    if (document.getElementById('mapbox-custom-styles')) return;

    const style = document.createElement('style');
    style.id = 'mapbox-custom-styles';
    style.textContent = `
      @keyframes pulse-marker {
        0%, 100% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.15);
          opacity: 0.8;
        }
      }
      .mapboxgl-popup-content {
        padding: 0 !important;
        background: transparent !important;
        box-shadow: none !important;
      }
      .mapboxgl-popup-tip {
        display: none !important;
      }
      .mapboxgl-canvas {
        outline: none;
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Fuerza una actualización del tamaño del mapa
   * Útil cuando se cambia la visibilidad del sidebar u otros elementos
   */
  resize(): void {
    if (this.map) {
      // Usar requestAnimationFrame para asegurar que el resize se ejecuta después del repaint
      requestAnimationFrame(() => {
        this.map?.resize();
      });
    }
  }

  /**
   * Limpia todos los recursos del mapa
   */
  destroy(): void {
    // Remover todos los marcadores
    this.markers.forEach((marker) => marker.remove());
    this.markers = [];

    // Remover todos los popups de parks
    this.parkPopups.forEach((popup) => popup.remove());
    this.parkPopups.clear();

    // Desconectar el resize observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // Remover el mapa
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  /**
   * Obtiene la instancia del mapa (para operaciones avanzadas)
   */
  getMap(): mapboxgl.Map | null {
    return this.map;
  }

  /**
   * Obtiene una ruta real por carreteras usando Mapbox Directions API
   */
  async getRealRoute(
    start: [number, number],
    end: [number, number]
  ): Promise<[number, number][]> {

    const url =
      `https://api.mapbox.com/directions/v5/mapbox/driving/` +
      `${start[0]},${start[1]};${end[0]},${end[1]}` +
      `?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;

    const res = await fetch(url);
    const data = await res.json();

    if (!data.routes || !data.routes.length) {
      throw new Error('No route found');
    }

    return data.routes[0].geometry.coordinates;
  }

  /**
   * Crea un asset de tipo fleet con trail realista
   */
  async createFleetAsset(
    base: Omit<Asset, 'trail' | 'position'> & {
      start: [number, number];
      end: [number, number];
    }
  ): Promise<Asset> {

    const trail = await this.getRealRoute(base.start, base.end);

    return {
      id: base.id,
      name: base.name,
      type: 'fleet',
      color: base.color,
      trail,
      position: trail[trail.length - 1]
    };
  }
  /**
   * Busca un lugar usando Mapbox Geocoding API y obtiene su polígono si está disponible
   */
  async searchPlace(
    query: string,
    proximity?: [number, number]
  ): Promise<{
    name: string;
    center: [number, number];
    polygon?: [number, number][][];
    bbox?: [number, number, number, number];
  } | null> {
    // Construir URL correctamente con mejor configuración
    let url =
      `https://api.mapbox.com/geocoding/v5/mapbox.places/` +
      `${encodeURIComponent(query)}.json` +
      `?access_token=${mapboxgl.accessToken}` +
      `&types=poi` + // Solo POI para mejor precisión
      `&limit=1`; // Solo el mejor resultado

    // Add proximity if provided (helps with location bias)
    if (proximity) {
      url += `&proximity=${proximity[0]},${proximity[1]}`;
    }

    try {
      const res = await fetch(url);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Geocoding API error: ${res.status} ${res.statusText}`, errorText);
        return null;
      }

      const data = await res.json();

      if (!data.features || !data.features.length) {
        console.warn(`No results found for: ${query}`);
        return null;
      }

      const feature = data.features[0];
      
      console.log(`Found: ${feature.place_name} at [${feature.center}]`);
      
      return {
        name: feature.text || feature.place_name,
        center: feature.center,
        polygon: feature.geometry?.type === 'Polygon' 
          ? feature.geometry.coordinates 
          : undefined,
        bbox: feature.bbox
      };
    } catch (error) {
      console.error('Error in searchPlace:', error);
      return null;
    }
  }
  /**
   * Obtiene el polígono exacto de un parque usando Overpass API (OpenStreetMap)
   * Esta API es gratuita y tiene datos muy precisos de parques y áreas
   */
  async getParkPolygonFromOSM(
    parkName: string,
    center: [number, number],
    radiusMeters: number = 1000
  ): Promise<[number, number][][] | null> {
    // Convertir radio de metros a grados (aproximado)
    const radiusDegrees = radiusMeters / 111320;

    const query = `
      [out:json];
      (
        way["leisure"="park"]["name"~"${parkName}",i](around:${radiusMeters},${center[1]},${center[0]});
        relation["leisure"="park"]["name"~"${parkName}",i](around:${radiusMeters},${center[1]},${center[0]});
      );
      out geom;
    `;

    try {
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        body: query
      });

      const data = await res.json();

      if (!data.elements || !data.elements.length) {
        return null;
      }

      const element = data.elements[0];

      // Procesar way (polígono simple)
      if (element.type === 'way' && element.geometry) {
        const coords = element.geometry.map((node: any) => [node.lon, node.lat]);
        return [coords];
      }

      // Procesar relation (polígono con huecos)
      if (element.type === 'relation' && element.members) {
        const outerWays = element.members
          .filter((m: any) => m.role === 'outer' && m.geometry)
          .map((m: any) => m.geometry.map((node: any) => [node.lon, node.lat]));
        
        if (outerWays.length > 0) {
          return outerWays;
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching from OSM:', error);
      return null;
    }
  }

  /**
   * Crea un polígono aproximado tipo bbox alrededor de un punto
   * Útil como fallback cuando no se encuentra el polígono exacto
   */
  createBBoxPolygon(
    center: [number, number],
    widthMeters: number = 500,
    heightMeters: number = 500
  ): [number, number][][] {
    const lat = center[1];
    const lng = center[0];

    // Conversión aproximada de metros a grados
    const latOffset = (heightMeters / 2) / 111320;
    const lngOffset = (widthMeters / 2) / (111320 * Math.cos(lat * Math.PI / 180));

    return [[
      [lng - lngOffset, lat - latOffset], // SW
      [lng + lngOffset, lat - latOffset], // SE
      [lng + lngOffset, lat + latOffset], // NE
      [lng - lngOffset, lat + latOffset], // NW
      [lng - lngOffset, lat - latOffset]  // Cerrar polígono
    ]];
  }

  /**
   * Crea un ParkArea con polígono proporcionado directamente o mediante búsqueda automática
   */
  async createParkArea(
    id: string,
    parkName: string,
    description: string,
    status: 'ok' | 'warning' | 'critical',
    color: string,
    locationOrGeoJSON?: [number, number] | GeoJSON.FeatureCollection | GeoJSON.Feature
  ): Promise<ParkArea | null> {
    try {
      // Si se proporciona un GeoJSON directamente
      if (locationOrGeoJSON && typeof locationOrGeoJSON === 'object' && 'type' in locationOrGeoJSON) {
        const polygon = this.extractPolygonFromGeoJSON(locationOrGeoJSON);
        if (polygon) {
          return {
            id,
            name: parkName,
            description,
            status,
            color,
            polygon
          };
        }
      }

      // Si es una ubicación [lng, lat], buscar automáticamente
      const searchLocation = Array.isArray(locationOrGeoJSON) ? locationOrGeoJSON : undefined;

      // Primero buscar el lugar
      const place = await this.searchPlace(
        searchLocation 
          ? `${parkName} near ${searchLocation[1]},${searchLocation[0]}`
          : parkName,
        searchLocation
      );

      if (!place) {
        console.warn(`Place not found: ${parkName}`);
        return null;
      }

      // Si ya tiene polígono de Mapbox, usarlo
      if (place.polygon) {
        return {
          id,
          name: place.name,
          description,
          status,
          color,
          polygon: place.polygon
        };
      }

      // Intentar obtener polígono de OpenStreetMap
      const osmPolygon = await this.getParkPolygonFromOSM(
        parkName,
        place.center,
        2000
      );

      if (osmPolygon) {
        return {
          id,
          name: place.name,
          description,
          status,
          color,
          polygon: osmPolygon
        };
      }

      // Fallback: crear bbox si tenemos bbox data
      if (place.bbox) {
        const [minLng, minLat, maxLng, maxLat] = place.bbox;
        return {
          id,
          name: place.name,
          description,
          status,
          color,
          polygon: [[
            [minLng, minLat],
            [maxLng, minLat],
            [maxLng, maxLat],
            [minLng, maxLat],
            [minLng, minLat]
          ]]
        };
      }

      // Último fallback: crear bbox aproximado
      return {
        id,
        name: place.name,
        description,
        status,
        color,
        polygon: this.createBBoxPolygon(place.center, 500, 500)
      };

    } catch (error) {
      console.error('Error creating park area:', error);
      return null;
    }
  }

  /**
   * Extrae coordenadas de polígono desde un GeoJSON
   */
  private extractPolygonFromGeoJSON(
    geoJSON: GeoJSON.FeatureCollection | GeoJSON.Feature
  ): [number, number][][] | null {
    try {
      // Si es FeatureCollection, tomar el primer Feature
      if (geoJSON.type === 'FeatureCollection') {
        if (!geoJSON.features || geoJSON.features.length === 0) {
          return null;
        }
        geoJSON = geoJSON.features[0];
      }

      // Ahora debe ser un Feature
      if (geoJSON.type === 'Feature') {
        const geometry = geoJSON.geometry;
        
        if (geometry.type === 'Polygon') {
          return geometry.coordinates as [number, number][][];
        }
        
        if (geometry.type === 'MultiPolygon') {
          // Tomar el primer polígono de un MultiPolygon
          return (geometry.coordinates as [number, number][][][])[0];
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting polygon from GeoJSON:', error);
      return null;
    }
  }

  /**
   * Crea múltiples park areas de una sola vez
   */
  async createMultipleParkAreas(
    parks: Array<{
      id: string;
      name: string;
      description: string;
      status: 'ok' | 'warning' | 'critical';
      color: string;
      location?: [number, number] | GeoJSON.FeatureCollection | GeoJSON.Feature;
    }>
  ): Promise<ParkArea[]> {
    const results = await Promise.allSettled(
      parks.map(park => 
        this.createParkArea(park.id, park.name, park.description, park.status, park.color, park.location)
      )
    );

    return results
      .filter((r): r is PromiseFulfilledResult<ParkArea> => 
        r.status === 'fulfilled' && r.value !== null
      )
      .map(r => r.value);
  }



  /**
 * Agrega un heatmap independiente basado en puntos de datos
 */
addHeatmap(points: HeatmapPoint[], options?: {
  id?: string;
  radius?: number;
  maxIntensity?: number;
  opacity?: number;
  colorScheme?: 'traffic' | 'pollution' | 'temperature' | 'crowd' | 'default';
  visible?: boolean;
}): void {
  if (!this.map) return;

  const {
    id = 'heatmap',
    radius = 25,
    maxIntensity = 1,
    opacity = 0.7,
    colorScheme = 'default',
    visible = true
  } = options || {};

  this.map.on('load', () => {
    if (!this.map) return;

    // Crear features para el heatmap
    const features = points.map(point => ({
      type: 'Feature' as const,
      properties: {
        intensity: point.intensity,
        category: point.category || 'default'
      },
      geometry: {
        type: 'Point' as const,
        coordinates: point.position
      }
    }));

    // Definir esquemas de color
    const colorSchemes = {
      traffic: [
        0, 'rgba(34,139,34,0)',      // Verde transparente
        0.2, 'rgb(34,139,34)',        // Verde
        0.4, 'rgb(255,255,0)',        // Amarillo
        0.6, 'rgb(255,165,0)',        // Naranja
        0.8, 'rgb(255,69,0)',         // Rojo-Naranja
        1, 'rgb(139,0,0)'             // Rojo oscuro
      ],
      pollution: [
        0, 'rgba(0,255,0,0)',         // Verde transparente
        0.3, 'rgb(144,238,144)',      // Verde claro
        0.5, 'rgb(255,255,0)',        // Amarillo
        0.7, 'rgb(255,140,0)',        // Naranja oscuro
        0.9, 'rgb(178,34,34)',        // Rojo ladrillo
        1, 'rgb(75,0,130)'            // Púrpura oscuro
      ],
      temperature: [
        0, 'rgba(0,0,255,0)', // Azul transparente 
        0.2, 'rgb(0,191,255)', // Azul cielo 
        0.4, 'rgb(0,255,0)', // Verde 
        0.6, 'rgb(255,255,0)', // Amarillo 
        0.8, 'rgb(255,140,0)', // Naranja 
        1, 'rgb(255,0,0)' // Rojo
      ],
      crowd: [
        0,   'rgba(0,0,255,0)',   // Violeta suave
        0.3, 'rgb(186, 85, 211)',         // Púrpura medio
        0.5, 'rgb(255, 105, 180)',        // Rosa intenso
        0.7, 'rgb(255, 69, 0)',           // Rojo-anaranjado
        0.9, 'rgb(220, 20, 60)',          // Carmesí
        1,   'rgb(139, 0, 0)'             // Rojo oscuro saturado
      ],
      default: [
        0, 'rgba(33,102,172,0)',
        0.2, 'rgb(103,169,207)',
        0.4, 'rgb(209,229,240)',
        0.6, 'rgb(253,219,199)',
        0.8, 'rgb(239,138,98)',
        1, 'rgb(178,24,43)'
      ]
    };

    // Agregar source
    this.map.addSource(`heatmap-source-${id}`, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features
      }
    });

    // Agregar capa de heatmap
    this.map.addLayer({
      id: `heatmap-layer-${id}`,
      type: 'heatmap',
      source: `heatmap-source-${id}`,
      layout: {
      'visibility': visible ? 'visible' : 'none' // ✅ AÑADIR esto
      },
      paint: {
        // Peso basado en intensidad
        'heatmap-weight': [
          'interpolate',
          ['linear'],
          ['get', 'intensity'],
          0, 0,
          1, 1
        ],
        // Intensidad según zoom
        'heatmap-intensity': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, maxIntensity * 0.3,
          9, maxIntensity * 0.7,
          15, maxIntensity
        ],
        // Color según esquema elegido
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          ...colorSchemes[colorScheme]
        ],
        // Radio del heatmap
        'heatmap-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          0, radius * 0.3,
          9, radius * 0.6,
          15, radius
        ],
        // Opacidad
        'heatmap-opacity': opacity
      }
    }, 'waterway-label');
  });
}

/**
 * Actualiza los datos de un heatmap existente
 */
updateHeatmap(id: string, points: HeatmapPoint[]): void {
  if (!this.map) return;

  const source = this.map.getSource(`heatmap-source-${id}`) as mapboxgl.GeoJSONSource;
  
  if (source) {
    const features = points.map(point => ({
      type: 'Feature' as const,
      properties: {
        intensity: point.intensity,
        category: point.category || 'default'
      },
      geometry: {
        type: 'Point' as const,
        coordinates: point.position
      }
    }));

    source.setData({
      type: 'FeatureCollection',
      features
    });
  }
}

/**
 * Muestra/oculta un heatmap
 */
toggleHeatmap(id: string, visible: boolean): void {
  if (!this.map) return;

  const layerId = `heatmap-layer-${id}`;
  
  // Verificar que la capa existe antes de intentar cambiarla
  if (!this.map.getLayer(layerId)) {
    console.warn(`Layer ${layerId} does not exist yet. Skipping toggle.`);
    return;
  }

  const visibility = visible ? 'visible' : 'none';
  this.map.setLayoutProperty(layerId, 'visibility', visibility);
}
  /**
   * Elimina un heatmap del mapa
   */
  removeHeatmap(id: string): void {
    if (!this.map) return;

    const layerId = `heatmap-layer-${id}`;
    const sourceId = `heatmap-source-${id}`;

    if (this.map.getLayer(layerId)) {
      this.map.removeLayer(layerId);
    }

    if (this.map.getSource(sourceId)) {
      this.map.removeSource(sourceId);
    }
  }


/**
   * Agrega marcadores animados para assets con trail
   * Los assets se moverán a lo largo de su trail de forma simulada
   */
  addAnimatedAssetMarkers(
    assets: Asset[],
    options?: {
      speed?: number; // Velocidad base en índices por segundo (default: 2)
      loop?: boolean; // Si debe reiniciar al llegar al final (default: true)
      startPaused?: boolean; // Si debe empezar pausado (default: false)
    }
  ): void {
    if (!this.map) return;

    const {
      speed = 2,
      loop = true,
      startPaused = false
    } = options || {};

    this.map.on('load', () => {
      setTimeout(() => {
        assets.forEach((asset) => {
          if (!this.map || !asset.trail || asset.trail.length < 2) return;

          const el = this.createMarkerElement(asset);
          const popup = this.createMarkerPopup(asset);

          // Posición inicial es el primer punto del trail
          const startPosition = asset.trail[0];

          const marker = new mapboxgl.Marker(el)
            .setLngLat(startPosition)
            .setPopup(popup)
            .addTo(this.map);

          this.markers.push(marker);

          const from = asset.trail[0];
          const to = asset.trail[1];

          this.animatedAssets.set(asset.id, {
            asset: { ...asset, position: from },
            marker,
            currentIndex: 0,
            traveledDistance: 0,
            segmentDistance: this.distanceMeters(from, to),
            speed: this.calculateSpeedForAsset(asset, speed), // m/s
            loop,
            paused: startPaused
          });

        });

        // Iniciar el loop de animación si hay assets animados
        if (this.animatedAssets.size > 0 && !startPaused) {
          this.startAnimation();
        }
      }, 500);
    });
  }

  private easeInOut(t: number): number {
    return t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }


  /**
   * Inicia el loop de animación de assets
   */
  private startAnimation(): void {
    if (this.animationFrameId !== null) return;

    const animate = (time: number) => {
      if (!this.map) return;

      if (!this.lastFrameTime) this.lastFrameTime = time;
      const deltaTime = (time - this.lastFrameTime) / 1000;
      this.lastFrameTime = time;

      this.animatedAssets.forEach(data => {
        if (data.paused) return;

        const trail = data.asset.trail;
        if (!trail || trail.length < 2) return;

        const from = trail[data.currentIndex];
        const to = trail[data.currentIndex + 1];

        if (!to) {
          if (data.loop) {
            data.currentIndex = 0;
            data.traveledDistance = 0;
            data.segmentDistance = this.distanceMeters(trail[0], trail[1]);
          }
          return;
        }

        data.traveledDistance += data.speed * deltaTime;

        let t = data.traveledDistance / data.segmentDistance;
        t = Math.min(1, t);

        const easedT = this.easeInOut(t);

        const lng = from[0] + (to[0] - from[0]) * easedT;
        const lat = from[1] + (to[1] - from[1]) * easedT;

        data.marker.setLngLat([lng, lat]);

        if (t >= 1) {
          data.currentIndex++;
          data.traveledDistance = 0;

          if (data.currentIndex < trail.length - 1) {
            data.segmentDistance = this.distanceMeters(
              trail[data.currentIndex],
              trail[data.currentIndex + 1]
            );
          } else if (!data.loop) {
            data.paused = true;
          }
        }
      });

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }


  pauseAnimation(): void {
    this.animatedAssets.forEach(a => a.paused = true);
  }

  resumeAnimation(): void {
    this.animatedAssets.forEach(a => a.paused = false);
    this.startAnimation();
  }
  private distanceMeters(a: number[], b: number[]): number {
    const R = 6371000;
    const toRad = (d: number) => (d * Math.PI) / 180;

    const dLat = toRad(b[1] - a[1]);
    const dLng = toRad(b[0] - a[0]);

    const lat1 = toRad(a[1]);
    const lat2 = toRad(b[1]);

    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(dLng / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(h));
  }



  /**
   * Calcula la velocidad final de animación para un asset
   * Ajusta según la longitud del trail
   */
  private calculateSpeedForAsset(asset: Asset, baseSpeed: number): number {
  if (!asset.trail || asset.trail.length < 2) return baseSpeed;

  let total = 0;
  for (let i = 1; i < asset.trail.length; i++) {
    total += this.distanceMeters(asset.trail[i - 1], asset.trail[i]);
  }

  // Ajuste natural
  const factor = Math.min(2.5, Math.max(0.8, total / 1000));
  return baseSpeed * factor; // m/s
}





}

/**
 * Renderiza un mensaje de error cuando el token no está configurado
 */
export function renderMapboxError(container: HTMLElement): void {
  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; height: 100%; background: #0a0a0a; color: rgba(255,255,255,0.5); font-family: system-ui; text-align: center; padding: 20px;">
      <div>
        <div style="font-size: 48px; margin-bottom: 16px;">🗺️</div>
        <div style="font-size: 14px; font-weight: 300;">Mapbox token required</div>
        <div style="font-size: 12px; margin-top: 8px; opacity: 0.5;">Configure NEXT_PUBLIC_MAPBOX_TOKEN</div>
      </div>
    </div>
  `;
}