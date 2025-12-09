/**
 * VISUALIZATION LAYERS ENDPOINT
 * 
 * GET /api/datasets/[id]/layers - Listar capas
 * POST /api/datasets/[id]/layers - Crear capa
 * PATCH /api/datasets/[id]/layers - Reordenar capas
 * 
 * Gestiona capas de visualización para filtrar y estilizar DataPoints en el viewer.
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

// Schema para crear capa
const createLayerSchema = z.object({
  // Basic info
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional().nullable(),
  enabled: z.boolean().optional().default(true),
  
  // Asset type
  assetType: z.enum(['point', 'moving', 'area']).default('point'),
  
  // Render configuration
  renderType: z.enum(['marker', 'icon', 'image', 'model3d', 'shape']).default('marker'),
  markerConfig: markerConfigSchema,
  imageUrl: z.string().url().optional().nullable(),
  modelUrl: z.string().url().optional().nullable(),
  model3dConfig: model3dConfigSchema,
  shapeConfig: shapeConfigSchema,
  
  // Style
  colorScheme: colorSchemeSchema.optional().nullable(),
  opacity: z.number().min(0).max(1).default(1.0),
  pointSize: z.number().min(0.1).max(10).default(1.0),
  borderConfig: borderConfigSchema,
  shadowConfig: shadowConfigSchema,
  
  // Dynamic behavior
  colorRules: z.array(colorRuleSchema).optional().nullable(),
  scaleRules: z.array(scaleRuleSchema).optional().nullable(),
  visibilityRules: z.array(visibilityRuleSchema).optional().nullable(),
  
  // Trail configuration
  showTrail: z.boolean().optional().default(false),
  trailLength: z.number().int().min(1).max(1000).optional().default(50),
  trailWidth: z.number().min(0.1).max(20).optional().default(2.0),
  trailOpacity: z.number().min(0).max(1).optional().default(0.6),
  trailColorMode: z.enum(['static', 'dynamic', 'gradient', 'rules']).optional().default('static'),
  trailColorScheme: trailColorSchemeSchema,
  trailColorRules: z.array(trailColorRuleSchema).optional().nullable(),
  trailGradientConfig: trailGradientConfigSchema,
  trailValidationConfig: trailValidationConfigSchema,
  trailPointsConfig: trailPointsConfigSchema,
  
  // Filter
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
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: datasetId } = await params;

    // Validar ownership del dataset
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
      select: {
        id: true,
        name: true,
        viewType: true,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found or access denied' },
        { status: 404 }
      );
    }

    // Obtener todas las capas ordenadas
    const layers = await prisma.layer.findMany({
      where: {
        datasetId: datasetId,
      },
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        datasetId: dataset.id,
        datasetName: dataset.name,
        viewType: dataset.viewType,
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
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: datasetId } = await params;

    // Validar ownership del dataset
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

    // Parse y validar body
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

    // Validar filterQuery (prevenir SQL injection)
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

    // Validaciones específicas por renderType
    if (data.renderType === 'image' && !data.imageUrl) {
      return NextResponse.json(
        { error: 'imageUrl is required when renderType is "image"' },
        { status: 400 }
      );
    }

    if (data.renderType === 'model3d' && !data.modelUrl) {
      return NextResponse.json(
        { error: 'modelUrl is required when renderType is "model3d"' },
        { status: 400 }
      );
    }

    if (data.renderType === 'shape' && !data.shapeConfig) {
      return NextResponse.json(
        { error: 'shapeConfig is required when renderType is "shape"' },
        { status: 400 }
      );
    }

    // Obtener el orden máximo actual
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

    // Crear la capa en transacción
    const newLayer = await prisma.$transaction(async (tx) => {
      const layer = await tx.layer.create({
        data: {
          datasetId: datasetId,
          name: data.name,
          description: data.description,
          enabled: data.enabled,
          order: nextOrder,
          assetType: data.assetType,
          renderType: data.renderType,
          markerConfig: data.markerConfig as any,
          imageUrl: data.imageUrl,
          modelUrl: data.modelUrl,
          model3dConfig: data.model3dConfig as any,
          shapeConfig: data.shapeConfig as any,
          colorScheme: data.colorScheme as any,
          opacity: data.opacity,
          pointSize: data.pointSize,
          borderConfig: data.borderConfig as any,
          shadowConfig: data.shadowConfig as any,
          colorRules: data.colorRules as any,
          scaleRules: data.scaleRules as any,
          visibilityRules: data.visibilityRules as any,
          showTrail: data.showTrail,
          trailLength: data.trailLength,
          trailWidth: data.trailWidth,
          trailOpacity: data.trailOpacity,
          trailColorMode: data.trailColorMode,
          trailColorScheme: data.trailColorScheme as any,
          trailColorRules: data.trailColorRules as any,
          trailGradientConfig: data.trailGradientConfig as any,
          trailValidationConfig: data.trailValidationConfig as any,
          trailPointsConfig: data.trailPointsConfig as any,
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
            assetType: data.assetType,
            renderType: data.renderType,
            hasFilter: !!data.filterQuery,
            hasTrail: data.showTrail,
            has3dModel: !!data.modelUrl,
            hasTrailColorRules: !!data.trailColorRules?.length,
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

    // Parse body
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
            datasetId: datasetId,
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