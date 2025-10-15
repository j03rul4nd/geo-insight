/**
 * LATEST DATA POINTS ENDPOINT
 * 
 * GET - OBJETIVO:
 * Devolver los últimos N data points para renderizar el 3D viewer.
 * Esta es la ruta más llamada - DEBE ser rápida.
 * 
 * MISIÓN:
 * - Validar ownership
 * - Query params:
 *   · limit (default 1000, max 5000)
 *   · sensorType (opcional: filtrar por tipo)
 *   · sensorId (opcional: filtrar por sensor específico)
 *   · since (timestamp: solo puntos después de esta fecha)
 * - Consultar DataPoint WHERE datasetId = [id]
 *   ORDER BY timestamp DESC
 *   LIMIT [limit]
 * - Devolver solo campos necesarios para renderizado:
 *   · x, y, z (coordenadas 3D)
 *   · value (para color-coding)
 *   · sensorId, sensorType (para tooltips)
 *   · timestamp
 * - NO incluir metadata pesada
 * 
 * OPTIMIZACIÓN:
 * - Índice: (datasetId, timestamp DESC)
 * - Considerar cachear 5-10s si el dataset no es real-time
 * - Si limit > 1000, advertir que puede ser lento
 * 
 * USADO POR:
 * - ThreeJsViewer component (panel central de /datasets/[id])
 * - Se llama:
 *   · 1 vez al montar (carga inicial)
 *   · Cada 10-30s en polling (si no usa MQTT directo)
 *   · Cuando usuario cambia filtros/layers
 * 
 * PRISMA MODELS:
 * - DataPoint (x, y, z, value, sensorId, sensorType, timestamp)
 */

/**
 * LATEST DATA POINTS ENDPOINT
 * 
 * GET /api/datasets/[id]/latest
 * 
 * Devuelve los últimos N data points para renderizar el 3D viewer.
 * Esta es la ruta más llamada - optimizada para velocidad.
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    // 2. Validar ownership del dataset con timeout
    const datasetPromise = prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
      select: {
        id: true,
        status: true,
        totalDataPoints: true,
      },
    });

    // ✅ Timeout de 5 segundos para evitar bloqueos
    const dataset = await Promise.race([
      datasetPromise,
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Database query timeout')), 5000)
      )
    ]).catch(error => {
      console.error('Dataset query failed:', error);
      throw new Error('Database temporarily unavailable');
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied' },
        { status: 404 }
      );
    }

    // ✅ Si el dataset tiene 0 puntos, devolver respuesta vacía inmediatamente
    if (dataset.totalDataPoints === 0) {
      return NextResponse.json(
        {
          success: true,
          data: [],
          metadata: {
            count: 0,
            limit: 0,
            hasMore: false,
            totalAvailable: 0,
            filters: {
              sensorType: null,
              sensorId: null,
              since: null,
            },
            isEmpty: true,
          },
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }

    // 3. Parse query params
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(
      parseInt(searchParams.get('limit') || '1000'),
      5000
    );
    const sensorType = searchParams.get('sensorType') || undefined;
    const sensorId = searchParams.get('sensorId') || undefined;
    const since = searchParams.get('since') 
      ? new Date(searchParams.get('since')!) 
      : undefined;

    // 4. Construir filtros dinámicos
    const whereClause: any = {
      datasetId: datasetId,
    };

    if (sensorType) {
      whereClause.sensorType = sensorType;
    }

    if (sensorId) {
      whereClause.sensorId = sensorId;
    }

    if (since) {
      whereClause.timestamp = {
        gte: since,
      };
    }

    // 5. Query optimizada con timeout
    const dataPointsPromise = prisma.dataPoint.findMany({
      where: whereClause,
      select: {
        id: true,
        x: true,
        y: true,
        z: true,
        value: true,
        sensorId: true,
        sensorType: true,
        unit: true,
        timestamp: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    // ✅ Timeout de 8 segundos
    const dataPoints = await Promise.race([
      dataPointsPromise,
      new Promise<[]>((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout')), 8000)
      )
    ]).catch(error => {
      console.error('DataPoints query failed:', error);
      // En caso de timeout, devolver array vacío
      return [];
    });

    // 6. Metadata
    const hasLargeLimit = limit > 1000;
    const metadata = {
      count: dataPoints.length,
      limit: limit,
      hasMore: dataPoints.length === limit,
      totalAvailable: dataset.totalDataPoints,
      filters: {
        sensorType: sensorType || null,
        sensorId: sensorId || null,
        since: since?.toISOString() || null,
      },
      isEmpty: dataPoints.length === 0,
      ...(hasLargeLimit && {
        warning: 'Large limit requested - response may be slower',
      }),
    };

    // 7. Headers de cache
    const isRealtime = dataset.status === 'active';
    const cacheMaxAge = isRealtime ? 0 : 5;

    return NextResponse.json(
      {
        success: true,
        data: dataPoints,
        metadata,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': cacheMaxAge === 0 
            ? 'no-cache, no-store, must-revalidate'
            : `public, s-maxage=${cacheMaxAge}, stale-while-revalidate=10`,
        },
      }
    );

  } catch (error) {
    console.error('❌ Error fetching latest data points:', error);
    
    // ✅ Mejor manejo de errores de Prisma
    const isPrismaError = error && typeof error === 'object' && 'code' in error;
    const isTimeoutError = error instanceof Error && 
      (error.message.includes('timeout') || error.message.includes('Timed out'));

    if (isTimeoutError || (isPrismaError && (error as any).code === 'P2024')) {
      return NextResponse.json(
        { 
          error: 'Database temporarily unavailable',
          message: 'The database is busy. Please try again in a moment.',
          retryable: true,
        },
        { status: 503 } // Service Unavailable
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'An unexpected error occurred',
        retryable: true,
      },
      { status: 500 }
    );
  } finally {
    // ✅ Asegurar que las conexiones se liberen
    // Prisma lo hace automáticamente, pero lo hacemos explícito
    await prisma.$disconnect().catch(() => {});
  }
}