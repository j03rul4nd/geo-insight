/**
 * Hook para gestionar credenciales temporales MQTT con auto-renovación
 * 
 * CARACTERÍSTICAS CLAVE:
 * - Genera credenciales JWT temporales para conexión MQTT desde navegador
 * - Auto-renovación inteligente (10 min antes de expirar)
 * - Gestión de ciclo de vida de conexión MQTT
 * - Validación de configuración MQTT del dataset
 * - Monitoreo de estado de conexión
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

// ============================================================================
// TIPOS
// ============================================================================

export interface MqttConfig {
  broker: string;
  clientId: string;
  username: string;
  password: string; // JWT token
  topic: string;
  options: {
    clean: boolean;
    connectTimeout: number;
    reconnectPeriod: number;
    keepalive: number;
    protocol: string;
    will: {
      topic: string;
      payload: string;
      qos: number;
      retain: boolean;
    };
  };
}

export interface MqttCredentialsMetadata {
  datasetId: string;
  datasetName: string;
  expiresAt: string;
  renewAt: string;
  expiresInSeconds: number;
  permissions: 'subscribe' | 'publish' | 'subscribe_publish';
  generatedAt: string;
}

interface MqttCredentialsResponse {
  success: boolean;
  data: {
    config: MqttConfig;
    metadata: MqttCredentialsMetadata;
  };
  message: string;
  warning?: string;
}

export interface MqttStatus {
  datasetId: string;
  datasetName: string;
  isMqttConfigured: boolean;
  isLikelyConnected: boolean;
  status: string;
  lastDataReceived: string | null;
  avgUpdateFrequency: number | null;
  broker: string | null;
  topic: string | null;
}

interface MqttStatusResponse {
  success: boolean;
  data: MqttStatus;
}

export interface UseMqttCredentialsOptions {
  // Auto-renovación
  autoRenew?: boolean; // Default: true
  
  // Renovar N segundos antes de expirar (default: 600 = 10min)
  renewBeforeExpiry?: number;
  
  // Callbacks
  onCredentialsGenerated?: (config: MqttConfig, metadata: MqttCredentialsMetadata) => void;
  onCredentialsRenewed?: (config: MqttConfig, metadata: MqttCredentialsMetadata) => void;
  onCredentialsExpired?: () => void;
  onError?: (error: string) => void;
  
  // Auto-fetch al montar
  autoFetch?: boolean; // Default: true
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useMqttCredentials(
  datasetId: string,
  options: UseMqttCredentialsOptions = {}
) {
  const {
    autoRenew = true,
    renewBeforeExpiry = 600, // 10 minutos
    onCredentialsGenerated,
    onCredentialsRenewed,
    onCredentialsExpired,
    onError,
    autoFetch = true,
  } = options;

  // ========== ESTADO ==========
  const [config, setConfig] = useState<MqttConfig | null>(null);
  const [metadata, setMetadata] = useState<MqttCredentialsMetadata | null>(null);
  const [status, setStatus] = useState<MqttStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  // Refs para timers y tracking
  const renewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const expiryTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialFetchRef = useRef(true);

  // ========== GENERAR CREDENCIALES ==========
  const generateCredentials = useCallback(
    async (isRenewal: boolean = false) => {
      setIsLoading(true);
      setError(null);
      setIsExpired(false);

      try {
        const response = await fetch(`/api/datasets/${datasetId}/mqtt-credentials`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result: MqttCredentialsResponse = await response.json();

        if (!response.ok) {
          throw new Error(result.message || 'Failed to generate MQTT credentials');
        }

        // Actualizar estado
        setConfig(result.data.config);
        setMetadata(result.data.metadata);

        // Callbacks
        if (isRenewal) {
          if (onCredentialsRenewed) {
            onCredentialsRenewed(result.data.config, result.data.metadata);
          }
          toast.success('MQTT Credentials Renewed', {
            description: 'Connection credentials updated successfully',
          });
        } else {
          if (onCredentialsGenerated) {
            onCredentialsGenerated(result.data.config, result.data.metadata);
          }
        }

        // Configurar auto-renovación
        if (autoRenew) {
          setupAutoRenewal(result.data.metadata);
        }

        return result.data;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);

        if (onError) {
          onError(errorMessage);
        } else {
          toast.error('MQTT Error', {
            description: errorMessage,
          });
        }

        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [datasetId, autoRenew, onCredentialsGenerated, onCredentialsRenewed, onError]
  );

  // ========== CONFIGURAR AUTO-RENOVACIÓN ==========
  const setupAutoRenewal = useCallback(
    (meta: MqttCredentialsMetadata) => {
      // Limpiar timers existentes
      if (renewTimerRef.current) {
        clearTimeout(renewTimerRef.current);
      }
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }

      const now = Date.now();
      const renewAt = new Date(meta.renewAt).getTime();
      const expiresAt = new Date(meta.expiresAt).getTime();

      const timeUntilRenew = renewAt - now;
      const timeUntilExpiry = expiresAt - now;

      // Timer para renovar
      if (timeUntilRenew > 0) {
        renewTimerRef.current = setTimeout(() => {
          console.log('🔄 Auto-renewing MQTT credentials...');
          generateCredentials(true);
        }, timeUntilRenew);
      }

      // Timer para marcar como expirado
      if (timeUntilExpiry > 0) {
        expiryTimerRef.current = setTimeout(() => {
          console.warn('⚠️ MQTT credentials expired');
          setIsExpired(true);
          if (onCredentialsExpired) {
            onCredentialsExpired();
          }
          toast.warning('MQTT Credentials Expired', {
            description: 'Please refresh to reconnect',
          });
        }, timeUntilExpiry);
      }
    },
    [generateCredentials, onCredentialsExpired]
  );

  // ========== OBTENER STATUS MQTT ==========
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/datasets/${datasetId}/mqtt-credentials`, {
        method: 'GET',
      });

      const result: MqttStatusResponse = await response.json();

      if (!response.ok) {
        throw new Error('Failed to fetch MQTT status');
      }

      setStatus(result.data);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching MQTT status:', errorMessage);
      return null;
    }
  }, [datasetId]);

  // ========== CARGA INICIAL ==========
  useEffect(() => {
    if (autoFetch && isInitialFetchRef.current) {
      generateCredentials(false);
      fetchStatus();
      isInitialFetchRef.current = false;
    }
  }, [autoFetch, generateCredentials, fetchStatus]);

  // ========== CLEANUP ==========
  useEffect(() => {
    return () => {
      if (renewTimerRef.current) {
        clearTimeout(renewTimerRef.current);
      }
      if (expiryTimerRef.current) {
        clearTimeout(expiryTimerRef.current);
      }
    };
  }, []);

  // ========== MÉTODOS PÚBLICOS ==========

  /**
   * Renovar credenciales manualmente
   */
  const renewCredentials = useCallback(() => {
    return generateCredentials(true);
  }, [generateCredentials]);

  /**
   * Verificar si las credenciales están cerca de expirar
   */
  const isNearExpiry = useCallback(() => {
    if (!metadata) return false;
    const now = Date.now();
    const expiresAt = new Date(metadata.expiresAt).getTime();
    const timeUntilExpiry = expiresAt - now;
    return timeUntilExpiry < renewBeforeExpiry * 1000;
  }, [metadata, renewBeforeExpiry]);

  /**
   * Obtener tiempo restante hasta expiración (en segundos)
   */
  const getTimeUntilExpiry = useCallback(() => {
    if (!metadata) return null;
    const now = Date.now();
    const expiresAt = new Date(metadata.expiresAt).getTime();
    const timeUntilExpiry = expiresAt - now;
    return Math.max(0, Math.floor(timeUntilExpiry / 1000));
  }, [metadata]);

  /**
   * Obtener tiempo restante hasta renovación (en segundos)
   */
  const getTimeUntilRenewal = useCallback(() => {
    if (!metadata) return null;
    const now = Date.now();
    const renewAt = new Date(metadata.renewAt).getTime();
    const timeUntilRenew = renewAt - now;
    return Math.max(0, Math.floor(timeUntilRenew / 1000));
  }, [metadata]);

  /**
   * Validar si el dataset tiene MQTT configurado
   */
  const isMqttConfigured = useCallback(() => {
    return status?.isMqttConfigured ?? false;
  }, [status]);

  /**
   * Verificar si hay conexión activa (basado en lastDataReceived)
   */
  const isLikelyConnected = useCallback(() => {
    return status?.isLikelyConnected ?? false;
  }, [status]);

  /**
   * Obtener información de conexión formateada
   */
  const getConnectionInfo = useCallback(() => {
    if (!config || !metadata || !status) return null;

    return {
      broker: status.broker,
      topic: status.topic,
      clientId: config.clientId,
      permissions: metadata.permissions,
      expiresAt: metadata.expiresAt,
      renewAt: metadata.renewAt,
      timeUntilExpiry: getTimeUntilExpiry(),
      timeUntilRenewal: getTimeUntilRenewal(),
      isExpired,
      isNearExpiry: isNearExpiry(),
      lastDataReceived: status.lastDataReceived,
      avgUpdateFrequency: status.avgUpdateFrequency,
    };
  }, [config, metadata, status, isExpired, isNearExpiry, getTimeUntilExpiry, getTimeUntilRenewal]);

  // ========== RETURN ==========
  return {
    // Estado principal
    config,
    metadata,
    status,
    isLoading,
    error,
    isExpired,

    // Acciones
    generateCredentials,
    renewCredentials,
    fetchStatus,

    // Utilidades de validación
    isMqttConfigured,
    isLikelyConnected,
    isNearExpiry,

    // Utilidades de tiempo
    getTimeUntilExpiry,
    getTimeUntilRenewal,
    getConnectionInfo,

    // Info útil
    hasCredentials: !!config,
    isReady: !!config && !isExpired && !error,
    needsRenewal: isNearExpiry(),
  };
}

// ============================================================================
// HOOK COMPLEMENTARIO: useMqttConnection
// ============================================================================

/**
 * Hook de nivel superior que combina credenciales + conexión MQTT real
 * Gestiona todo el ciclo de vida de la conexión MQTT con auto-reconexión
 */

import mqtt, { MqttClient } from 'mqtt';

export interface MqttMessage {
  topic: string;
  data: any;
  timestamp: Date;
  raw: Buffer;
}

export interface MqttConnectionStats {
  messagesReceived: number;
  messagesPerSecond: number;
  lastMessageAt: Date | null;
  averageLatency: number;
  reconnectCount: number;
}

export interface UseMqttConnectionOptions extends Omit<UseMqttCredentialsOptions, 'onError'> {
  // Callbacks de mensajes
  onMessage?: (topic: string, message: any, raw: Buffer) => void;
  
  // Callbacks de conexión
  onConnect?: () => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
  onError?: (error: Error) => void;
  
  // Configuración de mensajes
  maxMessages?: number; // Max mensajes guardados en memoria (default: 1000)
  parseJson?: boolean; // Auto-parse JSON messages (default: true)
  
  // Reconexión
  autoReconnect?: boolean; // Default: true
  maxReconnectAttempts?: number; // Default: infinito
}

export function useMqttConnection(
  datasetId: string,
  options: UseMqttConnectionOptions = {}
) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onReconnect,
    onError,
    maxMessages = 1000,
    parseJson = true,
    autoReconnect = true,
    maxReconnectAttempts,
    ...credentialsOptions
  } = options;

  // Hook de credenciales
  const credentials = useMqttCredentials(datasetId, {
    ...credentialsOptions,
    autoFetch: true,
    autoRenew: true,
    onCredentialsRenewed: (config, metadata) => {
      // Cuando se renuevan las credenciales, reconectar con las nuevas
      console.log('🔄 MQTT credentials renewed, reconnecting...');
      reconnectWithNewCredentials(config);
      
      if (credentialsOptions.onCredentialsRenewed) {
        credentialsOptions.onCredentialsRenewed(config, metadata);
      }
    },
    onCredentialsExpired: () => {
      // Desconectar si las credenciales expiran
      console.warn('⚠️ MQTT credentials expired, disconnecting...');
      if (clientRef.current) {
        clientRef.current.end(true);
      }
      setIsConnected(false);
      
      if (credentialsOptions.onCredentialsExpired) {
        credentialsOptions.onCredentialsExpired();
      }
    },
  });

  // Estado de conexión
  const [client, setClient] = useState<MqttClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [messages, setMessages] = useState<MqttMessage[]>([]);
  const [stats, setStats] = useState<MqttConnectionStats>({
    messagesReceived: 0,
    messagesPerSecond: 0,
    lastMessageAt: null,
    averageLatency: 0,
    reconnectCount: 0,
  });

  // Refs
  const clientRef = useRef<MqttClient | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const messageCountRef = useRef(0);
  const lastSecondRef = useRef(Date.now());

  // ========== RECONECTAR CON NUEVAS CREDENCIALES ==========
  const reconnectWithNewCredentials = useCallback((newConfig: MqttConfig) => {
    if (!clientRef.current) return;

    const oldClient = clientRef.current;
    
    // Desconectar cliente viejo
    oldClient.end(true, () => {
      console.log('🔌 Old MQTT client disconnected');
    });

    // Crear nuevo cliente con las nuevas credenciales
    const { protocol, ...mqttOptionsRest } = newConfig.options;
    const clientOptions: any = {
      clientId: newConfig.clientId,
      username: newConfig.username,
      password: newConfig.password,
      ...mqttOptionsRest,
      reconnectPeriod: autoReconnect ? 5000 : 0,
    };
    if (protocol && ['mqtt', 'mqtts', 'ws', 'wss'].includes(protocol)) {
      clientOptions.protocol = protocol as 'mqtt' | 'mqtts' | 'ws' | 'wss';
    }
    const newClient = mqtt.connect(newConfig.broker, clientOptions);

    setupClientHandlers(newClient, newConfig.topic);
    clientRef.current = newClient;
    setClient(newClient);
  }, [autoReconnect]);

  // ========== CONFIGURAR HANDLERS DEL CLIENTE ==========
  const setupClientHandlers = useCallback((
    mqttClient: MqttClient,
    topic: string
  ) => {
    mqttClient.on('connect', () => {
      console.log('✅ MQTT connected to', topic);
      setIsConnected(true);
      setIsConnecting(false);
      reconnectAttemptsRef.current = 0;

      // Suscribirse al topic
      mqttClient.subscribe(topic, (err) => {
        if (err) {
          console.error('❌ Subscribe error:', err);
          toast.error('MQTT Subscribe Error', {
            description: err.message,
          });
        } else {
          console.log('📡 Subscribed to', topic);
        }
      });

      if (onConnect) onConnect();
    });

    mqttClient.on('message', (receivedTopic, message) => {
      const now = Date.now();
      
      // Parsear mensaje
      let data: any = message;
      if (parseJson) {
        try {
          data = JSON.parse(message.toString());
        } catch (err) {
          console.warn('Failed to parse JSON message:', err);
        }
      }

      // Crear mensaje
      const mqttMessage: MqttMessage = {
        topic: receivedTopic,
        data,
        timestamp: new Date(),
        raw: message,
      };

      // Agregar a lista (mantener solo los últimos N)
      setMessages(prev => {
        const updated = [mqttMessage, ...prev];
        return updated.slice(0, maxMessages);
      });

      // Actualizar stats
      messageCountRef.current++;
      const secondsPassed = (now - lastSecondRef.current) / 1000;
      
      setStats(prev => ({
        messagesReceived: prev.messagesReceived + 1,
        messagesPerSecond: secondsPassed >= 1 
          ? messageCountRef.current / secondsPassed 
          : prev.messagesPerSecond,
        lastMessageAt: new Date(),
        averageLatency: prev.averageLatency, // TODO: calcular con timestamp del mensaje
        reconnectCount: prev.reconnectCount,
      }));

      // Reset contador cada segundo
      if (secondsPassed >= 1) {
        messageCountRef.current = 0;
        lastSecondRef.current = now;
      }

      // Callback
      if (onMessage) onMessage(receivedTopic, data, message);
    });

    mqttClient.on('error', (err) => {
      console.error('❌ MQTT error:', err);
      
      if (onError) {
        onError(err);
      } else {
        toast.error('MQTT Error', {
          description: err.message,
        });
      }
    });

    mqttClient.on('close', () => {
      console.log('🔌 MQTT connection closed');
      setIsConnected(false);
      if (onDisconnect) onDisconnect();
    });

    mqttClient.on('reconnect', () => {
      console.log('🔄 MQTT reconnecting...');
      setIsConnecting(true);
      reconnectAttemptsRef.current++;
      
      setStats(prev => ({
        ...prev,
        reconnectCount: prev.reconnectCount + 1,
      }));

      // Check max reconnect attempts
      if (maxReconnectAttempts && reconnectAttemptsRef.current >= maxReconnectAttempts) {
        console.warn(`⚠️ Max reconnect attempts (${maxReconnectAttempts}) reached`);
        mqttClient.end(true);
        toast.error('Connection Failed', {
          description: `Failed to reconnect after ${maxReconnectAttempts} attempts`,
        });
        return;
      }

      if (onReconnect) onReconnect();
    });

    mqttClient.on('offline', () => {
      console.log('📴 MQTT offline');
      setIsConnected(false);
    });
  }, [onMessage, onConnect, onDisconnect, onReconnect, onError, parseJson, maxMessages, maxReconnectAttempts]);

  // ========== CONECTAR CUANDO LAS CREDENCIALES ESTÉN LISTAS ==========
  useEffect(() => {
    if (!credentials.config) return;

    const { protocol, ...mqttOptionsRest } = credentials.config.options;
    const clientOptions: any = {
      clientId: credentials.config.clientId,
      username: credentials.config.username,
      password: credentials.config.password,
      ...mqttOptionsRest,
      reconnectPeriod: autoReconnect ? 5000 : 0,
    };
    if (protocol && ['mqtt', 'mqtts', 'ws', 'wss'].includes(protocol)) {
      clientOptions.protocol = protocol as 'mqtt' | 'mqtts' | 'ws' | 'wss';
    }
    const mqttClient = mqtt.connect(credentials.config.broker, clientOptions);

    setupClientHandlers(mqttClient, credentials.config.topic);
    clientRef.current = mqttClient;
    setClient(mqttClient);

    return () => {
      console.log('🧹 Cleaning up MQTT connection');
      if (mqttClient) {
        mqttClient.end(true);
      }
    };
  }, [credentials.isReady, credentials.config, autoReconnect, setupClientHandlers]);

  // ========== DESCONECTAR SI EXPIRAN LAS CREDENCIALES ==========
  useEffect(() => {
    if (credentials.isExpired && clientRef.current) {
      console.warn('⚠️ Credentials expired, disconnecting MQTT...');
      clientRef.current.end(true);
      setClient(null);
      clientRef.current = null;
    }
  }, [credentials.isExpired]);

  // ========== MÉTODOS PÚBLICOS ==========

  /**
   * Desconectar manualmente
   */
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true);
      setClient(null);
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  /**
   * Reconectar manualmente
   */
  const reconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.reconnect();
    }
  }, []);

  /**
   * Limpiar mensajes almacenados
   */
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  /**
   * Obtener últimos N mensajes
   */
  const getLastMessages = useCallback((count: number = 10) => {
    return messages.slice(0, count);
  }, [messages]);

  /**
   * Publicar mensaje (si tienes permisos)
   */
  const publish = useCallback((topic: string, message: string | object, opts?: any) => {
    if (!clientRef.current || !isConnected) {
      toast.error('Not connected', {
        description: 'Cannot publish message while disconnected',
      });
      return;
    }

    const payload = typeof message === 'string' ? message : JSON.stringify(message);
    
    clientRef.current.publish(topic, payload, opts, (err) => {
      if (err) {
        console.error('Publish error:', err);
        toast.error('Publish Error', {
          description: err.message,
        });
      }
    });
  }, [isConnected]);

  // ========== RETURN ==========
  return {
    // Estado del hook de credenciales
    ...credentials,

    // Estado de conexión MQTT
    client,
    isConnected,
    isConnecting,
    messages,
    stats,

    // Acciones
    disconnect,
    reconnect,
    clearMessages,
    getLastMessages,
    publish,

    // Info útil
    hasMessages: messages.length > 0,
    messageCount: messages.length,
    isReady: credentials.isReady && isConnected,
  };
}