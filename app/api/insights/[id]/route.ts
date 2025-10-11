/**
 * INSIGHT DETAIL ENDPOINT
 * 
 * GET - OBJETIVO:
 * Obtener detalles completos de un insight específico.
 * 
 * GET - MISIÓN:
 * - Validar ownership (insight.userId match)
 * - Devolver Insight completo con:
 *   · title, summary, details, recommendations
 *   · affectedArea, metricsDelta
 *   · Datos del Dataset relacionado
 *   · modelUsed, confidence, tokensUsed
 * 
 * PATCH - OBJETIVO:
 * Marcar insight como resuelto o actualizar notas.
 * 
 * PATCH - MISIÓN:
 * - Validar ownership
 * - Permitir actualizar:
 *   · isResolved (true/false)
 *   · resolvedBy (userId automático)
 *   · resolvedAt (timestamp automático)
 * - Crear ActivityLog: action="insight.resolved"
 * 
 * USADO POR:
 * - /insights/[id] detail page
 * - Botón "Mark as Resolved" en insight cards
 * - Modal de detalles en /datasets/[id]
 * 
 * PRISMA MODELS:
 * - Insight (all fields)
 * - Dataset (relación para mostrar nombre)
 * - ActivityLog
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET - Obtener detalles completos de un insight
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. Await params (Next.js 15 requirement)
    const { id } = await params;

    // 1. Validar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Obtener insight con relaciones
    const insight = await prisma.insight.findUnique({
      where: {
        id: id,
      },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            source: true,
            totalDataPoints: true,
            lastDataReceived: true,
            createdAt: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    // 3. Validar existencia
    if (!insight) {
      return NextResponse.json(
        { error: "Insight no encontrado" },
        { status: 404 }
      );
    }

    // 4. Validar ownership
    if (insight.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para ver este insight" },
        { status: 403 }
      );
    }

    // 5. Calcular métricas adicionales
    const daysAgo = Math.floor(
      (Date.now() - insight.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    const isRecent = daysAgo <= 7;
    const isStale = daysAgo > 30;

    // 6. Obtener insights relacionados del mismo dataset (para mostrar contexto)
    const relatedInsights = await prisma.insight.findMany({
      where: {
        datasetId: insight.datasetId,
        id: { not: insight.id }, // Excluir el actual
        userId: userId,
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        severity: true,
        title: true,
        summary: true,
        isResolved: true,
        createdAt: true,
      },
    });

    // 7. Formatear respuesta completa
    const response = {
      id: insight.id,
      type: insight.type,
      severity: insight.severity,
      
      // Contenido principal
      title: insight.title,
      summary: insight.summary,
      details: insight.details,
      recommendations: insight.recommendations,
      
      // Datos estructurados
      affectedArea: insight.affectedArea,
      metricsDelta: insight.metricsDelta,
      
      // Estado
      isResolved: insight.isResolved,
      resolvedAt: insight.resolvedAt?.toISOString() || null,
      resolvedBy: insight.resolvedBy,
      
      // Metadata AI
      ai: {
        model: insight.modelUsed,
        confidence: insight.confidence,
        processingTime: insight.processingTimeMs,
        tokensUsed: insight.tokensUsed,
      },
      
      // Dataset relacionado
      dataset: {
        id: insight.dataset.id,
        name: insight.dataset.name,
        description: insight.dataset.description,
        status: insight.dataset.status,
        source: insight.dataset.source,
        totalDataPoints: insight.dataset.totalDataPoints,
        lastDataReceived: insight.dataset.lastDataReceived?.toISOString() || null,
        createdAt: insight.dataset.createdAt.toISOString(),
      },
      
      // Usuario creador
      user: {
        id: insight.user.id,
        email: insight.user.email,
        name: insight.user.name || "Usuario",
      },
      
      // Timestamps
      createdAt: insight.createdAt.toISOString(),
      updatedAt: insight.updatedAt.toISOString(),
      
      // Métricas calculadas
      metadata: {
        daysAgo: daysAgo,
        isRecent: isRecent,
        isStale: isStale,
        ageLabel: daysAgo === 0 
          ? "Hoy" 
          : daysAgo === 1 
          ? "Ayer" 
          : `Hace ${daysAgo} días`,
      },
      
      // Insights relacionados para contexto
      relatedInsights: relatedInsights.map(ri => ({
        id: ri.id,
        type: ri.type,
        severity: ri.severity,
        title: ri.title,
        summary: ri.summary,
        isResolved: ri.isResolved,
        createdAt: ri.createdAt.toISOString(),
      })),
    };

    return NextResponse.json({
      success: true,
      data: response,
    });

  } catch (error) {
    console.error("❌ Error obteniendo insight:", error);
    return NextResponse.json(
      {
        error: "Error al obtener insight",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Actualizar estado del insight
 * 
 * Body:
 * - isResolved: boolean (marcar como resuelto/no resuelto)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. Await params (Next.js 15 requirement)
    const { id } = await params;

    // 1. Validar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Parsear body
    const body = await req.json().catch(() => ({}));
    const { isResolved } = body;

    // Validar que isResolved esté presente
    if (typeof isResolved !== "boolean") {
      return NextResponse.json(
        { 
          error: "Campo requerido: isResolved debe ser un boolean",
          example: { isResolved: true }
        },
        { status: 400 }
      );
    }

    // 3. Verificar ownership del insight
    const existingInsight = await prisma.insight.findUnique({
      where: { id: id },
      select: {
        id: true,
        userId: true,
        isResolved: true,
        type: true,
        severity: true,
        title: true,
        datasetId: true,
      },
    });

    if (!existingInsight) {
      return NextResponse.json(
        { error: "Insight no encontrado" },
        { status: 404 }
      );
    }

    if (existingInsight.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar este insight" },
        { status: 403 }
      );
    }

    // 4. Evitar updates innecesarios
    if (existingInsight.isResolved === isResolved) {
      return NextResponse.json(
        { 
          message: `El insight ya está ${isResolved ? "resuelto" : "sin resolver"}`,
          data: existingInsight,
        },
        { status: 200 }
      );
    }

    // 5. Actualizar insight
    const now = new Date();
    const updatedInsight = await prisma.insight.update({
      where: { id: id },
      data: {
        isResolved: isResolved,
        resolvedAt: isResolved ? now : null,
        resolvedBy: isResolved ? userId : null,
      },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 6. Si se marcó como resuelto y había alerta crítica, resolver la alerta también
    if (isResolved && existingInsight.severity === "critical") {
      await prisma.alert.updateMany({
        where: {
          datasetId: existingInsight.datasetId,
          status: "active",
          message: { contains: existingInsight.title }, // Buscar alert relacionada
        },
        data: {
          status: "resolved",
          resolvedAt: now,
        },
      });
    }

    // 7. Crear log de actividad
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: isResolved ? "insight.resolved" : "insight.reopened",
        resource: "Insight",
        resourceId: id,
        metadata: {
          insightId: id,
          datasetId: existingInsight.datasetId,
          type: existingInsight.type,
          severity: existingInsight.severity,
          previousState: existingInsight.isResolved,
          newState: isResolved,
        },
      },
    });

    // 8. Crear notificación de confirmación
    await prisma.notification.create({
      data: {
        userId: userId,
        type: isResolved ? "success" : "info",
        title: isResolved 
          ? "✅ Insight marcado como resuelto" 
          : "🔄 Insight reabierto",
        message: isResolved
          ? `Has marcado "${existingInsight.title}" como resuelto`
          : `Has reabierto el insight "${existingInsight.title}"`,
        relatedType: "insight",
        relatedId: id,
        actionUrl: `/insights/${id}`,
      },
    });

    // 9. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: isResolved 
        ? "Insight marcado como resuelto exitosamente" 
        : "Insight reabierto exitosamente",
      data: {
        id: updatedInsight.id,
        type: updatedInsight.type,
        severity: updatedInsight.severity,
        title: updatedInsight.title,
        isResolved: updatedInsight.isResolved,
        resolvedAt: updatedInsight.resolvedAt?.toISOString() || null,
        resolvedBy: updatedInsight.resolvedBy,
        dataset: {
          id: updatedInsight.dataset.id,
          name: updatedInsight.dataset.name,
        },
        updatedAt: updatedInsight.updatedAt.toISOString(),
      },
    });

  } catch (error) {
    console.error("❌ Error actualizando insight:", error);
    return NextResponse.json(
      {
        error: "Error al actualizar insight",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar un insight
 * 
 * Opcional: Permite eliminar insights (útil para limpiar falsos positivos)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 0. Await params (Next.js 15 requirement)
    const { id } = await params;

    // 1. Validar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Verificar ownership
    const insight = await prisma.insight.findUnique({
      where: { id: id },
      select: {
        id: true,
        userId: true,
        title: true,
        type: true,
        datasetId: true,
      },
    });

    if (!insight) {
      return NextResponse.json(
        { error: "Insight no encontrado" },
        { status: 404 }
      );
    }

    if (insight.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar este insight" },
        { status: 403 }
      );
    }

    // 3. Eliminar insight (cascade eliminará relaciones)
    await prisma.insight.delete({
      where: { id: id },
    });

    // 4. Log de actividad
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "insight.deleted",
        resource: "Insight",
        resourceId: id,
        metadata: {
          insightId: id,
          datasetId: insight.datasetId,
          title: insight.title,
          type: insight.type,
        },
      },
    });

    // 5. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Insight eliminado exitosamente",
      data: {
        id: insight.id,
        title: insight.title,
      },
    });

  } catch (error) {
    console.error("❌ Error eliminando insight:", error);
    return NextResponse.json(
      {
        error: "Error al eliminar insight",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}