import { useState } from 'react';
import { useDatasetMapping } from '@/hooks/useDatasetMapping';
import { Settings, Wand2, RotateCcw, Save, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface MappingConfigPanelProps {
  datasetId: string;
  onMappingChange?: (mapping: any) => void;
}

export default function MappingConfigPanel({ 
  datasetId, 
  onMappingChange 
}: MappingConfigPanelProps) {
  const {
    mapping,
    isLoading,
    isSaving,
    error,
    updateField,
    saveMapping,
    autoDetect,
    reset,
    validate,
    isReady,
  } = useDatasetMapping(datasetId, {
    onSuccess: (newMapping) => {
      if (onMappingChange) onMappingChange(newMapping);
    },
  });

  const [samplePayload, setSamplePayload] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSave = async () => {
    if (!mapping) return;

    // Validar primero si hay payload de muestra
    if (samplePayload) {
      try {
        const payload = JSON.parse(samplePayload);
        const validation = validate(payload);
        
        if (!validation.valid) {
          toast.error('Invalid mapping: ' + validation.errors.join(', '));
          return;
        }
      } catch (err) {
        toast.error('Invalid sample payload JSON');
        return;
      }
    }

    const success = await saveMapping({
      valuePath: mapping.valuePath,
      xPath: mapping.xPath,
      yPath: mapping.yPath,
      zPath: mapping.zPath,
      sensorIdPath: mapping.sensorIdPath,
      sensorTypePath: mapping.sensorTypePath,
      timestampPath: mapping.timestampPath,
      unitPath: mapping.unitPath,
      transforms: mapping.transforms,
    });

    if (success && onMappingChange) {
      onMappingChange(mapping);
    }
  };

  const handleAutoDetect = () => {
    if (!samplePayload) {
      toast.error('Please provide a sample payload first');
      return;
    }

    try {
      const payload = JSON.parse(samplePayload);
      autoDetect(payload);
    } catch (err) {
      toast.error('Invalid JSON in sample payload');
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-300 border-t-blue-500" />
        <p className="mt-4 text-gray-600">Loading mapping configuration...</p>
      </div>
    );
  }

  if (!isReady || !mapping) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load mapping configuration</p>
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">MQTT Payload Mapping</h3>
              <p className="text-sm text-gray-600 mt-0.5">
                Configure how to extract data from MQTT messages
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-1.5 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Mapping
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Sample Payload Section */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sample MQTT Payload (Optional)
          </label>
          <textarea
            value={samplePayload}
            onChange={(e) => setSamplePayload(e.target.value)}
            placeholder='{"temperature": {"value": 25.5, "unit": "°C"}, "position": {"x": 10, "y": 20}, "meta": {"id": "sensor_1", "ts": "2025-10-15T10:00:00Z"}}'
            className="w-full h-32 px-3 py-2 text-sm font-mono bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={handleAutoDetect}
            disabled={!samplePayload}
            className="mt-3 flex items-center gap-2 px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Wand2 className="w-4 h-4" />
            Auto-Detect Mapping
          </button>
        </div>

        {/* Required Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-red-500 rounded-full" />
            <h4 className="font-semibold text-gray-900">Required Fields</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Value Path <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={mapping.valuePath}
                onChange={(e) => updateField('valuePath', e.target.value)}
                placeholder="value"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Path to the measurement value (e.g., "temperature.value")
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Timestamp Path <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={mapping.timestampPath}
                onChange={(e) => updateField('timestampPath', e.target.value)}
                placeholder="timestamp"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Path to the timestamp (e.g., "meta.ts")
              </p>
            </div>
          </div>
        </div>

        {/* Optional Position Fields */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-blue-500 rounded-full" />
            <h4 className="font-semibold text-gray-900">Position Coordinates</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                X Path
              </label>
              <input
                type="text"
                value={mapping.xPath || ''}
                onChange={(e) => updateField('xPath', e.target.value || null)}
                placeholder="x"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Y Path
              </label>
              <input
                type="text"
                value={mapping.yPath || ''}
                onChange={(e) => updateField('yPath', e.target.value || null)}
                placeholder="y"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Z Path
              </label>
              <input
                type="text"
                value={mapping.zPath || ''}
                onChange={(e) => updateField('zPath', e.target.value || null)}
                placeholder="z"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Sensor Metadata */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <h4 className="font-semibold text-gray-900">Sensor Metadata</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sensor ID Path
              </label>
              <input
                type="text"
                value={mapping.sensorIdPath || ''}
                onChange={(e) => updateField('sensorIdPath', e.target.value || null)}
                placeholder="sensorId"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Sensor Type Path
              </label>
              <input
                type="text"
                value={mapping.sensorTypePath || ''}
                onChange={(e) => updateField('sensorTypePath', e.target.value || null)}
                placeholder="sensorType"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Unit Path
              </label>
              <input
                type="text"
                value={mapping.unitPath || ''}
                onChange={(e) => updateField('unitPath', e.target.value || null)}
                placeholder="unit"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Advanced Section (Transforms) */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            <div className={`transform transition-transform ${showAdvanced ? 'rotate-90' : ''}`}>
              ▶
            </div>
            Advanced: Data Transformations
          </button>

          {showAdvanced && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 mb-3">
                Apply mathematical transformations to values (e.g., scaling, offset)
              </p>
              <div className="text-sm text-gray-500 font-mono bg-white p-3 rounded border border-gray-300">
                Coming soon: Scale, offset, unit conversion, custom functions
              </div>
            </div>
          )}
        </div>

        {/* Test Section */}
        {samplePayload && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">Test Your Mapping</h4>
                <p className="text-sm text-blue-700">
                  Save your mapping configuration and the system will automatically apply it to incoming MQTT messages in real-time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )}