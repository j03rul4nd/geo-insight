/**
 * Hook para gestionar la configuración técnica de datasets
 * (MQTT, Webhooks, API endpoints, alertas)
 */

import { useState } from 'react';
import { toast } from 'sonner';

// Tipos
export interface DatasetConfig {
  id: string;
  source: 'mqtt_stream' | 'webhook' | 'api' | 'file_upload';
  mqttBroker: string | null;
  mqttTopic: string | null;
  mqttUsername: string | null;
  mqttPassword?: string | null; // '***' cuando se obtiene
  webhookUrl: string | null;
  webhookSecret: string | null;
  apiEndpoint: string | null;
  alertThresholds: Record<string, any> | null;
  alertsEnabled: boolean | null;
}

export interface UpdateConfigPayload {
  mqttBroker?: string | null;
  mqttTopic?: string | null;
  mqttUsername?: string | null;
  mqttPassword?: string | null;
  webhookUrl?: string | null;
  webhookSecret?: string | null;
  apiEndpoint?: string | null;
  alertThresholds?: Record<string, any> | null;
  alertsEnabled?: boolean;
}

interface ConfigResponse {
  success: boolean;
  data: DatasetConfig;
  message?: string;
  warning?: string;
}

export function useDatasetConfig(datasetId: string) {
  const [config, setConfig] = useState<DatasetConfig | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtener la configuración actual del dataset
   */
  const fetchConfig = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/datasets/${datasetId}/config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch configuration');
      }

      setConfig(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error('Error', {
        description: errorMessage,
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Actualizar la configuración del dataset
   */
  const updateConfig = async (payload: UpdateConfigPayload) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/datasets/${datasetId}/config`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: ConfigResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update configuration');
      }

      setConfig(result.data);

      // Toast de éxito
      toast.success('Success', {
        description: result.message || 'Configuration updated successfully',
      });

      // Warning adicional si hay reconexión MQTT
      if (result.warning) {
        toast.info('Notice', {
          description: result.warning,
        });
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error('Error', {
        description: errorMessage,
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Actualizar configuración MQTT
   */
  const updateMqttConfig = async (mqttConfig: {
    broker: string;
    topic: string;
    username?: string;
    password?: string;
  }) => {
    return updateConfig({
      mqttBroker: mqttConfig.broker,
      mqttTopic: mqttConfig.topic,
      mqttUsername: mqttConfig.username || null,
      mqttPassword: mqttConfig.password || null,
    });
  };

  /**
   * Actualizar configuración de Webhook
   */
  const updateWebhookConfig = async (webhookConfig: {
    url: string;
    secret?: string;
  }) => {
    return updateConfig({
      webhookUrl: webhookConfig.url,
      webhookSecret: webhookConfig.secret || null,
    });
  };

  /**
   * Actualizar umbrales de alertas
   */
  const updateAlertThresholds = async (
    thresholds: Record<string, any>,
    enabled?: boolean
  ) => {
    return updateConfig({
      alertThresholds: thresholds,
      ...(enabled !== undefined && { alertsEnabled: enabled }),
    });
  };

  /**
   * Habilitar/deshabilitar alertas
   */
  const toggleAlerts = async (enabled: boolean) => {
    return updateConfig({
      alertsEnabled: enabled,
    });
  };

  /**
   * Limpiar configuración MQTT
   */
  const clearMqttConfig = async () => {
    return updateConfig({
      mqttBroker: null,
      mqttTopic: null,
      mqttUsername: null,
      mqttPassword: null,
    });
  };

  /**
   * Limpiar configuración de Webhook
   */
  const clearWebhookConfig = async () => {
    return updateConfig({
      webhookUrl: null,
      webhookSecret: null,
    });
  };

  return {
    // Estado
    config,
    isLoading,
    error,

    // Acciones generales
    fetchConfig,
    updateConfig,

    // Acciones específicas
    updateMqttConfig,
    updateWebhookConfig,
    updateAlertThresholds,
    toggleAlerts,
    clearMqttConfig,
    clearWebhookConfig,
  };
}