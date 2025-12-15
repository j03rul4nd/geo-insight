import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

const alertRuleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  metricPath: z.string().min(1, 'Metric path is required'),
  condition: z.enum([
    'greater_than',
    'less_than',
    'equals',
    'not_equals',
    'between'
  ]),
  thresholdValue: z.number(),
  thresholdMax: z.number().optional(),
  severity: z.enum(['info', 'warning', 'critical']),
  enabled: z.boolean().default(true),
  cooldownMinutes: z.number().int().min(1).max(1440).default(15),
  notifyEmail: z.boolean().default(true),
  notifySlack: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.condition === 'between' && !data.thresholdMax) {
      return false;
    }
    if (data.condition === 'between' && data.thresholdMax && data.thresholdMax <= data.thresholdValue) {
      return false;
    }
    return true;
  },
  {
    message: 'For "between" condition, thresholdMax is required and must be greater than thresholdValue',
    path: ['thresholdMax'],
  }
);

// ============================================
// GET - Obtener todas las alert rules de un dataset
// ============================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: datasetId } = await params;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verificar que el dataset existe y pertenece al usuario
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Obtener todas las alert rules del dataset
    const alertRules = await prisma.alertRule.findMany({
      where: {
        datasetId: datasetId,
      },
      include: {
        _count: {
          select: {
            alerts: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      data: alertRules,
    });

  } catch (error) {
    console.error('Error fetching alert rules:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Crear una nueva alert rule
// ============================================

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: datasetId } = await params;
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verificar que el dataset existe y pertenece al usuario
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: 'Dataset not found' },
        { status: 404 }
      );
    }

    // Parsear y validar el body
    const body = await req.json();
    const validatedData = alertRuleSchema.parse(body);

    // Crear la alert rule
    const alertRule = await prisma.alertRule.create({
      data: {
        datasetId: datasetId,
        ...validatedData,
      },
    });

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: 'CREATE_ALERT_RULE',
        resource: 'AlertRule',
        resourceId: alertRule.id,
        metadata: {
          datasetId: datasetId,
          name: alertRule.name,
          severity: alertRule.severity,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: alertRule,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation error',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    console.error('Error creating alert rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}