import { useState, useMemo } from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

// ============================================================================
// UTILIDADES
// ============================================================================

function getValueByPath(obj: any, path: string): any {
  if (!path || typeof path !== 'string') return undefined; // Comprobación de tipo
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

// ============================================================================
// COMPONENTE: PathPreview
// ============================================================================

function PathPreview({ 
  path, 
  sampleData, 
  label 
}: { 
  path: string; 
  sampleData: any; 
  label: string;
}) {
  const value = getValueByPath(sampleData, path);
  const hasValue = value !== undefined && value !== null;
  
  return (
    <div className="flex items-center gap-2 text-xs mt-1">
      {hasValue ? (
        <>
          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
          <span className="text-gray-400">{label}:</span>
          <code className="text-green-400 truncate">
            {/* Si es objeto (como un JSON dentro del path), lo stringify, sino String(value) */}
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

interface PathSelectorProps {
  label: string;
  // CORRECCIÓN: Ahora acepta string | null
  value: string | null; 
  // CORRECCIÓN: Ahora propaga string | null
  onChange: (value: string | null) => void;
  availablePaths: string[];
  sampleData: any;
  required?: boolean;
  placeholder?: string;
}

export default function PathSelector({
  label,
  value,
  onChange,
  availablePaths,
  sampleData,
  required = false,
  placeholder = "Selecciona o escribe un path..."
}: PathSelectorProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const filteredPaths = useMemo(() => {
    // Si value es null, se muestran todos los paths.
    if (!value) return availablePaths;
    return availablePaths.filter(p => 
      p.toLowerCase().includes(value.toLowerCase())
    );
  }, [value, availablePaths]);

  return (
    <div className="relative">
      <label className="block text-xs font-medium mb-1 text-gray-300">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      
      <input
        type="text"
        // CORRECCIÓN: Si 'value' es null, se usa '' para el input HTML
        value={value ?? ''}
        // CORRECCIÓN: Si el valor es '', propagamos 'null' al padre
        onChange={(e) => onChange(e.target.value || null)}
        onFocus={() => setShowSuggestions(true)}
        // Pequeño delay para que el click en sugerencia funcione antes de ocultar
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
              onClick={() => {
                onChange(path);
                setShowSuggestions(false);
              }}
              className="w-full px-3 py-2 text-left text-xs hover:bg-[#27272a] text-gray-300 
                          flex items-center justify-between"
            >
              <span className="font-mono">{path}</span>
              <code className="text-gray-500 text-xs truncate ml-2">
                {/* Aseguramos que path sea string para getValueByPath */}
                {String(getValueByPath(sampleData, path))}
              </code>
            </button>
          ))}
        </div>
      )}
      
      {/* Solo mostramos PathPreview si 'value' es una cadena (no null) */}
      {value && <PathPreview path={value} sampleData={sampleData} label="Valor" />}
    </div>
  );
}