// hooks/useDatasets.ts
import { useState, useEffect, useCallback } from 'react';
import { Dataset, ViewType } from '@/types/Datasets';

interface UseDatasets {
  datasets: Dataset[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createDataset: (data: CreateDatasetPayload) => Promise<Dataset>;
  deleteDataset: (id: string) => Promise<void>;
  archiveDataset: (id: string) => Promise<void>;
  testMQTTConnection: (config: MQTTConfig) => Promise<MQTTTestResult>;
}

interface CreateDatasetPayload {
  name: string;
  description?: string;
  source: Dataset['source'];
  
  // 🆕 View type - cómo visualizar los datos
  viewType?: ViewType;
  
  // MQTT specific
  mqttBroker?: string;
  mqttTopic?: string;
  mqttUsername?: string;
  mqttPassword?: string;
  
  // API specific
  apiEndpoint?: string;
  apiMethod?: 'GET' | 'POST';
  apiHeaders?: Record<string, string>;
  pollInterval?: number;
  
  // Webhook specific
  webhookFormat?: 'json' | 'form' | 'xml';
  webhookSecret?: string;
  
  // 🆕 Bounding box para ThreeJS
  boundingBox?: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
}

interface MQTTConfig {
  brokerUrl: string;
  topic: string;
  username?: string;
  password?: string;
  clientId?: string;
  keepAlive?: number;
  cleanSession?: boolean;
}

interface ConnectionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
}

interface MQTTTestResult {
  success: boolean;
  latency?: number;
  error?: string;
  message?: string;
  logs?: ConnectionLog[];
  connectionDetails?: {
    protocol: string;
    host: string;
    port: string;
    useTLS: boolean;
  };
}

interface FetchDatasetsOptions {
  page?: number;
  limit?: number;
  status?: Dataset['status'];
  source?: Dataset['source'];
  viewType?: ViewType; // 🆕 Filtrar por tipo de visualización
}

export function useDatasets(options?: FetchDatasetsOptions): UseDatasets {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatasets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 🆕 Construir query params incluyendo viewType
      const params = new URLSearchParams();
      if (options?.page) params.set('page', options.page.toString());
      if (options?.limit) params.set('limit', options.limit.toString());
      if (options?.status) params.set('status', options.status);
      if (options?.source) params.set('source', options.source);
      if (options?.viewType) params.set('viewType', options.viewType);
      
      const queryString = params.toString();
      const url = `/api/datasets${queryString ? `?${queryString}` : ''}`;
      
      const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setDatasets(data.datasets || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load datasets';
      setError(message);
      console.error('Error fetching datasets:', err);
    } finally {
      setLoading(false);
    }
  }, [options?.page, options?.limit, options?.status, options?.source, options?.viewType]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const createDataset = async (payload: CreateDatasetPayload): Promise<Dataset> => {
    try {
      // 🆕 Validar viewType antes de enviar
      if (payload.viewType && !['gis', 'threejs'].includes(payload.viewType)) {
        throw new Error('viewType must be either "gis" or "threejs"');
      }

      const res = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          viewType: payload.viewType || 'gis' // Default a GIS
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create dataset');
      }

      const newDataset = await res.json();
      setDatasets(prev => [...prev, newDataset]);
      
      console.log('✅ Dataset created:', {
        id: newDataset.id,
        name: newDataset.name,
        viewType: newDataset.viewType,
        source: newDataset.source
      });
      
      return newDataset;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create dataset';
      setError(message);
      console.error('❌ Failed to create dataset:', err);
      throw err;
    }
  };

  const deleteDataset = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/datasets/${id}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete dataset');
      }

      setDatasets(prev => prev.filter(ds => ds.id !== id));
      console.log('🗑️ Dataset deleted:', id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete dataset';
      setError(message);
      throw err;
    }
  };

  const archiveDataset = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/datasets/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });

      if (!res.ok) {
        throw new Error('Failed to archive dataset');
      }

      const updated = await res.json();
      setDatasets(prev => prev.map(ds => ds.id === id ? updated : ds));
      console.log('📦 Dataset archived:', id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive dataset';
      setError(message);
      throw err;
    }
  };

  /**
   * Prueba conexión MQTT
   * Usa el endpoint /api/settings/integrations/mqtt
   */
  const testMQTTConnection = async (config: MQTTConfig): Promise<MQTTTestResult> => {
    try {
      console.log('🔌 Testing MQTT connection...', {
        broker: config.brokerUrl,
        topic: config.topic,
        hasUsername: !!config.username,
      });

      const res = await fetch('/api/settings/integrations/mqtt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mqttBroker: config.brokerUrl,
          mqttTopic: config.topic,
          mqttUsername: config.username,
          mqttPassword: config.password,
        })
      });

      const result: MQTTTestResult = await res.json();

      // Log detallado del resultado
      if (result.success) {
        console.log('✅ MQTT connection successful', {
          latency: result.latency,
          message: result.message,
          details: result.connectionDetails,
        });
      } else {
        console.error('❌ MQTT connection failed', {
          error: result.error,
          logs: result.logs,
        });
      }

      // Mostrar logs si están disponibles
      if (result.logs && result.logs.length > 0) {
        console.group('📝 Connection Logs:');
        result.logs.forEach(log => {
          const emoji = log.level === 'error' ? '❌' : log.level === 'warn' ? '⚠️' : 'ℹ️';
          console.log(`${emoji} [${log.timestamp}] ${log.message}`, log.details || '');
        });
        console.groupEnd();
      }

      return result;
    } catch (err) {
      console.error('❌ MQTT test request failed:', err);
      
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Network error occurred',
      };
    }
  };

  return {
    datasets,
    loading,
    error,
    refetch: fetchDatasets,
    createDataset,
    deleteDataset,
    archiveDataset,
    testMQTTConnection
  };
}