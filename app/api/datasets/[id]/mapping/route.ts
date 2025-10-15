import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación mejorado
const MappingSchema = z.object({
  valuePath: z.string().min(1, 'valuePath is required'),
  xPath: z.string().nullable().optional(),
  yPath: z.string().nullable().optional(),
  zPath: z.string().nullable().optional(),
  sensorIdPath: z.string().nullable().optional(),
  sensorTypePath: z.string().nullable().optional(),
  timestampPath: z.string().min(1, 'timestampPath is required'),
  unitPath: z.string().nullable().optional(),
  transforms: z.record(z.any()).nullable().optional(),
  metadata: z.record(z.any()).nullable().optional(),
});

/**
 * Verifica que el dataset pertenezca al usuario autenticado
 */
async function verifyDatasetOwnership(userId: string, datasetId: string) {
  const dataset = await prisma.dataset.findFirst({
    where: {
      id: datasetId,
      userId,
    },
  });
  
  return dataset;
}

/**
 * GET /api/datasets/[id]/mapping
 * Obtiene la configuración de mapping actual
 */
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const params = await props.params;
    const datasetId = params.id;
    
    // Verificar propiedad del dataset
    const dataset = await verifyDatasetOwnership(userId, datasetId);
    
    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Buscar mapping existente
    let mapping = await prisma.datasetMapping.findUnique({
      where: { datasetId },
    });
    
    // Si no existe, crear uno por defecto
    if (!mapping) {
      mapping = await prisma.datasetMapping.create({
        data: {
          datasetId,
          valuePath: 'value',
          xPath: 'x',
          yPath: 'y',
          zPath: 'z',
          sensorIdPath: 'sensorId',
          sensorTypePath: 'sensorType',
          timestampPath: 'timestamp',
          unitPath: 'unit',
        },
      });
    }
    
    return NextResponse.json({
      success: true,
      mapping: {
        id: mapping.id,
        datasetId: mapping.datasetId,
        valuePath: mapping.valuePath,
        xPath: mapping.xPath,
        yPath: mapping.yPath,
        zPath: mapping.zPath,
        sensorIdPath: mapping.sensorIdPath,
        sensorTypePath: mapping.sensorTypePath,
        timestampPath: mapping.timestampPath,
        unitPath: mapping.unitPath,
        transforms: mapping.transforms,
        metadata: mapping.metadata,
        updatedAt: mapping.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching mapping:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/datasets/[id]/mapping
 * Actualiza la configuración de mapping
 */
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const params = await props.params;
    const datasetId = params.id;
    
    // Verificar propiedad del dataset
    const dataset = await verifyDatasetOwnership(userId, datasetId);
    
    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Parsear y validar el body
    const body = await request.json();
    const validatedData = MappingSchema.parse(body);
    
    // Actualizar o crear mapping
    const mapping = await prisma.datasetMapping.upsert({
      where: { datasetId },
      update: {
        valuePath: validatedData.valuePath,
        xPath: validatedData.xPath ?? null,
        yPath: validatedData.yPath ?? null,
        zPath: validatedData.zPath ?? null,
        sensorIdPath: validatedData.sensorIdPath ?? null,
        sensorTypePath: validatedData.sensorTypePath ?? null,
        timestampPath: validatedData.timestampPath,
        unitPath: validatedData.unitPath ?? null,
        transforms: validatedData.transforms ?? null,
        metadata: validatedData.metadata ?? null,
      },
      create: {
        datasetId,
        valuePath: validatedData.valuePath,
        xPath: validatedData.xPath ?? null,
        yPath: validatedData.yPath ?? null,
        zPath: validatedData.zPath ?? null,
        sensorIdPath: validatedData.sensorIdPath ?? null,
        sensorTypePath: validatedData.sensorTypePath ?? null,
        timestampPath: validatedData.timestampPath,
        unitPath: validatedData.unitPath ?? null,
        transforms: validatedData.transforms ?? null,
        metadata: validatedData.metadata ?? null,
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Mapping updated successfully',
      mapping: {
        id: mapping.id,
        datasetId: mapping.datasetId,
        valuePath: mapping.valuePath,
        xPath: mapping.xPath,
        yPath: mapping.yPath,
        zPath: mapping.zPath,
        sensorIdPath: mapping.sensorIdPath,
        sensorTypePath: mapping.sensorTypePath,
        timestampPath: mapping.timestampPath,
        unitPath: mapping.unitPath,
        transforms: mapping.transforms,
        metadata: mapping.metadata,
        updatedAt: mapping.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid mapping configuration', 
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          }))
        },
        { status: 400 }
      );
    }
    
    console.error('Error updating mapping:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/datasets/[id]/mapping
 * Resetea el mapping a valores por defecto
 */
export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const params = await props.params;
    const datasetId = params.id;
    
    // Verificar propiedad del dataset
    const dataset = await verifyDatasetOwnership(userId, datasetId);
    
    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Resetear a valores por defecto
    const mapping = await prisma.datasetMapping.upsert({
      where: { datasetId },
      update: {
        valuePath: 'value',
        xPath: 'x',
        yPath: 'y',
        zPath: 'z',
        sensorIdPath: 'sensorId',
        sensorTypePath: 'sensorType',
        timestampPath: 'timestamp',
        unitPath: 'unit',
        transforms: null,
        metadata: null,
      },
      create: {
        datasetId,
        valuePath: 'value',
        xPath: 'x',
        yPath: 'y',
        zPath: 'z',
        sensorIdPath: 'sensorId',
        sensorTypePath: 'sensorType',
        timestampPath: 'timestamp',
        unitPath: 'unit',
      },
    });
    
    return NextResponse.json({
      success: true,
      message: 'Mapping reset to defaults',
      mapping: {
        id: mapping.id,
        datasetId: mapping.datasetId,
        valuePath: mapping.valuePath,
        xPath: mapping.xPath,
        yPath: mapping.yPath,
        zPath: mapping.zPath,
        sensorIdPath: mapping.sensorIdPath,
        sensorTypePath: mapping.sensorTypePath,
        timestampPath: mapping.timestampPath,
        unitPath: mapping.unitPath,
        transforms: mapping.transforms,
        metadata: mapping.metadata,
        updatedAt: mapping.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error resetting mapping:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}