/**
 * DATASET CONFIGURATION ENDPOINT
 * 
 * PATCH - OBJETIVO:
 * Actualizar configuración técnica del dataset (MQTT, webhooks, thresholds).
 * Separado de PATCH /datasets/[id] para seguridad y claridad.
 * 
 * MISIÓN:
 * - Validar ownership (userId match)
 * - Permitir actualizar campos técnicos:
 *   · mqttBroker, mqttTopic, mqttUsername, mqttPassword
 *   · webhookUrl (solo si source="webhook")
 *   · alertThresholds (JSON con condiciones)
 * - Encriptar mqttPassword antes de guardar
 * - Actualizar Dataset.updatedAt
 * - Crear ActivityLog: action="dataset.config_updated"
 * - CRÍTICO: Si cambia mqtt*, el servidor externo debe detectar el cambio
 *   en DB y reconectar con la nueva configuración
 * 
 * USADO POR:
 * - /datasets/[id]/settings tab
 * - Modal de "Edit MQTT Configuration"
 * 
 * PRISMA MODELS:
 * - Dataset (mqtt*, webhook*, alertThresholds)
 * - ActivityLog
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

// Schema de validación
const configSchema = z.object({
  // MQTT Configuration
  mqttBroker: z.string().url().optional().nullable(),
  mqttTopic: z.string().min(1).optional().nullable(),
  mqttUsername: z.string().optional().nullable(),
  mqttPassword: z.string().optional().nullable(),
  
  // Webhook Configuration
  webhookUrl: z.string().url().optional().nullable(),
  webhookSecret: z.string().optional().nullable(),
  
  // API Configuration
  apiEndpoint: z.string().url().optional().nullable(),
  
  // Alert Thresholds (JSON flexible)
  alertThresholds: z.record(z.any()).optional().nullable(),
  alertsEnabled: z.boolean().optional(),
}).refine(
  (data) => {
    // Si se proporciona MQTT, broker y topic son requeridos
    const hasMqttFields = data.mqttBroker || data.mqttTopic || data.mqttUsername || data.mqttPassword;
    if (hasMqttFields && (!data.mqttBroker || !data.mqttTopic)) {
      return false;
    }
    return true;
  },
  {
    message: "If MQTT is configured, mqttBroker and mqttTopic are required",
  }
);

// Función para encriptar password (simple - en producción usar AWS KMS o similar)
function encryptPassword(password: string): string {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY || 'default-key-32-chars-long!!!!!!', 'utf8');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

export async function PATCH(
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

    // 2. Validar ownership
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
      select: {
        id: true,
        source: true,
        mqttBroker: true,
        webhookUrl: true,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied' },
        { status: 404 }
      );
    }

    // 3. Parse y validar body
    const body = await request.json();
    const validationResult = configSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // 4. Validaciones de negocio
    // Si el dataset es webhook-based, no permitir cambiar a MQTT y viceversa
    if (data.webhookUrl && dataset.source !== 'webhook') {
      return NextResponse.json(
        { error: 'Cannot configure webhook for non-webhook dataset' },
        { status: 400 }
      );
    }

    if ((data.mqttBroker || data.mqttTopic) && dataset.source !== 'mqtt_stream') {
      return NextResponse.json(
        { error: 'Cannot configure MQTT for non-MQTT dataset' },
        { status: 400 }
      );
    }

    // 5. Preparar datos para actualización
    const updateData: any = {};
    let configChanged = false;

    // MQTT fields
    if (data.mqttBroker !== undefined) {
      updateData.mqttBroker = data.mqttBroker;
      configChanged = configChanged || (data.mqttBroker !== dataset.mqttBroker);
    }
    if (data.mqttTopic !== undefined) {
      updateData.mqttTopic = data.mqttTopic;
      configChanged = true;
    }
    if (data.mqttUsername !== undefined) {
      updateData.mqttUsername = data.mqttUsername;
      configChanged = true;
    }
    if (data.mqttPassword !== undefined) {
      // Encriptar password antes de guardar
      updateData.mqttPassword = data.mqttPassword 
        ? encryptPassword(data.mqttPassword)
        : null;
      configChanged = true;
    }

    // Webhook fields
    if (data.webhookUrl !== undefined) {
      updateData.webhookUrl = data.webhookUrl;
    }
    if (data.webhookSecret !== undefined) {
      updateData.webhookSecret = data.webhookSecret;
    }

    // API endpoint
    if (data.apiEndpoint !== undefined) {
      updateData.apiEndpoint = data.apiEndpoint;
    }

    // Alert configuration
    if (data.alertThresholds !== undefined) {
      updateData.alertThresholds = data.alertThresholds;
    }
    if (data.alertsEnabled !== undefined) {
      updateData.alertsEnabled = data.alertsEnabled;
    }

    // 6. Actualizar dataset en transacción
    const updatedDataset = await prisma.$transaction(async (tx) => {
      // Actualizar dataset
      const updated = await tx.dataset.update({
        where: { id: datasetId },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          name: true,
          source: true,
          mqttBroker: true,
          mqttTopic: true,
          mqttUsername: true,
          webhookUrl: true,
          apiEndpoint: true,
          alertThresholds: true,
          alertsEnabled: true,
          updatedAt: true,
        },
      });

      // Crear activity log
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: 'dataset.config_updated',
          resource: 'Dataset',
          resourceId: datasetId,
          metadata: {
            changedFields: Object.keys(updateData),
            mqttConfigChanged: configChanged,
            timestamp: new Date().toISOString(),
          },
          ipAddress: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return updated;
    });

    // 7. Nota sobre reconexión MQTT
    const response: any = {
      success: true,
      data: {
        ...updatedDataset,
        // NO devolver password encriptado
        mqttPassword: updatedDataset.mqttBroker ? '***' : null,
      },
      message: 'Configuration updated successfully',
    };

    if (configChanged && dataset.source === 'mqtt_stream') {
      response.warning = 'MQTT configuration changed. Server will reconnect automatically within 30 seconds.';
    }

    return NextResponse.json(response, { status: 200 });

  } catch (error) {
    console.error('Error updating dataset config:', error);
    
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

// GET - Obtener configuración actual (para formulario de edición)
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
        source: true,
        mqttBroker: true,
        mqttTopic: true,
        mqttUsername: true,
        webhookUrl: true,
        webhookSecret: true,
        apiEndpoint: true,
        alertThresholds: true,
        alertsEnabled: true,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied' },
        { status: 404 }
      );
    }

    // Ocultar password y secretos
    return NextResponse.json({
      success: true,
      data: {
        ...dataset,
        mqttPassword: dataset.mqttBroker ? '***' : null,
        webhookSecret: dataset.webhookUrl ? dataset.webhookSecret?.substring(0, 8) + '***' : null,
      },
    });

  } catch (error) {
    console.error('Error fetching dataset config:', error);
    
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