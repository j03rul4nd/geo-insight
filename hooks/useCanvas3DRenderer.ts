import { useRef, useState, useEffect } from 'react';
import { getHeatmapColor } from '@/utils/getHeatmapColor'; // Ajusta el import si usas color utility

interface Layer {
  id: string;
  datasetId: string;
  name: string;
  enabled: boolean;
  order: number;
  colorScheme: {
    type: 'solid' | 'gradient' | 'heatmap';
    color?: string;
    low?: string;
    high?: string;
  };
  opacity: number;
  pointSize: number;
  filterQuery?: string;
}

interface DataPoint {
  id: string;
  x: number;
  y: number;
  z: number | null;
  value: number;
  sensorId: string | null;
  sensorType: string | null;
  unit: string | null;
  timestamp: Date | string;
  metadata?: Record<string, any>;
}


interface UseCanvas3DRendererParams {
  dataPoints: DataPoint[] | null;
  layers: Layer[] | null;
  selectedPoint: DataPoint | null;
  colorMode: 'heatmap' | 'sensor-type';
  valueRange: { min: number; max: number };
  isLive: boolean;
}

export function useCanvas3DRenderer({
  dataPoints,
  layers,
  selectedPoint,
  colorMode,
  valueRange,
  isLive,
}: UseCanvas3DRendererParams) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dataPoints) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.offsetWidth * window.devicePixelRatio);
    const height = (canvas.height = canvas.offsetHeight * window.devicePixelRatio);
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = width / (2 * window.devicePixelRatio);
    const centerY = height / (2 * window.devicePixelRatio);

    const draw = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 0.5;
      const gridSize = 20;
      for (let i = -5; i <= 5; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX + i * gridSize - 100, centerY - 80);
        ctx.lineTo(centerX + i * gridSize - 100, centerY + 80);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(centerX - 100, centerY + i * gridSize);
        ctx.lineTo(centerX + 100, centerY + i * gridSize);
        ctx.stroke();
      }

      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX - 120, centerY);
      ctx.lineTo(centerX + 120, centerY);
      ctx.stroke();

      ctx.strokeStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY - 100);
      ctx.lineTo(centerX, centerY + 100);
      ctx.stroke();

      dataPoints.forEach((point) => {
        const activeLayer =
          layers?.find((l) => l.enabled && l.name === 'All Sensors') ||
          layers?.find((l) => l.enabled);
        if (!activeLayer) return;

        const scale = 1 + Math.sin(rotation.y * 0.01) * 0.2;
        const projX =
          centerX + point.x * scale * Math.cos(rotation.y * 0.01) + rotation.x * 0.3;
        const projY =
          centerY + point.y * scale + (point.z ?? 0) * 0.5 * Math.sin(rotation.y * 0.01);

        let color: string;
        if (colorMode === 'heatmap' && activeLayer.colorScheme.type === 'heatmap') {
          color = getHeatmapColor(point.value, valueRange.min, valueRange.max);
        } else {
          color = activeLayer.colorScheme.color || '#3b82f6';
        }

        const size = 6 * activeLayer.pointSize;
        const alpha = Math.floor(activeLayer.opacity * 255)
          .toString(16)
          .padStart(2, '0');

        ctx.fillStyle = color + alpha;
        ctx.beginPath();
        ctx.arc(projX, projY, size, 0, Math.PI * 2);
        ctx.fill();

        if (hoveredPoint?.id === point.id || selectedPoint?.id === point.id) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(projX, projY, size + 4, 0, Math.PI * 2);
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(point.sensorId || point.id, projX, projY - size - 8);
        }
      });
    };

    draw();
  }, [dataPoints, layers, rotation, hoveredPoint, selectedPoint, colorMode, valueRange]);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setRotation((prev) => ({ ...prev, y: prev.y + 0.3 }));
    }, 50);
    return () => clearInterval(interval);
  }, [isLive]);

  return {
    canvasRef,
    rotation,
    setRotation,
    hoveredPoint,
    setHoveredPoint,
  };
}
