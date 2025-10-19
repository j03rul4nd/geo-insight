import { CheckCircle } from 'lucide-react';

interface NormalizedPoint {
  value: number;
  x: number | null;
  y: number | null;
  z: number | null;
  sensorId: string | null;
  sensorType: string | null;
  timestamp: Date | string;
  unit: string | null;
}

interface NormalizedPreviewProps {
  normalizedPoints: NormalizedPoint[];
  isValid: boolean;
}

export default function NormalizedPreview({
  normalizedPoints,
  isValid
}: NormalizedPreviewProps) {
  if (!isValid) return null;

  return (
    <div className="bg-[#27272a] rounded-lg p-4">
      <h3 className="text-sm font-bold mb-3 text-gray-100 flex items-center gap-2">
        <CheckCircle className="w-4 h-4 text-green-500" />
        Muestra Normalizada
      </h3>
      {normalizedPoints[0] ? (
        <div className="bg-[#0a0a0a] rounded p-3 text-xs text-gray-300 font-mono whitespace-pre-wrap">
          {JSON.stringify(normalizedPoints[0], null, 2)}
        </div>
      ) : (
        <div className="text-xs text-gray-400">
          No se pudo normalizar el mensaje de ejemplo con la configuración actual.
        </div>
      )}
    </div>
  );
}