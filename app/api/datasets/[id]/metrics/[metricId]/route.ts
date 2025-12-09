// ============================================
// app/api/datasets/[id]/metrics/[metricId]/route.ts
// GET: Obtener métrica, PUT: Actualizar, DELETE: Eliminar
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

const FilterOperatorSchema = z.enum([
  'equals',
  'not_equals',
  'contains',
  'not_contains',
  'greater_than',
  'less_than',
  'greater_than_or_equal',
  'less_than_or_equal',
  'in',
  'not_in',
]);

const FilterRuleSchema = z.object({
  field: z.string().min(1),
  operator: FilterOperatorSchema,
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number()])),
  ]),
});

const FiltersConfigSchema = z.object({
  logic: z.enum(['AND', 'OR']).default('AND'),
  rules: z.array(FilterRuleSchema).min(1),
});

const ThresholdSchema = z.object({
  value: z.number(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  label: z.string().optional(),
});

const UpdateMetricSchema = z.object({
  // Configuración básica
  name: z.string().min(1).max(100).optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  valueSelector: z.string().min(1).optional(),
  
  // Agregación y procesamiento
  aggregation: z.enum(['none', 'avg', 'sum', 'min', 'max', 'count']).optional(),
  windowSize: z.number().int().min(10).max(1000).optional(),
  
  // Tipo de chart
  chartType: z.enum(['line', 'area', 'bar', 'scatter', 'gauge', 'distribution']).optional(),
  showStats: z.boolean().optional(),
  
  // Display options
  unit: z.string().max(20).nullable().optional(),
  decimals: z.number().int().min(0).max(10).optional(),
  
  // 🆕 Filtros avanzados
  filters: FiltersConfigSchema.nullable().optional(),
  
  // Opciones avanzadas
  secondaryValueSelector: z.string().nullable().optional(),
  groupBySelector: z.string().nullable().optional(),
  thresholds: z.array(ThresholdSchema).nullable().optional(),
  
  // Configuración adicional
  description: z.string().max(500).nullable().optional(),
  isVisible: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
}).refine(
  (data) => {
    // Si se actualiza a scatter, debe tener secondaryValueSelector
    if (data.chartType === 'scatter' && data.secondaryValueSelector === null) {
      return false;
    }
    return true;
  },
  {
    message: 'Scatter plots require secondaryValueSelector',
    path: ['secondaryValueSelector'],
  }
).refine(
  (data) => {
    // Validación de operadores in/not_in
    if (data.filters) {
      for (const rule of data.filters.rules) {
        if ((rule.operator === 'in' || rule.operator === 'not_in') && !Array.isArray(rule.value)) {
          return false;
        }
      }
    }
    return true;
  },
  {
    message: 'Operators "in" and "not_in" require an array value',
    path: ['filters'],
  }
);

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
// GET: Obtener una métrica específica
// ============================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; metricId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: datasetId, metricId } = await params;

    // Verificar dataset
    const dataset = await verifyDatasetOwnership(userId, datasetId);

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Obtener métrica
    const metric = await prisma.metricConfig.findFirst({
      where: {
        id: metricId,
        datasetId,
      },
    });

    if (!metric) {
      return NextResponse.json(
        { success: false, error: 'Metric not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      metric,
    });
  } catch (error) {
    console.error('Error fetching metric:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// PUT: Actualizar métrica existente
// ============================================

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; metricId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: datasetId, metricId } = await params;

    // Verificar dataset
    const dataset = await verifyDatasetOwnership(userId, datasetId);

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Verificar que la métrica existe
    const existingMetric = await prisma.metricConfig.findFirst({
      where: {
        id: metricId,
        datasetId,
      },
    });

    if (!existingMetric) {
      return NextResponse.json(
        { success: false, error: 'Metric not found' },
        { status: 404 }
      );
    }

    // Parse y validar body
    const body = await request.json();
    const validatedData = UpdateMetricSchema.parse(body);

    // Si se actualiza el nombre, verificar que no exista otro con ese nombre
    if (validatedData.name && validatedData.name !== existingMetric.name) {
      const duplicate = await prisma.metricConfig.findFirst({
        where: {
          datasetId,
          name: validatedData.name.trim(),
          id: { not: metricId },
        },
      });

      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'A metric with this name already exists' },
          { status: 409 }
        );
      }
    }

    // Construir objeto de actualización dinámicamente
    const updateData: any = {};
    
    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name.trim();
    }
    if (validatedData.color !== undefined) {
      updateData.color = validatedData.color;
    }
    if (validatedData.valueSelector !== undefined) {
      updateData.valueSelector = validatedData.valueSelector.trim();
    }
    if (validatedData.aggregation !== undefined) {
      updateData.aggregation = validatedData.aggregation;
    }
    if (validatedData.windowSize !== undefined) {
      updateData.windowSize = validatedData.windowSize;
    }
    if (validatedData.chartType !== undefined) {
      updateData.chartType = validatedData.chartType;
    }
    if (validatedData.showStats !== undefined) {
      updateData.showStats = validatedData.showStats;
    }
    if (validatedData.unit !== undefined) {
      updateData.unit = validatedData.unit?.trim() || null;
    }
    if (validatedData.decimals !== undefined) {
      updateData.decimals = validatedData.decimals;
    }
    
    // 🆕 Filtros avanzados
    if (validatedData.filters !== undefined) {
      updateData.filters = validatedData.filters || Prisma.JsonNull;
    }
    
    // Campos avanzados
    if (validatedData.secondaryValueSelector !== undefined) {
      updateData.secondaryValueSelector = validatedData.secondaryValueSelector?.trim() || null;
    }
    if (validatedData.groupBySelector !== undefined) {
      updateData.groupBySelector = validatedData.groupBySelector?.trim() || null;
    }
    if (validatedData.thresholds !== undefined) {
      updateData.thresholds = validatedData.thresholds || Prisma.JsonNull;
    }
    if (validatedData.description !== undefined) {
      updateData.description = validatedData.description?.trim() || null;
    }
    if (validatedData.isVisible !== undefined) {
      updateData.isVisible = validatedData.isVisible;
    }
    if (validatedData.sortOrder !== undefined) {
      updateData.sortOrder = validatedData.sortOrder;
    }

    // Actualizar métrica
    const metric = await prisma.metricConfig.update({
      where: { id: metricId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Metric updated successfully',
      metric,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid metric configuration',
          details: error.errors.map((err) => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Error updating metric:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE: Eliminar métrica
// ============================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; metricId: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: datasetId, metricId } = await params;

    // Verificar dataset
    const dataset = await verifyDatasetOwnership(userId, datasetId);

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Verificar que la métrica existe
    const metric = await prisma.metricConfig.findFirst({
      where: {
        id: metricId,
        datasetId,
      },
    });

    if (!metric) {
      return NextResponse.json(
        { success: false, error: 'Metric not found' },
        { status: 404 }
      );
    }

    // Eliminar métrica
    await prisma.metricConfig.delete({
      where: { id: metricId },
    });

    return NextResponse.json({
      success: true,
      message: 'Metric deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting metric:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}