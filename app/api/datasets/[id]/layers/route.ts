/**
 * VISUALIZATION LAYERS ENDPOINT
 * 
 * GET - OBJETIVO:
 * Listar todas las capas de visualización configuradas para el dataset.
 * 
 * GET - MISIÓN:
 * - Validar ownership del dataset
 * - Consultar Layer WHERE datasetId = [id] ORDER BY order ASC
 * - Devolver configuración visual: colorScheme, opacity, pointSize
 * - Incluir filterQuery (usado por frontend para filtrar DataPoints)
 * 
 * POST - OBJETIVO:
 * Crear nueva capa de visualización (ej: "Solo sensores de temperatura > 70°C").
 * 
 * POST - MISIÓN:
 * - Validar ownership del dataset
 * - Crear Layer con:
 *   · name, description
 *   · colorScheme (gradient, solid, heatmap)
 *   · opacity (0.0 - 1.0)
 *   · pointSize (multiplicador para Three.js)
 *   · filterQuery (SQL-like: "sensorType = 'temperature' AND value > 70")
 *   · order (auto-incrementar desde max existente)
 * - enabled = true por defecto
 * 
 * USADO POR:
 * - Layer toggles en panel izquierdo de /datasets/[id]
 * - "Add Layer" modal en viewer
 * - Frontend aplica filterQuery sobre DataPoints en cliente
 * 
 * EJEMPLO DE USO:
 * Usuario crea layer "High Temperature" con:
 * - colorScheme: {low: "#ffff00", high: "#ff0000"}
 * - filterQuery: "sensorType = 'temperature' AND value > 75"
 * → Frontend filtra DataPoints y renderiza solo los que cumplan + aplica colores
 * 
 * PRISMA MODELS:
 * - Layer (all fields)
 * - Dataset (para validar ownership)
 */

/**
 * VISUALIZATION LAYERS ENDPOINT
 * 
 * GET /api/datasets/[id]/layers - Listar capas
 * POST /api/datasets/[id]/layers - Crear capa
 * 
 * Gestiona capas de visualización para filtrar y estilizar DataPoints en el 3D viewer.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para colorScheme
const colorSchemeSchema = z.object({
  type: z.enum(['gradient', 'solid', 'heatmap', 'categorical']),
  low: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  high: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  colors: z.array(z.string()).optional(), // Para categorical
  thresholds: z.array(z.number()).optional(), // Para heatmap
});

// Schema de validación para crear capa
const createLayerSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  enabled: z.boolean().optional().default(true),
  colorScheme: colorSchemeSchema,
  opacity: z.number().min(0).max(1).default(1.0),
  pointSize: z.number().min(0.1).max(10).default(1.0),
  filterQuery: z.string().max(1000).optional().nullable(),
});

// ============================================
// GET - Listar todas las capas del dataset
// ============================================
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

    // 2. Validar ownership del dataset
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied' },
        { status: 404 }
      );
    }

    // 3. Obtener todas las capas ordenadas
    const layers = await prisma.layer.findMany({
      where: {
        datasetId: datasetId,
      },
      orderBy: {
        order: 'asc',
      },
      select: {
        id: true,
        name: true,
        description: true,
        enabled: true,
        order: true,
        colorScheme: true,
        opacity: true,
        pointSize: true,
        filterQuery: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        datasetId: dataset.id,
        datasetName: dataset.name,
        layers: layers,
        totalLayers: layers.length,
        enabledLayers: layers.filter(l => l.enabled).length,
      },
    });

  } catch (error) {
    console.error('Error fetching layers:', error);
    
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

// ============================================
// POST - Crear nueva capa de visualización
// ============================================
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

    // 2. Validar ownership del dataset
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
      select: {
        id: true,
        name: true,
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
    const validationResult = createLayerSchema.safeParse(body);

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

    // 4. Validar filterQuery básico (prevenir SQL injection)
    if (data.filterQuery) {
      const dangerousKeywords = [
        'DROP', 'DELETE', 'UPDATE', 'INSERT', 'TRUNCATE', 
        'ALTER', 'CREATE', 'EXEC', '--', ';'
      ];
      
      const upperQuery = data.filterQuery.toUpperCase();
      const hasDangerousKeyword = dangerousKeywords.some(keyword => 
        upperQuery.includes(keyword)
      );

      if (hasDangerousKeyword) {
        return NextResponse.json(
          { 
            error: 'Invalid filter query',
            message: 'Filter contains forbidden keywords',
          },
          { status: 400 }
        );
      }
    }

    // 5. Obtener el orden máximo actual para auto-incrementar
    const maxOrderLayer = await prisma.layer.findFirst({
      where: {
        datasetId: datasetId,
      },
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    });

    const nextOrder = (maxOrderLayer?.order ?? -1) + 1;

    // 6. Crear la capa en una transacción
    const newLayer = await prisma.$transaction(async (tx) => {
      // Crear layer
      const layer = await tx.layer.create({
        data: {
          datasetId: datasetId,
          name: data.name,
          description: data.description,
          enabled: data.enabled,
          order: nextOrder,
          colorScheme: data.colorScheme as any,
          opacity: data.opacity,
          pointSize: data.pointSize,
          filterQuery: data.filterQuery,
        },
      });

      // Log de actividad
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: 'layer.created',
          resource: 'Layer',
          resourceId: layer.id,
          metadata: {
            datasetId: datasetId,
            layerName: data.name,
            hasFilter: !!data.filterQuery,
            timestamp: new Date().toISOString(),
          },
          ipAddress: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });

      return layer;
    });

    return NextResponse.json(
      {
        success: true,
        data: newLayer,
        message: 'Layer created successfully',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error creating layer:', error);
    
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

// ============================================
// PATCH - Reordenar capas (bulk update)
// ============================================
export async function PATCH(
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

    // Validar ownership
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
      select: { id: true },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied' },
        { status: 404 }
      );
    }

    // Parse body - esperamos array de {id, order}
    const body = await request.json();
    const reorderSchema = z.object({
      layers: z.array(z.object({
        id: z.string(),
        order: z.number().int().min(0),
      })),
    });

    const validationResult = reorderSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { layers } = validationResult.data;

    // Actualizar orden en transacción
    await prisma.$transaction(
      layers.map(({ id, order }) =>
        prisma.layer.update({
          where: { 
            id: id,
            datasetId: datasetId, // Seguridad: solo del dataset actual
          },
          data: { order },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: 'Layers reordered successfully',
    });

  } catch (error) {
    console.error('Error reordering layers:', error);
    
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