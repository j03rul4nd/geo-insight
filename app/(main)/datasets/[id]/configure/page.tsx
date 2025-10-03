'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle, Wifi, MapPin, Layers, Activity, AlertTriangle, Sparkles, X, Eye, EyeOff } from 'lucide-react';

interface WizardStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface DetectedField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  path: string;
  sample: any;
  count: number;
}

interface LayerConfig {
  id: string;
  name: string;
  field: string;
  color: string;
  enabled: boolean;
  type: 'heatmap' | 'scatter';
}

interface MetricConfig {
  id: string;
  name: string;
  field: string;
  type: 'avg' | 'count' | 'sum' | 'min' | 'max';
}

interface AlertConfig {
  id: string;
  field: string;
  operator: '>' | '<' | '=' | '!=';
  value: number;
  severity: 'warning' | 'critical';
  message: string;
}

const DatasetConfigWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(true);
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [schemaDetectionMode, setSchemaDetectionMode] = useState<'auto' | 'manual' | 'template'>('auto');
const [manualSchema, setManualSchema] = useState<string>('');
const [selectedTemplate, setSelectedTemplate] = useState<string>('');
const [isEditingSchema, setIsEditingSchema] = useState<boolean>(false);
const [schemaDetectionTimeout, setSchemaDetectionTimeout] = useState<number>(30); // segundos

// Plantillas predefinidas
const schemaTemplates = {
  'iot-sensors': {
    name: 'Sensores IoT (Simple)',
    structure: `{
  "device_id": "string",
  "timestamp": "number",
  "latitude": "number",
  "longitude": "number",
  "sensors": {
    "temperature": "number",
    "humidity": "number"
  }
}`
  },
  'industrial': {
    name: 'Industrial SCADA',
    structure: `{
  "metadata": {
    "station_id": "string",
    "timestamp": "number"
  },
  "location": {
    "lat": "number",
    "lon": "number",
    "altitude": "number"
  },
  "measurements": {
    "pressure": "number",
    "flow_rate": "number",
    "valve_status": "boolean"
  }
}`
  },
  'vehicle-tracking': {
    name: 'Tracking de Vehículos',
    structure: `{
  "vehicle_id": "string",
  "gps": {
    "lat": "number",
    "lng": "number",
    "speed": "number",
    "heading": "number"
  },
  "telemetry": {
    "fuel_level": "number",
    "engine_temp": "number",
    "odometer": "number"
  }
}`
  },
  'weather-stations': {
    name: 'Estaciones Meteorológicas',
    structure: `{
  "station": "string",
  "coords": {
    "latitude": "number",
    "longitude": "number"
  },
  "weather": {
    "temperature": "number",
    "pressure": "number",
    "wind_speed": "number",
    "precipitation": "number"
  }
}`
  }
};

  // Simular diferentes tipos de datasets realistas
  const [datasetType, setDatasetType] = useState<'3d' | 'gis' | 'auto'>('auto');
  const [detectedCoordinateSystem, setDetectedCoordinateSystem] = useState<'cartesian' | 'geographic' | 'mixed'>('geographic');
  
  const [detectedFields] = useState<DetectedField[]>([
    { name: 'device_id', type: 'string', path: 'device_id', sample: 'WS-BCN-0847', count: 156 },
    { name: 'latitude', type: 'number', path: 'latitude', sample: 41.3851, count: 156 },
    { name: 'longitude', type: 'number', path: 'longitude', sample: 2.1734, count: 156 },
    { name: 'altitude', type: 'number', path: 'altitude', sample: 12.0, count: 89 },
    { name: 'pressure', type: 'number', path: 'sensors.pressure', sample: 3.2, count: 156 },
    { name: 'flow_rate', type: 'number', path: 'sensors.flow_rate', sample: 45.8, count: 134 },
    { name: 'temperature', type: 'number', path: 'sensors.temperature', sample: 18.5, count: 156 },
    { name: 'chlorine', type: 'number', path: 'sensors.chlorine', sample: 0.8, count: 98 },
    { name: 'ph', type: 'number', path: 'sensors.ph', sample: 7.2, count: 102 },
    { name: 'turbidity', type: 'number', path: 'sensors.turbidity', sample: 0.5, count: 87 },
    { name: 'battery', type: 'number', path: 'battery_level', sample: 87, count: 156 },
    { name: 'timestamp', type: 'number', path: 'timestamp', sample: 1696234567, count: 156 }
  ]);

  const [positionMapping, setPositionMapping] = useState({
    lat: 'latitude',
    lon: 'longitude',
    alt: 'altitude',
    identifier: 'device_id',
    mode: 'geographic' as 'geographic' | 'cartesian'
  });

  const [layers, setLayers] = useState<LayerConfig[]>([
    { id: '1', name: 'Presión de Red', field: 'sensors.pressure', color: '#3b82f6', enabled: true, type: 'heatmap' },
    { id: '2', name: 'Caudal', field: 'sensors.flow_rate', color: '#10b981', enabled: true, type: 'scatter' },
    { id: '3', name: 'Calidad (pH)', field: 'sensors.ph', color: '#f59e0b', enabled: false, type: 'heatmap' }
  ]);

  const [metrics, setMetrics] = useState<MetricConfig[]>([
    { id: '1', name: 'Presión Media', field: 'sensors.pressure', type: 'avg' },
    { id: '2', name: 'Sensores Activos', field: 'device_id', type: 'count' },
    { id: '3', name: 'Caudal Total', field: 'sensors.flow_rate', type: 'sum' }
  ]);

  const [alerts, setAlerts] = useState<AlertConfig[]>([
    { id: '1', field: 'sensors.pressure', operator: '<', value: 2.5, severity: 'warning', message: 'Presión baja en red - revisar sector' },
    { id: '2', field: 'sensors.pressure', operator: '>', value: 5.0, severity: 'critical', message: 'Presión crítica - posible fuga' },
    { id: '3', field: 'sensors.chlorine', operator: '<', value: 0.4, severity: 'critical', message: 'Cloro bajo - calidad comprometida' }
  ]);

  const [showPreview, setShowPreview] = useState<boolean>(false);

  const steps: WizardStep[] = [
    { id: 1, title: 'Detección de Esquema', description: 'Analizando datos entrantes', completed: currentStep > 1 },
    { id: 2, title: 'Posicionamiento', description: 'Configurar datos espaciales', completed: currentStep > 2 },
    { id: 3, title: 'Capas Visuales', description: 'Configurar capas de visualización', completed: currentStep > 3 },
    { id: 4, title: 'Métricas y Alertas', description: 'Configurar monitorización', completed: currentStep > 4 },
    { id: 5, title: 'Vista Previa', description: 'Revisar y guardar', completed: false }
  ];

useEffect(() => {
  if (isAnalyzing && schemaDetectionMode === 'auto') {
    // Timer de progreso
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => setIsAnalyzing(false), 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Timeout de detección
    const timeoutId = setTimeout(() => {
      if (detectedFields.length === 0) {
        // No se detectó nada, ofrecer configuración manual
        setIsAnalyzing(false);
        setIsEditingSchema(true);
      }
    }, schemaDetectionTimeout * 1000);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeoutId);
    };
  }
}, [isAnalyzing, schemaDetectionMode, schemaDetectionTimeout, detectedFields.length]);

  const addLayer = () => {
    const numericFields = detectedFields.filter(f => f.type === 'number' && !['latitude', 'longitude', 'altitude'].includes(f.name));
    if (numericFields.length === 0) return;
    
    const newLayer: LayerConfig = {
      id: Date.now().toString(),
      name: `Capa ${layers.length + 1}`,
      field: numericFields[0].path,
      color: '#10b981',
      enabled: true,
      type: 'scatter'
    };
    setLayers([...layers, newLayer]);
  };

  const removeLayer = (id: string) => {
    setLayers(layers.filter(l => l.id !== id));
  };

  const addMetric = () => {
    const numericFields = detectedFields.filter(f => f.type === 'number');
    if (numericFields.length === 0) return;
    
    const newMetric: MetricConfig = {
      id: Date.now().toString(),
      name: 'Nueva Métrica',
      field: numericFields[0].path,
      type: 'avg'
    };
    setMetrics([...metrics, newMetric]);
  };

  const addAlert = () => {
    const numericFields = detectedFields.filter(f => f.type === 'number');
    if (numericFields.length === 0) return;
    
    const newAlert: AlertConfig = {
      id: Date.now().toString(),
      field: numericFields[0].path,
      operator: '>',
      value: 0,
      severity: 'warning',
      message: 'Alerta activada'
    };
    setAlerts([...alerts, newAlert]);
  };

  const handleSaveConfiguration = () => {
    console.log('Guardando configuración:', {
      positionMapping,
      layers,
      metrics,
      alerts
    });
    alert('¡Configuración guardada! Redirigiendo al visor del dataset...');
  };

  const renderStepContent = () => {
    if (isAnalyzing && currentStep === 1) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            <div className="text-center mb-6">
              <Wifi className="w-16 h-16 mx-auto mb-4 text-[#3b82f6] animate-pulse" />
              <h2 className="text-2xl font-bold mb-2">Analizando Flujo de Datos</h2>
              <p className="text-gray-400">Recolectando muestras del broker MQTT...</p>
            </div>
            <div className="bg-[#27272a] rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span className="text-gray-400">Progreso</span>
                <span className="font-mono">{analysisProgress}%</span>
              </div>
              <div className="w-full bg-[#18181b] rounded-full h-2">
                <div 
                  className="bg-[#3b82f6] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle size={16} className="text-[#10b981]" />
                Conectado a mqtt.aiguesbarcelona.cat
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <CheckCircle size={16} className="text-[#10b981]" />
                Suscrito a bcn/eixample/sensors/#
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                {analysisProgress >= 50 ? (
                  <CheckCircle size={16} className="text-[#10b981]" />
                ) : (
                  <div className="w-4 h-4 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                )}
                Detectando sistema de coordenadas...
              </div>
            </div>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
  if (isEditingSchema || schemaDetectionMode === 'manual') {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Configuración Manual de Esquema</h2>
            <p className="text-gray-400">Define la estructura de tus datos MQTT</p>
          </div>

          {/* Selector de modo */}
          <div className="bg-[#27272a] rounded-lg p-4 mb-6">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => {
                  setSchemaDetectionMode('template');
                  setSelectedTemplate('iot-sensors');
                }}
                className={`flex-1 py-2 px-4 rounded transition-colors ${
                  schemaDetectionMode === 'template'
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#18181b] text-gray-400 hover:bg-[#3f3f46]'
                }`}
              >
                Usar Plantilla
              </button>
              <button
                onClick={() => setSchemaDetectionMode('manual')}
                className={`flex-1 py-2 px-4 rounded transition-colors ${
                  schemaDetectionMode === 'manual'
                    ? 'bg-[#3b82f6] text-white'
                    : 'bg-[#18181b] text-gray-400 hover:bg-[#3f3f46]'
                }`}
              >
                Definir Manualmente
              </button>
              <button
                onClick={() => {
                  setSchemaDetectionMode('auto');
                  setIsAnalyzing(true);
                  setAnalysisProgress(0);
                  setIsEditingSchema(false);
                }}
                className="flex-1 py-2 px-4 bg-[#18181b] text-gray-400 hover:bg-[#3f3f46] rounded transition-colors"
              >
                Reintentar Auto-detección
              </button>
            </div>

            {/* Selector de plantillas */}
            {schemaDetectionMode === 'template' && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">
                  Selecciona una plantilla
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    setSelectedTemplate(e.target.value);
                    setManualSchema(schemaTemplates[e.target.value as keyof typeof schemaTemplates].structure);
                  }}
                  className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white"
                >
                  {Object.entries(schemaTemplates).map(([key, template]) => (
                    <option key={key} value={key}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Editor de esquema */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-400">
                  Estructura JSON del mensaje MQTT
                </label>
                <div className="text-xs text-gray-500">
                  Usa "string", "number", "boolean" para tipos
                </div>
              </div>
              <textarea
                value={schemaDetectionMode === 'template' && selectedTemplate 
                  ? schemaTemplates[selectedTemplate as keyof typeof schemaTemplates].structure 
                  : manualSchema}
                onChange={(e) => setManualSchema(e.target.value)}
                className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-4 py-3 text-white font-mono text-sm h-64 resize-none"
                placeholder={`{\n  "device_id": "string",\n  "location": {\n    "lat": "number",\n    "lon": "number"\n  },\n  "sensors": {\n    "temp": "number"\n  }\n}`}
              />
            </div>

            {/* Opciones de conversión de tipos */}
            <div className="bg-[#18181b] rounded p-3 mb-4">
              <div className="text-sm font-bold mb-2">Conversiones Automáticas</div>
              <div className="space-y-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span>Convertir strings numéricos a números (ej: "123" → 123)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span>Convertir timestamps en string a números</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" />
                  <span>Aplanar objetos anidados (metadata.id → metadata_id)</span>
                </label>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-4 pt-4 border-t border-[#27272a]">
                    <span>Timeout en {schemaDetectionTimeout}s</span>
                    <button
                    onClick={() => {
                        setIsAnalyzing(false);
                        setIsEditingSchema(true);
                    }}
                    className="text-[#3b82f6] hover:text-[#2563eb]"
                    >
                    Configurar manualmente →
                    </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                // Aquí procesarías el esquema manual
                setIsEditingSchema(false);
                setCurrentStep(2);
              }}
              className="w-full py-3 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded font-bold transition-colors"
            >
              Aplicar Esquema y Continuar
            </button>
          </div>

          {/* Ayuda */}
          <div className="bg-[#18181b] border border-[#f59e0b]/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-[#f59e0b] mt-1" size={18} />
              <div className="flex-1 text-sm">
                <div className="font-bold text-[#f59e0b] mb-1">Consejos para configurar el esquema</div>
                <ul className="text-gray-400 space-y-1 list-disc list-inside">
                  <li>Usa la ruta completa con puntos: "sensors.temperature"</li>
                  <li>Si un número llega como string, márcalo como "number" y activa la conversión</li>
                  <li>Para arrays, usa el índice: "readings[0].value"</li>
                  <li>Puedes probar con un mensaje de ejemplo desde el topic MQTT</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Contenido existente cuando está en modo auto...
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">Esquema Detectado</h2>
          <p className="text-gray-400">Encontramos {detectedFields.length} campos en tu flujo de datos</p>
        </div>

        {/* Botón para editar manualmente */}
        <div className="mb-4">
          <button
            onClick={() => setIsEditingSchema(true)}
            className="text-sm text-[#3b82f6] hover:text-[#2563eb] transition-colors"
          >
            ✏️ Editar esquema manualmente
          </button>
        </div>

        {/* Resto del contenido existente... */}
        <div className="bg-[#27272a] rounded-lg p-4 mb-6">
          {/* ... contenido existente ... */}
        </div>

        {/* Lista de campos con opciones de edición */}
        <div className="space-y-2 mb-6">
          {detectedFields.map((field, idx) => (
            <div key={field.path} className="bg-[#27272a] rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold">{field.name}</span>
                    <select
                      value={field.type}
                      onChange={(e) => {
                        // Aquí actualizarías el tipo del campo
                        const newFields = [...detectedFields];
                        newFields[idx].type = e.target.value as any;
                        // setDetectedFields(newFields); // Si fuera state mutable
                      }}
                      className="text-xs px-2 py-0.5 rounded bg-[#18181b] border border-[#3f3f46]"
                    >
                      <option value="number">number</option>
                      <option value="string">string</option>
                      <option value="boolean">boolean</option>
                      <option value="object">object</option>
                    </select>
                  </div>
                  <div className="text-sm text-gray-400">
                    Path: <input
                      type="text"
                      value={field.path}
                      className="font-mono bg-transparent border-b border-transparent hover:border-[#3f3f46] focus:border-[#3b82f6] outline-none"
                      onChange={(e) => {
                        // Permitir editar el path
                      }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Muestra</div>
                  <div className="font-mono">{JSON.stringify(field.sample)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ... resto del contenido existente ... */}
      </div>
    </div>
  );

      case 2:
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <MapPin className="text-[#3b82f6]" />
                  Configuración de Posicionamiento
                </h2>
                <p className="text-gray-400">Sistema de coordenadas geográficas detectado (GIS)</p>
              </div>

              <div className="bg-[#18181b] border border-[#3b82f6] rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="text-[#3b82f6] mt-1" size={20} />
                  <div className="flex-1">
                    <div className="font-bold mb-2">✓ Coordenadas geográficas detectadas</div>
                    <div className="text-sm text-gray-400 mb-3">
                      Hemos identificado campos de latitud/longitud. Tu visualización se proyectará sobre un mapa base 3D con relieve real.
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="bg-[#27272a] rounded px-2 py-1">
                        <span className="text-gray-400">Proyección:</span> <span className="font-mono">WGS84</span>
                      </div>
                      <div className="bg-[#27272a] rounded px-2 py-1">
                        <span className="text-gray-400">Zona:</span> <span className="font-mono">UTM 31N</span>
                      </div>
                      <div className="bg-[#27272a] rounded px-2 py-1">
                        <span className="text-gray-400">EPSG:</span> <span className="font-mono">4326</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#27272a] rounded-lg p-6 mb-4">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <MapPin size={18} />
                  Mapeo de Coordenadas
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Latitud (Y)
                    </label>
                    <select 
                      value={positionMapping.lat}
                      onChange={(e) => setPositionMapping({...positionMapping, lat: e.target.value})}
                      className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white font-mono"
                    >
                      {detectedFields.filter(f => f.type === 'number').map(field => (
                        <option key={field.path} value={field.path}>
                          {field.name} {field.name === 'latitude' && '✓'}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      Rango: 41.35° - 41.42°
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Longitud (X)
                    </label>
                    <select 
                      value={positionMapping.lon}
                      onChange={(e) => setPositionMapping({...positionMapping, lon: e.target.value})}
                      className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white font-mono"
                    >
                      {detectedFields.filter(f => f.type === 'number').map(field => (
                        <option key={field.path} value={field.path}>
                          {field.name} {field.name === 'longitude' && '✓'}
                        </option>
                      ))}
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      Rango: 2.10° - 2.25°
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Altitud (Z) - Opcional
                    </label>
                    <select 
                      value={positionMapping.alt}
                      onChange={(e) => setPositionMapping({...positionMapping, alt: e.target.value})}
                      className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white font-mono"
                    >
                      <option value="">Usar elevación del terreno</option>
                      {detectedFields.filter(f => f.type === 'number').map(field => (
                        <option key={field.path} value={field.path}>{field.name}</option>
                      ))}
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      Elevación media: ~12m
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Identificador del Punto
                    </label>
                    <select 
                      value={positionMapping.identifier}
                      onChange={(e) => setPositionMapping({...positionMapping, identifier: e.target.value})}
                      className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white font-mono"
                    >
                      {detectedFields.filter(f => f.type === 'string').map(field => (
                        <option key={field.path} value={field.path}>{field.name}</option>
                      ))}
                    </select>
                    <div className="text-xs text-gray-500 mt-1">
                      Ejemplo: WS-BCN-0847
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#27272a] rounded-lg p-4 mb-4">
                <h3 className="font-bold mb-3 text-sm">Opciones de Visualización</h3>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="text-sm">Mostrar mapa base</div>
                      <div className="text-xs text-gray-400">OpenStreetMap con relieve 3D</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="text-sm">Líneas de conexión entre puntos</div>
                      <div className="text-xs text-gray-400">Útil para visualizar rutas o redes</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox"
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <div className="text-sm">Proyección cilíndrica plana</div>
                      <div className="text-xs text-gray-400">Desactiva curvatura terrestre para áreas pequeñas</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="bg-[#18181b] border border-[#f59e0b]/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-[#f59e0b] mt-1" size={18} />
                  <div className="flex-1 text-sm">
                    <div className="font-bold text-[#f59e0b] mb-1">Zona detectada: Barcelona, España</div>
                    <div className="text-gray-400">
                      Se aplicará automáticamente corrección de proyección para esta zona geográfica.
                      Los datos se convertirán de coordenadas geográficas (lat/lon) a coordenadas proyectadas (metros) para una visualización precisa.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Layers className="text-[#3b82f6]" />
                  Capas de Visualización
                </h2>
                <p className="text-gray-400">Configura cómo se visualizan tus datos en el espacio 3D</p>
              </div>

              <div className="space-y-4 mb-4">
                {layers.map((layer) => (
                  <div key={layer.id} className="bg-[#27272a] rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <input 
                        type="checkbox" 
                        checked={layer.enabled}
                        onChange={(e) => setLayers(layers.map(l => 
                          l.id === layer.id ? {...l, enabled: e.target.checked} : l
                        ))}
                        className="w-5 h-5"
                      />
                      <input
                        type="color"
                        value={layer.color}
                        onChange={(e) => setLayers(layers.map(l => 
                          l.id === layer.id ? {...l, color: e.target.value} : l
                        ))}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={layer.name}
                        onChange={(e) => setLayers(layers.map(l => 
                          l.id === layer.id ? {...l, name: e.target.value} : l
                        ))}
                        className="flex-1 bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white"
                        placeholder="Nombre de la capa"
                      />
                      {layers.length > 1 && (
                        <button 
                          onClick={() => removeLayer(layer.id)}
                          className="p-2 hover:bg-[#18181b] rounded transition-colors"
                        >
                          <X size={18} />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Campo de Datos</label>
                        <select 
                          value={layer.field}
                          onChange={(e) => setLayers(layers.map(l => 
                            l.id === layer.id ? {...l, field: e.target.value} : l
                          ))}
                          className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white"
                        >
                          {detectedFields.filter(f => f.type === 'number').map(field => (
                            <option key={field.path} value={field.path}>{field.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-gray-400 mb-2">Tipo de Visualización</label>
                        <select 
                          value={layer.type}
                          onChange={(e) => setLayers(layers.map(l => 
                            l.id === layer.id ? {...l, type: e.target.value as 'heatmap' | 'scatter'} : l
                          ))}
                          className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white"
                        >
                          <option value="heatmap">Mapa de calor (tamaño por valor)</option>
                          <option value="scatter">Dispersión (tamaño uniforme)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addLayer}
                className="w-full py-3 bg-[#18181b] border-2 border-dashed border-[#3f3f46] hover:border-[#3b82f6] rounded-lg transition-colors text-gray-400 hover:text-white"
              >
                + Añadir Capa
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Activity className="text-[#3b82f6]" />
                  Métricas & Alertas
                </h2>
                <p className="text-gray-400">Configura monitorización en tiempo real y detección de anomalías</p>
              </div>

              <div className="mb-8">
                <h3 className="font-bold mb-4">Métricas de Estadísticas Rápidas</h3>
                <div className="space-y-3 mb-4">
                  {metrics.map((metric) => (
                    <div key={metric.id} className="bg-[#27272a] rounded-lg p-4 flex items-center gap-3">
                      <input
                        type="text"
                        value={metric.name}
                        onChange={(e) => setMetrics(metrics.map(m => 
                          m.id === metric.id ? {...m, name: e.target.value} : m
                        ))}
                        className="flex-1 bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white"
                        placeholder="Nombre de métrica"
                      />
                      <select 
                        value={metric.field}
                        onChange={(e) => setMetrics(metrics.map(m => 
                          m.id === metric.id ? {...m, field: e.target.value} : m
                        ))}
                        className="bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white"
                      >
                        {detectedFields.filter(f => f.type === 'number').map(field => (
                          <option key={field.path} value={field.path}>{field.name}</option>
                        ))}
                      </select>
                      <select 
                        value={metric.type}
                        onChange={(e) => setMetrics(metrics.map(m => 
                          m.id === metric.id ? {...m, type: e.target.value as any} : m
                        ))}
                        className="bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white"
                      >
                        <option value="avg">Promedio</option>
                        <option value="sum">Suma</option>
                        <option value="min">Mínimo</option>
                        <option value="max">Máximo</option>
                        <option value="count">Conteo</option>
                      </select>
                    </div>
                  ))}
                </div>
                <button
                  onClick={addMetric}
                  className="w-full py-2 bg-[#18181b] border-2 border-dashed border-[#3f3f46] hover:border-[#3b82f6] rounded-lg transition-colors text-sm text-gray-400 hover:text-white"
                >
                  + Añadir Métrica
                </button>
              </div>

              <div>
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle className="text-[#f59e0b]" size={20} />
                  Reglas de Detección de Anomalías
                </h3>
                <div className="space-y-3 mb-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="bg-[#27272a] rounded-lg p-4">
                      <div className="grid grid-cols-4 gap-3 mb-3">
                        <select 
                          value={alert.field}
                          onChange={(e) => setAlerts(alerts.map(a => 
                            a.id === alert.id ? {...a, field: e.target.value} : a
                          ))}
                          className="bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white"
                        >
                          {detectedFields.filter(f => f.type === 'number').map(field => (
                            <option key={field.path} value={field.path}>{field.name}</option>
                          ))}
                        </select>
                        <select 
                          value={alert.operator}
                          onChange={(e) => setAlerts(alerts.map(a => 
                            a.id === alert.id ? {...a, operator: e.target.value as any} : a
                          ))}
                          className="bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white"
                        >
                          <option value=">">Mayor que</option>
                          <option value="<">Menor que</option>
                          <option value="=">Igual a</option>
                          <option value="!=">Distinto de</option>
                        </select>
                        <input
                          type="number"
                          value={alert.value}
                          onChange={(e) => setAlerts(alerts.map(a => 
                            a.id === alert.id ? {...a, value: parseFloat(e.target.value)} : a
                          ))}
                          className="bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white"
                        />
                        <select 
                          value={alert.severity}
                          onChange={(e) => setAlerts(alerts.map(a => 
                            a.id === alert.id ? {...a, severity: e.target.value as any} : a
                          ))}
                          className="bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white"
                        >
                          <option value="warning">Advertencia</option>
                          <option value="critical">Crítico</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={alert.message}
                        onChange={(e) => setAlerts(alerts.map(a => 
                          a.id === alert.id ? {...a, message: e.target.value} : a
                        ))}
                        className="w-full bg-[#18181b] border border-[#3f3f46] rounded px-3 py-2 text-white text-sm"
                        placeholder="Mensaje de alerta"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={addAlert}
                  className="w-full py-2 bg-[#18181b] border-2 border-dashed border-[#3f3f46] hover:border-[#3b82f6] rounded-lg transition-colors text-sm text-gray-400 hover:text-white"
                >
                  + Añadir Regla de Alerta
                </button>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2">Resumen de Configuración</h2>
                <p className="text-gray-400">Revisa la configuración de tu dataset antes de guardar</p>
              </div>

              <div className="space-y-4">
                <div className="bg-[#27272a] rounded-lg p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <MapPin size={18} />
                    Sistema de Posicionamiento
                  </h3>
                  <div className="mb-3 p-2 bg-[#18181b] rounded">
                    <div className="text-xs text-[#3b82f6] font-bold mb-1">SISTEMA GEOGRÁFICO (GIS)</div>
                    <div className="text-xs text-gray-400">Proyección WGS84 / UTM 31N</div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="text-gray-400">Latitud:</div>
                    <div className="font-mono">{positionMapping.lat}</div>
                    <div className="text-gray-400">Longitud:</div>
                    <div className="font-mono">{positionMapping.lon}</div>
                    <div className="text-gray-400">Altitud:</div>
                    <div className="font-mono">{positionMapping.alt || 'Auto (terreno)'}</div>
                    <div className="text-gray-400">Identificador:</div>
                    <div className="font-mono">{positionMapping.identifier}</div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-[#18181b] text-xs text-gray-400">
                    <div>• Mapa base: OpenStreetMap con relieve 3D</div>
                    <div>• Zona: Barcelona, España (41.39°N, 2.17°E)</div>
                    <div>• Radio de cobertura: ~8.5 km</div>
                  </div>
                </div>

                <div className="bg-[#27272a] rounded-lg p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Layers size={18} />
                    Capas de Visualización ({layers.filter(l => l.enabled).length} activas)
                  </h3>
                  <div className="space-y-2">
                    {layers.filter(l => l.enabled).map(layer => (
                      <div key={layer.id} className="flex items-center gap-2 text-sm">
                        <div className="w-4 h-4 rounded" style={{backgroundColor: layer.color}} />
                        <span>{layer.name}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-mono text-gray-400">{layer.field}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#27272a] rounded-lg p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <Activity size={18} />
                    Métricas ({metrics.length})
                  </h3>
                  <div className="space-y-1 text-sm">
                    {metrics.map(metric => (
                      <div key={metric.id} className="text-gray-400">
                        • {metric.name} ({metric.type})
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#27272a] rounded-lg p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-[#f59e0b]" />
                    Reglas de Alerta ({alerts.length})
                  </h3>
                  <div className="space-y-1 text-sm">
                    {alerts.map(alert => (
                      <div key={alert.id} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'bg-[#ef4444]' : 'bg-[#f59e0b]'}`} />
                        <span className="text-gray-400">
                          {alert.field} {alert.operator} {alert.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-[#0a0a0a] text-gray-100 flex flex-col overflow-hidden font-mono">
      <div className="h-14 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-[#10b981] rounded-full animate-pulse" />
          <h1 className="font-bold">Dataset: Red de Sensores - Distrito Eixample</h1>
        </div>
        <button 
          onClick={() => window.history.back()}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Cancelar
        </button>
      </div>

      <div className="bg-[#18181b] border-b border-[#27272a] px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all ${
                    step.completed ? 'bg-[#10b981] text-black' :
                    currentStep === step.id ? 'bg-[#3b82f6] text-white' :
                    'bg-[#27272a] text-gray-500'
                  }`}>
                    {step.completed ? <CheckCircle size={20} /> : step.id}
                  </div>
                  <div className="hidden md:block">
                    <div className={`text-sm font-bold ${
                      currentStep === step.id ? 'text-white' : 
                      step.completed ? 'text-[#10b981]' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 ${
                    step.completed ? 'bg-[#10b981]' : 'bg-[#27272a]'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        {renderStepContent()}
      </div>

      {!isAnalyzing && (
        <div className="bg-[#18181b] border-t border-[#27272a] px-6 py-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={() => currentStep > 1 && setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1}
              className={`px-4 py-2 rounded transition-colors ${
                currentStep === 1 
                  ? 'text-gray-600 cursor-not-allowed' 
                  : 'text-white hover:bg-[#27272a]'
              }`}
            >
              Atrás
            </button>

            <div className="flex items-center gap-3">
              {currentStep === 5 && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#27272a] hover:bg-[#3f3f46] rounded transition-colors"
                >
                  {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  {showPreview ? 'Ocultar' : 'Ver'} Vista Previa
                </button>
              )}

              {currentStep < 5 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="flex items-center gap-2 px-6 py-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded font-bold transition-colors"
                >
                  Continuar
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleSaveConfiguration}
                  className="flex items-center gap-2 px-6 py-2 bg-[#10b981] hover:bg-[#059669] text-black rounded font-bold transition-colors"
                >
                  <CheckCircle size={18} />
                  Guardar e Iniciar Monitoreo
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showPreview && currentStep === 5 && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50 p-4">
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-[#27272a]">
              <h3 className="text-lg font-bold">Vista Previa en Vivo</h3>
              <button 
                onClick={() => setShowPreview(false)}
                className="p-2 hover:bg-[#27272a] rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-[#0a0a0a] rounded-lg p-4 mb-4">
                <div className="aspect-video bg-[#18181b] rounded flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
                    <div className="text-gray-400">Renderizando mapa 3D...</div>
                    <div className="text-sm text-gray-500 mt-2">
                      {layers.filter(l => l.enabled).length} capas • Barcelona, España
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {metrics.map(metric => (
                  <div key={metric.id} className="bg-[#27272a] rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">{metric.name}</div>
                    <div className="text-2xl font-bold">--</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetConfigWizard;