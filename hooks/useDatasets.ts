// hooks/useDatasets.ts
import { useState, useEffect, useCallback } from 'react';
import { Dataset } from '@/types/Datasets';

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

export function useDatasets(): UseDatasets {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDatasets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch('/api/datasets', {
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
  }, []);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  const createDataset = async (payload: CreateDatasetPayload): Promise<Dataset> => {
    try {
      const res = await fetch('/api/datasets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create dataset');
      }

      const newDataset = await res.json();
      setDatasets(prev => [...prev, newDataset]);
      return newDataset;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create dataset';
      setError(message);
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
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to archive dataset';
      setError(message);
      throw err;
    }
  };

  /**
   * Prueba conexión MQTT
   * Usa el endpoint /api/settings/integrations/mqtt que has sobrescrito
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