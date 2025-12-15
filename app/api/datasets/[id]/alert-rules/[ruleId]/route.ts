import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

const updateAlertRuleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).optional(),
  description: z.string().optional(),
  metricPath: z.string().min(1, 'Metric path is required').optional(),
  condition: z.enum([
    'greater_than',
    'less_than',
    'equals',
    'not_equals',
    'between'
  ]).optional(),
  thresholdValue: z.number().optional(),
  thresholdMax: z.number().optional(),
  severity: z.enum(['info', 'warning', 'critical']).optional(),
  enabled: z.boolean().optional(),
  cooldownMinutes: z.number().int().min(1).max(1440).optional(),
  notifyEmail: z.boolean().optional(),
  notifySlack: z.boolean().optional(),
}).refine(
  (data) => {
    // Solo validar si se está actualizando la condición a "between"
    if (data.condition === 'between' && data.thresholdMax !== undefined && data.thresholdValue !== undefined) {
      if (data.thresholdMax <= data.thresholdValue) {
        return false;
      }
    }
    return true;
  },
  {
    message: 'For "between" condition, thresholdMax must be greater than thresholdValue',
    path: ['thresholdMax'],
  }
);

// ============================================
// GET - Obtener una alert rule específica
// ============================================

export async function GET(  
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  const { id: datasetId, ruleId } = await params;
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

    // Obtener la alert rule específica
    const alertRule = await prisma.alertRule.findFirst({
      where: {
        id: ruleId,
        datasetId: datasetId,
      },
      include: {
        _count: {
          select: {
            alerts: true,
          },
        },
      },
    });

    if (!alertRule) {
      return NextResponse.json(
        { error: 'Alert rule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: alertRule,
    });

  } catch (error) {
    console.error('Error fetching alert rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// PATCH - Actualizar una alert rule específica
// ============================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  const { id: datasetId, ruleId } = await params;
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

    // Verificar que la alert rule existe y pertenece al dataset
    const existingRule = await prisma.alertRule.findFirst({
      where: {
        id: ruleId,
        datasetId: datasetId,
      },
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Alert rule not found' },
        { status: 404 }
      );
    }

    // Parsear y validar el body
    const body = await req.json();
    const validatedData = updateAlertRuleSchema.parse(body);

    // Validación adicional para "between" condition
    if (validatedData.condition === 'between' || existingRule.condition === 'between') {
      const finalThresholdValue = validatedData.thresholdValue ?? existingRule.thresholdValue;
      const finalThresholdMax = validatedData.thresholdMax ?? existingRule.thresholdMax;
      const finalCondition = validatedData.condition ?? existingRule.condition;

      if (finalCondition === 'between') {
        if (!finalThresholdMax) {
          return NextResponse.json(
            { error: 'thresholdMax is required for "between" condition' },
            { status: 400 }
          );
        }
        if (finalThresholdMax <= finalThresholdValue) {
          return NextResponse.json(
            { error: 'thresholdMax must be greater than thresholdValue for "between" condition' },
            { status: 400 }
          );
        }
      }
    }

    // Actualizar la alert rule
    const updatedRule = await prisma.alertRule.update({
      where: {
        id: ruleId,
      },
      data: validatedData,
    });

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: 'UPDATE_ALERT_RULE',
        resource: 'AlertRule',
        resourceId: updatedRule.id,
        metadata: {
          datasetId: datasetId,
          changes: Object.keys(validatedData),
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedRule,
    });

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

    console.error('Error updating alert rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Eliminar una alert rule
// ============================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  const { id: datasetId, ruleId } = await params;
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

    // Verificar que la alert rule existe y pertenece al dataset
    const existingRule = await prisma.alertRule.findFirst({
      where: {
        id: ruleId,
        datasetId: datasetId,
      },
    });

    if (!existingRule) {
      return NextResponse.json(
        { error: 'Alert rule not found' },
        { status: 404 }
      );
    }

    // Eliminar la alert rule
    await prisma.alertRule.delete({
      where: {
        id: ruleId,
      },
    });

    // Log de actividad
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: 'DELETE_ALERT_RULE',
        resource: 'AlertRule',
        resourceId: ruleId,
        metadata: {
          datasetId: datasetId,
          name: existingRule.name,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Alert rule deleted successfully',
    });

  } catch (error) {
    console.error('Error deleting alert rule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}