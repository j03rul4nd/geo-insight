/**
 * useMQTTConnection.ts
 * 
 * MISIÓN:
 * Probar conexiones MQTT antes de crear un dataset, validando credenciales,
 * broker URL y topic. Proporciona feedback visual inmediato del estado de conexión.
 * 
 * PROPÓSITO:
 * - Evitar crear datasets con configuración MQTT incorrecta
 * - Dar feedback en tiempo real: 'testing' → 'success' | 'error'
 * - Cachear resultados temporalmente (30s) para evitar tests duplicados
 * - Auto-limpiar estado después de 3 segundos del resultado
 * 
 * ENDPOINT API QUE USA:
 * - POST /api/settings/integrations/mqtt → Test MQTT connection
 * 
 * PAYLOAD ENVIADO:
 * {
 *   brokerUrl: string,      // mqtt://broker.hivemq.com:1883
 *   topic: string,          // factory/sensors/#
 *   username?: string,      // Opcional
 *   password?: string,      // Opcional
 *   clientId?: string,      // Opcional (auto-generado si vacío)
 *   keepAlive?: number,     // Opcional (default 60)
 *   cleanSession?: boolean  // Opcional (default true)
 * }
 * 
 * RESPUESTA API:
 * {
 *   success: boolean,
 *   message?: string,       // En caso de error
 *   broker: string,         // Echo del broker conectado
 *   latencyMs?: number      // Tiempo de respuesta
 * }
 * 
 * DATOS PRISMA INVOLUCRADOS:
 * - No modifica DB directamente
 * - Se usa antes de crear Dataset con source: 'mqtt_stream'
 * 
 * USO EN COMPONENTE:
 * const { testConnection, status, lastError, reset } = useMQTTConnection();
 * 
 * // En modal de crear dataset (tab MQTT)
 * const handleTest = async () => {
 *   const result = await testConnection({
 *     brokerUrl: formData.brokerUrl,
 *     topic: formData.topic,
 *     username: formData.username,
 *     password: formData.password
 *   });
 *   
 *   if (result) {
 *     // Mostrar mensaje de éxito
 *   }
 * };
 * 
 * // Renderizado condicional
 * {status === 'testing' && <Spinner />}
 * {status === 'success' && <SuccessBanner broker={lastTestedBroker} />}
 * {status === 'error' && <ErrorBanner error={lastError} />}
 * 
 * ESTADOS A RETORNAR:
 * {
 *   testConnection: (config: MQTTConfig) => Promise<boolean>,
 *   status: 'idle' | 'testing' | 'success' | 'error',
 *   lastError: string | null,
 *   lastTestedBroker: string | null,
 *   lastSuccessAt: Date | null,
 *   reset: () => void
 * }
 * 
 * LÓGICA DE AUTO-LIMPIEZA:
 * - Al llegar a 'success' o 'error', iniciar timer de 3 segundos
 * - Después de 3s, volver a 'idle' automáticamente
 * - Limpiar timer si componente se desmonta
 * 
 * CACHÉ:
 * - Si se testea el mismo broker en <30s, devolver resultado cacheado
 * - Key de cache: `${brokerUrl}:${topic}:${username || 'anon'}`
 */
import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * MQTT Connection Configuration
 */
interface MQTTConfig {
  brokerUrl: string;
  topic?: string;
  username?: string;
  password?: string;
  clientId?: string;
  keepAlive?: number;
  cleanSession?: boolean;
}

/**
 * API Response Structure
 */
interface MQTTTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  latency?: number;
}

/**
 * Hook Return Type
 */
interface UseMQTTConnectionReturn {
  testConnection: (config: MQTTConfig) => Promise<boolean>;
  status: 'idle' | 'testing' | 'success' | 'error';
  lastError: string | null;
  lastTestedBroker: string | null;
  lastSuccessAt: Date | null;
  latency: number | null;
  reset: () => void;
}

/**
 * Cache Entry
 */
interface CacheEntry {
  success: boolean;
  timestamp: number;
  latency?: number;
}

// Cache Map (30s TTL)
const connectionCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 30000; // 30 segundos
const AUTO_RESET_DELAY_MS = 3000; // 3 segundos

/**
 * useMQTTConnection Hook
 * 
 * Prueba conexiones MQTT antes de crear datasets.
 * Incluye caché temporal, auto-limpieza y feedback visual.
 */
export function useMQTTConnection(): UseMQTTConnectionReturn {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastTestedBroker, setLastTestedBroker] = useState<string | null>(null);
  const [lastSuccessAt, setLastSuccessAt] = useState<Date | null>(null);
  const [latency, setLatency] = useState<number | null>(null);

  const autoResetTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Genera cache key único para la configuración MQTT
   */
  const getCacheKey = useCallback((config: MQTTConfig): string => {
    return `${config.brokerUrl}:${config.topic || 'no-topic'}:${config.username || 'anon'}`;
  }, []);

  /**
   * Limpia el timer de auto-reset
   */
  const clearAutoResetTimer = useCallback(() => {
    if (autoResetTimerRef.current) {
      clearTimeout(autoResetTimerRef.current);
      autoResetTimerRef.current = null;
    }
  }, []);

  /**
   * Inicia timer de auto-reset (3s después de success/error)
   */
  const startAutoReset = useCallback(() => {
    clearAutoResetTimer();
    autoResetTimerRef.current = setTimeout(() => {
      setStatus('idle');
      setLastError(null);
      setLatency(null);
    }, AUTO_RESET_DELAY_MS);
  }, [clearAutoResetTimer]);

  /**
   * Reset manual del estado
   */
  const reset = useCallback(() => {
    clearAutoResetTimer();
    setStatus('idle');
    setLastError(null);
    setLastTestedBroker(null);
    setLastSuccessAt(null);
    setLatency(null);
  }, [clearAutoResetTimer]);

  /**
   * Limpia cache entries expiradas
   */
  const cleanupCache = useCallback(() => {
    const now = Date.now();
    for (const [key, entry] of connectionCache.entries()) {
      if (now - entry.timestamp > CACHE_TTL_MS) {
        connectionCache.delete(key);
      }
    }
  }, []);

  /**
   * Verifica si existe resultado cacheado válido
   */
  const getCachedResult = useCallback((cacheKey: string): CacheEntry | null => {
    cleanupCache();
    const cached = connectionCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached;
    }
    
    return null;
  }, [cleanupCache]);

  /**
   * Guarda resultado en cache
   */
  const setCachedResult = useCallback((cacheKey: string, success: boolean, latency?: number) => {
    connectionCache.set(cacheKey, {
      success,
      timestamp: Date.now(),
      latency,
    });
  }, []);

  /**
   * Prueba la conexión MQTT
   */
  const testConnection = useCallback(async (config: MQTTConfig): Promise<boolean> => {
    // Validación básica
    if (!config.brokerUrl || !config.brokerUrl.trim()) {
      setStatus('error');
      setLastError('Broker URL is required');
      startAutoReset();
      return false;
    }

    const cacheKey = getCacheKey(config);

    // Verificar cache
    const cached = getCachedResult(cacheKey);
    if (cached) {
      console.log('[useMQTTConnection] Using cached result');
      setStatus(cached.success ? 'success' : 'error');
      setLastError(cached.success ? null : 'Connection failed (cached)');
      setLastTestedBroker(config.brokerUrl);
      setLatency(cached.latency || null);
      
      if (cached.success) {
        setLastSuccessAt(new Date());
      }
      
      startAutoReset();
      return cached.success;
    }

    // Iniciar test
    setStatus('testing');
    setLastError(null);
    setLastTestedBroker(config.brokerUrl);
    setLatency(null);
    clearAutoResetTimer();

    try {
      const response = await fetch('/api/mqtt/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mqttBroker: config.brokerUrl,
          mqttTopic: config.topic,
          mqttUsername: config.username,
          mqttPassword: config.password,
        }),
      });

      const data: MQTTTestResponse = await response.json();

      // Manejar rate limiting
      if (response.status === 429) {
        setStatus('error');
        setLastError('Rate limit exceeded. Please wait before testing again.');
        startAutoReset();
        return false;
      }

      // Guardar latencia si existe
      if (data.latency) {
        setLatency(data.latency);
      }

      if (data.success) {
        setStatus('success');
        setLastError(null);
        setLastSuccessAt(new Date());
        setCachedResult(cacheKey, true, data.latency);
        startAutoReset();
        return true;
      } else {
        setStatus('error');
        setLastError(data.error || data.message || 'Connection failed');
        setCachedResult(cacheKey, false);
        startAutoReset();
        return false;
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error occurred';
      setStatus('error');
      setLastError(errorMessage);
      setCachedResult(cacheKey, false);
      startAutoReset();
      return false;
    }
  }, [getCacheKey, getCachedResult, setCachedResult, startAutoReset, clearAutoResetTimer]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      clearAutoResetTimer();
    };
  }, [clearAutoResetTimer]);

  return {
    testConnection,
    status,
    lastError,
    lastTestedBroker,
    lastSuccessAt,
    latency,
    reset,
  };
}