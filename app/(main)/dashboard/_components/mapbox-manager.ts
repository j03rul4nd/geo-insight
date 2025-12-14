import mapboxgl from 'mapbox-gl';
import type { ParkArea, Asset } from './types';


interface MapConfig {
  container: HTMLElement;
  center: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
}

export class MapboxManager {
  private map: mapboxgl.Map | null = null;
  private markers: mapboxgl.Marker[] = [];
  private resizeObserver: ResizeObserver | null = null;

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
   * Agrega áreas de parques (polígonos) al mapa
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
              status: park.status
            },
            geometry: {
              type: 'Polygon',
              coordinates: park.polygon
            }
          }
        });

        // Relleno
        this.map.addLayer({
          id: `park-fill-${park.id}`,
          type: 'fill',
          source: `park-${park.id}`,
          paint: {
            'fill-color': park.color,
            'fill-opacity': 0.35
          }
        });

        // Borde
        this.map.addLayer({
          id: `park-outline-${park.id}`,
          type: 'line',
          source: `park-${park.id}`,
          paint: {
            'line-color': park.color,
            'line-width': 2
          }
        });
      });
    });
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