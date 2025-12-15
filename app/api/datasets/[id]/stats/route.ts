/**
 * DATASET STATS ENDPOINT
 * 
 * GET /api/datasets/[id]/stats
 * 
 * Devuelve estadísticas agregadas del dataset:
 * - Conteo de data points por rango de tiempo
 * - Agregados por sensorId (en lugar de sensorType)
 * - Métricas de rendimiento
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

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

    const { id: datasetId } = await params;

    // Verificar ownership del dataset
    const dataset = await prisma.dataset.findUnique({
      where: {
        id: datasetId,
        userId
      },
      select: { id: true }
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Obtener parámetros de query
    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('range') || '24h'; // 1h, 24h, 7d, 30d

    // Calcular timestamp de inicio basado en el rango
    const now = new Date();
    const startTime = new Date();
    
    switch (timeRange) {
      case '1h':
        startTime.setHours(now.getHours() - 1);
        break;
      case '24h':
        startTime.setHours(now.getHours() - 24);
        break;
      case '7d':
        startTime.setDate(now.getDate() - 7);
        break;
      case '30d':
        startTime.setDate(now.getDate() - 30);
        break;
      default:
        startTime.setHours(now.getHours() - 24);
    }

    // Ejecutar queries en paralelo
    const [
      totalPoints,
      pointsInRange,
      sensorStats,
      valueStats,
      recentPoints
    ] = await Promise.all([
      // Total de data points
      prisma.dataPoint.count({
        where: { datasetId }
      }),

      // Data points en el rango de tiempo
      prisma.dataPoint.count({
        where: {
          datasetId,
          timestamp: {
            gte: startTime
          }
        }
      }),

      // Agregados por sensorId (en lugar de sensorType)
      prisma.dataPoint.groupBy({
        by: ['sensorId'],
        where: {
          datasetId,
          timestamp: {
            gte: startTime
          }
        },
        _count: {
          id: true
        },
        _avg: {
          value: true
        },
        _min: {
          value: true
        },
        _max: {
          value: true
        }
      }),

      // Estadísticas generales de valores
      prisma.dataPoint.aggregate({
        where: {
          datasetId,
          timestamp: {
            gte: startTime
          }
        },
        _avg: {
          value: true
        },
        _min: {
          value: true
        },
        _max: {
          value: true
        },
        _count: {
          id: true
        }
      }),

      // Últimos 10 data points para calcular frecuencia
      prisma.dataPoint.findMany({
        where: { datasetId },
        orderBy: { timestamp: 'desc' },
        take: 10,
        select: {
          timestamp: true
        }
      })
    ]);

    // Calcular frecuencia promedio de actualización
    let avgUpdateFrequency = null;
    if (recentPoints.length > 1) {
      const timeDiffs = [];
      for (let i = 0; i < recentPoints.length - 1; i++) {
        const diff = recentPoints[i].timestamp.getTime() - recentPoints[i + 1].timestamp.getTime();
        timeDiffs.push(diff);
      }
      const avgDiff = timeDiffs.reduce((a, b) => a + b, 0) / timeDiffs.length;
      avgUpdateFrequency = Math.round(avgDiff / 1000); // en segundos
    }

    // Opcional: Si necesitas info de sensorType desde SensorConfig
    const sensorsWithConfig = await prisma.$queryRaw<Array<{
      sensorId: string;
      type: string | null;
      name: string | null;
      count: bigint;
    }>>`
      SELECT 
        dp."sensorId",
        sc."type",
        sc."name",
        COUNT(dp.id)::bigint as count
      FROM "DataPoint" dp
      LEFT JOIN "SensorConfig" sc ON sc."sensorId" = dp."sensorId" 
        AND sc."datasetId" = dp."datasetId"
      WHERE dp."datasetId" = ${datasetId}
        AND dp."timestamp" >= ${startTime}
      GROUP BY dp."sensorId", sc."type", sc."name"
      ORDER BY count DESC
    `;

    // Formatear respuesta
    return NextResponse.json({
      timeRange,
      period: {
        start: startTime.toISOString(),
        end: now.toISOString()
      },
      summary: {
        totalPoints,
        pointsInRange,
        avgValue: valueStats._avg.value,
        minValue: valueStats._min.value,
        maxValue: valueStats._max.value,
        avgUpdateFrequency // en segundos
      },
      bySensor: sensorStats.map(stat => ({
        sensorId: stat.sensorId,
        count: stat._count.id,
        avgValue: stat._avg.value,
        minValue: stat._min.value,
        maxValue: stat._max.value
      })),
      bySensorType: sensorsWithConfig.map(s => ({
        sensorId: s.sensorId,
        sensorType: s.type,
        sensorName: s.name,
        count: Number(s.count)
      }))
    });

  } catch (error) {
    console.error('Error fetching dataset stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dataset statistics' },
      { status: 500 }
    );
  }
}