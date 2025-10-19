import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Settings,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Zap,
  Save,
  X,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';


import MappingConfigForm from './components/MappingConfigForm';
import LivePreviewCanvas from './components/LivePreviewCanvas';
import WaitingForMQTT from './components/WaitingForMQTT';
import RawMessagePreview from './components/RawMessagePreview';
import NormalizedPreview from './components/NormalizedPreview';


// ============================================================================
// TIPOS
// ============================================================================

interface MappingConfig {
  valuePath: string | null;
  xPath?: string | null;
  yPath?: string | null;
  zPath?: string | null;
  sensorIdPath?: string | null;
  sensorTypePath?: string | null;
  timestampPath: string | null;
  unitPath?: string | null;
}


interface RawMessage {
  id: string;
  timestamp: Date | string;
  [key: string]: any;
}

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

// ============================================================================
// UTILIDADES
// ============================================================================

function extractPaths(obj: any, prefix = ''): string[] {
  const paths: string[] = [];
  if (!obj || typeof obj !== 'object') return paths;

  for (const key in obj) {
    const currentPath = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];

    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      paths.push(currentPath);
      paths.push(...extractPaths(value, currentPath));
    } else {
      paths.push(currentPath);
    }
  }
  return paths;
}

function getValueByPath(obj: any, path: string): any {
  if (!path) return undefined;
  // Añadir una comprobación para asegurar que 'path' no es null o undefined antes de split
  if (typeof path !== 'string') return undefined; 
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

function autoDetectFields(payload: any): Partial<MappingConfig> {
  const paths = extractPaths(payload);
  const detected: Partial<MappingConfig> = {};

  const timestampPaths = paths.filter(p => /time|date|timestamp|ts|created|fecha/i.test(p));
  if (timestampPaths.length > 0) detected.timestampPath = timestampPaths[0];

  const valuePaths = paths.filter(p => /^value$|^val$|temperatura|temperature|temp|humedad|humidity|speed|velocidad/i.test(p));
  if (valuePaths.length > 0) detected.valuePath = valuePaths[0];

  const xPaths = paths.filter(p => /^x$|latitude|lat|coordX/i.test(p));
  if (xPaths.length > 0) detected.xPath = xPaths[0];

  const yPaths = paths.filter(p => /^y$|longitude|lng|lon|coordY/i.test(p));
  if (yPaths.length > 0) detected.yPath = yPaths[0];

  const zPaths = paths.filter(p => /^z$|altitude|alt|elevation|coordZ/i.test(p));
  if (zPaths.length > 0) detected.zPath = zPaths[0];

  const sensorIdPaths = paths.filter(p => /sensor.*id|id.*sensor|deviceId/i.test(p));
  if (sensorIdPaths.length > 0) detected.sensorIdPath = sensorIdPaths[0];

  const sensorTypePaths = paths.filter(p => /sensor.*type|type.*sensor|deviceType/i.test(p));
  if (sensorTypePaths.length > 0) detected.sensorTypePath = sensorTypePaths[0];

  const unitPaths = paths.filter(p => /unit|unidad|measure/i.test(p));
  if (unitPaths.length > 0) detected.unitPath = unitPaths[0];

  return detected;
}

// ============================================================================
// NORMALIZAR MENSAJE CON CONFIG ACTUAL
// ============================================================================

function normalizeMessage(message: any, config: MappingConfig): NormalizedPoint | null {
  try {
    // Comprobación de tipo necesaria para getValueByPath
    const value = config.valuePath ? getValueByPath(message, config.valuePath) : undefined;
    const timestamp = config.timestampPath ? getValueByPath(message, config.timestampPath) : undefined;

    // Ya que valuePath y timestampPath son obligatorios según tu validación, 
    // y para asegurar que 'path' no es null en getValueByPath.
    if (!config.valuePath || !config.timestampPath) return null;
    
    if (value === undefined || timestamp === undefined) return null;

    // Las comprobaciones config.xPath, etc., ya manejan el caso string | null
    return {
      value: Number(value),
      x: config.xPath ? Number(getValueByPath(message, config.xPath as string)) : null,
      y: config.yPath ? Number(getValueByPath(message, config.yPath as string)) : null,
      z: config.zPath ? Number(getValueByPath(message, config.zPath as string)) : null,
      sensorId: config.sensorIdPath ? String(getValueByPath(message, config.sensorIdPath as string)) : null,
      sensorType: config.sensorTypePath ? String(getValueByPath(message, config.sensorTypePath as string)) : null,
      timestamp,
      unit: config.unitPath ? String(getValueByPath(message, config.unitPath as string)) : null,
    };
  } catch (error) {
    // console.error("Error al normalizar mensaje:", error);
    return null;
  }
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function MappingConfigurator({
  rawMessages = [], onSave, onClose, datasetId, initialMapping
}: {
  rawMessages: RawMessage[]; onSave: (config: MappingConfig) => Promise<boolean>;
  onClose: () => void; datasetId: string; initialMapping?: MappingConfig | null;
}) {
  const [config, setConfig] = useState<MappingConfig>(() => {
    // ✅ CORRECCIÓN: Inicializar con null para que el tipo coincida con MappingConfig
    if (initialMapping) {
      return {
        valuePath: initialMapping.valuePath || null,
        xPath: initialMapping.xPath || null,
        yPath: initialMapping.yPath || null,
        zPath: initialMapping.zPath || null,
        sensorIdPath: initialMapping.sensorIdPath || null,
        sensorTypePath: initialMapping.sensorTypePath || null,
        timestampPath: initialMapping.timestampPath || null,
        unitPath: initialMapping.unitPath || null,
      };
    }
    return {
      valuePath: null,
      xPath: null,
      yPath: null,
      zPath: null,
      sensorIdPath: null,
      sensorTypePath: null,
      timestampPath: null,
      unitPath: null,
    };
  });

  const [showRawPreview, setShowRawPreview] = useState(true);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ CORRECCIÓN: Extraer directamente el contenido de 'data' (sin el prefijo data.)
  const sampleMessage = useMemo(() => {
    const msg = rawMessages[selectedMessageIndex];
    if (!msg) return null;
    
    // Caso 1: Mensaje ya normalizado (tiene metadata.originalPayload)
    if (msg.metadata?.originalPayload) {
      return msg.metadata.originalPayload;
    }
    
    // Caso 2: Mensaje raw wrapeado (tiene metadata.originalPayload.data)
    if (msg.metadata?.originalPayload?.data) {
      return msg.metadata.originalPayload.data;
    }
    
    // Caso 3: Mensaje raw directo
    return msg;
  }, [rawMessages, selectedMessageIndex]);

  const availablePaths = useMemo(() => {
    if (!sampleMessage) return [];
    return extractPaths(sampleMessage);
  }, [sampleMessage]);

  // ✅ NUEVO: Normalizar TODOS los mensajes para el preview 3D
  const normalizedPoints = useMemo(() => {
    // Ahora comprobamos contra null
    if (!config.valuePath || !config.timestampPath) return [];

    return rawMessages
      .slice(0, 50) // Limitar a 50 puntos para performance
      .map(msg => {
        // Extraer el payload original completo (incluye 'data')
        const payload = msg.metadata?.originalPayload || msg;
        return normalizeMessage(payload, config);
      })
      .filter((p): p is NormalizedPoint => p !== null);
  }, [rawMessages, config]);

  useEffect(() => {
    // ✅ CORRECCIÓN: Comprobar contra null
    if (sampleMessage && config.valuePath === null) {
      const detected = autoDetectFields(sampleMessage);
      // autoDetectFields devuelve Partial<MappingConfig> que puede tener undefined, 
      // pero usar el spread operator es seguro aquí.
      setConfig(prev => ({ ...prev, ...detected }));
    }
  }, [sampleMessage, config.valuePath]);

  const validation = useMemo(() => {
    const errors: string[] = [];

    if (!config.valuePath) errors.push('El campo "value" es obligatorio');
    if (!config.timestampPath) errors.push('El campo "timestamp" es obligatorio');

    if (sampleMessage) {
      // Necesitamos asegurar a TypeScript que config.valuePath y config.timestampPath son strings si existen
      if (config.valuePath && getValueByPath(sampleMessage, config.valuePath as string) === undefined) {
        errors.push(`Path "${config.valuePath}" no encontrado`);
      }
      if (config.timestampPath && getValueByPath(sampleMessage, config.timestampPath as string) === undefined) {
        errors.push(`Path "${config.timestampPath}" no encontrado`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }, [config, sampleMessage]);

  const handleAutoDetect = () => {
    if (!sampleMessage) return;
    const detected = autoDetectFields(sampleMessage);
    setConfig(prev => ({ ...prev, ...detected }));
  };

  const handleSave = async () => {
    // Si config.valuePath o config.timestampPath son null, la validación falla.
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }
    
    // Si la validación pasa, TypeScript sabe que los paths obligatorios no son null.

    setIsSaving(true);
    setError(null);

    try {
      const success = await onSave(config);
      if (success) {
        onClose();
      } else {
        setError('Error al guardar la configuración');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsSaving(false);
    }
  };

  if (rawMessages.length === 0) {
    return <WaitingForMQTT onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-[#18181b] rounded-lg shadow-xl w-full max-w-[95vw] xl:max-w-7xl m-4 md:m-8 max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="p-3 md:p-4 border-b border-[#27272a] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
            <Settings className="w-5 h-5 md:w-6 md:h-6 text-blue-500 shrink-0" />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-gray-100">Configurar Visualización</h2>
              <p className="text-xs text-gray-400 hidden sm:block">Mapea los campos y ve el preview en tiempo real</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleAutoDetect}
              className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-xs md:text-sm flex-1 sm:flex-initial"
            >
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Auto-detectar</span>
              <span className="sm:hidden">Auto</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-[#27272a] rounded shrink-0">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* LEFT: Formulario */}
            <MappingConfigForm
              config={config}
              onConfigChange={setConfig}
              availablePaths={availablePaths}
              sampleData={sampleMessage}
              validation={validation}
              error={error}
              isSaving={isSaving}
              onSave={handleSave}
            />

            {/* RIGHT: Preview */}
            <div className="space-y-4">
              {/* ✅ NUEVO: Preview 3D en vivo */}
              <div className="bg-[#27272a] rounded-lg p-4">
                <h3 className="text-sm font-bold mb-3 text-gray-100 flex items-center gap-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  Preview 3D en Vivo
                  <span className="text-xs font-normal text-gray-400 ml-auto">
                    {normalizedPoints.length} puntos
                  </span>
                </h3>
                <LivePreviewCanvas normalizedPoints={normalizedPoints} />
              </div>

              {/* Mensaje raw */}
              <RawMessagePreview
                rawMessages={rawMessages}
                selectedMessageIndex={selectedMessageIndex}
                onSelectMessage={setSelectedMessageIndex}
                showRawPreview={showRawPreview}
                onTogglePreview={() => setShowRawPreview(!showRawPreview)}
              />

              {/* Preview normalizado */}
              <NormalizedPreview
                normalizedPoints={normalizedPoints}
                isValid={validation.isValid}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}