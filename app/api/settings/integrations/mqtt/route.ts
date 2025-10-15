/**
 * MQTT CONNECTION TEST ENDPOINT
 * 
 * POST - OBJETIVO:
 * Validar que las credenciales MQTT funcionan antes de guardar el dataset.
 * Soporta HiveMQ Cloud con TLS/SSL (mqtts://) y WebSocket Secure (wss://)
 * 
 * MISIÓN:
 * - Body params:
 *   · mqttBroker (ej: "mqtts://xxx.s2.eu.hivemq.cloud:8883")
 *   · mqttUsername
 *   · mqttPassword
 *   · mqttTopic (opcional)
 * - Intentar conexión MQTT desde servidor
 * - Si OK: devolver {success: true, latency: 234ms}
 * - Si falla: devolver {success: false, error: "...", logs: [...]}
 * 
 * USADO POR:
 * - useDatasets hook -> testMQTTConnection()
 * - Modal de configuración MQTT en /datasets
 */

import { NextRequest, NextResponse } from 'next/server';
import mqtt from 'mqtt';
import { headers } from 'next/headers';

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  MAX_REQUESTS: 5,
  WINDOW_MS: 60000, // 1 minuto
};

const MQTT_CONFIG = {
  TIMEOUT_MS: 10000, // Aumentado a 10s para HiveMQ Cloud
  KEEPALIVE: 60,
  RECONNECT_PERIOD: 0,
  PROTOCOL_VERSION: 4, // MQTT 3.1.1
};

interface MqttTestRequest {
  mqttBroker: string;
  mqttUsername?: string;
  mqttPassword?: string;
  mqttTopic?: string;
}

interface ConnectionLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  details?: any;
}

interface MqttTestResponse {
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

/**
 * Logger de conexión
 */
class ConnectionLogger {
  private logs: ConnectionLog[] = [];

  log(level: 'info' | 'warn' | 'error', message: string, details?: any) {
    this.logs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      details,
    });
    
    // También log en consola para debugging
    const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    logMethod(`[MQTT ${level.toUpperCase()}] ${message}`, details || '');
  }

  getLogs(): ConnectionLog[] {
    return this.logs;
  }
}

/**
 * Valida y normaliza el broker URL
 */
function validateAndParseBrokerUrl(broker: string): { 
  valid: boolean; 
  url?: URL; 
  protocol?: string;
  error?: string;
} {
  try {
    // Intentar parsear como URL
    const url = new URL(broker);
    
    // Protocolos soportados
    const validProtocols = ['mqtt:', 'mqtts:', 'ws:', 'wss:'];
    
    if (!validProtocols.includes(url.protocol)) {
      return {
        valid: false,
        error: `Invalid protocol: ${url.protocol}. Must be mqtt://, mqtts://, ws://, or wss://`,
      };
    }

    // Validar que tenga host
    if (!url.hostname) {
      return {
        valid: false,
        error: 'Broker URL must include a hostname',
      };
    }

    return {
      valid: true,
      url,
      protocol: url.protocol,
    };
  } catch (err) {
    return {
      valid: false,
      error: `Invalid URL format: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Obtiene identificador del cliente para rate limiting
 */
async function getClientIdentifier(request: NextRequest): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  
  return forwarded?.split(',')[0] || realIp || 'unknown';
}

/**
 * Verifica el rate limit
 */
function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const clientData = rateLimitMap.get(clientId);

  // Limpiar entradas expiradas
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!clientData || clientData.resetTime < now) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT.WINDOW_MS,
    });
    return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - 1 };
  }

  if (clientData.count >= RATE_LIMIT.MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  clientData.count++;
  return { allowed: true, remaining: RATE_LIMIT.MAX_REQUESTS - clientData.count };
}

/**
 * Prueba la conexión MQTT con logging detallado
 */
async function testMqttConnection(config: MqttTestRequest): Promise<MqttTestResponse> {
  const logger = new ConnectionLogger();
  const startTime = Date.now();

  return new Promise((resolve) => {
    let isResolved = false;
    let client: mqtt.MqttClient | null = null;

    logger.log('info', 'Starting MQTT connection test', {
      broker: config.mqttBroker,
      username: config.mqttUsername ? '***' : 'none',
      topic: config.mqttTopic || 'none',
    });

    // Timeout global
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        logger.log('error', 'Connection timeout exceeded', {
          timeoutMs: MQTT_CONFIG.TIMEOUT_MS,
          elapsedMs: Date.now() - startTime,
        });
        
        if (client) {
          client.end(true);
        }
        
        resolve({
          success: false,
          error: `Connection timeout after ${MQTT_CONFIG.TIMEOUT_MS / 1000} seconds`,
          logs: logger.getLogs(),
        });
      }
    }, MQTT_CONFIG.TIMEOUT_MS);

    try {
      // Parsear broker URL primero
      const parsed = validateAndParseBrokerUrl(config.mqttBroker);
      if (!parsed.valid || !parsed.url) {
        logger.log('error', 'Invalid broker URL', { error: parsed.error });
        clearTimeout(timeoutId);
        resolve({
          success: false,
          error: parsed.error || 'Invalid broker URL',
          logs: logger.getLogs(),
        });
        return;
      }

      logger.log('info', 'Broker URL parsed successfully', {
        protocol: parsed.url.protocol,
        host: parsed.url.hostname,
        port: parsed.url.port,
      });

      // Detectar si es TLS/SSL
      const useTLS = parsed.protocol === 'mqtts:' || parsed.protocol === 'wss:';
      
      if (useTLS) {
        logger.log('info', 'TLS/SSL connection detected', {
          protocol: parsed.protocol,
        });
      }

      // Opciones de conexión para HiveMQ Cloud
      const options: mqtt.IClientOptions = {
        keepalive: MQTT_CONFIG.KEEPALIVE,
        connectTimeout: MQTT_CONFIG.TIMEOUT_MS,
        reconnectPeriod: MQTT_CONFIG.RECONNECT_PERIOD,
        clean: true,
        protocolVersion: MQTT_CONFIG.PROTOCOL_VERSION as 3 | 4 | 5,
        rejectUnauthorized: true, // Importante para TLS
      };

      // Agregar credenciales si existen
      if (config.mqttUsername) {
        options.username = config.mqttUsername;
        logger.log('info', 'Username configured', { username: config.mqttUsername });
      }
      
      if (config.mqttPassword) {
        options.password = config.mqttPassword;
        logger.log('info', 'Password configured', { length: config.mqttPassword.length });
      }

      // Conectar al broker
      logger.log('info', 'Attempting to connect to broker...');
      client = mqtt.connect(config.mqttBroker, options);

      // Evento: Conexión exitosa
      client.on('connect', (connack) => {
        if (isResolved) return;

        logger.log('info', 'Successfully connected to broker', {
          sessionPresent: connack.sessionPresent,
          returnCode: connack.returnCode,
        });

        // Si hay topic, intentar suscribirse
        if (config.mqttTopic && client) {
          logger.log('info', 'Attempting to subscribe to topic', {
            topic: config.mqttTopic,
          });

          client.subscribe(config.mqttTopic, { qos: 0 }, (err, granted) => {
            if (isResolved) return;
            
            isResolved = true;
            clearTimeout(timeoutId);
            
            const latency = Date.now() - startTime;
            
            if (err) {
              logger.log('error', 'Subscription failed', {
                error: err.message,
                topic: config.mqttTopic,
              });
              
              client?.end(true);
              resolve({
                success: false,
                error: `Connected but failed to subscribe: ${err.message}`,
                latency,
                logs: logger.getLogs(),
                connectionDetails: {
                  protocol: parsed.protocol!,
                  host: parsed.url!.hostname,
                  port: parsed.url!.port || (useTLS ? '8883' : '1883'),
                  useTLS,
                },
              });
            } else {
              logger.log('info', 'Successfully subscribed to topic', {
                topic: config.mqttTopic,
                granted: granted,
                latencyMs: latency,
              });
              
              client?.end(true);
              resolve({
                success: true,
                latency,
                message: `Connected and subscribed to ${config.mqttTopic}`,
                logs: logger.getLogs(),
                connectionDetails: {
                  protocol: parsed.protocol!,
                  host: parsed.url!.hostname,
                  port: parsed.url!.port || (useTLS ? '8883' : '1883'),
                  useTLS,
                },
              });
            }
          });
        } else {
          // Sin topic, solo confirmar conexión
          isResolved = true;
          clearTimeout(timeoutId);
          const latency = Date.now() - startTime;
          
          logger.log('info', 'Connection test completed successfully', {
            latencyMs: latency,
          });
          
          client?.end(true);
          resolve({
            success: true,
            latency,
            message: 'Connection successful',
            logs: logger.getLogs(),
            connectionDetails: {
              protocol: parsed.protocol!,
              host: parsed.url!.hostname,
              port: parsed.url!.port || (useTLS ? '8883' : '1883'),
              useTLS,
            },
          });
        }
      });

      // Evento: Error de conexión
      client.on('error', (err) => {
        if (isResolved) return;
        
        logger.log('error', 'Connection error occurred', {
          error: err.message,
          code: (err as any).code,
          errno: (err as any).errno,
          syscall: (err as any).syscall,
        });
        
        isResolved = true;
        clearTimeout(timeoutId);
        client?.end(true);
        
        // Mensajes de error más específicos
        let errorMessage = err.message;
        
        if (err.message.includes('ENOTFOUND')) {
          errorMessage = 'Broker hostname not found. Check your broker URL.';
        } else if (err.message.includes('ECONNREFUSED')) {
          errorMessage = 'Connection refused. Check if the broker is running and the port is correct.';
        } else if (err.message.includes('ETIMEDOUT')) {
          errorMessage = 'Connection timed out. The broker may be unreachable or behind a firewall.';
        } else if (err.message.includes('Not authorized') || err.message.includes('Connection refused: Not authorized')) {
          errorMessage = 'Authentication failed. Check your username and password.';
        }
        
        resolve({
          success: false,
          error: errorMessage,
          logs: logger.getLogs(),
        });
      });

      // Evento: Desconexión inesperada
      client.on('close', () => {
        if (isResolved) return;
        
        logger.log('warn', 'Connection closed unexpectedly');
        
        isResolved = true;
        clearTimeout(timeoutId);
        resolve({
          success: false,
          error: 'Connection closed unexpectedly',
          logs: logger.getLogs(),
        });
      });

      // Evento: Mensaje recibido (útil para debugging)
      client.on('message', (topic, message) => {
        logger.log('info', 'Message received', {
          topic,
          messageLength: message.length,
        });
      });

      // Evento: Offline
      client.on('offline', () => {
        logger.log('warn', 'Client went offline');
      });

      // Evento: Reconnect attempt
      client.on('reconnect', () => {
        logger.log('info', 'Attempting to reconnect...');
      });

    } catch (err) {
      if (!isResolved) {
        logger.log('error', 'Unexpected error during connection', {
          error: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
        });
        
        isResolved = true;
        clearTimeout(timeoutId);
        
        if (client) {
          client.end(true);
        }
        
        resolve({
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error occurred',
          logs: logger.getLogs(),
        });
      }
    }
  });
}

/**
 * POST /api/settings/integrations/mqtt
 * Test de conexión MQTT
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = await getClientIdentifier(request);
    const { allowed, remaining } = checkRateLimit(clientId);

    if (!allowed) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded. Maximum 5 tests per minute.',
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': RATE_LIMIT.MAX_REQUESTS.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(Date.now() + RATE_LIMIT.WINDOW_MS).toISOString(),
          },
        }
      );
    }

    // Parsear body
    let body: MqttTestRequest;
    try {
      body = await request.json();
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid JSON body',
        },
        { status: 400 }
      );
    }

    // Validaciones básicas
    if (!body.mqttBroker || typeof body.mqttBroker !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'mqttBroker is required and must be a string',
        },
        { status: 400 }
      );
    }

    // Validar formato de URL
    const parsed = validateAndParseBrokerUrl(body.mqttBroker);
    if (!parsed.valid) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error || 'Invalid broker URL format',
        },
        { status: 400 }
      );
    }

    console.log('🔌 Testing MQTT connection:', {
      broker: body.mqttBroker,
      username: body.mqttUsername || 'none',
      hasTopic: !!body.mqttTopic,
    });

    // Ejecutar test de conexión
    const result = await testMqttConnection(body);

    console.log(result.success ? '✅' : '❌', 'MQTT test result:', {
      success: result.success,
      latency: result.latency,
      error: result.error,
    });

    // Headers de respuesta
    const responseHeaders = {
      'X-RateLimit-Limit': RATE_LIMIT.MAX_REQUESTS.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
    };

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('❌ MQTT test connection error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/settings/integrations/mqtt
 * Información del endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/settings/integrations/mqtt',
    method: 'POST',
    description: 'Test MQTT broker connection (supports HiveMQ Cloud with TLS)',
    rateLimit: {
      max: RATE_LIMIT.MAX_REQUESTS,
      window: `${RATE_LIMIT.WINDOW_MS / 1000}s`,
    },
    timeout: `${MQTT_CONFIG.TIMEOUT_MS / 1000}s`,
    supportedProtocols: ['mqtt://', 'mqtts://', 'ws://', 'wss://'],
    body: {
      mqttBroker: 'string (required) - MQTT broker URL',
      mqttUsername: 'string (optional) - MQTT username',
      mqttPassword: 'string (optional) - MQTT password',
      mqttTopic: 'string (optional) - MQTT topic to test subscription',
    },
    examples: {
      hivemq_cloud: {
        mqttBroker: 'mqtts://9da7cd10c3c440aa9e8c2ac30e5a733b.s2.eu.hivemq.cloud:8883',
        mqttUsername: 'test_saas',
        mqttPassword: 'TestSaas1',
        mqttTopic: 'factory/sensors/#',
      },
      public_broker: {
        mqttBroker: 'mqtt://broker.hivemq.com:1883',
        mqttTopic: 'test/topic',
      },
    },
  });
}