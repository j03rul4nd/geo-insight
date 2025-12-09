import mapboxgl from 'mapbox-gl';

import type { DataPoint, AssetTracker, AssetTrackerOptions } from './types';


/**
 * Clase para gestionar el tracking de assets en el mapa
 */
export class AssetTrackerManager {
  private trackers: Map<string, AssetTracker> = new Map();
  private map: mapboxgl.Map;
  private options: AssetTrackerOptions;

  constructor(map: mapboxgl.Map, options: AssetTrackerOptions) {
    this.map = map;
    this.options = options;
  }

  /**
   * Obtiene todos los trackers activos
   */
  getAllTrackers(): Map<string, AssetTracker> {
    return this.trackers;
  }

  /**
   * Obtiene un tracker específico por ID
   */
  getTracker(assetId: string): AssetTracker | undefined {
    return this.trackers.get(assetId);
  }

  /**
   * Obtiene el número de assets activos
   */
  getActiveCount(): number {
    return this.trackers.size;
  }

  /**
   * Crea un nuevo marcador para un asset
   */
  createMarker(
    assetId: string,
    point: DataPoint,
    color: string,
    position: [number, number]
  ): void {
    console.log(`✨ Creando nuevo asset: ${assetId} en`, position);

    // Crear elemento del marcador
    const el = this.createMarkerElement(color);
    
    // Agregar event listeners
    this.addMarkerEventListeners(el, assetId, point);

    // Crear marcador de Mapbox con anchor explícito
    const marker = new mapboxgl.Marker({ 
      element: el,
      anchor: 'center' // IMPORTANTE: anclar al centro
    })
      .setLngLat(position)
      .addTo(this.map);

    // Crear popup
    const popup = this.createPopup(point, color, 1);
    marker.setPopup(popup);

    // Guardar tracker
    this.trackers.set(assetId, {
      marker,
      trail: [position],
      lastUpdate: Date.now(),
      currentPoint: point
    });
  }

  /**
   * Actualiza un asset existente con nueva posición
   */
  updateMarker(
    assetId: string,
    point: DataPoint,
    color: string,
    newPosition: [number, number]
  ): boolean {
    const tracker = this.trackers.get(assetId);
    if (!tracker) return false;

    const oldPosition = tracker.marker.getLngLat();
    const oldLngLat: [number, number] = [oldPosition.lng, oldPosition.lat];

    // Verificar si la posición cambió
    const positionChanged = 
      Math.abs(oldLngLat[0] - newPosition[0]) > 0.000001 ||
      Math.abs(oldLngLat[1] - newPosition[1]) > 0.000001;

    if (positionChanged) {
      console.log(`🔄 Actualizando posición de ${assetId}:`, oldLngLat, '→', newPosition);

      // Animar movimiento
      this.animateMarker(tracker.marker, oldLngLat, newPosition);

      // Actualizar trail
      tracker.trail.push(newPosition);
      if (tracker.trail.length > this.options.maxTrailLength) {
        tracker.trail.shift();
      }

      // Actualizar metadata
      tracker.lastUpdate = Date.now();
      tracker.currentPoint = point;
    }

    // Actualizar color del dot interno
    const container = tracker.marker.getElement();
    const dot = container.querySelector('.custom-marker-dot') as HTMLDivElement;
    if (dot) {
      dot.style.backgroundColor = color;
    }

    // Actualizar popup
    this.updatePopup(tracker.marker, point, color, tracker.trail.length);

    return positionChanged;
  }

  /**
   * Elimina un asset del mapa
   */
  removeMarker(assetId: string): void {
    const tracker = this.trackers.get(assetId);
    if (tracker) {
      console.log('❌ Removiendo asset:', assetId);
      tracker.marker.remove();
      this.removeTrailLayer(assetId);
      this.trackers.delete(assetId);
    }
  }

  /**
   * Resalta visualmente un marcador seleccionado
   */
  highlightMarker(assetId: string | null): void {
    this.trackers.forEach((tracker, id) => {
      const container = tracker.marker.getElement();
      const dot = container.querySelector('.custom-marker-dot') as HTMLDivElement;
      if (!dot) return;
      
      if (assetId === id) {
        // Asset seleccionado - escalar dot interno con transform
        dot.style.transform = 'scale(1.67)'; // 12px * 1.67 ≈ 20px
        dot.style.border = '3px solid #ffffff';
        dot.style.boxShadow = '0 0 20px rgba(255,255,255,0.5)';
        container.style.zIndex = '1001';
        
        const popup = tracker.marker.getPopup();
        if (popup && !popup.isOpen()) {
          tracker.marker.togglePopup();
        }
      } else {
        // Assets no seleccionados - escala normal
        dot.style.transform = 'scale(1)';
        dot.style.border = '2px solid rgba(255,255,255,0.5)';
        dot.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
        container.style.zIndex = '1';
      }
    });
  }

  /**
   * Actualiza el trail layer en el mapa
   */
  updateTrailLayer(assetId: string, trail: [number, number][], color: string): void {
    if (trail.length < 2) return;

    const sourceId = `trail-${assetId}`;
    const layerId = `trail-layer-${assetId}`;
    const pointsLayerId = `trail-points-${assetId}`;

    // GeoJSON para la línea del trail
    const lineGeojson: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: { assetId },
      geometry: {
        type: 'LineString',
        coordinates: trail
      }
    };

    // GeoJSON para los puntos históricos
    const pointsGeojson: GeoJSON.FeatureCollection<GeoJSON.Point> = {
      type: 'FeatureCollection',
      features: trail.slice(0, -1).map((coord, index) => ({
        type: 'Feature',
        properties: { 
          assetId,
          index,
          opacity: 0.3 + (index / trail.length) * 0.7
        },
        geometry: {
          type: 'Point',
          coordinates: coord
        }
      }))
    };

    const source = this.map.getSource(sourceId) as mapboxgl.GeoJSONSource;
    
    if (source) {
      source.setData(lineGeojson);
    } else {
      // Crear layer de línea
      this.map.addSource(sourceId, {
        type: 'geojson',
        data: lineGeojson
      });

      this.map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': color,
          'line-width': 4,
          'line-opacity': 0.8,
          'line-dasharray': [1, 1.5]
        }
      });
    }

    // Actualizar puntos históricos
    const pointsSourceId = `trail-points-source-${assetId}`;
    const pointsSource = this.map.getSource(pointsSourceId) as mapboxgl.GeoJSONSource;
    
    if (pointsSource) {
      pointsSource.setData(pointsGeojson);
    } else {
      this.map.addSource(pointsSourceId, {
        type: 'geojson',
        data: pointsGeojson
      });

      this.map.addLayer({
        id: pointsLayerId,
        type: 'circle',
        source: pointsSourceId,
        paint: {
          'circle-radius': 3,
          'circle-color': color,
          'circle-opacity': ['get', 'opacity'],
          'circle-stroke-width': 1,
          'circle-stroke-color': '#ffffff',
          'circle-stroke-opacity': 0.5
        }
      });
    }
  }

  /**
   * Limpia todos los trackers y trails
   */
  clearAll(): void {
    this.trackers.forEach((tracker, assetId) => {
      tracker.marker.remove();
      this.removeTrailLayer(assetId);
    });
    this.trackers.clear();
  }

  // ============ MÉTODOS PRIVADOS ============

  private createMarkerElement(color: string): HTMLDivElement {
    // Contenedor externo - TAMAÑO FIJO para mantener anchor estable
    const container = document.createElement('div');
    container.className = 'custom-marker-container';
    container.style.cssText = `
      width: 24px;
      height: 24px;
      position: relative;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Punto interno - usa transform scale que NO afecta el layout
    const dot = document.createElement('div');
    dot.className = 'custom-marker-dot';
    dot.style.cssText = `
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: ${color};
      border: 2px solid rgba(255,255,255,0.5);
      transition: transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transform: scale(1);
      transform-origin: center center;
    `;
    
    container.appendChild(dot);
    return container;
  }

  private addMarkerEventListeners(
    el: HTMLDivElement,
    assetId: string,
    point: DataPoint
  ): void {
    const dot = el.querySelector('.custom-marker-dot') as HTMLDivElement;
    if (!dot) return;
    
    el.addEventListener('mouseenter', () => {
      // Usar transform scale solo en el dot interno
      dot.style.transform = 'scale(1.5)';
      dot.style.boxShadow = '0 4px 8px rgba(0,0,0,0.5)';
      dot.style.borderWidth = '3px';
      el.style.zIndex = '1000';
    });

    el.addEventListener('mouseleave', () => {
      // Restaurar escala del dot
      dot.style.transform = 'scale(1)';
      dot.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      dot.style.borderWidth = '2px';
      el.style.zIndex = '1';
    });

    el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.options.onPointSelect(point);
    });
  }

  private createPopup(point: DataPoint, color: string, trailLength: number): mapboxgl.Popup {
    return new mapboxgl.Popup({ 
      offset: 15,
      closeButton: false,
      className: 'mapbox-popup-custom'
    }).setHTML(this.getPopupHTML(point, color, trailLength));
  }

  private updatePopup(
    marker: mapboxgl.Marker,
    point: DataPoint,
    color: string,
    trailLength: number
  ): void {
    const popup = marker.getPopup();
    if (popup) {
      popup.setHTML(this.getPopupHTML(point, color, trailLength));
    }
  }

  private getPopupHTML(point: DataPoint, color: string, trailLength: number): string {
    return `
      <div style="padding: 8px; font-family: ui-monospace, monospace; font-size: 12px; background: #18181b; color: #fff; border-radius: 4px;">
        <strong style="color: ${color};">${point.metadata?.sensorType || 'Sensor'}</strong><br/>
        <span style="color: #9ca3af;">ID:</span> ${point.sensorId}<br/>
        <span style="color: #9ca3af;">Value:</span> ${point.value.toFixed(2)} ${point.metadata?.unit || ''}<br/>
        ${point.metadata?.z ? `<span style="color: #9ca3af;">Altitude:</span> ${point.metadata.z.toFixed(1)}m<br/>` : ''}
        <span style="color: #9ca3af;">Trail:</span> ${trailLength} point${trailLength !== 1 ? 's' : ''}<br/>
        <span style="color: #9ca3af;">Time:</span> ${new Date(point.timestamp).toLocaleTimeString()}
      </div>
    `;
  }

  private animateMarker(
    marker: mapboxgl.Marker,
    fromLngLat: [number, number],
    toLngLat: [number, number]
  ): void {
    const start = performance.now();
    const duration = this.options.animationDuration;
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-in-out)
      const eased = progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      
      const lng = fromLngLat[0] + (toLngLat[0] - fromLngLat[0]) * eased;
      const lat = fromLngLat[1] + (toLngLat[1] - fromLngLat[1]) * eased;
      
      marker.setLngLat([lng, lat]);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  private removeTrailLayer(assetId: string): void {
    const sourceId = `trail-${assetId}`;
    const layerId = `trail-layer-${assetId}`;
    const pointsSourceId = `trail-points-source-${assetId}`;
    const pointsLayerId = `trail-points-${assetId}`;

    if (this.map.getLayer(layerId)) {
      this.map.removeLayer(layerId);
    }
    if (this.map.getSource(sourceId)) {
      this.map.removeSource(sourceId);
    }
    if (this.map.getLayer(pointsLayerId)) {
      this.map.removeLayer(pointsLayerId);
    }
    if (this.map.getSource(pointsSourceId)) {
      this.map.removeSource(pointsSourceId);
    }
  }
}