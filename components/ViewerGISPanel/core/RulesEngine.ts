import type { DataPoint } from './types';
import type { VisualizationLayer } from '@/hooks/useVisualizationLayers';

/**
 * Motor de evaluación de reglas dinámicas y filtros
 * Maneja:
 * - Filtrado de datos (filterQuery)
 * - Reglas de visibilidad (visibilityRules)
 * - Reglas de color (colorRules)
 * - Reglas de escala (scaleRules)
 */
export class RulesEngine {
  /**
   * Filtra puntos de datos según el filterQuery de la layer
   */
  filterPointsForLayer(
    dataPoints: DataPoint[],
    layer: VisualizationLayer
  ): DataPoint[] {
    if (!layer.filterQuery) {
      return dataPoints;
    }

    try {
      // Soportar formato simple (key=value) o compuesto con AND
      const filters = layer.filterQuery.includes(' AND ')
        ? layer.filterQuery.split(' AND ').map(f => f.trim())
        : [layer.filterQuery.trim()];
      
      console.log('🔎 Aplicando filtros:', filters);

      return dataPoints.filter(point => {
        const matches = filters.every(filter => {
          // Operadores: =, !=, >, <, >=, <=
          const operatorMatch = filter.match(/(.+?)\s*(>=|<=|!=|>|<|=)\s*(.+)/);
          
          if (!operatorMatch) {
            console.warn(`⚠️ Formato inválido: ${filter}`);
            return false;
          }
          
          const [, key, operator, rawValue] = operatorMatch;
          const value = rawValue.replace(/^['"]|['"]$/g, '');
          const pointValue = this.getNestedValue(point, key.trim());
          
          if (pointValue === undefined) return false;
          
          return this.evaluateComparison(pointValue, operator, value);
        });

        return matches;
      });
    } catch (error) {
      console.error('❌ Error parsing filter:', layer.filterQuery, error);
      return dataPoints;
    }
  }

  /**
   * Evalúa reglas dinámicas (visibilidad, color, escala)
   */
  evaluateDynamicRules(
    layer: VisualizationLayer,
    point: DataPoint,
    valueRange: { min: number; max: number }
  ): { colorScheme: any; scale: number; visible: boolean } {
    let colorScheme = layer.colorScheme;
    let scale = layer.pointSize;
    let visible = true;

    // 1. Evaluar reglas de visibilidad (prioridad más alta)
    if (layer.visibilityRules && layer.visibilityRules.length > 0) {
      const visibilityResult = this.evaluateVisibilityRules(
        layer.visibilityRules,
        point
      );
      if (visibilityResult !== null) {
        visible = visibilityResult;
      }
    }

    // Si no es visible, retornar inmediatamente
    if (!visible) {
      return { colorScheme, scale, visible };
    }

    // 2. Evaluar reglas de color
    if (layer.colorRules && layer.colorRules.length > 0) {
      const colorResult = this.evaluateColorRules(layer.colorRules, point);
      if (colorResult !== null) {
        colorScheme = colorResult;
      }
    }

    // 3. Evaluar reglas de escala
    if (layer.scaleRules && layer.scaleRules.length > 0) {
      const scaleResult = this.evaluateScaleRules(layer.scaleRules, point);
      if (scaleResult !== null) {
        scale = scaleResult;
      }
    }

    return { colorScheme, scale, visible };
  }

  // ============================================================================
  // EVALUACIÓN DE REGLAS ESPECÍFICAS
  // ============================================================================

  /**
   * Evalúa reglas de visibilidad
   */
  private evaluateVisibilityRules(
    rules: Array<{ condition: string; visible: boolean; priority?: number }>,
    point: DataPoint
  ): boolean | null {
    const sortedRules = [...rules].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );
    
    for (const rule of sortedRules) {
      if (this.evaluateCondition(rule.condition, point)) {
        return rule.visible;
      }
    }
    
    return null; // No se aplicó ninguna regla
  }

  /**
   * Evalúa reglas de color
   */
  private evaluateColorRules(
    rules: Array<{ condition: string; colorScheme: any; priority?: number }>,
    point: DataPoint
  ): any | null {
    const sortedRules = [...rules].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );
    
    for (const rule of sortedRules) {
      if (this.evaluateCondition(rule.condition, point)) {
        return rule.colorScheme;
      }
    }
    
    return null;
  }

  /**
   * Evalúa reglas de escala
   */
  private evaluateScaleRules(
    rules: Array<{ condition: string; scale: number; priority?: number }>,
    point: DataPoint
  ): number | null {
    const sortedRules = [...rules].sort(
      (a, b) => (b.priority || 0) - (a.priority || 0)
    );
    
    for (const rule of sortedRules) {
      if (this.evaluateCondition(rule.condition, point)) {
        return rule.scale;
      }
    }
    
    return null;
  }

  // ============================================================================
  // EVALUACIÓN DE CONDICIONES
  // ============================================================================

  /**
   * Evalúa una condición individual (ej: "metadata.status = 'active'")
   */
  private evaluateCondition(condition: string, point: DataPoint): boolean {
    try {
      // Patrón: campo operador valor
      // Soporta: field = 'value', field > 10, metadata.x >= 5.5
      const match = condition.match(
        /([a-zA-Z0-9_.]+)\s*(=|>|<|>=|<=|!=)\s*('([^']*)'|"([^"]*)"|(\d+\.?\d*))/
      );
      
      if (!match) {
        console.warn(`⚠️ Condición no válida: ${condition}`);
        return false;
      }
      
      const [, field, operator, , strValue1, strValue2, numValue] = match;
      const value = strValue1 || strValue2 || parseFloat(numValue);
      const dataValue = this.getNestedValue(point, field);
      
      if (dataValue === undefined) {
        return false;
      }
      
      return this.evaluateComparison(dataValue, operator, String(value));
    } catch (err) {
      console.warn('❌ Error evaluando condición:', condition, err);
      return false;
    }
  }

  /**
   * Evalúa una comparación entre dos valores
   */
  private evaluateComparison(
    pointValue: any,
    operator: string,
    filterValue: string
  ): boolean {
    const numericPointValue = Number(pointValue);
    const numericFilterValue = Number(filterValue);
    
    // Determinar si es comparación numérica
    const isNumericComparison = 
      !isNaN(numericPointValue) && 
      !isNaN(numericFilterValue) &&
      (operator === '>' || operator === '<' || operator === '>=' || operator === '<=');
    
    if (isNumericComparison) {
      switch (operator) {
        case '>': 
          return numericPointValue > numericFilterValue;
        case '<': 
          return numericPointValue < numericFilterValue;
        case '>=': 
          return numericPointValue >= numericFilterValue;
        case '<=': 
          return numericPointValue <= numericFilterValue;
        default: 
          return false;
      }
    } else {
      // Comparación de strings (case-insensitive)
      const pointValueStr = String(pointValue).toLowerCase();
      const filterValueStr = filterValue.toLowerCase();
      
      switch (operator) {
        case '=': 
          return pointValueStr === filterValueStr;
        case '!=': 
          return pointValueStr !== filterValueStr;
        default: 
          return false;
      }
    }
  }

  // ============================================================================
  // UTILIDADES
  // ============================================================================

  /**
   * Obtiene un valor anidado de un objeto usando dot notation
   * Ejemplo: getNestedValue(point, 'metadata.x') => point.metadata.x
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

  /**
   * Valida el formato de una condición
   */
  validateCondition(condition: string): boolean {
    const match = condition.match(
      /([a-zA-Z0-9_.]+)\s*(=|>|<|>=|<=|!=)\s*('([^']*)'|"([^"]*)"|(\d+\.?\d*))/
    );
    return match !== null;
  }

  /**
   * Valida el formato de un filterQuery
   */
  validateFilterQuery(filterQuery: string): boolean {
    if (!filterQuery) return true;
    
    const filters = filterQuery.includes(' AND ')
      ? filterQuery.split(' AND ').map(f => f.trim())
      : [filterQuery.trim()];
    
    return filters.every(filter => this.validateCondition(filter));
  }

  /**
   * Debug: Imprime el resultado de evaluación de reglas
   */
  debugRuleEvaluation(
    layer: VisualizationLayer,
    point: DataPoint,
    valueRange: { min: number; max: number }
  ): void {
    console.group(`🔍 Debug Rules - Layer: ${layer.name}`);
    console.log('DataPoint:', point);
    
    // Visibility Rules
    if (layer.visibilityRules && layer.visibilityRules.length > 0) {
      console.log('Visibility Rules:');
      layer.visibilityRules.forEach((rule, i) => {
        const matches = this.evaluateCondition(rule.condition, point);
        console.log(`  [${i}] ${rule.condition} => ${matches ? '✓' : '✗'} (visible: ${rule.visible})`);
      });
    }
    
    // Color Rules
    if (layer.colorRules && layer.colorRules.length > 0) {
      console.log('Color Rules:');
      layer.colorRules.forEach((rule, i) => {
        const matches = this.evaluateCondition(rule.condition, point);
        console.log(`  [${i}] ${rule.condition} => ${matches ? '✓' : '✗'}`);
      });
    }
    
    // Scale Rules
    if (layer.scaleRules && layer.scaleRules.length > 0) {
      console.log('Scale Rules:');
      layer.scaleRules.forEach((rule, i) => {
        const matches = this.evaluateCondition(rule.condition, point);
        console.log(`  [${i}] ${rule.condition} => ${matches ? '✓' : '✗'} (scale: ${rule.scale})`);
      });
    }
    
    const result = this.evaluateDynamicRules(layer, point, valueRange);
    console.log('Final Result:', result);
    console.groupEnd();
  }
}