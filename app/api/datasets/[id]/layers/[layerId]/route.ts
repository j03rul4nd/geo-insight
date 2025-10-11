/**
 * LAYER DETAIL ENDPOINT
 * 
 * PATCH - OBJETIVO:
 * Actualizar configuración de una capa existente.
 * 
 * PATCH - MISIÓN:
 * - Validar ownership (dataset.userId match)
 * - Permitir actualizar: name, enabled, colorScheme, opacity, pointSize, filterQuery
 * - NO permitir cambiar datasetId u order aquí
 * - Actualizar Layer.updatedAt
 * 
 * DELETE - OBJETIVO:
 * Eliminar capa de visualización.
 * 
 * DELETE - MISIÓN:
 * - Validar ownership
 * - Eliminar Layer
 * - Reordenar layers restantes (ajustar order)
 * 
 * USADO POR:
 * - Layer settings modal en /datasets/[id]
 * - Toggle enable/disable layer
 * - Botón "Delete Layer"
 * 
 * PRISMA MODELS:
 * - Layer
 * - Dataset (para validar ownership)
 */

/**
 * LAYER DETAIL ENDPOINT
 * 
 * GET /api/datasets/[id]/layers/[layerId] - Obtener detalles de capa
 * PATCH /api/datasets/[id]/layers/[layerId] - Actualizar capa
 * DELETE /api/datasets/[id]/layers/[layerId] - Eliminar capa
 * 
 * Gestiona operaciones individuales sobre capas de visualización.
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
  colors: z.array(z.string()).optional(),
  thresholds: z.array(z.number()).optional(),
});

// Schema de validación para actualizar capa
const updateLayerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  enabled: z.boolean().optional(),
  colorScheme: colorSchemeSchema.optional(),
  opacity: z.number().min(0).max(1).optional(),
  pointSize: z.number().min(0.1).max(10).optional(),
  filterQuery: z.string().max(1000).optional().nullable(),
});

// ============================================
// GET - Obtener detalles de una capa específica
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; layerId: string }> }
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

    const { id: datasetId, layerId } = await params;

    // 2. Validar ownership del dataset y obtener layer
    const layer = await prisma.layer.findFirst({
      where: {
        id: layerId,
        datasetId: datasetId,
        dataset: {
          userId: userId,
        },
      },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    });

    if (!layer) {
      return NextResponse.json(
        { error: 'Layer not found or access denied' },
        { status: 404 }
      );
    }

    // 3. Devolver datos de la capa
    const { dataset, ...layerData } = layer;

    return NextResponse.json({
      success: true,
      data: {
        ...layerData,
        datasetId: dataset.id,
        datasetName: dataset.name,
      },
    });

  } catch (error) {
    console.error('Error fetching layer:', error);
    
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
// PATCH - Actualizar configuración de capa
// ============================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; layerId: string }> }
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

    const { id: datasetId, layerId } = await params;

    // 2. Validar ownership del dataset
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied' },
        { status: 404 }
      );
    }

    // 3. Verificar que la capa existe y pertenece al dataset
    const existingLayer = await prisma.layer.findFirst({
      where: {
        id: layerId,
        datasetId: datasetId,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!existingLayer) {
      return NextResponse.json(
        { error: 'Layer not found in this dataset' },
        { status: 404 }
      );
    }

    // 4. Parse y validar body
    const body = await request.json();
    const validationResult = updateLayerSchema.safeParse(body);

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

    // 5. Validar filterQuery si se está actualizando
    if (data.filterQuery !== undefined && data.filterQuery !== null) {
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

    // 6. Actualizar capa en transacción
    const updatedLayer = await prisma.$transaction(async (tx) => {
      // Actualizar layer
      const layer = await tx.layer.update({
        where: {
          id: layerId,
        },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.enabled !== undefined && { enabled: data.enabled }),
          ...(data.colorScheme !== undefined && { colorScheme: data.colorScheme as any }),
          ...(data.opacity !== undefined && { opacity: data.opacity }),
          ...(data.pointSize !== undefined && { pointSize: data.pointSize }),
          ...(data.filterQuery !== undefined && { filterQuery: data.filterQuery }),
          updatedAt: new Date(),
        },
      });

      // Log de actividad
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: 'layer.updated',
          resource: 'Layer',
          resourceId: layerId,
          metadata: {
            datasetId: datasetId,
            layerName: layer.name,
            updatedFields: Object.keys(data),
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

    return NextResponse.json({
      success: true,
      data: updatedLayer,
      message: 'Layer updated successfully',
    });

  } catch (error) {
    console.error('Error updating layer:', error);
    
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
// DELETE - Eliminar capa de visualización
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; layerId: string }> }
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

    const { id: datasetId, layerId } = await params;

    // 2. Validar ownership del dataset
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
      select: {
        id: true,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied' },
        { status: 404 }
      );
    }

    // 3. Obtener la capa a eliminar con su orden
    const layerToDelete = await prisma.layer.findFirst({
      where: {
        id: layerId,
        datasetId: datasetId,
      },
      select: {
        id: true,
        name: true,
        order: true,
      },
    });

    if (!layerToDelete) {
      return NextResponse.json(
        { error: 'Layer not found in this dataset' },
        { status: 404 }
      );
    }

    // 4. Eliminar capa y reordenar en transacción
    await prisma.$transaction(async (tx) => {
      // Eliminar la capa
      await tx.layer.delete({
        where: {
          id: layerId,
        },
      });

      // Reordenar las capas restantes (decrementar order de las que venían después)
      await tx.layer.updateMany({
        where: {
          datasetId: datasetId,
          order: {
            gt: layerToDelete.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });

      // Log de actividad
      await tx.activityLog.create({
        data: {
          userId: userId,
          action: 'layer.deleted',
          resource: 'Layer',
          resourceId: layerId,
          metadata: {
            datasetId: datasetId,
            layerName: layerToDelete.name,
            previousOrder: layerToDelete.order,
            timestamp: new Date().toISOString(),
          },
          ipAddress: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Layer deleted successfully',
      data: {
        deletedLayerId: layerId,
        deletedLayerName: layerToDelete.name,
      },
    });

  } catch (error) {
    console.error('Error deleting layer:', error);
    
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