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

// ============================================================================
// TIPOS
// ============================================================================

interface MappingConfig {
  valuePath: string;
  xPath?: string;
  yPath?: string;
  zPath?: string;
  sensorIdPath?: string;
  sensorTypePath?: string;
  timestampPath: string;
  unitPath?: string;
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
    const value = getValueByPath(message, config.valuePath);
    const timestamp = getValueByPath(message, config.timestampPath);
    
    if (value === undefined || timestamp === undefined) return null;
    
    return {
      value: Number(value),
      x: config.xPath ? Number(getValueByPath(message, config.xPath)) : null,
      y: config.yPath ? Number(getValueByPath(message, config.yPath)) : null,
      z: config.zPath ? Number(getValueByPath(message, config.zPath)) : null,
      sensorId: config.sensorIdPath ? String(getValueByPath(message, config.sensorIdPath)) : null,
      sensorType: config.sensorTypePath ? String(getValueByPath(message, config.sensorTypePath)) : null,
      timestamp,
      unit: config.unitPath ? String(getValueByPath(message, config.unitPath)) : null,
    };
  } catch (error) {
    return null;
  }
}

// ============================================================================
// COMPONENTE: Mini Canvas 3D Preview
// ============================================================================

function LivePreviewCanvas({ 
  normalizedPoints 
}: { 
  normalizedPoints: NormalizedPoint[] 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const animationRef = useRef<number | null>(null);

  // Calcular rangos para normalización
  const ranges = useMemo(() => {
    if (normalizedPoints.length === 0) return null;
    
    const values = normalizedPoints.map(p => p.value).filter(v => !isNaN(v));
    const xCoords = normalizedPoints.map(p => p.x).filter((v): v is number => v !== null && !isNaN(v));
    const yCoords = normalizedPoints.map(p => p.y).filter((v): v is number => v !== null && !isNaN(v));
    
    return {
      value: { 
        min: Math.min(...values), 
        max: Math.max(...values) 
      },
      x: xCoords.length > 0 ? {
        min: Math.min(...xCoords),
        max: Math.max(...xCoords)
      } : null,
      y: yCoords.length > 0 ? {
        min: Math.min(...yCoords),
        max: Math.max(...yCoords)
      } : null,
    };
  }, [normalizedPoints]);

  // Renderizar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ranges) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const w = canvas.width;
      const h = canvas.height;
      const centerX = w / 2;
      const centerY = h / 2;

      // Limpiar
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, w, h);

      // Grid
      ctx.strokeStyle = '#27272a';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const x = (w / 10) * i;
        const y = (h / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Ejes
      ctx.strokeStyle = '#3f3f46';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, h);
      ctx.moveTo(0, centerY);
      ctx.lineTo(w, centerY);
      ctx.stroke();

      // Puntos
      normalizedPoints.forEach(point => {
        let x = centerX;
        let y = centerY;

        // Usar coordenadas si existen, sino posicionar aleatoriamente
        if (point.x !== null && ranges.x) {
          const normalizedX = (point.x - ranges.x.min) / (ranges.x.max - ranges.x.min);
          x = 50 + normalizedX * (w - 100);
        } else {
          x = centerX + (Math.random() - 0.5) * (w * 0.6);
        }

        if (point.y !== null && ranges.y) {
          const normalizedY = (point.y - ranges.y.min) / (ranges.y.max - ranges.y.min);
          y = 50 + normalizedY * (h - 100);
        } else {
          y = centerY + (Math.random() - 0.5) * (h * 0.6);
        }

        // Aplicar rotación 3D simulada
        const rotatedX = x * Math.cos(rotation.y) - (point.z || 0) * 0.5 * Math.sin(rotation.y);
        const rotatedY = y + (point.z || 0) * 0.3 * Math.sin(rotation.x);

        // Color basado en valor
        const valueNormalized = (point.value - ranges.value.min) / (ranges.value.max - ranges.value.min);
        const hue = 240 - valueNormalized * 120; // Azul a rojo
        
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(rotatedX, rotatedY, 4, 0, Math.PI * 2);
        ctx.fill();

        // Borde
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Info overlay
      ctx.fillStyle = '#18181b';
      ctx.fillRect(10, 10, 150, 60);
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText(`Points: ${normalizedPoints.length}`, 15, 25);
      ctx.fillText(`Value: ${ranges.value.min.toFixed(1)} - ${ranges.value.max.toFixed(1)}`, 15, 40);
      if (ranges.x && ranges.y) {
        ctx.fillText(`X: ${ranges.x.min.toFixed(1)} - ${ranges.x.max.toFixed(1)}`, 15, 55);
      } else {
        ctx.fillText(`No coordinates`, 15, 55);
      }
    };

    render();
  }, [normalizedPoints, rotation, ranges]);

  // Auto-rotación
  useEffect(() => {
    if (!isAutoRotating) return;

    const animate = () => {
      setRotation(prev => ({
        x: prev.x + 0.005,
        y: prev.y + 0.01,
      }));
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAutoRotating]);

  if (normalizedPoints.length === 0) {
    return (
      <div className="w-full h-[300px] bg-[#0a0a0a] rounded flex items-center justify-center text-gray-500 text-sm">
        Configura los campos para ver el preview
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas 
        ref={canvasRef}
        width={500}
        height={300}
        className="w-full h-[300px] bg-[#0a0a0a] rounded"
      />
      
      {/* Controles */}
      <div className="absolute bottom-2 right-2 flex gap-2">
        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className="p-2 bg-[#18181b]/90 backdrop-blur rounded hover:bg-[#27272a] transition-colors"
          title={isAutoRotating ? "Pausar rotación" : "Reanudar rotación"}
        >
          {isAutoRotating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setRotation({ x: 0, y: 0 })}
          className="p-2 bg-[#18181b]/90 backdrop-blur rounded hover:bg-[#27272a] transition-colors"
          title="Reset vista"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE: PathPreview
// ============================================================================

function PathPreview({ path, sampleData, label }: { path: string; sampleData: any; label: string }) {
  const value = getValueByPath(sampleData, path);
  const hasValue = value !== undefined && value !== null;
  
  return (
    <div className="flex items-center gap-2 text-xs mt-1">
      {hasValue ? (
        <>
          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
          <span className="text-gray-400">{label}:</span>
          <code className="text-green-400 truncate">
            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </code>
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0" />
          <span className="text-red-400">No encontrado</span>
        </>
      )}
    </div>
  );
}

// ============================================================================
// COMPONENTE: PathSelector
// ============================================================================

function PathSelector({
  label, value, onChange, availablePaths, sampleData, required = false, placeholder = "Selecciona o escribe un path..."
}: {
  label: string; value: string; onChange: (value: string) => void; availablePaths: string[];
  sampleData: any; required?: boolean; placeholder?: string;
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const filteredPaths = useMemo(() => {
    if (!value) return availablePaths;
    return availablePaths.filter(p => p.toLowerCase().includes(value.toLowerCase()));
  }, [value, availablePaths]);

  return (
    <div className="relative">
      <label className="block text-xs font-medium mb-1 text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-[#27272a] border border-[#3f3f46] rounded text-sm 
                   focus:border-blue-500 outline-none text-gray-100"
      />
      
      {showSuggestions && filteredPaths.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#18181b] border border-[#3f3f46] 
                        rounded shadow-lg max-h-48 overflow-y-auto">
          {filteredPaths.slice(0, 10).map(path => (
            <button
              key={path}
              onClick={() => { onChange(path); setShowSuggestions(false); }}
              className="w-full px-3 py-2 text-left text-xs hover:bg-[#27272a] text-gray-300 
                         flex items-center justify-between"
            >
              <span className="font-mono">{path}</span>
              <code className="text-gray-500 text-xs truncate ml-2">
                {String(getValueByPath(sampleData, path))}
              </code>
            </button>
          ))}
        </div>
      )}
      
      {value && <PathPreview path={value} sampleData={sampleData} label="Valor" />}
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function MappingConfigurator({
  rawMessages = [], onSave, onClose, datasetId
}: {
  rawMessages: RawMessage[]; onSave: (config: MappingConfig) => Promise<boolean>;
  onClose: () => void; datasetId: string;
}) {
  const [config, setConfig] = useState<MappingConfig>({
    valuePath: '', xPath: '', yPath: '', zPath: '', sensorIdPath: '',
    sensorTypePath: '', timestampPath: '', unitPath: '',
  });
  
  const [showRawPreview, setShowRawPreview] = useState(true);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleMessage = rawMessages[selectedMessageIndex];
  
  const availablePaths = useMemo(() => {
    if (!sampleMessage) return [];
    return extractPaths(sampleMessage);
  }, [sampleMessage]);

  // ✅ NUEVO: Normalizar TODOS los mensajes para el preview 3D
  const normalizedPoints = useMemo(() => {
    if (!config.valuePath || !config.timestampPath) return [];
    
    return rawMessages
      .slice(0, 50) // Limitar a 50 puntos para performance
      .map(msg => normalizeMessage(msg, config))
      .filter((p): p is NormalizedPoint => p !== null);
  }, [rawMessages, config]);

  useEffect(() => {
    if (sampleMessage && config.valuePath === '') {
      const detected = autoDetectFields(sampleMessage);
      setConfig(prev => ({ ...prev, ...detected }));
    }
  }, [sampleMessage, config.valuePath]);

  const validation = useMemo(() => {
    const errors: string[] = [];
    
    if (!config.valuePath) errors.push('El campo "value" es obligatorio');
    if (!config.timestampPath) errors.push('El campo "timestamp" es obligatorio');
    
    if (sampleMessage) {
      if (config.valuePath && getValueByPath(sampleMessage, config.valuePath) === undefined) {
        errors.push(`Path "${config.valuePath}" no encontrado`);
      }
      if (config.timestampPath && getValueByPath(sampleMessage, config.timestampPath) === undefined) {
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
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

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
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
        <div className="bg-[#18181b] rounded-lg shadow-xl max-w-md w-full p-6 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 text-gray-100">Esperando datos MQTT</h2>
          <p className="text-gray-400 text-sm mb-4">
            Conectado al broker, pero no se han recibido mensajes aún.
          </p>
          <button onClick={onClose} className="px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded text-sm">
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-[#18181b] rounded-lg shadow-xl max-w-7xl w-full my-8">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex justify-between items-center sticky top-0 bg-[#18181b] z-10">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-500" />
            <div>
              <h2 className="text-xl font-bold text-gray-100">Configurar Visualización</h2>
              <p className="text-xs text-gray-400">Mapea los campos y ve el preview en tiempo real</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleAutoDetect}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
            >
              <Zap className="w-4 h-4" />
              Auto-detectar
            </button>
            <button onClick={onClose} className="p-2 hover:bg-[#27272a] rounded">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* LEFT: Formulario */}
            <div className="space-y-4">
              <div className="bg-[#27272a] rounded-lg p-4">
                <h3 className="text-sm font-bold mb-4 text-gray-100">Campos Obligatorios</h3>
                <div className="space-y-4">
                  <PathSelector label="Valor (value)" value={config.valuePath} 
                    onChange={(v) => setConfig({...config, valuePath: v})}
                    availablePaths={availablePaths} sampleData={sampleMessage} required
                    placeholder="temperatura, value, sensor.reading..." />
                  <PathSelector label="Timestamp" value={config.timestampPath}
                    onChange={(v) => setConfig({...config, timestampPath: v})}
                    availablePaths={availablePaths} sampleData={sampleMessage} required
                    placeholder="timestamp, time, fecha..." />
                </div>
              </div>

              <div className="bg-[#27272a] rounded-lg p-4">
                <h3 className="text-sm font-bold mb-4 text-gray-100">Coordenadas (Opcional)</h3>
                <div className="space-y-4">
                  <PathSelector label="X (latitud)" value={config.xPath || ''}
                    onChange={(v) => setConfig({...config, xPath: v})}
                    availablePaths={availablePaths} sampleData={sampleMessage}
                    placeholder="x, lat, latitude..." />
                  <PathSelector label="Y (longitud)" value={config.yPath || ''}
                    onChange={(v) => setConfig({...config, yPath: v})}
                    availablePaths={availablePaths} sampleData={sampleMessage}
                    placeholder="y, lng, longitude..." />
                  <PathSelector label="Z (altitud)" value={config.zPath || ''}
                    onChange={(v) => setConfig({...config, zPath: v})}
                    availablePaths={availablePaths} sampleData={sampleMessage}
                    placeholder="z, alt, elevation..." />
                </div>
              </div>

              <div className="bg-[#27272a] rounded-lg p-4">
                <h3 className="text-sm font-bold mb-4 text-gray-100">Sensor (Opcional)</h3>
                <div className="space-y-4">
                  <PathSelector label="ID del Sensor" value={config.sensorIdPath || ''}
                    onChange={(v) => setConfig({...config, sensorIdPath: v})}
                    availablePaths={availablePaths} sampleData={sampleMessage}
                    placeholder="sensorId, deviceId..." />
                  <PathSelector label="Tipo de Sensor" value={config.sensorTypePath || ''}
                    onChange={(v) => setConfig({...config, sensorTypePath: v})}
                    availablePaths={availablePaths} sampleData={sampleMessage}
                    placeholder="sensorType, type..." />
                  <PathSelector label="Unidad" value={config.unitPath || ''}
                    onChange={(v) => setConfig({...config, unitPath: v})}
                    availablePaths={availablePaths} sampleData={sampleMessage}
                    placeholder="unit, unidad..." />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              )}

              {!validation.isValid && (
                <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-bold text-yellow-400">Configuración incompleta</span>
                  </div>
                  <ul className="text-xs text-yellow-300 space-y-1 ml-6 list-disc">
                    {validation.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                </div>
              )}

              <button onClick={handleSave} disabled={!validation.isValid || isSaving}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 
                           hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed 
                           rounded text-sm font-bold">
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Guardar Configuración
                  </>
                )}
              </button>
            </div>

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
              <div className="bg-[#27272a] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-100">Mensaje de ejemplo</h3>
                  <div className="flex items-center gap-2">
                    <select value={selectedMessageIndex}
                      onChange={(e) => setSelectedMessageIndex(Number(e.target.value))}
                      className="bg-[#18181b] text-xs px-2 py-1 rounded border border-[#3f3f46]">
                      {rawMessages.slice(0, 10).map((_, i) => (
                        <option key={i} value={i}>Mensaje #{i + 1}</option>
                      ))}
                    </select>
                    <button onClick={() => setShowRawPreview(!showRawPreview)}
                      className="p-1 hover:bg-[#3f3f46] rounded">
                      {showRawPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                
                {showRawPreview && (
                  <div className="bg-[#0a0a0a] rounded p-3 max-h-[300px] overflow-auto">
                    <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                      {JSON.stringify(sampleMessage, null, 2)}
                    </pre>
                  </div>
                )}
              </div>

              {/* Preview normalizado */}
              {validation.isValid && (
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
