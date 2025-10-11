// hooks/useDataset.ts
import { useState, useEffect, useCallback } from 'react';

export interface DatasetDetail {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'idle' | 'error' | 'archived' | 'processing';
  source: 'csv_upload' | 'json_upload' | 'mqtt_stream' | 'webhook' | 'api';
  
  // MQTT config
  mqttBroker?: string;
  mqttTopic?: string;
  mqttUsername?: string;
  mqttPasswordSet?: boolean;
  
  // Webhook config
  webhookUrl?: string;
  webhookSecretSet?: boolean;
  
  // API config
  apiEndpoint?: string;
  
  // Bounding box
  boundingBox?: {
    min: { x: number; y: number; z: number };
    max: { x: number; y: number; z: number };
  };
  
  // Alerts config
  alertsEnabled: boolean;
  alertThresholds?: Record<string, { max?: number; min?: number }>;
  
  // Stats
  stats: {
    totalDataPoints: number;
    dataPointsToday: number;
    lastDataReceived?: Date;
    avgUpdateFreq?: number;
    activeAlertsCount: number;
    totalInsights: number;
    totalLayers: number;
  };
  
  health: number;
  
  createdAt: Date;
  updatedAt: Date;
}

interface UpdateDatasetPayload {
  name?: string;
  description?: string;
  status?: DatasetDetail['status'];
  alertsEnabled?: boolean;
  alertThresholds?: Record<string, { max?: number; min?: number }>;
  boundingBox?: DatasetDetail['boundingBox'];
}

interface UseDataset {
  dataset: DatasetDetail | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateDataset: (data: UpdateDatasetPayload) => Promise<DatasetDetail>;
  deleteDataset: () => Promise<void>;
}

export function useDataset(datasetId: string): UseDataset {
  const [dataset, setDataset] = useState<DatasetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDataset = useCallback(async () => {
    if (!datasetId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/datasets/${datasetId}`, {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Dataset not found');
        }
        if (res.status === 403) {
          throw new Error('You do not have access to this dataset');
        }
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      
      // Parse dates
      setDataset({
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        stats: {
          ...data.stats,
          lastDataReceived: data.stats.lastDataReceived 
            ? new Date(data.stats.lastDataReceived) 
            : undefined
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load dataset';
      setError(message);
      console.error('Error fetching dataset:', err);
    } finally {
      setLoading(false);
    }
  }, [datasetId]);

  useEffect(() => {
    fetchDataset();
  }, [fetchDataset]);

  const updateDataset = async (payload: UpdateDatasetPayload): Promise<DatasetDetail> => {
    try {
      setError(null);

      const res = await fetch(`/api/datasets/${datasetId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update dataset');
      }

      const updated = await res.json();
      
      // Parse dates
      const parsedDataset = {
        ...updated,
        createdAt: new Date(updated.createdAt),
        updatedAt: new Date(updated.updatedAt),
        stats: {
          ...updated.stats,
          lastDataReceived: updated.stats.lastDataReceived 
            ? new Date(updated.stats.lastDataReceived) 
            : undefined
        }
      };

      setDataset(parsedDataset);
      return parsedDataset;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update dataset';
      setError(message);
      throw err;
    }
  };

  const deleteDataset = async (): Promise<void> => {
    try {
      setError(null);

      const res = await fetch(`/api/datasets/${datasetId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete dataset');
      }

      // Clear local state after successful deletion
      setDataset(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete dataset';
      setError(message);
      throw err;
    }
  };

  return {
    dataset,
    loading,
    error,
    refetch: fetchDataset,
    updateDataset,
    deleteDataset
  };
}