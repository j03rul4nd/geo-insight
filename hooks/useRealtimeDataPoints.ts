/**
 * Hook para gestionar data points en tiempo real con WebSocket
 * 
 * ACTUALIZADO para el nuevo esquema Prisma:
 * - x, y, z, sensorType, unit ahora están en metadata (JSON)
 * - Solo campos directos: id, datasetId, value, sensorId, timestamp
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { toast } from 'sonner';

// ============================================================================
// TIPOS
// ============================================================================

export interface DataPoint {
  id: string;
  datasetId: string;
  value: number;
  sensorId: string;
  timestamp: Date | string;
  metadata?: {
    x?: number;
    y?: number;
    z?: number;
    sensorType?: string;
    unit?: string;
    [key: string]: any; // Otros campos custom
  };
}

export interface Alert {
  id: string;
  datasetId: string;
  name: string;
  condition: string;
  thresholdValue: number;
  currentValue: number;
  severity: 'info' | 'warning' | 'critical';
  status: 'active' | 'acknowledged' | 'resolved' | 'muted';
  message: string;
  triggeredAt: Date | string;
}

export interface DataPointsMetadata {
  count: number;
  limit: number;
  hasMore: boolean;
  filters: {
    sensorType: string | null;
    sensorId: string | null;
  };
}

// WebSocket message types
type WSMessage = 
  | { type: 'connected'; message: string }
  | { type: 'auth_success'; userId: string; datasets: any[] }
  | { type: 'subscribed'; datasetId: string; message: string; broker?: string }
  | { type: 'unsubscribed'; datasetId: string }
  | { type: 'datapoint'; datasetId: string; data: DataPoint }
  | { type: 'datapoint_raw'; datasetId: string; data: any } 
  | { type: 'alert'; datasetId: string; alert: Alert }
  | { type: 'history'; datasetId: string; data: DataPoint[]; count: number }
  | { type: 'error'; message: string };

type ConnectionStatus = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'authenticating'
  | 'authenticated' 
  | 'subscribed'
  | 'error';

export interface UseRealtimeDataPointsOptions {
  initialLimit?: number;
  autoConnect?: boolean;
  initialFilters?: {
    sensorType?: string;
    sensorId?: string;
  };
  onDataReceived?: (point: DataPoint) => void;
  onAlertReceived?: (alert: Alert) => void;
  onRawDataReceived?: (rawData: any) => void;
  onError?: (error: string) => void;
  onConnectionChange?: (status: ConnectionStatus) => void;
  silentErrors?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useRealtimeDataPoints(
  datasetId: string,
  options: UseRealtimeDataPointsOptions = {}
) {
  const {
    initialLimit = 1000,
    autoConnect = true,
    initialFilters = {},
    onDataReceived,
    onAlertReceived,
    onRawDataReceived,
    onError,
    onConnectionChange,
    silentErrors = false,
    reconnectInterval = 3000,
    maxReconnectAttempts = -1,
  } = options;

  // ========== CLERK AUTH ==========
  const { getToken, isLoaded: authLoaded, userId } = useAuth();

  // ========== ESTADO ==========
  const [dataPoints, setDataPoints] = useState<DataPoint[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metadata, setMetadata] = useState<DataPointsMetadata>({
    count: 0,
    limit: initialLimit,
    hasMore: false,
    filters: {
      sensorType: initialFilters.sensorType ?? null,
      sensorId: initialFilters.sensorId ?? null,
    },
  });
  
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmpty, setIsEmpty] = useState(false);
  
  const [filters, setFilters] = useState(initialFilters);
  const [limit, setLimit] = useState(initialLimit);

  // ========== REFS ==========
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isSubscribedRef = useRef(false);
  const mountedRef = useRef(true);

  const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';

  // ========== HELPERS ==========
  
  // Helper para extraer sensorType de metadata
  const getSensorType = useCallback((point: DataPoint): string | null => {
    return point.metadata?.sensorType ?? null;
  }, []);

  // ========== NOTIFICAR CAMBIO DE STATUS ==========
  const updateStatus = useCallback((newStatus: ConnectionStatus) => {
    setStatus(newStatus);
    if (onConnectionChange) {
      onConnectionChange(newStatus);
    }
  }, [onConnectionChange]);

  // ========== CONECTAR WEBSOCKET ==========
  const connect = useCallback(async () => {
    if (wsRef.current) {
      const currentState = wsRef.current.readyState;
      if (currentState === WebSocket.OPEN || currentState === WebSocket.CONNECTING) {
        console.log('⚠️ Connection already exists, state:', currentState);
        return;
      }
      if (currentState === WebSocket.CLOSED || currentState === WebSocket.CLOSING) {
        wsRef.current = null;
      }
    }

    if (!authLoaded || !userId) {
      console.log('⏳ Waiting for Clerk authentication...');
      return;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    updateStatus('connecting');
    setError(null);

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      let authTimeout: NodeJS.Timeout | null = null;

      ws.onopen = async () => {
        console.log('✅ WebSocket connected to', WS_URL);
        updateStatus('connected');
        reconnectAttemptsRef.current = 0;

        updateStatus('authenticating');
        
        try {
          const token = await getToken();
          
          if (!token) {
            throw new Error('Failed to get authentication token');
          }

          if (ws.readyState !== WebSocket.OPEN) {
            console.log('⚠️ Connection closed before auth');
            return;
          }
          console.log('🔐 Sending auth token...');
          ws.send(JSON.stringify({ 
            type: 'auth', 
            token 
          }));

          authTimeout = setTimeout(() => {
            if (status !== 'authenticated' && status !== 'subscribed') {
              console.error('❌ Authentication timeout - no response from server');
              ws.close(4008, 'Authentication timeout');
            }
          }, 10000);

        } catch (err) {
          console.error('❌ Error getting token:', err);
          ws.close(4002, 'Token error');
        }
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;

        try {
          const message: WSMessage = JSON.parse(event.data);
          // console.log('📨 WS message:', message.type, message);
          
          if (message.type === 'auth_success' && authTimeout) {
            clearTimeout(authTimeout);
            authTimeout = null;
          }

          handleWebSocketMessage(message);
        } catch (err) {
          console.error('❌ Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        console.error('❌ WebSocket error:', event);
        updateStatus('error');
        setError('WebSocket connection error');
        
        if (authTimeout) {
          clearTimeout(authTimeout);
          authTimeout = null;
        }
      };

      ws.onclose = (event) => {
        console.log(`🔌 WebSocket closed: code=${event.code}, reason="${event.reason}"`);
        
        if (authTimeout) {
          clearTimeout(authTimeout);
          authTimeout = null;
        }

        if (wsRef.current === ws) {
          updateStatus('disconnected');
          wsRef.current = null;
          isSubscribedRef.current = false;
        }

        const shouldReconnect = 
          mountedRef.current && 
          wsRef.current === ws &&
          event.code !== 1000 &&
          event.code !== 1001 &&
          event.code !== 4001 &&
          event.code !== 4002 &&
          event.code !== 4004 &&
          (maxReconnectAttempts === -1 || reconnectAttemptsRef.current < maxReconnectAttempts);

        if (shouldReconnect) {
          reconnectAttemptsRef.current++;
          console.log(`🔄 Reconnecting in ${reconnectInterval}ms... (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Connection failed';
      console.error('❌ Connection error:', errorMessage);
      updateStatus('error');
      setError(errorMessage);
      
      if (!silentErrors && onError) {
        onError(errorMessage);
      }
    }
  }, [authLoaded, userId, getToken, WS_URL, reconnectInterval, maxReconnectAttempts, 
      silentErrors, onError, updateStatus, status]);

  // ========== MANEJAR MENSAJES WEBSOCKET ==========
  const handleWebSocketMessage = useCallback((message: WSMessage) => {
    switch (message.type) {
      case 'connected':
        console.log('📡', message.message);
        break;
      case 'datapoint_raw': 
        console.log('📨 Raw datapoint received:', message.data);
        
        if (onRawDataReceived) {
          onRawDataReceived(message.data);
        }
        break;

      case 'auth_success':
        console.log('✅ Authenticated as:', message.userId);
        console.log('📊 Available datasets:', message.datasets?.length || 0);
        updateStatus('authenticated');
        
        if (!isSubscribedRef.current && wsRef.current?.readyState === WebSocket.OPEN) {
          console.log('📊 Auto-subscribing to dataset:', datasetId);
          wsRef.current.send(JSON.stringify({ 
            type: 'subscribe', 
            datasetId 
          }));
        }
        break;

      case 'subscribed':
        console.log('✅ Subscribed to dataset:', message.datasetId);
        console.log('📡 Broker:', message.broker);
        isSubscribedRef.current = true;
        updateStatus('subscribed');
        setIsLoading(false);
        
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          console.log('📚 Requesting history...');
          wsRef.current.send(JSON.stringify({
            type: 'get_history',
            datasetId,
            limit,
            ...filters
          }));
        }
        break;

      case 'datapoint':
        const newPoint: DataPoint = {
          ...message.data,
          timestamp: new Date(message.data.timestamp),
        };

        console.log('📊 New datapoint:', {
          sensorId: newPoint.sensorId,
          sensorType: newPoint.metadata?.sensorType,
          value: newPoint.value,
          timestamp: newPoint.timestamp
        });

        setDataPoints(prev => {
          const exists = prev.some(p => p.id === newPoint.id);
          if (exists) return prev;

          // Aplicar filtros (ahora desde metadata)
          if (filters.sensorType && newPoint.metadata?.sensorType !== filters.sensorType) {
            return prev;
          }
          if (filters.sensorId && newPoint.sensorId !== filters.sensorId) {
            return prev;
          }

          const updated = [newPoint, ...prev];
          return updated.slice(0, limit);
        });

        setIsEmpty(false);

        if (onDataReceived) {
          onDataReceived(newPoint);
        }

        setMetadata(prev => ({
          ...prev,
          count: prev.count + 1,
        }));
        break;

      case 'alert':
        const newAlert: Alert = {
          ...message.alert,
          triggeredAt: new Date(message.alert.triggeredAt),
        };

        console.log('🚨 New alert:', newAlert.severity, newAlert.message);

        setAlerts(prev => {
          const exists = prev.some(a => a.id === newAlert.id);
          if (exists) return prev;
          return [newAlert, ...prev].slice(0, 50);
        });

        if (onAlertReceived) {
          onAlertReceived(newAlert);
        }

        if (!silentErrors) {
          toast.warning('New Alert', {
            description: newAlert.message,
          });
        }
        break;

      case 'history':
        console.log(`📊 Received ${message.count} historical points`);
        
        const historicalPoints = message.data.map(p => ({
          ...p,
          timestamp: new Date(p.timestamp),
        }));

        setDataPoints(historicalPoints);
        setIsEmpty(historicalPoints.length === 0);
        setMetadata(prev => ({
          ...prev,
          count: message.count,
          hasMore: message.count >= limit,
        }));

        if (historicalPoints.length === 0) {
          console.log('ℹ️ Dataset is empty - waiting for incoming data...');
        }
        break;

      case 'unsubscribed':
        console.log('🔕 Unsubscribed from dataset:', message.datasetId);
        isSubscribedRef.current = false;
        break;

      case 'error':
        console.error('❌ Server error:', message.message);
        setError(message.message);
        
        if (!silentErrors && onError) {
          onError(message.message);
        }
        break;
    }
  }, [datasetId, filters, limit, onDataReceived, onRawDataReceived, onAlertReceived, onError, 
      silentErrors, updateStatus]);

  // ========== DESCONECTAR ==========
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    isSubscribedRef.current = false;
    updateStatus('disconnected');
  }, [updateStatus]);

  // ========== RECONECTAR MANUALMENTE ==========
  const reconnect = useCallback(() => {
    disconnect();
    reconnectAttemptsRef.current = 0;
    connect();
  }, [disconnect, connect]);

  // ========== SOLICITAR HISTORIAL ==========
  const getHistory = useCallback((options?: {
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) => {
    if (wsRef.current?.readyState === WebSocket.OPEN && isSubscribedRef.current) {
      wsRef.current.send(JSON.stringify({
        type: 'get_history',
        datasetId,
        limit: options?.limit || limit,
        startDate: options?.startDate,
        endDate: options?.endDate,
        ...filters,
      }));
    }
  }, [datasetId, limit, filters]);

  // ========== ACTUALIZAR FILTROS ==========
  const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setMetadata(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        sensorType: newFilters.sensorType !== undefined ? newFilters.sensorType : null,
        sensorId: newFilters.sensorId !== undefined ? newFilters.sensorId : null,
      },
    }));

    getHistory();
  }, [getHistory]);

  // ========== LIMPIAR FILTROS ==========
  const clearFilters = useCallback(() => {
    setFilters({});
    setMetadata(prev => ({
      ...prev,
      filters: { sensorType: null, sensorId: null },
    }));
    getHistory();
  }, [getHistory]);

  // ========== ACTUALIZAR LÍMITE ==========
  const updateLimit = useCallback((newLimit: number) => {
    const clampedLimit = Math.min(newLimit, 5000);
    setLimit(clampedLimit);
    setMetadata(prev => ({ ...prev, limit: clampedLimit }));
    getHistory({ limit: clampedLimit });
  }, [getHistory]);

  // ========== LIMPIAR DATOS ==========
  const clearData = useCallback(() => {
    setDataPoints([]);
    setAlerts([]);
    setMetadata({
      count: 0,
      limit,
      hasMore: false,
      filters: {
        sensorType: filters.sensorType ?? null,
        sensorId: filters.sensorId ?? null,
      },
    });
    setIsEmpty(false);
  }, [limit, filters]);

  // ========== UTILIDADES ==========
  const getPointsBySensorType = useCallback((sensorType: string) => {
    return dataPoints.filter(p => p.metadata?.sensorType === sensorType);
  }, [dataPoints]);

  const getPointsBySensorId = useCallback((sensorId: string) => {
    return dataPoints.filter(p => p.sensorId === sensorId);
  }, [dataPoints]);

  const getStats = useCallback(() => {
    if (dataPoints.length === 0) return null;

    const values = dataPoints.map(p => p.value);
    const sensorTypes = new Set(
      dataPoints.map(p => p.metadata?.sensorType).filter(Boolean)
    );
    const sensorIds = new Set(dataPoints.map(p => p.sensorId).filter(Boolean));

    return {
      count: dataPoints.length,
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
      avgValue: values.reduce((a, b) => a + b, 0) / values.length,
      sensorTypeCount: sensorTypes.size,
      sensorIdCount: sensorIds.size,
      timeRange: {
        earliest: new Date(Math.min(...dataPoints.map(p => 
          new Date(p.timestamp).getTime()
        ))),
        latest: new Date(Math.max(...dataPoints.map(p => 
          new Date(p.timestamp).getTime()
        ))),
      },
    };
  }, [dataPoints]);

  // ========== EFECTOS ==========

  useEffect(() => {
    mountedRef.current = true;
    
    if (autoConnect && authLoaded && userId) {
      console.log('🚀 Auto-connecting on mount...');
      setIsLoading(true);
      connect();
    }

    return () => {
      console.log('🧹 Component unmounting, cleaning up...');
      mountedRef.current = false;
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      
      if (wsRef.current) {
        const ws = wsRef.current;
        wsRef.current = null;
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          ws.close(1000, 'Component unmounted');
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (autoConnect && authLoaded && userId && !wsRef.current && mountedRef.current) {
      console.log('🔄 Auth loaded, connecting...');
      setIsLoading(true);
      connect();
    }
  }, [autoConnect, authLoaded, userId, connect]);

  useEffect(() => {
    if (status === 'authenticated' && !isSubscribedRef.current) {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ 
          type: 'subscribe', 
          datasetId 
        }));
      }
    }
  }, [datasetId, status]);

  // ========== RETURN ==========
  return {
    dataPoints,
    alerts,
    metadata,
    status,
    isLoading,
    error,
    isEmpty,

    isConnected: status === 'subscribed',
    isAuthenticated: status === 'authenticated' || status === 'subscribed',

    filters,
    limit,

    connect,
    disconnect,
    reconnect,

    getHistory,
    clearData,

    updateFilters,
    clearFilters,
    updateLimit,

    getPointsBySensorType,
    getPointsBySensorId,
    getStats,

    hasData: dataPoints.length > 0,
    hasAlerts: alerts.length > 0,
  };
}