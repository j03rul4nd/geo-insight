import type { DataPoint } from './types';
import type { VisualizationLayer } from '@/hooks/useVisualizationLayers';

/**
 * ColorSchemeManager
 * 
 * Gestiona todos los esquemas de color, interpolaciones y conversiones.
 * Centraliza la lógica de color para mantener consistencia.
 */
export class ColorSchemeManager {
  /**
   * Obtiene el color de un punto según el esquema de color de la layer
   */
  getPointColor(
    point: DataPoint,
    layer: VisualizationLayer,
    colorMode: 'heatmap' | 'sensor-type',
    valueRange: { min: number; max: number },
    evaluatedColorScheme?: any
  ): string {
    const scheme = evaluatedColorScheme || layer.colorScheme;
    
    if (!scheme) {
      return this.getFallbackColor(point, colorMode, valueRange);
    }

    const valueKey = scheme.valueKey || 'value';
    const value = this.getNestedValue(point, valueKey);

    switch (scheme.type) {
      case 'solid':
        return scheme.color;

      case 'gradient':
        return this.getGradientColor(value, scheme, valueRange);

      case 'heatmap':
        return this.getHeatmapColor(value, scheme);

      case 'categorical':
        return this.getCategoricalColor(point, scheme);

      case 'threshold':
        return this.getThresholdColor(value, scheme);

      default:
        return this.getFallbackColor(point, colorMode, valueRange);
    }
  }

  /**
   * Color para esquema de gradiente
   */
  private getGradientColor(
    value: any,
    scheme: any,
    valueRange: { min: number; max: number }
  ): string {
    if (value === undefined) return scheme.low;
    
    const normalized = Math.max(0, Math.min(1, 
      (value - valueRange.min) / (valueRange.max - valueRange.min || 1)
    ));
    
    return this.interpolateColor(scheme.low, scheme.high, normalized);
  }

  /**
   * Color para esquema de heatmap
   */
  private getHeatmapColor(value: any, scheme: any): string {
    if (value === undefined) return scheme.colors[0];
    
    const numValue = parseFloat(value);
    
    for (let i = 0; i < scheme.thresholds.length; i++) {
      if (numValue <= scheme.thresholds[i]) {
        return scheme.colors[i] || '#ffffff';
      }
    }
    
    return scheme.colors[scheme.colors.length - 1] || '#ffffff';
  }

  /**
   * Color para esquema categórico
   */
  private getCategoricalColor(point: DataPoint, scheme: any): string {
    const category = this.getNestedValue(point, scheme.categoryKey);
    const index = scheme.categories.indexOf(category);
    return index >= 0 ? scheme.colors[index] : scheme.colors[0];
  }

  /**
   * Color para esquema de umbrales
   */
  private getThresholdColor(value: any, scheme: any): string {
    if (value === undefined) return scheme.thresholdRanges[0].color;
    
    const numValue = parseFloat(value);
    
    for (const range of scheme.thresholdRanges) {
      if (numValue >= range.min && numValue <= range.max) {
        return range.color;
      }
    }
    
    return scheme.thresholdRanges[0].color;
  }

  /**
   * Color de fallback cuando no hay esquema definido
   */
  private getFallbackColor(
    point: DataPoint,
    colorMode: 'heatmap' | 'sensor-type',
    valueRange: { min: number; max: number }
  ): string {
    if (colorMode === 'sensor-type') {
      const sensorType = point.metadata?.sensorType || 'unknown';
      const colors: Record<string, string> = {
        temperature: '#ef4444',
        pressure: '#8b5cf6',
        humidity: '#3b82f6',
        speed: '#10b981',
        unknown: '#6b7280'
      };
      return colors[sensorType.toLowerCase()] || colors.unknown;
    }

    // Heatmap basado en valor
    const normalized = Math.max(0, Math.min(1, 
      (point.value - valueRange.min) / (valueRange.max - valueRange.min || 1)
    ));
    const hue = (1 - normalized) * 240;
    return `hsl(${hue}, 80%, 50%)`;
  }

  /**
   * Interpola entre dos colores
   */
  interpolateColor(color1: string, color2: string, factor: number): string {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);
    
    if (!c1 || !c2) return color1;

    const r = Math.round(c1.r + factor * (c2.r - c1.r));
    const g = Math.round(c1.g + factor * (c2.g - c1.g));
    const b = Math.round(c1.b + factor * (c2.b - c1.b));

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Convierte hexadecimal a RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Aplica opacidad a un color
   */
  applyOpacityToColor(color: string, opacity: number): string {
    // Si ya es rgba/hsla, reemplazar la opacidad
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/g, `${opacity})`);
    }
    if (color.startsWith('hsla')) {
      return color.replace(/[\d.]+\)$/g, `${opacity})`);
    }
    
    // Si es rgb, convertir a rgba
    if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    
    // Si es hexadecimal, convertir a rgba
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    
    // Para colores nombrados
    return `rgba(${color}, ${opacity})`;
  }

  /**
   * Obtiene valor anidado de un objeto usando notación de punto
   */
  private getNestedValue(obj: any, path: string): any {
    const keys = path.split('.');
    let current = obj;
    
    for (const key of keys) {
      if (current === null || current === undefined || !(key in current)) {
        return undefined;
      }
      current = current[key];
    }
    
    return current;
  }
}