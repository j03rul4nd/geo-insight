import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { detectMapping } from '@/lib/normalizePayload';

/**
 * POST /api/datasets/[id]/mapping/detect
 * Detecta automáticamente el mapping basándose en un payload de ejemplo
 */
export async function POST(
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
    
    // Verificar que el dataset pertenece al usuario
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId,
      },
    });
    
    if (!dataset) {
      return NextResponse.json(
        { success: false, error: 'Dataset not found' },
        { status: 404 }
      );
    }
    
    // Obtener el payload de ejemplo del body
    const body = await request.json();
    const { payload, applyToDataset } = body;
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Sample payload is required' },
        { status: 400 }
      );
    }
    
    // Detectar el mapping usando la función del lib
    const detected = detectMapping(payload);
    
    // Si applyToDataset es true, guardar automáticamente
    if (applyToDataset === true) {
      await prisma.datasetMapping.upsert({
        where: { datasetId },
        update: {
          valuePath: detected.valuePath,
          xPath: detected.xPath ?? null,
          yPath: detected.yPath ?? null,
          zPath: detected.zPath ?? null,
          sensorIdPath: detected.sensorIdPath ?? null,
          sensorTypePath: detected.sensorTypePath ?? null,
          timestampPath: detected.timestampPath,
          unitPath: detected.unitPath ?? null,
          transforms: detected.transforms ?? Prisma.JsonNull,
        },
        create: {
          datasetId,
          valuePath: detected.valuePath,
          xPath: detected.xPath ?? null,
          yPath: detected.yPath ?? null,
          zPath: detected.zPath ?? null,
          sensorIdPath: detected.sensorIdPath ?? null,
          sensorTypePath: detected.sensorTypePath ?? null,
          timestampPath: detected.timestampPath,
          unitPath: detected.unitPath ?? null,
          transforms: detected.transforms ?? Prisma.JsonNull,
        },
      });
      
      return NextResponse.json({
        success: true,
        detected,
        applied: true,
        message: 'Mapping detected and applied successfully',
      });
    }
    
    // Si no, solo devolver la detección
    return NextResponse.json({
      success: true,
      detected,
      applied: false,
      message: 'Mapping detected. Review and apply manually.',
    });
  } catch (error) {
    console.error('Error detecting mapping:', error);
    
    // Si es un error de la función detectMapping
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Auto-detection failed', 
          details: error.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}