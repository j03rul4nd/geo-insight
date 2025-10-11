/**
 * DATASETS LIST & CREATE ENDPOINT
 * 
 * GET - OBJETIVO:
 * Listar todos los datasets del usuario actual con paginación y filtros.
 * 
 * GET - MISIÓN:
 * - Consultar Dataset WHERE userId = currentUser
 * - Filtros opcionales: status (active/idle/error), source (mqtt/csv/webhook)
 * - Incluir stats básicas: totalDataPoints, lastDataReceived, activeAlerts
 * - Ordenar por updatedAt DESC (más recientes primero)
 * - Paginación: page, limit (default 20)
 * 
 * POST - OBJETIVO:
 * Crear un nuevo dataset validando límites del plan del usuario.
 * 
 * POST - MISIÓN:
 * - Validar currentDatasetsUsage < monthlyDatasetsLimit (o -1 si Pro)
 * - Crear registro en Dataset con status="processing"
 * - Si source="mqtt_stream": validar mqttBroker, mqttTopic obligatorios
 * - Si source="webhook": generar webhookUrl único + webhookSecret
 * - Incrementar User.currentDatasetsUsage += 1
 * - Crear ActivityLog: action="dataset.created"
 * - Si source="mqtt_stream": El servidor externo debe detectar este nuevo
 *   dataset en DB y conectarse al broker MQTT especificado
 * 
 * USADO POR:
 * - /datasets page (tabla de datasets)
 * - Botón "+ Create Dataset" en dashboard
 * 
 * PRISMA MODELS:
 * - User (currentDatasetsUsage, monthlyDatasetsLimit)
 * - Dataset (name, source, status, mqtt*, webhook*, userId)
 * - ActivityLog (action, resource, userId)
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import crypto from 'crypto';

/**
 * DATASETS LIST & CREATE ENDPOINT
 * 
 * GET - List all datasets for current user with pagination and filters
 * POST - Create new dataset with plan limit validation
 */

// GET /api/datasets - List datasets
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status'); // active, idle, error, archived, processing
    const source = searchParams.get('source'); // mqtt_stream, csv_upload, webhook, api

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };
    
    if (status) {
      where.status = status;
    }
    
    if (source) {
      where.source = source;
    }

    // Fetch datasets with stats
    const [datasets, total] = await Promise.all([
      prisma.dataset.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          status: true,
          source: true,
          totalDataPoints: true,
          dataPointsToday: true,
          lastDataReceived: true,
          avgUpdateFreq: true,
          mqttBroker: true,
          mqttTopic: true,
          mqttUsername: true,
          webhookUrl: true,
          apiEndpoint: true,
          alertsEnabled: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              alerts: {
                where: { status: 'active' }
              }
            }
          }
        }
      }),
      prisma.dataset.count({ where })
    ]);

    // Calculate health and trends for each dataset
    const enrichedDatasets = datasets.map(dataset => {
      const activeAlerts = dataset._count.alerts;
      
      // Calculate health score (0-100)
      let health = 100;
      if (dataset.status === 'error') health = 0;
      else if (dataset.status === 'idle') health = 50;
      else if (dataset.status === 'processing') health = 75;
      else if (activeAlerts > 0) health = Math.max(30, 100 - (activeAlerts * 20));
      
      // Calculate trend based on today vs yesterday data points
      // (In a real implementation, you'd query historical data)
      const trend = dataset.dataPointsToday > 0 ? 'up' : 'neutral';
      const trendPercent = dataset.totalDataPoints > 0 
        ? Math.round((dataset.dataPointsToday / dataset.totalDataPoints) * 100)
        : 0;

      const { _count, ...rest } = dataset;
      
      return {
        ...rest,
        health,
        trend,
        trendPercent,
        activeAlertsCount: activeAlerts
      };
    });

    return NextResponse.json({
      datasets: enrichedDatasets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching datasets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch datasets' },
      { status: 500 }
    );
  }
}

// POST /api/datasets - Create new dataset
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      source,
      mqttBroker,
      mqttTopic,
      mqttUsername,
      mqttPassword,
      webhookFormat,
      webhookSecret,
      apiEndpoint,
      apiMethod,
      apiHeaders,
      pollInterval
    } = body;

    // Validate required fields
    if (!name || !source) {
      return NextResponse.json(
        { error: 'Name and source are required' },
        { status: 400 }
      );
    }

    // Validate source-specific requirements
    if (source === 'mqtt_stream') {
      if (!mqttBroker || !mqttTopic) {
        return NextResponse.json(
          { error: 'MQTT broker and topic are required for MQTT sources' },
          { status: 400 }
        );
      }
    }

    // Fetch user with usage limits
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        currentDatasetsUsage: true,
        monthlyDatasetsLimit: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has reached dataset limit
    // -1 means unlimited (Pro plan)
    if (user.monthlyDatasetsLimit !== -1 && 
        user.currentDatasetsUsage >= user.monthlyDatasetsLimit) {
      return NextResponse.json(
        { 
          error: 'Dataset limit reached',
          message: `You have reached your plan limit of ${user.monthlyDatasetsLimit} datasets. Upgrade to create more.`,
          currentUsage: user.currentDatasetsUsage,
          limit: user.monthlyDatasetsLimit
        },
        { status: 403 }
      );
    }

    // Prepare dataset data
    const datasetData: any = {
      userId,
      name,
      description,
      source,
      status: 'processing'
    };

    // Add source-specific configuration
    if (source === 'mqtt_stream') {
      datasetData.mqttBroker = mqttBroker;
      datasetData.mqttTopic = mqttTopic;
      datasetData.mqttUsername = mqttUsername;
      // TODO: Encrypt password in production
      datasetData.mqttPassword = mqttPassword;
    }

    if (source === 'webhook') {
      // Generate unique webhook URL
      const webhookId = nanoid(16);
      datasetData.webhookUrl = `/api/webhooks/dataset/${webhookId}`;
      
      // Generate webhook secret for validation
      datasetData.webhookSecret = webhookSecret || crypto.randomBytes(32).toString('hex');
    }

    if (source === 'api') {
      datasetData.apiEndpoint = apiEndpoint;
      // Store additional API config in metadata if needed
    }

    // Create dataset and update user usage in transaction
    const [dataset] = await prisma.$transaction([
      prisma.dataset.create({
        data: datasetData
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          currentDatasetsUsage: {
            increment: 1
          }
        }
      }),
      prisma.activityLog.create({
        data: {
          userId,
          action: 'dataset.created',
          resource: 'Dataset',
          resourceId: datasetData.name, // Will be replaced with actual ID
          metadata: {
            name,
            source,
            ...(source === 'mqtt_stream' && { mqttBroker, mqttTopic })
          }
        }
      })
    ]);

    // Update activity log with correct dataset ID
    await prisma.activityLog.updateMany({
      where: {
        userId,
        resource: 'Dataset',
        resourceId: datasetData.name
      },
      data: {
        resourceId: dataset.id
      }
    });

    return NextResponse.json(dataset, { status: 201 });

  } catch (error) {
    console.error('Error creating dataset:', error);
    return NextResponse.json(
      { error: 'Failed to create dataset' },
      { status: 500 }
    );
  }
}