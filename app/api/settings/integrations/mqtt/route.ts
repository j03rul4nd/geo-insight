/**
 * MQTT CONNECTION TEST ENDPOINT
 * 
 * POST - OBJETIVO:
 * Validar que las credenciales MQTT funcionan antes de guardar el dataset.
 * 
 * MISIÓN:
 * - Body params:
 *   · mqttBroker (ej: "mqtt://broker.hivemq.com:1883")
 *   · mqttUsername
 *   · mqttPassword
 *   · mqttTopic (opcional)
 * - Intentar conexión MQTT desde servidor:
 *   · Timeout de 5 segundos
 *   · Intentar SUBSCRIBE al topic (si se proporciona)
 * - Si OK: devolver {success: true, latency: 234ms}
 * - Si falla: devolver {success: false, error: "Connection refused"}
 * - NO guardar nada en DB (esto es solo validación)
 * 
 * USADO POR:
 * - Modal de "Configure MQTT" en /datasets
 * - Botón "Test Connection" antes de guardar
 * 
 * SEGURIDAD:
 * - Solo ejecutar desde servidor (evitar exponer broker desde cliente)
 * - Rate limit: máximo 5 tests por minuto por usuario
 * 
 * NOTA:
 * Esta es una función serverless de corta duración (<10s).
 * Si el test tarda más, devolver timeout error.
 * 
 * NO REQUIERE PRISMA (no accede a DB)
 */

import { NextRequest, NextResponse } from 'next/server';
import mqtt from 'mqtt';
import { headers } from 'next/headers';

// Rate limiting simple usando Map en memoria
// Para producción, considera usar Upstash Redis o similar
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Constantes de configuración
const RATE_LIMIT = {
  MAX_REQUESTS: 5,
  WINDOW_MS: 60000, // 1 minuto
};

const MQTT_CONFIG = {
  TIMEOUT_MS: 5000,
  KEEPALIVE: 30,
  RECONNECT_PERIOD: 0, // No reconectar automáticamente
};

interface MqttTestRequest {
  mqttBroker: string;
  mqttUsername?: string;
  mqttPassword?: string;
  mqttTopic?: string;
}

interface MqttTestResponse {
  success: boolean;
  latency?: number;
  error?: string;
  message?: string;
}

/**
 * Valida el formato del broker MQTT
 */
function validateBrokerUrl(broker: string): boolean {
  try {
    const url = new URL(broker);
    return ['mqtt:', 'mqtts:', 'ws:', 'wss:'].includes(url.protocol);
  } catch {
    return false;
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

  // Limpiar entradas expiradas periódicamente
  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (value.resetTime < now) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!clientData || clientData.resetTime < now) {
    // Nueva ventana de tiempo
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
 * Prueba la conexión MQTT
 */
async function testMqttConnection(config: MqttTestRequest): Promise<MqttTestResponse> {
  const startTime = Date.now();

  return new Promise((resolve) => {
    let isResolved = false;
    let client: mqtt.MqttClient | null = null;

    // Timeout global
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        isResolved = true;
        if (client) {
          client.end(true);
        }
        resolve({
          success: false,
          error: 'Connection timeout after 5 seconds',
        });
      }
    }, MQTT_CONFIG.TIMEOUT_MS);

    try {
      // Opciones de conexión
      const options: mqtt.IClientOptions = {
        keepalive: MQTT_CONFIG.KEEPALIVE,
        connectTimeout: MQTT_CONFIG.TIMEOUT_MS,
        reconnectPeriod: MQTT_CONFIG.RECONNECT_PERIOD,
        clean: true,
      };

      // Agregar credenciales si existen
      if (config.mqttUsername) {
        options.username = config.mqttUsername;
      }
      if (config.mqttPassword) {
        options.password = config.mqttPassword;
      }

      // Conectar al broker
      client = mqtt.connect(config.mqttBroker, options);

      // Evento: Conexión exitosa
      client.on('connect', () => {
        if (isResolved) return;

        // Si hay topic, intentar suscribirse
        if (config.mqttTopic && client) {
          client.subscribe(config.mqttTopic, { qos: 0 }, (err) => {
            if (isResolved) return;
            
            isResolved = true;
            clearTimeout(timeoutId);
            
            const latency = Date.now() - startTime;
            
            if (err) {
              client?.end(true);
              resolve({
                success: false,
                error: `Connected but failed to subscribe to topic: ${err.message}`,
                latency,
              });
            } else {
              client?.end(true);
              resolve({
                success: true,
                latency,
                message: `Connected and subscribed to ${config.mqttTopic}`,
              });
            }
          });
        } else {
          // Sin topic, solo confirmar conexión
          isResolved = true;
          clearTimeout(timeoutId);
          const latency = Date.now() - startTime;
          client?.end(true);
          resolve({
            success: true,
            latency,
            message: 'Connection successful',
          });
        }
      });

      // Evento: Error de conexión
      client.on('error', (err) => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timeoutId);
        client?.end(true);
        resolve({
          success: false,
          error: err.message || 'Connection failed',
        });
      });

      // Evento: Desconexión inesperada
      client.on('close', () => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timeoutId);
        resolve({
          success: false,
          error: 'Connection closed unexpectedly',
        });
      });

    } catch (err) {
      if (!isResolved) {
        isResolved = true;
        clearTimeout(timeoutId);
        if (client) {
          client.end(true);
        }
        resolve({
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }
  });
}

/**
 * POST /api/mqtt/test-connection
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
    const body: MqttTestRequest = await request.json();

    // Validaciones
    if (!body.mqttBroker || typeof body.mqttBroker !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'mqttBroker is required and must be a string',
        },
        { status: 400 }
      );
    }

    if (!validateBrokerUrl(body.mqttBroker)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid broker URL. Must use mqtt://, mqtts://, ws://, or wss:// protocol',
        },
        { status: 400 }
      );
    }

    // Ejecutar test de conexión
    const result = await testMqttConnection(body);

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
    console.error('MQTT test connection error:', error);
    
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
 * GET /api/mqtt/test-connection
 * Información del endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/mqtt/test-connection',
    method: 'POST',
    description: 'Test MQTT broker connection before saving dataset',
    rateLimit: {
      max: RATE_LIMIT.MAX_REQUESTS,
      window: `${RATE_LIMIT.WINDOW_MS / 1000}s`,
    },
    timeout: `${MQTT_CONFIG.TIMEOUT_MS / 1000}s`,
    body: {
      mqttBroker: 'string (required) - MQTT broker URL',
      mqttUsername: 'string (optional) - MQTT username',
      mqttPassword: 'string (optional) - MQTT password',
      mqttTopic: 'string (optional) - MQTT topic to test subscription',
    },
    example: {
      mqttBroker: 'mqtt://broker.hivemq.com:1883',
      mqttUsername: 'user',
      mqttPassword: 'pass',
      mqttTopic: 'sensors/temperature',
    },
  });
}