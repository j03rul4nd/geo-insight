// ============================================
// app/api/datasets/[id]/metrics/batch/route.ts
// POST: Operaciones batch (reordenar, toggle visibility, etc.)
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

const ReorderMetricsSchema = z.object({
  action: z.literal('reorder'),
  metrics: z.array(
    z.object({
      id: z.string(),
      sortOrder: z.number().int(),
    })
  ).min(1),
});

const ToggleVisibilitySchema = z.object({
  action: z.literal('toggle_visibility'),
  metricIds: z.array(z.string()).min(1),
  isVisible: z.boolean(),
});

const DeleteBatchSchema = z.object({
  action: z.literal('delete'),
  metricIds: z.array(z.string()).min(1),
});

const BatchOperationSchema = z.discriminatedUnion('action', [
  ReorderMetricsSchema,
  ToggleVisibilitySchema,
  DeleteBatchSchema,
]);

// ============================================
// HELPER: Verificar propiedad del dataset
// ============================================

async function verifyDatasetOwnership(userId: string, datasetId: string) {
  const dataset = await prisma.dataset.findFirst({
    where: {
      id: datasetId,
      userId,
    },
  });
  return dataset;
}

// ============================================
// POST: Operaciones batch
// ============================================

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { id: datasetId } = await params;

    // Verificar dataset
    const dataset = await verifyDatasetOwnership(userId, datasetId);

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Parsear y validar body
    const body = await request.json();
    const validatedData = BatchOperationSchema.parse(body);

    // Ejecutar operación según el tipo
    switch (validatedData.action) {
      case 'reorder': {
        // Reordenar métricas usando transacción
        const updatePromises = validatedData.metrics.map((metric) =>
          prisma.metricConfig.update({
            where: {
              id: metric.id,
              datasetId, // Asegurar que pertenece al dataset
            },
            data: {
              sortOrder: metric.sortOrder,
            },
          })
        );

        await prisma.$transaction(updatePromises);

        return NextResponse.json({
          success: true,
          message: 'Metrics reordered successfully',
          count: validatedData.metrics.length,
        });
      }

      case 'toggle_visibility': {
        // Toggle visibility de múltiples métricas
        await prisma.metricConfig.updateMany({
          where: {
            id: { in: validatedData.metricIds },
            datasetId,
          },
          data: {
            isVisible: validatedData.isVisible,
          },
        });

        return NextResponse.json({
          success: true,
          message: `Metrics ${validatedData.isVisible ? 'shown' : 'hidden'} successfully`,
          count: validatedData.metricIds.length,
        });
      }

      case 'delete': {
        // Eliminar múltiples métricas
        const result = await prisma.metricConfig.deleteMany({
          where: {
            id: { in: validatedData.metricIds },
            datasetId,
          },
        });

        return NextResponse.json({
          success: true,
          message: 'Metrics deleted successfully',
          count: result.count,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid batch operation',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Error in batch operation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}