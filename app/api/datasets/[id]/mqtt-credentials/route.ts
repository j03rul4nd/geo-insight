/**
 * MQTT TEMPORARY CREDENTIALS ENDPOINT
 * 
 * POST - OBJETIVO:
 * Generar credenciales temporales (JWT) para que el navegador pueda conectarse
 * directamente al broker MQTT sin exponer credenciales permanentes.
 * 
 * MISIÓN:
 * - Validar ownership del dataset
 * - Generar JWT token con payload:
 *   · userId, datasetId, exp (expires en 1 hora)
 * - Devolver configuración completa para mqtt.connect():
 *   · broker (WSS URL del MQTT broker)
 *   · clientId único (web_userId_datasetId_timestamp)
 *   · username/password (token JWT)
 *   · topic (solo el permitido para este dataset)
 * - El broker MQTT debe validar estos tokens y aplicar ACLs:
 *   · Solo permitir SUBSCRIBE (no PUBLISH)
 *   · Solo permitir topics del dataset específico
 * - Token expira en 1h → cliente debe renovar automáticamente
 * 
 * USADO POR:
 * - MqttRealtimeViewer component en /datasets/[id]
 * - Se llama al montar el componente y cada 50 minutos
 * 
 * SEGURIDAD:
 * - Token no da acceso a otros datasets del usuario
 * - Solo lectura (SUBSCRIBE), no escritura
 * - Expira automáticamente
 * 
 * PRISMA MODELS:
 * - Dataset (id, userId, mqttTopic) - para validar ownership
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Tipos para el JWT payload
interface MqttJwtPayload {
  userId: string;
  datasetId: string;
  topic: string;
  permissions: 'subscribe' | 'publish' | 'subscribe_publish';
  exp: number;
  iat: number;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Autenticación
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: datasetId } = await params;

    // 2. Validar ownership y configuración MQTT
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
        source: 'mqtt_stream', // Solo datasets MQTT
      },
      select: {
        id: true,
        name: true,
        mqttBroker: true,
        mqttTopic: true,
        status: true,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found, access denied, or MQTT not configured' },
        { status: 404 }
      );
    }

    // 3. Validar que el dataset tenga configuración MQTT
    if (!dataset.mqttBroker || !dataset.mqttTopic) {
      return NextResponse.json(
        { 
          error: 'MQTT not configured for this dataset',
          message: 'Please configure MQTT broker and topic first',
        },
        { status: 400 }
      );
    }

    // 4. Generar JWT token temporal (expira en 1 hora)
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = 60 * 60; // 1 hora
    
    const payload: MqttJwtPayload = {
      userId: userId,
      datasetId: datasetId,
      topic: dataset.mqttTopic,
      permissions: 'subscribe', // Solo lectura para el navegador
      iat: now,
      exp: now + expiresIn,
    };

    const jwtSecret = process.env.MQTT_JWT_SECRET || process.env.JWT_SECRET || 'your-secret-key';
    const token = jwt.sign(payload, jwtSecret);

    // 5. Generar clientId único para esta sesión
    const timestamp = Date.now();
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const clientId = `web_${userId.substring(0, 8)}_${datasetId.substring(0, 8)}_${timestamp}_${randomSuffix}`;

    // 6. Convertir broker URL a WebSocket si es necesario
    let wssBrokerUrl = dataset.mqttBroker;
    
    // Si es TCP broker (mqtt://), convertir a WSS para navegador
    if (wssBrokerUrl.startsWith('mqtt://')) {
      wssBrokerUrl = wssBrokerUrl.replace('mqtt://', 'wss://');
      // Agregar puerto WSS por defecto si no existe
      if (!wssBrokerUrl.includes(':')) {
        wssBrokerUrl += ':8884'; // Puerto WSS estándar para MQTT
      }
    } else if (wssBrokerUrl.startsWith('mqtts://')) {
      wssBrokerUrl = wssBrokerUrl.replace('mqtts://', 'wss://');
    }
    
    // Asegurar que tenga /mqtt path si es necesario (para algunos brokers)
    if (!wssBrokerUrl.endsWith('/mqtt')) {
      wssBrokerUrl += '/mqtt';
    }

    // 7. Preparar configuración completa para mqtt.js en el cliente
    const mqttConfig = {
      broker: wssBrokerUrl,
      clientId: clientId,
      username: 'jwt', // Usuario especial que indica al broker validar JWT
      password: token, // El JWT como password
      topic: dataset.mqttTopic,
      options: {
        // Opciones recomendadas para mqtt.js
        clean: true,
        connectTimeout: 30000,
        reconnectPeriod: 5000,
        keepalive: 60,
        protocol: 'wss',
        // Solo suscripción, sin publicación
        will: {
          topic: `${dataset.mqttTopic}/status`,
          payload: JSON.stringify({
            clientId: clientId,
            status: 'disconnected',
            timestamp: new Date().toISOString(),
          }),
          qos: 0,
          retain: false,
        },
      },
    };

    // 8. Metadata adicional
    const expiresAt = new Date((now + expiresIn) * 1000);
    const renewAt = new Date((now + expiresIn - 600) * 1000); // Renovar 10 min antes

    return NextResponse.json({
      success: true,
      data: {
        config: mqttConfig,
        metadata: {
          datasetId: dataset.id,
          datasetName: dataset.name,
          expiresAt: expiresAt.toISOString(),
          renewAt: renewAt.toISOString(),
          expiresInSeconds: expiresIn,
          permissions: 'subscribe', // Solo lectura
          generatedAt: new Date().toISOString(),
        },
      },
      message: 'MQTT credentials generated successfully',
      warning: 'Token expires in 1 hour. Client should renew automatically.',
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating MQTT credentials:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : undefined,
      },
      { status: 500 }
    );
  }
}

// GET - Verificar estado de la conexión MQTT del dataset
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: datasetId } = await params;

    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        source: true,
        mqttBroker: true,
        mqttTopic: true,
        status: true,
        lastDataReceived: true,
        avgUpdateFreq: true,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied' },
        { status: 404 }
      );
    }

    // Verificar si MQTT está configurado
    const isMqttConfigured = dataset.source === 'mqtt_stream' && 
                            dataset.mqttBroker && 
                            dataset.mqttTopic;

    // Estimar si la conexión está activa basándose en lastDataReceived
    const isLikelyConnected = dataset.lastDataReceived && 
      (Date.now() - dataset.lastDataReceived.getTime()) < 5 * 60 * 1000; // 5 minutos

    return NextResponse.json({
      success: true,
      data: {
        datasetId: dataset.id,
        datasetName: dataset.name,
        isMqttConfigured,
        isLikelyConnected,
        status: dataset.status,
        lastDataReceived: dataset.lastDataReceived?.toISOString() || null,
        avgUpdateFrequency: dataset.avgUpdateFreq || null,
        broker: dataset.mqttBroker 
          ? dataset.mqttBroker.replace(/:[^:]+@/, ':***@') // Ocultar credenciales en URL
          : null,
        topic: dataset.mqttTopic,
      },
    });

  } catch (error) {
    console.error('Error checking MQTT status:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : undefined,
      },
      { status: 500 }
    );
  }
}