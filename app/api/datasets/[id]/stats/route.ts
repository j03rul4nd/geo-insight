/**
 * DATASET STATISTICS ENDPOINT
 * 
 * GET - OBJETIVO:
 * Proporcionar estadísticas agregadas del dataset para widgets del dashboard
 * y el panel derecho del 3D viewer.
 * 
 * MISIÓN:
 * - Validar ownership
 * - Query params: range (1h, 24h, 7d, 30d, custom)
 * - Consultar Dataset para stats básicas:
 *   · totalDataPoints, lastDataReceived, avgUpdateFreq
 * - Hacer aggregations sobre DataPoint en el rango especificado:
 *   · COUNT(*) para dataPointsInRange
 *   · AVG(value) por sensorType
 *   · MAX(value), MIN(value)
 * - Contar Alert WHERE status="active"
 * - Generar timeline para mini-chart (agrupado por 15min o 1h según rango)
 * - Calcular boundingBox si no existe (MIN/MAX de x,y,z)
 * 
 * OPTIMIZACIÓN:
 * - NO devolver DataPoints individuales (usar /latest para eso)
 * - Usar índices de Prisma: datasetId + timestamp
 * - Cachear 30-60s para reducir carga de DB
 * 
 * USADO POR:
 * - Panel derecho de /datasets/[id] (Current Readings, mini timeline)
 * - Dashboard cards de estadísticas
 * - Se hace polling cada 10-30s
 * 
 * PRISMA MODELS:
 * - Dataset (totalDataPoints, lastDataReceived, boundingBox)
 * - DataPoint (aggregate queries)
 * - Alert (count WHERE status="active")
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Tipos para las estadísticas
interface TimeRange {
  start: Date;
  end: Date;
  interval: 'minute' | 'hour' | 'day';
}

function getTimeRange(range: string): TimeRange {
  const end = new Date();
  let start: Date;
  let interval: 'minute' | 'hour' | 'day';

  switch (range) {
    case '1h':
      start = new Date(end.getTime() - 60 * 60 * 1000);
      interval = 'minute';
      break;
    case '24h':
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      interval = 'hour';
      break;
    case '7d':
      start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
      interval = 'hour';
      break;
    case '30d':
      start = new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);
      interval = 'day';
      break;
    default:
      start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      interval = 'hour';
  }

  return { start, end, interval };
}

function getIntervalInMs(interval: 'minute' | 'hour' | 'day'): number {
  switch (interval) {
    case 'minute':
      return 15 * 60 * 1000; // 15 minutos
    case 'hour':
      return 60 * 60 * 1000; // 1 hora
    case 'day':
      return 24 * 60 * 60 * 1000; // 1 día
  }
}

export async function GET(
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

    // 2. Parse query params
    const searchParams = request.nextUrl.searchParams;
    const rangeParam = searchParams.get('range') || '24h';
    const includeTimeline = searchParams.get('timeline') !== 'false';
    const includeBoundingBox = searchParams.get('boundingBox') !== 'false';

    // 3. Validar ownership y obtener datos básicos del dataset
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        status: true,
        source: true,
        totalDataPoints: true,
        dataPointsToday: true,
        lastDataReceived: true,
        avgUpdateFreq: true,
        boundingBox: true,
        alertsEnabled: true,
        createdAt: true,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied' },
        { status: 404 }
      );
    }

    // 4. Calcular rango de tiempo
    const timeRange = getTimeRange(rangeParam);

    // 5. Obtener estadísticas agregadas en el rango
    const [
      dataPointsInRange,
      sensorStats,
      valueStats,
      activeAlerts,
      sensorTypes,
    ] = await Promise.all([
      // Count total de puntos en rango
      prisma.dataPoint.count({
        where: {
          datasetId: datasetId,
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
      }),

      // Agregados por tipo de sensor
      prisma.dataPoint.groupBy({
        by: ['sensorType'],
        where: {
          datasetId: datasetId,
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        _count: {
          id: true,
        },
        _avg: {
          value: true,
        },
        _max: {
          value: true,
        },
        _min: {
          value: true,
        },
      }),

      // Stats globales de valores
      prisma.dataPoint.aggregate({
        where: {
          datasetId: datasetId,
          timestamp: {
            gte: timeRange.start,
            lte: timeRange.end,
          },
        },
        _avg: {
          value: true,
        },
        _max: {
          value: true,
        },
        _min: {
          value: true,
        },
      }),

      // Contar alertas activas
      prisma.alert.count({
        where: {
          datasetId: datasetId,
          status: 'active',
        },
      }),

      // Lista única de tipos de sensores
      prisma.dataPoint.findMany({
        where: {
          datasetId: datasetId,
        },
        select: {
          sensorType: true,
          unit: true,
        },
        distinct: ['sensorType'],
        take: 50,
      }),
    ]);

    // 6. Generar timeline (agrupado por intervalo)
    let timeline: Array<{ timestamp: string; count: number; avgValue: number }> = [];
    
    if (includeTimeline && dataPointsInRange > 0) {
      const intervalMs = getIntervalInMs(timeRange.interval);
      const buckets = Math.ceil((timeRange.end.getTime() - timeRange.start.getTime()) / intervalMs);
      
      // Query raw para agrupar por intervalo de tiempo
      const timelineData = await prisma.$queryRaw<Array<{
        bucket: Date;
        count: bigint;
        avg_value: number;
      }>>`
        SELECT 
          date_trunc(${timeRange.interval}, timestamp) as bucket,
          COUNT(*) as count,
          AVG(value) as avg_value
        FROM "DataPoint"
        WHERE "datasetId" = ${datasetId}
          AND timestamp >= ${timeRange.start}
          AND timestamp <= ${timeRange.end}
        GROUP BY bucket
        ORDER BY bucket ASC
        LIMIT ${Math.min(buckets, 100)}
      `;

      timeline = timelineData.map(row => ({
        timestamp: row.bucket.toISOString(),
        count: Number(row.count),
        avgValue: Number(row.avg_value) || 0,
      }));
    }

    // 7. Calcular o actualizar bounding box si no existe
    let boundingBox = dataset.boundingBox as any;
    
    if (includeBoundingBox && !boundingBox) {
      const bounds = await prisma.dataPoint.aggregate({
        where: {
          datasetId: datasetId,
        },
        _min: {
          x: true,
          y: true,
          z: true,
        },
        _max: {
          x: true,
          y: true,
          z: true,
        },
      });

      if (bounds._min.x !== null && bounds._max.x !== null) {
        boundingBox = {
          min: {
            x: bounds._min.x,
            y: bounds._min.y,
            z: bounds._min.z || 0,
          },
          max: {
            x: bounds._max.x,
            y: bounds._max.y,
            z: bounds._max.z || 0,
          },
        };

        // Actualizar en DB para futuras consultas (no esperar)
        prisma.dataset.update({
          where: { id: datasetId },
          data: { boundingBox: boundingBox },
        }).catch(err => console.error('Error updating bounding box:', err));
      }
    }

    // 8. Calcular métricas de salud del dataset
    const isHealthy = dataset.status === 'active' && 
                     dataset.lastDataReceived &&
                     (Date.now() - dataset.lastDataReceived.getTime()) < 10 * 60 * 1000; // 10 min

    const dataRate = dataset.avgUpdateFreq 
      ? Math.round(3600 / dataset.avgUpdateFreq) // puntos por hora
      : null;

    // 9. Formatear respuesta
    const stats = {
      // Información básica
      dataset: {
        id: dataset.id,
        name: dataset.name,
        status: dataset.status,
        source: dataset.source,
        isHealthy,
        createdAt: dataset.createdAt.toISOString(),
      },

      // Totales globales
      totals: {
        allTimeDataPoints: dataset.totalDataPoints,
        todayDataPoints: dataset.dataPointsToday,
        lastDataReceived: dataset.lastDataReceived?.toISOString() || null,
        avgUpdateFrequency: dataset.avgUpdateFreq,
        estimatedDataRate: dataRate,
      },

      // Stats del rango seleccionado
      range: {
        period: rangeParam,
        start: timeRange.start.toISOString(),
        end: timeRange.end.toISOString(),
        dataPoints: dataPointsInRange,
        avgValue: valueStats._avg.value || 0,
        maxValue: valueStats._max.value || 0,
        minValue: valueStats._min.value || 0,
      },

      // Por tipo de sensor
      sensors: sensorStats.map(s => ({
        type: s.sensorType || 'unknown',
        count: s._count.id,
        avgValue: s._avg.value || 0,
        maxValue: s._max.value || 0,
        minValue: s._min.value || 0,
      })),

      // Lista de tipos disponibles
      availableSensorTypes: sensorTypes
        .filter(s => s.sensorType)
        .map(s => ({
          type: s.sensorType!,
          unit: s.unit,
        })),

      // Alertas
      alerts: {
        enabled: dataset.alertsEnabled,
        activeCount: activeAlerts,
      },

      // Timeline para gráfico
      ...(includeTimeline && { timeline }),

      // Bounding box para 3D viewer
      ...(includeBoundingBox && boundingBox && { boundingBox }),
    };

    // 10. Headers de cache (30-60s según si está activo)
    const cacheMaxAge = dataset.status === 'active' ? 30 : 60;

    return NextResponse.json(
      {
        success: true,
        data: stats,
        metadata: {
          queriedAt: new Date().toISOString(),
          cached: false,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': `public, s-maxage=${cacheMaxAge}, stale-while-revalidate=60`,
        },
      }
    );

  } catch (error) {
    console.error('Error fetching dataset statistics:', error);
    
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