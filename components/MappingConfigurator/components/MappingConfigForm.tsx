import { AlertCircle, Save } from 'lucide-react';
import PathSelector from './PathSelector';

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

interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

interface MappingConfigFormProps {
  config: MappingConfig;
  onConfigChange: (config: MappingConfig) => void;
  availablePaths: string[];
  sampleData: any;
  validation: ValidationResult;
  error: string | null;
  isSaving: boolean;
  onSave: () => void;
}

// Función auxiliar para obtener valor en un path del objeto
function getValueAtPath(obj: any, path: string): any {
  if (!path || !obj) return undefined;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    current = current[key];
  }
  
  return current;
}

export default function MappingConfigForm({
  config,
  onConfigChange,
  availablePaths,
  sampleData,
  validation,
  error,
  isSaving,
  onSave
}: MappingConfigFormProps) {
  // ✅ El sampleData YA viene como originalPayload desde el padre
//   // No necesitamos extraer nada más
  
//   console.log('🔍 DEBUG - sampleData:', sampleData);
//   console.log('🔍 DEBUG - availablePaths:', availablePaths);
  
  // Los availablePaths ya vienen limpios del padre (sin prefijos innecesarios)
  // Simplemente los usamos tal cual
  
//   console.log('🔍 DEBUG - paths disponibles:', availablePaths);

  // Validación mejorada que verifica contra sampleData (originalPayload)
  const validateConfig = (): ValidationResult => {
    const errors: string[] = [];
    
    // Validar campos obligatorios
    if (!config.valuePath) {
      errors.push('El campo "Valor" es obligatorio');
    } else {
      // Verificar que el path existe en sampleData
      const value = getValueAtPath(sampleData, config.valuePath);
      if (value === undefined) {
        errors.push(`Path "${config.valuePath}" no encontrado en los datos`);
      }
    }
    
    if (!config.timestampPath) {
      errors.push('El campo "Timestamp" es obligatorio');
    } else {
      // Verificar que el path existe en sampleData
      const value = getValueAtPath(sampleData, config.timestampPath);
      if (value === undefined) {
        errors.push(`Path "${config.timestampPath}" no encontrado en los datos`);
      }
    }
    
    // Validar campos opcionales si están configurados
    const optionalFields = [
      { path: config.xPath, name: 'X (latitud)' },
      { path: config.yPath, name: 'Y (longitud)' },
      { path: config.zPath, name: 'Z (altitud)' },
      { path: config.sensorIdPath, name: 'ID del Sensor' },
      { path: config.sensorTypePath, name: 'Tipo de Sensor' },
      { path: config.unitPath, name: 'Unidad' }
    ];
    
    optionalFields.forEach(field => {
      if (field.path) {
        const value = getValueAtPath(sampleData, field.path);
        if (value === undefined) {
          errors.push(`Path "${field.path}" configurado en "${field.name}" no encontrado en los datos`);
        }
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Usar la validación mejorada en lugar de la proporcionada
  const localValidation = validateConfig();
  const finalValidation = localValidation.errors.length > 0 ? localValidation : validation;

  return (
    <div className="space-y-4">
      {/* Campos Obligatorios */}
      <div className="bg-[#27272a] rounded-lg p-4">
        <h3 className="text-sm font-bold mb-4 text-gray-100">Campos Obligatorios</h3>
        <div className="space-y-4">
          <PathSelector 
            label="Valor (value)" 
            value={config.valuePath} 
            onChange={(v) => onConfigChange({...config, valuePath: v})}
            availablePaths={availablePaths} 
            sampleData={sampleData} 
            required
            placeholder="data.temperature.value, data.humidity.value..." 
          />
          <PathSelector 
            label="Timestamp" 
            value={config.timestampPath}
            onChange={(v) => onConfigChange({...config, timestampPath: v})}
            availablePaths={availablePaths} 
            sampleData={sampleData} 
            required
            placeholder="data.timestamp, timestamp..." 
          />
        </div>
      </div>

      {/* Coordenadas */}
      <div className="bg-[#27272a] rounded-lg p-4">
        <h3 className="text-sm font-bold mb-4 text-gray-100">Coordenadas (Opcional)</h3>
        <div className="space-y-4">
          <PathSelector 
            label="X (latitud)" 
            value={config.xPath ?? null}
            onChange={(v) => onConfigChange({...config, xPath: v})}
            availablePaths={availablePaths} 
            sampleData={sampleData}
            placeholder="data.position.x, data.lat..." 
          />
          <PathSelector 
            label="Y (longitud)" 
            value={config.yPath ?? null}
            onChange={(v) => onConfigChange({...config, yPath: v})}
            availablePaths={availablePaths} 
            sampleData={sampleData}
            placeholder="data.position.y, data.lng..." 
          />
          <PathSelector 
            label="Z (altitud)" 
            value={config.zPath ?? null}
            onChange={(v) => onConfigChange({...config, zPath: v})}
            availablePaths={availablePaths} 
            sampleData={sampleData}
            placeholder="data.position.z, data.alt..." 
          />
        </div>
      </div>

      {/* Sensor */}
      <div className="bg-[#27272a] rounded-lg p-4">
        <h3 className="text-sm font-bold mb-4 text-gray-100">Sensor (Opcional)</h3>
        <div className="space-y-4">
          <PathSelector 
            label="ID del Sensor" 
            value={config.sensorIdPath ?? null}
            onChange={(v) => onConfigChange({...config, sensorIdPath: v})}
            availablePaths={availablePaths} 
            sampleData={sampleData}
            placeholder="data.sensorId, data.deviceId..." 
          />
          <PathSelector 
            label="Tipo de Sensor" 
            value={config.sensorTypePath ?? null}
            onChange={(v) => onConfigChange({...config, sensorTypePath: v})}
            availablePaths={availablePaths} 
            sampleData={sampleData}
            placeholder="data.sensorType, data.type..." 
          />
          <PathSelector 
            label="Unidad" 
            value={config.unitPath ?? null}
            onChange={(v) => onConfigChange({...config, unitPath: v})}
            availablePaths={availablePaths} 
            sampleData={sampleData}
            placeholder="data.temperature.unit, data.unit..." 
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Validación */}
      {!finalValidation.isValid && (
        <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-bold text-yellow-400">Configuración incompleta</span>
          </div>
          <ul className="text-xs text-yellow-300 space-y-1 ml-6 list-disc">
            {finalValidation.errors.map((err, i) => <li key={i}>{err}</li>)}
          </ul>
        </div>
      )}

      {/* Botón Guardar */}
      <button 
        onClick={onSave} 
        disabled={!finalValidation.isValid || isSaving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 
                   hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed 
                   rounded text-sm font-bold transition-colors"
      >
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
  );
}