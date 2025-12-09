/**
 * DATASETS LIST & CREATE ENDPOINT
 * 
 * GET - List all datasets for current user with pagination and filters
 * POST - Create new dataset with plan limit validation
 * 
 * 🆕 Now supports viewType: "gis" or "threejs"
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';

// GET /api/datasets - List datasets
export async function GET(req: NextRequest) {
  try {
    // En Next.js 15, auth() ya NO es async
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
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const viewType = searchParams.get('viewType');

    const skip = (page - 1) * limit;

    // Build where clause with proper typing
    const where: Prisma.DatasetWhereInput = { userId };
    
    if (status) {
      where.status = status;
    }
    
    if (source) {
      where.source = source;
    }

    // 🆕 Filter by viewType
    if (viewType && (viewType === 'gis' || viewType === 'threejs')) {
      where.viewType = viewType;
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
          viewType: true,
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
      
      // Calculate trend
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
    // En Next.js 15, auth() ya NO es async
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
      viewType,
      mqttBroker,
      mqttTopic,
      mqttUsername,
      mqttPassword,
      webhookSecret,
      apiEndpoint,
    } = body;

    // Validate required fields
    if (!name || !source) {
      return NextResponse.json(
        { error: 'Name and source are required' },
        { status: 400 }
      );
    }

    // 🆕 Validate viewType
    if (viewType && !['gis', 'threejs'].includes(viewType)) {
      return NextResponse.json(
        { error: 'viewType must be either "gis" or "threejs"' },
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

    // Prepare dataset data with proper typing
    const datasetData: Prisma.DatasetCreateInput = {
      user: {
        connect: { id: userId }
      },
      name,
      description: description || null,
      source,
      status: 'processing',
      viewType: viewType || 'gis',
    };

    // Add source-specific configuration
    if (source === 'mqtt_stream') {
      datasetData.mqttBroker = mqttBroker;
      datasetData.mqttTopic = mqttTopic;
      datasetData.mqttUsername = mqttUsername || null;
      datasetData.mqttPassword = mqttPassword || null;
    }

    if (source === 'webhook') {
      const webhookId = nanoid(16);
      datasetData.webhookUrl = `/api/webhooks/dataset/${webhookId}`;
      datasetData.webhookSecret = webhookSecret || crypto.randomBytes(32).toString('hex');
    }

    if (source === 'api') {
      datasetData.apiEndpoint = apiEndpoint || null;
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
          user: {
            connect: { id: userId }
          },
          action: 'dataset.created',
          resource: 'Dataset',
          resourceId: name,
          metadata: {
            name,
            source,
            viewType: datasetData.viewType,
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
        resourceId: name
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