import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// --- CONFIGURACIÓN Y TIPOS ---
interface MetricThreshold {
  value: number;
  color: string;
  label?: string;
}

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  units?: string;
  thresholds?: MetricThreshold[];
  width?: number;
  height?: number;
  showThresholds?: boolean;
}

// Un hook simple para animar el valor al montar el componente (efecto de conteo)
const useAnimatedValue = (targetValue: number, duration: number = 1000) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Easing function (easeOutQuart) para que termine suave
      const easeProgress = 1 - Math.pow(1 - progress, 4); 
      
      setDisplayValue(targetValue * easeProgress);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [targetValue, duration]);

  return displayValue;
};

// Función para determinar el color según thresholds o fallback al sistema de colores por defecto
const getColorForValue = (value: number, min: number, max: number, thresholds?: MetricThreshold[]) => {
  // Si hay thresholds, usar esos
  if (thresholds && thresholds.length > 0) {
    // Ordenar thresholds de mayor a menor
    const sortedThresholds = [...thresholds].sort((a, b) => b.value - a.value);
    
    // Encontrar el primer threshold que sea menor o igual al valor actual
    for (const threshold of sortedThresholds) {
      if (value >= threshold.value) {
        return threshold.color;
      }
    }
    
    // Si no se encuentra ninguno, usar el último (el más bajo)
    return sortedThresholds[sortedThresholds.length - 1].color;
  }
  
  // Fallback al sistema de colores por porcentaje
  const percent = ((value - min) / (max - min)) * 100;
  if (percent < 30) return "#10b981"; // Emerald-500
  if (percent < 70) return "#f59e0b"; // Amber-500
  return "#ef4444"; // Red-500
};

export const Gauge = ({ 
  value, 
  min = 0, 
  max = 100, 
  label, 
  units = "%",
  thresholds = [],
  width = 400,
  height = 100,
  showThresholds = false
}: GaugeProps) => {
  const animatedValue = useAnimatedValue(value);
  const percent = ((animatedValue - min) / (max - min)) * 100;
  
  // Datos para el gráfico: [Valor Actual, Restante]
  const data = [
    { name: 'value', value: percent },
    { name: 'empty', value: 100 - percent },
  ];

  // Configuración de ángulos para un semicírculo perfecto
  const startAngle = 180;
  const endAngle = 0;
  
  // El color principal actual basado en thresholds o fallback
  const currentColor = getColorForValue(animatedValue, min, max, thresholds);

  // Calcular tamaños de fuente responsive basados en las dimensiones
  const fontSize = Math.max(Math.min(height * 0.45, 48), 20);
  const unitFontSize = Math.max(Math.min(height * 0.18, 20), 10);
  const paddingBottom = height * 0.15;

  return (
    <div 
      className="gauge-container"
      style={{
        '--gauge-width': `${width}px`,
        '--gauge-height': `${height}px`,
        '--font-size': `${fontSize}px`,
        '--unit-font-size': `${unitFontSize}px`,
        '--padding-bottom': `${paddingBottom}px`
      } as React.CSSProperties}
    >
      {/* Contenedor del Gráfico */}
      <div className="gauge-chart-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {/* Definimos un gradiente para darle un toque "premium" */}
              <linearGradient id={`gaugeGradient-${label || 'gauge'}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={currentColor} stopOpacity={0.8} />
                <stop offset="100%" stopColor={currentColor} stopOpacity={1} />
              </linearGradient>
            </defs>

            {/* CAPA 1: El carril de fondo (Gris oscuro para fondo transparente) */}
            <Pie
              data={[{ value: 100 }]}
              cx="50%"
              cy="75%"
              innerRadius="70%"
              outerRadius="90%"
              startAngle={startAngle}
              endAngle={endAngle}
              fill="#374151"
              stroke="none"
              isAnimationActive={false}
            />

            {/* CAPA 2: La barra de progreso */}
            <Pie
              data={data}
              cx="50%"
              cy="75%"
              innerRadius="70%"
              outerRadius="90%"
              startAngle={startAngle}
              endAngle={endAngle}
              paddingAngle={0}
              stroke="none"
              cornerRadius={10}
            >
              <Cell key="progress" fill={`url(#gaugeGradient-${label || 'gauge'})`} /> 
              <Cell key="empty" fill="transparent" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* TEXTO CENTRAL */}
        <div className="gauge-value-display">
          <div className="gauge-value-wrapper">
            <span 
              className="gauge-value" 
              style={{ color: currentColor }}
            >
              {Math.round(animatedValue)}
            </span>
            <span className="gauge-units">{units}</span>
          </div>
        </div>
      </div>

      {/* Indicadores de Thresholds (si existen) */}
      {showThresholds && thresholds && thresholds.length > 0 && (
        <div className="gauge-thresholds">
          {thresholds.map((threshold, idx) => (
            <div key={idx} className="gauge-threshold-item">
              <div 
                className="gauge-threshold-dot" 
                style={{ backgroundColor: threshold.color }}
              />
              <span className="gauge-threshold-label">
                {threshold.label || `≥${threshold.value}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .gauge-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: var(--gauge-width);
          margin: 0 auto;
          container-type: inline-size;
        }

        .gauge-chart-wrapper {
          width: 100%;
          height: var(--gauge-height);
          position: relative;
          min-height: 80px;
        }

        .gauge-value-display {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          padding-bottom: var(--padding-bottom);
          pointer-events: none;
        }

        .gauge-value-wrapper {
          display: flex;
          align-items: baseline;
          gap: 0.25rem;
        }

        .gauge-value {
          font-size: var(--font-size);
          font-weight: 700;
          letter-spacing: -0.05em;
          transition: color 0.5s ease;
          line-height: 1;
        }

        .gauge-units {
          font-size: var(--unit-font-size);
          font-weight: 500;
          color: #94a3b8;
          line-height: 1;
        }

        .gauge-thresholds {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
          justify-content: center;
          padding: 0 0.5rem;
        }

        .gauge-threshold-item {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.75rem;
        }

        .gauge-threshold-dot {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 9999px;
          flex-shrink: 0;
        }

        .gauge-threshold-label {
          color: #94a3b8;
          white-space: nowrap;
        }

        /* Responsive breakpoints usando container queries */
        @container (max-width: 300px) {
          .gauge-value {
            font-size: clamp(20px, 8cqw, var(--font-size));
          }
          
          .gauge-units {
            font-size: clamp(10px, 4cqw, var(--unit-font-size));
          }

          .gauge-threshold-item {
            font-size: 0.625rem;
          }

          .gauge-threshold-dot {
            width: 0.625rem;
            height: 0.625rem;
          }
        }

        @container (max-width: 200px) {
          .gauge-value {
            font-size: clamp(16px, 10cqw, 28px);
          }
          
          .gauge-units {
            font-size: clamp(8px, 5cqw, 14px);
          }

          .gauge-thresholds {
            gap: 0.25rem;
          }

          .gauge-threshold-item {
            font-size: 0.5rem;
          }

          .gauge-threshold-dot {
            width: 0.5rem;
            height: 0.5rem;
          }
        }

        /* Media queries tradicionales como fallback */
        @media (max-width: 640px) {
          .gauge-container {
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};