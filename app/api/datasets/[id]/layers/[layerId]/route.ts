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

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

const markerConfigSchema = z.object({
  iconName: z.string().optional(),
  iconLibrary: z.enum(['lucide', 'custom']).optional(),
  customSvg: z.string().optional(),
}).optional();

const model3dConfigSchema = z.object({
  scale: z.array(z.number()).length(3).optional(),
  rotation: z.array(z.number()).length(3).optional(),
  translate: z.array(z.number()).length(3).optional(),
  orientation: z.enum(['map', 'viewport', 'auto']).optional(),
  anchor: z.enum(['center', 'bottom', 'top']).optional(),
  autoRotate: z.boolean().optional(),
  autoRotateOffset: z.number().optional(),
  minZoom: z.number().optional(),
  maxZoom: z.number().optional(),
  scaleWithZoom: z.boolean().optional(),
  scaleRange: z.array(z.number()).length(2).optional(),
  animations: z.object({
    idle: z.string().optional(),
    moving: z.string().optional(),
    speed: z.number().optional(),
  }).optional(),
  castShadows: z.boolean().optional(),
  receiveShadows: z.boolean().optional(),
  metalness: z.number().optional(),
  roughness: z.number().optional(),
  emissiveIntensity: z.number().optional(),
  frustumCulling: z.boolean().optional(),
  lodEnabled: z.boolean().optional(),
  lodDistances: z.array(z.number()).optional(),
  clickable: z.boolean().optional(),
  hoverable: z.boolean().optional(),
  altitudeMode: z.enum(['absolute', 'relative', 'clampToGround']).optional(),
  heightOffset: z.number().optional(),
}).optional();

const shapeConfigSchema = z.object({
  type: z.enum(['circle', 'polygon', 'rectangle', 'custom']),
  coordinates: z.array(z.array(z.number())).optional(),
  radius: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  fillColor: z.string().optional(),
  strokeColor: z.string().optional(),
  strokeWidth: z.number().optional(),
}).optional();

const borderConfigSchema = z.object({
  width: z.number().min(0),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  style: z.enum(['solid', 'dashed', 'dotted']),
}).optional();

const shadowConfigSchema = z.object({
  enabled: z.boolean(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  blur: z.number().min(0),
  offsetX: z.number(),
  offsetY: z.number(),
}).optional();

const colorSchemeSchema = z.object({
  type: z.enum(['gradient', 'solid', 'heatmap', 'categorical']),
  low: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  high: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  colors: z.array(z.string()).optional(),
  thresholds: z.array(z.number()).optional(),
});

const colorRuleSchema = z.object({
  condition: z.string(),
  colorScheme: colorSchemeSchema,
  priority: z.number().optional(),
});

const scaleRuleSchema = z.object({
  condition: z.string(),
  scale: z.number().min(0.1).max(10),
  priority: z.number().optional(),
});

const visibilityRuleSchema = z.object({
  condition: z.string(),
  visible: z.boolean(),
  priority: z.number().optional(),
});

const trailColorRuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  priority: z.number(),
  applicationType: z.enum(['entire-trail', 'current-segment', 'future-segments', 'historical']),
  enabled: z.boolean(),
  description: z.string().optional(),
  condition: z.string(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

const trailGradientConfigSchema = z.object({
  enabled: z.boolean(),
  fadeOldSegments: z.boolean().optional(),
  fadeStartAge: z.number().optional(),
  fadeEndAge: z.number().optional(),
  minOpacity: z.number().min(0).max(1).optional(),
}).optional();

const trailValidationConfigSchema = z.object({
  enableValidation: z.boolean().optional(),
  minDistanceThreshold: z.number().optional(),
  maxTimeBetweenPoints: z.number().optional(),
}).optional();

const trailPointsConfigSchema = z.object({
  showHistoricalPoints: z.boolean().optional(),
  pointInterval: z.number().optional(),
  pointSize: z.number().optional(),
  pointOpacity: z.number().min(0).max(1).optional(),
  fadeWithAge: z.boolean().optional(),
}).optional();

const trailColorSchemeSchema = z.object({
  type: z.enum(['static', 'gradient', 'speed-based']),
  staticColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  gradient: z.object({
    stops: z.array(z.object({
      value: z.number(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    })),
  }).optional(),
  speedBased: z.object({
    lowSpeed: z.object({
      threshold: z.number(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
    mediumSpeed: z.object({
      threshold: z.number(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
    highSpeed: z.object({
      threshold: z.number(),
      color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
    }),
  }).optional(),
}).optional();

// Schema para actualizar capa (todos los campos opcionales)
const updateLayerSchema = z.object({
  // Basic info
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  enabled: z.boolean().optional(),
  
  // Asset type
  assetType: z.enum(['point', 'moving', 'area']).optional(),
  
  // Render configuration
  renderType: z.enum(['marker', 'icon', 'image', 'model3d', 'shape']).optional(),
  markerConfig: markerConfigSchema,
  imageUrl: z.string().url().optional().nullable(),
  modelUrl: z.string().url().optional().nullable(),
  model3dConfig: model3dConfigSchema,
  shapeConfig: shapeConfigSchema,
  
  // Style
  colorScheme: colorSchemeSchema.optional().nullable(),
  opacity: z.number().min(0).max(1).optional(),
  pointSize: z.number().min(0.1).max(10).optional(),
  borderConfig: borderConfigSchema,
  shadowConfig: shadowConfigSchema,
  
  // Dynamic behavior
  colorRules: z.array(colorRuleSchema).optional().nullable(),
  scaleRules: z.array(scaleRuleSchema).optional().nullable(),
  visibilityRules: z.array(visibilityRuleSchema).optional().nullable(),
  
  // Trail configuration
  showTrail: z.boolean().optional(),
  trailLength: z.number().int().min(1).max(1000).optional(),
  trailWidth: z.number().min(0.1).max(20).optional(),
  trailOpacity: z.number().min(0).max(1).optional(),
  trailColorMode: z.enum(['static', 'dynamic', 'gradient', 'rules']).optional(),
  trailColorScheme: trailColorSchemeSchema,
  trailColorRules: z.array(trailColorRuleSchema).optional().nullable(),
  trailGradientConfig: trailGradientConfigSchema,
  trailValidationConfig: trailValidationConfigSchema,
  trailPointsConfig: trailPointsConfigSchema,
  
  // Filter
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
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: datasetId, layerId } = await params;

    // Validar ownership del dataset y obtener layer
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
            viewType: true,
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

    // Devolver datos de la capa
    const { dataset, ...layerData } = layer;

    return NextResponse.json({
      success: true,
      data: {
        ...layerData,
        datasetId: dataset.id,
        datasetName: dataset.name,
        datasetViewType: dataset.viewType,
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
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: datasetId, layerId } = await params;

    // Validar ownership del dataset
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

    // Verificar que la capa existe y pertenece al dataset
    const existingLayer = await prisma.layer.findFirst({
      where: {
        id: layerId,
        datasetId: datasetId,
      },
      select: {
        id: true,
        name: true,
        renderType: true,
      },
    });

    if (!existingLayer) {
      return NextResponse.json(
        { error: 'Layer not found in this dataset' },
        { status: 404 }
      );
    }

    // Parse y validar body
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

    // Validar filterQuery si se está actualizando
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

    // Validaciones específicas por renderType
    const newRenderType = data.renderType || existingLayer.renderType;
    
    if (newRenderType === 'image' && data.imageUrl === null) {
      return NextResponse.json(
        { error: 'imageUrl cannot be null when renderType is "image"' },
        { status: 400 }
      );
    }

    if (newRenderType === 'model3d' && data.modelUrl === null) {
      return NextResponse.json(
        { error: 'modelUrl cannot be null when renderType is "model3d"' },
        { status: 400 }
      );
    }

    if (newRenderType === 'shape' && data.shapeConfig === null) {
      return NextResponse.json(
        { error: 'shapeConfig cannot be null when renderType is "shape"' },
        { status: 400 }
      );
    }

    // Actualizar capa en transacción
    const updatedLayer = await prisma.$transaction(async (tx) => {
      const layer = await tx.layer.update({
        where: {
          id: layerId,
        },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.enabled !== undefined && { enabled: data.enabled }),
          ...(data.assetType !== undefined && { assetType: data.assetType }),
          ...(data.renderType !== undefined && { renderType: data.renderType }),
          ...(data.markerConfig !== undefined && { markerConfig: data.markerConfig as any }),
          ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
          ...(data.modelUrl !== undefined && { modelUrl: data.modelUrl }),
          ...(data.model3dConfig !== undefined && { model3dConfig: data.model3dConfig as any }),
          ...(data.shapeConfig !== undefined && { shapeConfig: data.shapeConfig as any }),
          ...(data.colorScheme !== undefined && { colorScheme: data.colorScheme as any }),
          ...(data.opacity !== undefined && { opacity: data.opacity }),
          ...(data.pointSize !== undefined && { pointSize: data.pointSize }),
          ...(data.borderConfig !== undefined && { borderConfig: data.borderConfig as any }),
          ...(data.shadowConfig !== undefined && { shadowConfig: data.shadowConfig as any }),
          ...(data.colorRules !== undefined && { colorRules: data.colorRules as any }),
          ...(data.scaleRules !== undefined && { scaleRules: data.scaleRules as any }),
          ...(data.visibilityRules !== undefined && { visibilityRules: data.visibilityRules as any }),
          ...(data.showTrail !== undefined && { showTrail: data.showTrail }),
          ...(data.trailLength !== undefined && { trailLength: data.trailLength }),
          ...(data.trailWidth !== undefined && { trailWidth: data.trailWidth }),
          ...(data.trailOpacity !== undefined && { trailOpacity: data.trailOpacity }),
          ...(data.trailColorMode !== undefined && { trailColorMode: data.trailColorMode }),
          ...(data.trailColorScheme !== undefined && { trailColorScheme: data.trailColorScheme as any }),
          ...(data.trailColorRules !== undefined && { trailColorRules: data.trailColorRules as any }),
          ...(data.trailGradientConfig !== undefined && { trailGradientConfig: data.trailGradientConfig as any }),
          ...(data.trailValidationConfig !== undefined && { trailValidationConfig: data.trailValidationConfig as any }),
          ...(data.trailPointsConfig !== undefined && { trailPointsConfig: data.trailPointsConfig as any }),
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
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: datasetId, layerId } = await params;

    // Validar ownership del dataset
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

    // Obtener la capa a eliminar con su orden
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

    // Eliminar capa y reordenar en transacción
    await prisma.$transaction(async (tx) => {
      // Eliminar la capa
      await tx.layer.delete({
        where: {
          id: layerId,
        },
      });

      // Reordenar las capas restantes
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