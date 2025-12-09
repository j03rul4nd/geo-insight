import mapboxgl from 'mapbox-gl';
import { MapConfig, MapView } from './types';

export interface MapManagerCallbacks {
  onLoad: () => void;
  onError: (error: any) => void;
  onViewChange?: (view: MapView) => void;
}

/**
 * Control para cambiar el estilo del mapa
 */
class StyleControl implements mapboxgl.IControl {
  private map?: mapboxgl.Map;
  private container?: HTMLDivElement;
  private styles: Array<{ name: string; url: string; icon: string }>;

  constructor() {
    this.styles = [
      { 
        name: 'Calles', 
        url: 'mapbox://styles/mapbox/streets-v12',
        icon: '🗺️'
      },
      { 
        name: 'Satélite', 
        url: 'mapbox://styles/mapbox/satellite-streets-v12',
        icon: '🛰️'
      },
      { 
        name: 'Oscuro', 
        url: 'mapbox://styles/mapbox/dark-v11',
        icon: '🌙'
      },
      { 
        name: '3D', 
        url: 'mapbox://styles/mapbox/standard',
        icon: '🏔️'
      },
      { 
        name: 'Navegación', 
        url: 'mapbox://styles/mapbox/navigation-day-v1',
        icon: '🧭'
      }
    ];
  }

  onAdd(map: mapboxgl.Map): HTMLElement {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    
    const button = document.createElement('button');
    button.className = 'mapboxgl-ctrl-icon';
    button.type = 'button';
    button.title = 'jbeCambiar estilo de mapa';
    button.innerHTML = '🗺️';
    button.style.cssText = `
      font-size: 18px;
      width: 29px;
      height: 29px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: white;
      border: none;
      color: #333;
      line-height: 1;
      padding: 0;
    `;

    const dropdown = this.createDropdown();
    dropdown.style.display = 'none';

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = dropdown.style.display === 'block';
      dropdown.style.display = isVisible ? 'none' : 'block';
    });

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', () => {
      dropdown.style.display = 'none';
    });

    this.container.appendChild(button);
    this.container.appendChild(dropdown);

    return this.container;
  }

  onRemove(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.map = undefined;
  }

  private createDropdown(): HTMLDivElement {
    const dropdown = document.createElement('div');
    dropdown.style.cssText = `
      position: absolute;
      top: 0;
      left: 40px;
      background: white;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      min-width: 150px;
      z-index: 1;
    `;

    this.styles.forEach((style) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.innerHTML = `${style.icon} ${style.name}`;
      option.style.cssText = `
        width: 100%;
        padding: 10px 15px;
        border: none;
        background: white;
        cursor: pointer;
        text-align: left;
        font-size: 14px;
        color: #333;
        border-bottom: 1px solid #eee;
        display: flex;
        align-items: center;
        gap: 8px;
      `;

      option.addEventListener('mouseenter', () => {
        option.style.backgroundColor = '#f0f0f0';
      });

      option.addEventListener('mouseleave', () => {
        option.style.backgroundColor = 'white';
      });

      option.addEventListener('click', (e) => {
        e.stopPropagation();
        this.changeStyle(style.url, style.name);
        dropdown.style.display = 'none';
      });

      dropdown.appendChild(option);
    });

    return dropdown;
  }

  private changeStyle(styleUrl: string, styleName: string): void {
    if (!this.map) return;

    // Guardar estado actual
    const currentCenter = this.map.getCenter();
    const currentZoom = this.map.getZoom();
    const currentPitch = this.map.getPitch();
    const currentBearing = this.map.getBearing();

    // Cambiar estilo
    this.map.setStyle(styleUrl);

    // Restaurar estado después de cargar
    this.map.once('style.load', () => {
      this.map?.setCenter(currentCenter);
      this.map?.setZoom(currentZoom);
      this.map?.setPitch(currentPitch);
      this.map?.setBearing(currentBearing);

      // Si es el estilo 3D, habilitar terreno
      if (styleName === '3D') {
        this.enable3DTerrain();
      }
    });
  }

  private enable3DTerrain(): void {
    if (!this.map) return;

    try {
      // Agregar fuente de terreno 3D
      this.map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });

      // Establecer terreno 3D
      this.map.setTerrain({ 
        source: 'mapbox-dem', 
        exaggeration: 1.5 
      });

      // Agregar capa de cielo para efecto 3D
      this.map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      // Ajustar pitch para vista 3D
      this.map.easeTo({ pitch: 60, duration: 1000 });
    } catch (error) {
      console.error('Error enabling 3D terrain:', error);
    }
  }
}

/**
 * Control personalizado para rotación del mapa
 */
class RotationControl implements mapboxgl.IControl {
  private map?: mapboxgl.Map;
  private container?: HTMLDivElement;
  private rotateStep: number;

  constructor(rotateStep: number = 45) {
    this.rotateStep = rotateStep;
  }

  onAdd(map: mapboxgl.Map): HTMLElement {
    this.map = map;
    this.container = document.createElement('div');
    this.container.className = 'mapboxgl-ctrl mapboxgl-ctrl-group';
    this.container.style.cssText = 'display: flex; flex-direction: column;';

    // Botón rotar a la izquierda
    const rotateLeftBtn = this.createButton('⟲', 'Rotar izquierda', () => {
      this.rotate(-this.rotateStep);
    });

    // Botón reset bearing (norte arriba)
    const resetBtn = this.createButton('N', 'Restablecer norte', () => {
      this.resetBearing();
    });

    // Botón rotar a la derecha
    const rotateRightBtn = this.createButton('⟳', 'Rotar derecha', () => {
      this.rotate(this.rotateStep);
    });

    this.container.appendChild(rotateLeftBtn);
    this.container.appendChild(resetBtn);
    this.container.appendChild(rotateRightBtn);

    return this.container;
  }

  onRemove(): void {
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.map = undefined;
  }

  private createButton(
    text: string,
    title: string,
    onClick: () => void
  ): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'mapboxgl-ctrl-icon';
    button.type = 'button';
    button.title = title;
    button.innerHTML = text;
    button.style.cssText = `
      font-size: 20px;
      font-weight: bold;
      width: 29px;
      height: 29px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background: white;
      border: none;
      border-bottom: 1px solid #ddd;
      color: #333;
      line-height: 1;
      padding: 0;
    `;
    
    button.addEventListener('click', (e) => {
      e.preventDefault();
      onClick();
    });

    // Hover effect
    button.addEventListener('mouseenter', () => {
      button.style.backgroundColor = '#f0f0f0';
      button.style.color = '#000';
    });
    button.addEventListener('mouseleave', () => {
      button.style.backgroundColor = 'white';
      button.style.color = '#333';
    });

    return button;
  }

  private rotate(degrees: number): void {
    if (!this.map) return;
    const currentBearing = this.map.getBearing();
    this.map.easeTo({
      bearing: currentBearing + degrees,
      duration: 300
    });
  }

  private resetBearing(): void {
    if (!this.map) return;
    this.map.easeTo({
      bearing: 0,
      pitch: 0,
      duration: 500
    });
  }
}

/**
 * Clase para gestionar la instancia de Mapbox
 */
export class MapManager {
  private map: mapboxgl.Map | null = null;
  private config: MapConfig;
  private callbacks: MapManagerCallbacks;

  constructor(config: MapConfig, callbacks: MapManagerCallbacks) {
    this.config = config;
    this.callbacks = callbacks;
  }

  /**
   * Inicializa el mapa
   */
  initialize(container: HTMLDivElement, accessToken: string): mapboxgl.Map {
    if (this.map) {
      throw new Error('Map already initialized');
    }

    // Configurar token
    mapboxgl.accessToken = accessToken;

    // Crear instancia del mapa
    this.map = new mapboxgl.Map({
      container,
      style: this.config.style,
      center: this.config.defaultCenter,
      zoom: this.config.defaultZoom,
      pitch: this.config.defaultPitch,
      bearing: this.config.defaultBearing,
      attributionControl: true,
      logoPosition: 'bottom-right'
    });

    // Agregar controles
    this.addControls();

    // Configurar eventos
    this.setupEventListeners();

    return this.map;
  }

  /**
   * Obtiene la instancia del mapa
   */
  getMap(): mapboxgl.Map | null {
    return this.map;
  }

  /**
   * Ajusta la vista del mapa a los bounds dados
   */
  fitBounds(bounds: mapboxgl.LngLatBounds, options?: {
    padding?: number;
    maxZoom?: number;
    duration?: number;
  }): void {
    if (!this.map) return;

    try {
      this.map.fitBounds(bounds, {
        padding: options?.padding || 50,
        maxZoom: options?.maxZoom || 15,
        duration: options?.duration || 1000
      });
    } catch (error) {
      console.error('Error fitting bounds:', error);
    }
  }

  /**
   * Obtiene la vista actual del mapa
   */
  getCurrentView(): MapView | null {
    if (!this.map) return null;

    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    const pitch = this.map.getPitch();
    const bearing = this.map.getBearing();

    return {
      center: [center.lng, center.lat],
      zoom,
      pitch,
      bearing
    };
  }

  /**
   * Rota el mapa en grados
   */
  rotate(degrees: number, duration: number = 300): void {
    if (!this.map) return;
    const currentBearing = this.map.getBearing();
    this.map.easeTo({
      bearing: currentBearing + degrees,
      duration
    });
  }

  /**
   * Establece el bearing absoluto
   */
  setBearing(bearing: number, duration: number = 300): void {
    if (!this.map) return;
    this.map.easeTo({
      bearing,
      duration
    });
  }

  /**
   * Resetea bearing y pitch a valores por defecto
   */
  resetOrientation(duration: number = 500): void {
    if (!this.map) return;
    this.map.easeTo({
      bearing: 0,
      pitch: 0,
      duration
    });
  }

  /**
   * Cambia el estilo del mapa
   */
  changeMapStyle(styleUrl: string, options?: {
    preserveDrawingBuffer?: boolean;
    enable3D?: boolean;
  }): void {
    if (!this.map) return;

    // Guardar estado actual
    const currentCenter = this.map.getCenter();
    const currentZoom = this.map.getZoom();
    const currentPitch = this.map.getPitch();
    const currentBearing = this.map.getBearing();

    // Cambiar estilo
    this.map.setStyle(styleUrl);

    // Restaurar estado después de cargar
    this.map.once('style.load', () => {
      this.map?.setCenter(currentCenter);
      this.map?.setZoom(currentZoom);
      this.map?.setPitch(currentPitch);
      this.map?.setBearing(currentBearing);

      // Si es el estilo 3D, habilitar terreno
      if (options?.enable3D) {
        this.enable3DTerrain();
      }
    });
  }

  /**
   * Habilita el terreno 3D
   */
  enable3DTerrain(exaggeration: number = 1.5): void {
    if (!this.map) return;

    try {
      // Agregar fuente de terreno 3D
      this.map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });

      // Establecer terreno 3D
      this.map.setTerrain({ 
        source: 'mapbox-dem', 
        exaggeration 
      });

      // Agregar capa de cielo para efecto 3D
      this.map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });

      // Ajustar pitch para vista 3D
      this.map.easeTo({ pitch: 60, duration: 1000 });
    } catch (error) {
      console.error('Error enabling 3D terrain:', error);
    }
  }

  /**
   * Deshabilita el terreno 3D
   */
  disable3DTerrain(): void {
    if (!this.map) return;

    try {
      // Remover terreno
      this.map.setTerrain(null);

      // Remover capa de cielo
      if (this.map.getLayer('sky')) {
        this.map.removeLayer('sky');
      }

      // Restaurar pitch plano
      this.map.easeTo({ pitch: 0, duration: 1000 });
    } catch (error) {
      console.error('Error disabling 3D terrain:', error);
    }
  }

  /**
   * Destruye el mapa y limpia recursos
   */
  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  /**
   * Verifica si el mapa está cargado
   */
  isLoaded(): boolean {
    return this.map?.loaded() || false;
  }

  // ============ MÉTODOS PRIVADOS ============

  private addControls(): void {
    if (!this.map) return;

    // Controles de navegación (zoom y orientación)
    this.map.addControl(new mapboxgl.NavigationControl(), 'top-right');
    
    // Control de rotación personalizado
    this.map.addControl(new RotationControl(45), 'top-right');
    
    // Escala
    this.map.addControl(new mapboxgl.ScaleControl(), 'bottom-left');
  }

  private setupEventListeners(): void {
    if (!this.map) return;

    // Evento de carga
    this.map.on('load', () => {
      this.callbacks.onLoad();
    });

    // Evento de error
    this.map.on('error', (e) => {
      console.error('Mapbox error:', e.error);
      this.callbacks.onError(e);
    });

    // Trackear cambios de vista
    if (this.callbacks.onViewChange) {
      this.map.on('moveend', () => {
        const view = this.getCurrentView();
        if (view && this.callbacks.onViewChange) {
          this.callbacks.onViewChange(view);
        }
      });
    }
  }
}