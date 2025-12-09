// ============================================
// app/api/datasets/[id]/metrics/route.ts
// GET: Listar métricas, POST: Crear métrica
// ============================================

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { z } from 'zod';

// ============================================
// SCHEMAS DE VALIDACIÓN MEJORADOS
// ============================================

// Schema para operadores de filtros
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

// Schema para un filtro individual
const FilterRuleSchema = z.object({
  field: z.string().min(1, 'Field path is required'), // e.g., "metadata.sensorType"
  operator: FilterOperatorSchema,
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number()])), // Para operadores 'in' y 'not_in'
  ]),
});

// Schema para configuración de filtros (soporte AND/OR)
const FiltersConfigSchema = z.object({
  logic: z.enum(['AND', 'OR']).default('AND'),
  rules: z.array(FilterRuleSchema).min(1, 'At least one filter rule is required'),
});

// Schema para thresholds de gauge
const ThresholdSchema = z.object({
  value: z.number(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  label: z.string().optional(),
});

const CreateMetricSchema = z.object({
  // Configuración básica
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  valueSelector: z.string().min(1, 'Value selector is required'),
  
  // Agregación y procesamiento
  aggregation: z.enum(['none', 'avg', 'sum', 'min', 'max', 'count']).default('none'),
  windowSize: z.number().int().min(10).max(1000).default(50),
  
  // Tipo de chart
  chartType: z.enum(['line', 'area', 'bar', 'scatter', 'gauge', 'distribution']).default('line'),
  showStats: z.boolean().default(true),
  
  // Display options
  unit: z.string().max(20).nullable().optional(),
  decimals: z.number().int().min(0).max(10).default(2),
  
  // 🆕 Filtros avanzados
  filters: FiltersConfigSchema.nullable().optional(),
  
  // Opciones avanzadas de chart
  secondaryValueSelector: z.string().nullable().optional(),
  groupBySelector: z.string().nullable().optional(),
  thresholds: z.array(ThresholdSchema).nullable().optional(),
  
  // Configuración adicional
  description: z.string().max(500).nullable().optional(),
  isVisible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
}).refine(
  (data) => {
    // Validación: scatter plot requiere secondaryValueSelector
    if (data.chartType === 'scatter' && !data.secondaryValueSelector) {
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
    // Validación: gauge con thresholds no puede estar vacío
    if (data.chartType === 'gauge' && data.thresholds && data.thresholds.length === 0) {
      return false;
    }
    return true;
  },
  {
    message: 'Gauge thresholds array cannot be empty if provided',
    path: ['thresholds'],
  }
).refine(
  (data) => {
    // Validación: operadores 'in' y 'not_in' requieren array
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
// GET: Obtener todas las métricas de un dataset
// ============================================

export async function GET(
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

    // Verificar que el dataset existe y pertenece al usuario
    const dataset = await verifyDatasetOwnership(userId, datasetId);

    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Query params opcionales para filtrado
    const { searchParams } = new URL(request.url);
    const includeHidden = searchParams.get('includeHidden') === 'true';
    const chartType = searchParams.get('chartType');
    const hasFilters = searchParams.get('hasFilters') === 'true';

    // Construir filtro dinámico
    const where: any = { datasetId };
    
    if (!includeHidden) {
      where.isVisible = true;
    }
    
    if (chartType) {
      where.chartType = chartType;
    }

    if (hasFilters) {
      where.filters = { not: Prisma.JsonNull };
    }

    // Obtener métricas ordenadas por sortOrder y createdAt
    const metrics = await prisma.metricConfig.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ],
    });

    return NextResponse.json({
      success: true,
      metrics,
      count: metrics.length,
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// POST: Crear nueva métrica
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
    const validatedData = CreateMetricSchema.parse(body);

    // Verificar que no exista una métrica con el mismo nombre
    const existingMetric = await prisma.metricConfig.findFirst({
      where: {
        datasetId,
        name: validatedData.name.trim(),
      },
    });

    if (existingMetric) {
      return NextResponse.json(
        { success: false, error: 'A metric with this name already exists' },
        { status: 409 }
      );
    }

    // Si no se proporciona sortOrder, usar el siguiente disponible
    if (validatedData.sortOrder === 0) {
      const lastMetric = await prisma.metricConfig.findFirst({
        where: { datasetId },
        orderBy: { sortOrder: 'desc' },
      });
      validatedData.sortOrder = lastMetric ? lastMetric.sortOrder + 1 : 0;
    }

    // Crear métrica con todos los campos
    const metric = await prisma.metricConfig.create({
      data: {
        name: validatedData.name.trim(),
        color: validatedData.color,
        valueSelector: validatedData.valueSelector.trim(),
        aggregation: validatedData.aggregation,
        windowSize: validatedData.windowSize,
        chartType: validatedData.chartType,
        showStats: validatedData.showStats,
        unit: validatedData.unit?.trim() || null,
        decimals: validatedData.decimals,
        
        // 🆕 Filtros avanzados - usar Prisma.JsonNull si no hay filtros
        filters: validatedData.filters || Prisma.JsonNull,
        
        // Campos avanzados con manejo correcto de JSON null
        secondaryValueSelector: validatedData.secondaryValueSelector?.trim() || null,
        groupBySelector: validatedData.groupBySelector?.trim() || null,
        thresholds: validatedData.thresholds || Prisma.JsonNull,
        
        description: validatedData.description?.trim() || null,
        isVisible: validatedData.isVisible,
        sortOrder: validatedData.sortOrder,
        
        dataset: {
          connect: { id: datasetId }
        }
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Metric created successfully',
        metric,
      },
      { status: 201 }
    );
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

    console.error('Error creating metric:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}