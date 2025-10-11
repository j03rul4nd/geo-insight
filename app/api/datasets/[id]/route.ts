/**
 * DATASET DETAIL ENDPOINT
 * 
 * GET - OBJETIVO:
 * Obtener todos los detalles de un dataset específico para mostrar en /datasets/[id].
 * 
 * GET - MISIÓN:
 * - Consultar Dataset WHERE id = [id] AND userId = currentUser
 * - Incluir toda la configuración: mqtt*, boundingBox, alertThresholds
 * - Calcular stats en tiempo real: totalDataPoints, avgUpdateFreq
 * - NO devolver DataPoints aquí (usar /latest para eso)
 * 
 * PATCH - OBJETIVO:
 * Actualizar configuración básica del dataset (nombre, descripción, alertas).
 * 
 * PATCH - MISIÓN:
 * - Validar ownership (userId match)
 * - Permitir actualizar: name, description, alertsEnabled, alertThresholds
 * - NO permitir cambiar source o mqtt* (usar /config para eso)
 * - Actualizar Dataset.updatedAt
 * - Crear ActivityLog: action="dataset.updated"
 * 
 * DELETE - OBJETIVO:
 * Eliminar dataset y todos sus datos relacionados.
 * 
 * DELETE - MISIÓN:
 * - Validar ownership
 * - Prisma CASCADE eliminará automáticamente:
 *   · DataPoint (todos los puntos del dataset)
 *   · Insight (análisis AI relacionados)
 *   · Alert (alertas activas)
 *   · Layer (capas de visualización)
 * - Decrementar User.currentDatasetsUsage -= 1
 * - Crear ActivityLog: action="dataset.deleted"
 * - Notificar al servidor externo para que desconecte MQTT si aplica
 * 
 * USADO POR:
 * - /datasets/[id] viewer (panel izquierdo de info)
 * - Settings modal dentro del viewer
 * - Botón "Delete Dataset"
 * 
 * PRISMA MODELS:
 * - Dataset (all fields)
 * - User (currentDatasetsUsage)
 * - ActivityLog
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

/**
 * DATASET DETAIL ENDPOINT
 * 
 * GET - Get full dataset details
 * PATCH - Update basic dataset configuration
 * DELETE - Delete dataset and all related data
 */

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/datasets/[id] - Get dataset details
export async function GET(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Fetch dataset with related counts
    const dataset = await prisma.dataset.findUnique({
      where: {
        id,
        userId // Ensure user owns this dataset
      },
      include: {
        _count: {
          select: {
            dataPoints: true,
            insights: true,
            alerts: {
              where: { status: 'active' }
            },
            layers: true
          }
        }
      }
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Calculate additional stats
    const stats = {
      totalDataPoints: dataset.totalDataPoints,
      dataPointsToday: dataset.dataPointsToday,
      lastDataReceived: dataset.lastDataReceived,
      avgUpdateFreq: dataset.avgUpdateFreq,
      activeAlertsCount: dataset._count.alerts,
      totalInsights: dataset._count.insights,
      totalLayers: dataset._count.layers
    };

    // Calculate health score
    let health = 100;
    if (dataset.status === 'error') health = 0;
    else if (dataset.status === 'idle') health = 50;
    else if (dataset.status === 'processing') health = 75;
    else if (dataset.status === 'archived') health = 25;
    else if (stats.activeAlertsCount > 0) {
      health = Math.max(30, 100 - (stats.activeAlertsCount * 20));
    }

    // Remove _count from response
    const { _count, mqttPassword, webhookSecret, ...datasetData } = dataset;

    return NextResponse.json({
      ...datasetData,
      stats,
      health,
      // Mask sensitive data
      mqttPasswordSet: !!mqttPassword,
      webhookSecretSet: !!webhookSecret
    });

  } catch (error) {
    console.error('Error fetching dataset:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset' },
      { status: 500 }
    );
  }
}

// PATCH /api/datasets/[id] - Update dataset
export async function PATCH(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await req.json();

    // Verify dataset ownership
    const existingDataset = await prisma.dataset.findUnique({
      where: { id },
      select: { userId: true, name: true }
    });

    if (!existingDataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    if (existingDataset.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Only allow updating specific fields
    const allowedFields = [
      'name',
      'description',
      'status',
      'alertsEnabled',
      'alertThresholds',
      'boundingBox'
    ];

    const updateData: any = {};
    
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Validate status if being updated
    if (updateData.status) {
      const validStatuses = ['active', 'idle', 'error', 'archived', 'processing'];
      if (!validStatuses.includes(updateData.status)) {
        return NextResponse.json(
          { error: 'Invalid status value' },
          { status: 400 }
        );
      }
    }

    // Validate alertThresholds format if provided
    if (updateData.alertThresholds) {
      if (typeof updateData.alertThresholds !== 'object') {
        return NextResponse.json(
          { error: 'alertThresholds must be an object' },
          { status: 400 }
        );
      }
    }

    // Validate boundingBox format if provided
    if (updateData.boundingBox) {
      const bb = updateData.boundingBox;
      if (!bb.min || !bb.max || 
          typeof bb.min.x !== 'number' || 
          typeof bb.max.x !== 'number') {
        return NextResponse.json(
          { error: 'Invalid boundingBox format' },
          { status: 400 }
        );
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Update dataset and create activity log
    const [updatedDataset] = await prisma.$transaction([
      prisma.dataset.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date()
        }
      }),
      prisma.activityLog.create({
        data: {
          userId,
          action: 'dataset.updated',
          resource: 'Dataset',
          resourceId: id,
          metadata: {
            name: existingDataset.name,
            updatedFields: Object.keys(updateData)
          }
        }
      })
    ]);

    // Remove sensitive data from response
    const { mqttPassword, webhookSecret, ...safeDataset } = updatedDataset;

    return NextResponse.json({
      ...safeDataset,
      mqttPasswordSet: !!mqttPassword,
      webhookSecretSet: !!webhookSecret
    });

  } catch (error) {
    console.error('Error updating dataset:', error);
    return NextResponse.json(
      { error: 'Failed to update dataset' },
      { status: 500 }
    );
  }
}

// DELETE /api/datasets/[id] - Delete dataset
export async function DELETE(
  req: NextRequest,
  { params }: RouteParams
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Verify dataset ownership and get details
    const dataset = await prisma.dataset.findUnique({
      where: { id },
      select: { 
        userId: true, 
        name: true,
        source: true,
        _count: {
          select: {
            dataPoints: true,
            insights: true,
            alerts: true,
            layers: true
          }
        }
      }
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    if (dataset.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete dataset and update user usage in transaction
    // Prisma CASCADE will automatically delete:
    // - DataPoints, Insights, Alerts, Layers
    await prisma.$transaction([
      prisma.dataset.delete({
        where: { id }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          currentDatasetsUsage: {
            decrement: 1
          }
        }
      }),
      prisma.activityLog.create({
        data: {
          userId,
          action: 'dataset.deleted',
          resource: 'Dataset',
          resourceId: id,
          metadata: {
            name: dataset.name,
            source: dataset.source,
            deletedCounts: {
              dataPoints: dataset._count.dataPoints,
              insights: dataset._count.insights,
              alerts: dataset._count.alerts,
              layers: dataset._count.layers
            }
          }
        }
      })
    ]);

    // TODO: Notify external MQTT server to disconnect if source was mqtt_stream
    // This would typically be done via a message queue or webhook
    if (dataset.source === 'mqtt_stream') {
      // Queue disconnection task
      console.log(`[MQTT] Dataset ${id} deleted, should disconnect from broker`);
    }

    return NextResponse.json({
      success: true,
      message: 'Dataset deleted successfully',
      deletedCounts: dataset._count
    });

  } catch (error) {
    console.error('Error deleting dataset:', error);
    return NextResponse.json(
      { error: 'Failed to delete dataset' },
      { status: 500 }
    );
  }
}