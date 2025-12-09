import type { DataPoint } from './types';
import type { VisualizationLayer } from '@/hooks/useVisualizationLayers';

// ============================================================================
// TIPOS
// ============================================================================

/**
 * Tipo de aplicación de color
 */
export type ColorApplicationType = 
  | 'entire-trail'    // Aplica a todo el trail (histórico + actual)
  | 'current-segment' // Solo al segmento actual
  | 'future-segments' // Desde ahora en adelante
  | 'historical';     // Solo al histórico (no al actual)

/**
 * Configuración de una regla de color
 */
export interface TrailColorRule {
  id: string;
  name: string;
  priority: number; // Mayor = más prioridad
  applicationType: ColorApplicationType;
  
  // Condición para activar la regla
  condition: (point: DataPoint, layer: VisualizationLayer) => boolean;
  
  // Color a aplicar
  getColor: (point: DataPoint, layer: VisualizationLayer) => string;
  
  // Metadata opcional
  description?: string;
  enabled?: boolean;
}

/**
 * Resultado de evaluación de color para un punto
 */
export interface ColorEvaluation {
  color: string;
  appliedRuleId?: string;
  priority: number;
  isHistorical: boolean; // Si es un color histórico o aplicado por regla
}

/**
 * Configuración de gradiente histórico
 */
export interface HistoricalGradientConfig {
  enabled: boolean;
  fadeOldSegments?: boolean; // Atenuar segmentos viejos
  fadeStartAge?: number; // Edad (ms) donde empieza el fade
  fadeEndAge?: number; // Edad (ms) donde termina el fade
  minOpacity?: number; // Opacidad mínima para segmentos viejos
}

// ============================================================================
// MOTOR DE REGLAS DE COLOR
// ============================================================================

export class TrailColorRulesEngine {
  private rules: Map<string, TrailColorRule> = new Map();
  private historicalColors: Map<string, Map<number, string>> = new Map(); // stateKey -> timestamp -> color
  private gradientConfig: HistoricalGradientConfig = {
    enabled: true,
    fadeOldSegments: true,
    fadeStartAge: 2 * 60 * 1000, // 2 minutos
    fadeEndAge: 5 * 60 * 1000,   // 5 minutos
    minOpacity: 0.3
  };

  constructor() {
    console.log('✨ TrailColorRulesEngine inicializado');
  }

  // ============================================================================
  // GESTIÓN DE REGLAS
  // ============================================================================

  /**
   * Registra una nueva regla de color
   */
  registerRule(rule: TrailColorRule): void {
    if (rule.enabled === undefined) {
      rule.enabled = true;
    }
    this.rules.set(rule.id, rule);
    console.log(`📋 Regla registrada: ${rule.name} (prioridad: ${rule.priority})`);
  }

  /**
   * Elimina una regla
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    console.log(`🗑️ Regla eliminada: ${ruleId}`);
  }

  /**
   * Activa/desactiva una regla
   */
  setRuleEnabled(ruleId: string, enabled: boolean): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      rule.enabled = enabled;
      console.log(`${enabled ? '✅' : '⏸️'} Regla ${ruleId} ${enabled ? 'activada' : 'desactivada'}`);
    }
  }

  /**
   * Obtiene todas las reglas ordenadas por prioridad
   */
  private getSortedRules(): TrailColorRule[] {
    return Array.from(this.rules.values())
      .filter(rule => rule.enabled)
      .sort((a, b) => b.priority - a.priority); // Mayor prioridad primero
  }

  // ============================================================================
  // EVALUACIÓN DE COLOR PARA UN PUNTO
  // ============================================================================

  /**
   * Evalúa qué color debe tener un punto específico del trail
   * 
   * @param stateKey - Identificador del asset
   * @param point - Punto de datos
   * @param layer - Configuración de la layer
   * @param timestamp - Timestamp del punto (para histórico)
   * @param baseColor - Color base si no hay reglas
   * @param isCurrentPoint - Si es el punto actual o histórico
   */
  evaluatePointColor(
    stateKey: string,
    point: DataPoint,
    layer: VisualizationLayer,
    timestamp: number,
    baseColor: string,
    isCurrentPoint: boolean
  ): ColorEvaluation {
    
    // 1. Evaluar reglas por prioridad
    const sortedRules = this.getSortedRules();
    
    for (const rule of sortedRules) {
      try {
        // Verificar si la condición se cumple
        if (!rule.condition(point, layer)) {
          continue;
        }

        // Verificar si la regla aplica a este punto
        const shouldApply = this.shouldApplyRule(
          rule,
          isCurrentPoint,
          timestamp
        );

        if (!shouldApply) {
          continue;
        }

        // Regla coincide: obtener color
        const color = rule.getColor(point, layer);
        
        return {
          color,
          appliedRuleId: rule.id,
          priority: rule.priority,
          isHistorical: false
        };

      } catch (error) {
        console.error(`❌ Error evaluando regla ${rule.id}:`, error);
      }
    }

    // 2. Si no hay reglas, usar color histórico si existe
    if (this.gradientConfig.enabled && !isCurrentPoint) {
      const historicalColor = this.getHistoricalColor(stateKey, timestamp);
      if (historicalColor) {
        return {
          color: historicalColor,
          priority: -1,
          isHistorical: true
        };
      }
    }

    // 3. Fallback: color base
    return {
      color: baseColor,
      priority: -1,
      isHistorical: false
    };
  }

  /**
   * Determina si una regla debe aplicarse a un punto
   */
  private shouldApplyRule(
    rule: TrailColorRule,
    isCurrentPoint: boolean,
    timestamp: number
  ): boolean {
    const now = Date.now();
    const age = now - timestamp;

    switch (rule.applicationType) {
      case 'entire-trail':
        // Siempre aplica
        return true;

      case 'current-segment':
        // Solo al punto actual
        return isCurrentPoint;

      case 'future-segments':
        // A puntos nuevos desde que se activó la regla
        // (requiere tracking de cuándo se activó - implementar si necesario)
        return isCurrentPoint;

      case 'historical':
        // Solo a puntos históricos
        return !isCurrentPoint;

      default:
        return false;
    }
  }

  // ============================================================================
  // GESTIÓN DE COLORES HISTÓRICOS
  // ============================================================================

  /**
   * Guarda el color de un punto en el histórico
   */
  saveHistoricalColor(
    stateKey: string,
    timestamp: number,
    color: string
  ): void {
    if (!this.gradientConfig.enabled) return;

    let history = this.historicalColors.get(stateKey);
    if (!history) {
      history = new Map();
      this.historicalColors.set(stateKey, history);
    }

    history.set(timestamp, color);

    // Limitar tamaño del histórico (mantener últimos 100 puntos)
    if (history.size > 100) {
      const oldest = Array.from(history.keys()).sort((a, b) => a - b)[0];
      history.delete(oldest);
    }
  }

  /**
   * Obtiene el color histórico de un punto
   */
  private getHistoricalColor(
    stateKey: string,
    timestamp: number
  ): string | null {
    const history = this.historicalColors.get(stateKey);
    if (!history) return null;

    return history.get(timestamp) || null;
  }

  /**
   * Limpia el histórico de un asset
   */
  clearHistoricalColors(stateKey: string): void {
    this.historicalColors.delete(stateKey);
  }

  /**
   * Limpia todo el histórico
   */
  clearAllHistoricalColors(): void {
    this.historicalColors.clear();
  }

  // ============================================================================
  // APLICACIÓN DE FADE A SEGMENTOS ANTIGUOS
  // ============================================================================

  /**
   * Calcula la opacidad para un punto según su edad
   */
  calculateOpacityForAge(timestamp: number): number {
    if (!this.gradientConfig.fadeOldSegments) {
      return 1.0;
    }

    const now = Date.now();
    const age = now - timestamp;
    const startAge = this.gradientConfig.fadeStartAge || 0;
    const endAge = this.gradientConfig.fadeEndAge || startAge;
    const minOpacity = this.gradientConfig.minOpacity || 0.3;

    if (age <= startAge) {
      return 1.0;
    }

    if (age >= endAge) {
      return minOpacity;
    }

    // Interpolación lineal entre startAge y endAge
    const factor = (age - startAge) / (endAge - startAge);
    return 1.0 - (factor * (1.0 - minOpacity));
  }

  /**
   * Aplica opacidad a un color
   */
  applyOpacityToColor(color: string, opacity: number): string {
    // Manejar diferentes formatos de color
    if (color.startsWith('rgba')) {
      return color.replace(/[\d.]+\)$/g, `${opacity})`);
    }
    
    if (color.startsWith('rgb')) {
      return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
    }
    
    if (color.startsWith('#')) {
      const hex = color.replace('#', '');
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }

    // Fallback
    return color;
  }

  // ============================================================================
  // CONFIGURACIÓN
  // ============================================================================

  /**
   * Actualiza la configuración de gradiente histórico
   */
  setGradientConfig(config: Partial<HistoricalGradientConfig>): void {
    this.gradientConfig = {
      ...this.gradientConfig,
      ...config
    };
    console.log('⚙️ Configuración de gradiente actualizada:', this.gradientConfig);
  }

  /**
   * Obtiene la configuración actual
   */
  getGradientConfig(): HistoricalGradientConfig {
    return { ...this.gradientConfig };
  }

  // ============================================================================
  // DEBUG Y UTILIDADES
  // ============================================================================

  /**
   * Obtiene información sobre las reglas activas
   */
  getRulesInfo(): Array<{
    id: string;
    name: string;
    priority: number;
    applicationType: ColorApplicationType;
    enabled: boolean;
  }> {
    return Array.from(this.rules.values()).map(rule => ({
      id: rule.id,
      name: rule.name,
      priority: rule.priority,
      applicationType: rule.applicationType,
      enabled: rule.enabled || false
    }));
  }

  /**
   * Imprime información de debug
   */
  printDebugInfo(): void {
    console.group('🎨 TrailColorRulesEngine Debug Info');
    
    console.log('Reglas registradas:', this.rules.size);
    this.getSortedRules().forEach(rule => {
      console.log(`  - [${rule.priority}] ${rule.name} (${rule.applicationType})`);
    });

    console.log('\nAssets con histórico:', this.historicalColors.size);
    this.historicalColors.forEach((history, stateKey) => {
      console.log(`  - ${stateKey}: ${history.size} puntos`);
    });

    console.log('\nConfiguración de gradiente:', this.gradientConfig);

    console.groupEnd();
  }
}

// ============================================================================
// REGLAS PREDEFINIDAS (EJEMPLOS)
// ============================================================================

/**
 * Crea reglas de ejemplo comunes
 */
export function createCommonRules(): TrailColorRule[] {
  return [
    // Emergency rule (highest priority)
    {
      id: 'emergency-override',
      name: 'Emergency - Total Override',
      priority: 1000,
      applicationType: 'entire-trail',
      enabled: true,
      description: 'In an emergency, the entire trail turns red',
      condition: (point) => {
        return point.metadata?.emergency === true;
      },
      getColor: () => '#ef4444' // Red
    },

    // Critical alert rule
    {
      id: 'critical-alert',
      name: 'Critical Alert',
      priority: 500,
      applicationType: 'entire-trail',
      enabled: true,
      description: 'In a critical alert, the entire trail turns orange',
      condition: (point) => {
        return point.metadata?.alertLevel === 'critical';
      },
      getColor: () => '#f59e0b' // Orange
    },

    // High-speed rule (only current segment)
    {
      id: 'high-speed',
      name: 'High Speed',
      priority: 100,
      applicationType: 'current-segment',
      enabled: true,
      description: 'Speed > 80 km/h → green segment',
      condition: (point) => {
        const speed = point.metadata?.speed;
        return typeof speed === 'number' && speed > 80;
      },
      getColor: () => '#10b981' // Green
    },

    // Medium-speed rule
    {
      id: 'medium-speed',
      name: 'Medium Speed',
      priority: 90,
      applicationType: 'current-segment',
      enabled: true,
      description: 'Speed 40-80 km/h → yellow segment',
      condition: (point) => {
        const speed = point.metadata?.speed;
        return typeof speed === 'number' && speed >= 40 && speed <= 80;
      },
      getColor: () => '#eab308' // Yellow
    },

    // Low-speed rule
    {
      id: 'low-speed',
      name: 'Low Speed',
      priority: 80,
      applicationType: 'current-segment',
      enabled: true,
      description: 'Speed < 40 km/h → red segment',
      condition: (point) => {
        const speed = point.metadata?.speed;
        return typeof speed === 'number' && speed < 40;
      },
      getColor: () => '#ef4444' // Red
    },

    // Company rule
    {
      id: 'company-acme',
      name: 'Company ACME',
      priority: 50,
      applicationType: 'entire-trail',
      enabled: true,
      description: 'ACME assets → blue',
      condition: (point) => {
        return point.metadata?.company === 'ACME';
      },
      getColor: () => '#3b82f6' // Blue
    },

    {
      id: 'company-techco',
      name: 'Company TechCo',
      priority: 50,
      applicationType: 'entire-trail',
      enabled: true,
      description: 'TechCo assets → green',
      condition: (point) => {
        return point.metadata?.company === 'TechCo';
      },
      getColor: () => '#10b981' // Green
    },

    // Low battery rule
    {
      id: 'low-battery',
      name: 'Low Battery',
      priority: 200,
      applicationType: 'current-segment',
      enabled: true,
      description: 'Battery < 20% → orange',
      condition: (point) => {
        const battery = point.metadata?.battery;
        return typeof battery === 'number' && battery < 20;
      },
      getColor: () => '#f59e0b' // Orange
    },

    // Restricted zone rule
    {
      id: 'restricted-zone',
      name: 'Restricted Zone',
      priority: 300,
      applicationType: 'current-segment',
      enabled: true,
      description: 'In a restricted zone → purple',
      condition: (point) => {
        return point.metadata?.inRestrictedZone === true;
      },
      getColor: () => '#a855f7' // Purple
    }
  ];
}
