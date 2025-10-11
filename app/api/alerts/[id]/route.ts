/**
 * ALERT DETAIL ENDPOINT
 * 
 * GET - OBJETIVO:
 * Obtener detalles de una alerta específica.
 * 
 * GET - MISIÓN:
 * - Validar que el dataset de la alerta pertenece al usuario
 * - Devolver Alert completo con datos del Dataset
 * 
 * PATCH - OBJETIVO:
 * Cambiar estado de la alerta (acknowledge, resolve).
 * 
 * PATCH - MISIÓN:
 * - Validar ownership (via dataset.userId)
 * - Permitir actualizar:
 *   · status (acknowledged | resolved)
 *   · acknowledgedBy, acknowledgedAt (si status=acknowledged)
 *   · resolvedAt (si status=resolved)
 * - NO permitir cambiar: thresholdValue, currentValue, triggeredAt
 * - Crear ActivityLog: action="alert.acknowledged" o "alert.resolved"
 * 
 * USADO POR:
 * - Botón "Acknowledge" en alert cards
 * - Botón "Mark Resolved" en alert details
 * - Bulk actions en alerts table (futuro)
 * 
 * PRISMA MODELS:
 * - Alert
 * - Dataset (para validar ownership)
 * - ActivityLog
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET - Obtener detalles de una alerta específica
 * 
 * Devuelve información completa de la alerta incluyendo:
 * - Datos del dataset relacionado
 * - Metadata calculada (tiempo, urgencia, etc.)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Obtener alerta con dataset
    const { id: alertId } = await params;
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            source: true,
            userId: true,
            totalDataPoints: true,
            lastDataReceived: true,
          },
        },
      },
    });

    // Validar existencia
    if (!alert) {
      return NextResponse.json(
        { error: "Alerta no encontrada" },
        { status: 404 }
      );
    }

    // 3. Validar ownership via dataset.userId
    if (alert.dataset.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permisos para ver esta alerta" },
        { status: 403 }
      );
    }

    // 4. Calcular metadata adicional
    const now = new Date();
    const minutesSinceTriggered = Math.floor(
      (now.getTime() - alert.triggeredAt.getTime()) / (1000 * 60)
    );

    // Label de tiempo
    let timeLabel: string;
    if (minutesSinceTriggered < 1) {
      timeLabel = "Ahora mismo";
    } else if (minutesSinceTriggered < 60) {
      timeLabel = `Hace ${minutesSinceTriggered} min`;
    } else if (minutesSinceTriggered < 1440) {
      const hoursAgo = Math.floor(minutesSinceTriggered / 60);
      timeLabel = `Hace ${hoursAgo}h`;
    } else {
      const daysAgo = Math.floor(minutesSinceTriggered / 1440);
      timeLabel = `Hace ${daysAgo}d`;
    }

    // Icono según severity
    let icon: string;
    switch (alert.severity) {
      case "critical":
        icon = "🚨";
        break;
      case "warning":
        icon = "⚠️";
        break;
      case "info":
      default:
        icon = "ℹ️";
        break;
    }

    // Label de status
    let statusLabel: string;
    switch (alert.status) {
      case "active":
        statusLabel = "Activa";
        break;
      case "acknowledged":
        statusLabel = "Reconocida";
        break;
      case "resolved":
        statusLabel = "Resuelta";
        break;
      case "muted":
        statusLabel = "Silenciada";
        break;
      default:
        statusLabel = alert.status;
    }

    // Flags de estado
    const isStale = alert.status === "active" && minutesSinceTriggered > 1440;
    const isUrgent =
      alert.status === "active" &&
      alert.severity === "critical" &&
      minutesSinceTriggered < 60;

    // Tiempo restante de mute
    let muteTimeRemaining: string | null = null;
    if (alert.status === "muted" && alert.mutedUntil) {
      const minutesUntilUnmute = Math.floor(
        (alert.mutedUntil.getTime() - now.getTime()) / (1000 * 60)
      );
      if (minutesUntilUnmute > 0) {
        if (minutesUntilUnmute < 60) {
          muteTimeRemaining = `${minutesUntilUnmute} min`;
        } else {
          const hoursUntilUnmute = Math.floor(minutesUntilUnmute / 60);
          muteTimeRemaining = `${hoursUntilUnmute}h`;
        }
      }
    }

    // Tiempo para resolver (si está acknowledged)
    let timeToResolve: string | null = null;
    if (alert.acknowledgedAt && alert.resolvedAt) {
      const minutesToResolve = Math.floor(
        (alert.resolvedAt.getTime() - alert.acknowledgedAt.getTime()) / (1000 * 60)
      );
      if (minutesToResolve < 60) {
        timeToResolve = `${minutesToResolve} min`;
      } else {
        const hoursToResolve = Math.floor(minutesToResolve / 60);
        timeToResolve = `${hoursToResolve}h`;
      }
    }

    // 5. Respuesta completa
    return NextResponse.json({
      success: true,
      data: {
        // Datos principales
        id: alert.id,
        name: alert.name,
        message: alert.message,
        condition: alert.condition,
        severity: alert.severity,
        status: alert.status,
        statusLabel: statusLabel,
        icon: icon,

        // Valores
        thresholdValue: alert.thresholdValue,
        currentValue: alert.currentValue,
        exceedsBy:
          alert.currentValue > alert.thresholdValue
            ? alert.currentValue - alert.thresholdValue
            : 0,
        exceedsByPercent:
          alert.thresholdValue > 0
            ? Math.round(
                ((alert.currentValue - alert.thresholdValue) /
                  alert.thresholdValue) *
                  100
              )
            : 0,

        // Dataset relacionado
        dataset: {
          id: alert.dataset.id,
          name: alert.dataset.name,
          description: alert.dataset.description,
          status: alert.dataset.status,
          source: alert.dataset.source,
          totalDataPoints: alert.dataset.totalDataPoints,
          lastDataReceived: alert.dataset.lastDataReceived?.toISOString(),
        },

        // Timestamps
        triggeredAt: alert.triggeredAt.toISOString(),
        acknowledgedAt: alert.acknowledgedAt?.toISOString() || null,
        acknowledgedBy: alert.acknowledgedBy,
        resolvedAt: alert.resolvedAt?.toISOString() || null,
        mutedUntil: alert.mutedUntil?.toISOString() || null,
        createdAt: alert.createdAt.toISOString(),
        updatedAt: alert.updatedAt.toISOString(),

        // Metadata calculada
        timeLabel: timeLabel,
        minutesSinceTriggered: minutesSinceTriggered,
        isStale: isStale,
        isUrgent: isUrgent,
        isNew: minutesSinceTriggered < 5,
        requiresAction: alert.status === "active" && alert.severity === "critical",
        muteTimeRemaining: muteTimeRemaining,
        timeToResolve: timeToResolve,

        // Acciones disponibles
        availableActions: {
          canAcknowledge: alert.status === "active",
          canResolve: alert.status === "active" || alert.status === "acknowledged",
          canMute: alert.status === "active" || alert.status === "acknowledged",
          canUnmute: alert.status === "muted",
        },
      },
    });

  } catch (error) {
    console.error("❌ Error obteniendo detalles de alerta:", error);
    return NextResponse.json(
      {
        error: "Error al obtener detalles de alerta",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Actualizar estado de alerta
 * 
 * Permite:
 * - Reconocer alerta (status=acknowledged)
 * - Resolver alerta (status=resolved)
 * 
 * NO permite cambiar valores de threshold o datos de trigger
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { status, notes } = body;

    // Validar status
    const validStatuses = ["acknowledged", "resolved"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: "Status inválido",
          validStatuses: validStatuses,
          received: status,
        },
        { status: 400 }
      );
    }

    // 3. Obtener alerta actual
    const { id: alertId } = await params;
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    });

    if (!alert) {
      return NextResponse.json(
        { error: "Alerta no encontrada" },
        { status: 404 }
      );
    }

    // 4. Validar ownership
    if (alert.dataset.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permisos para modificar esta alerta" },
        { status: 403 }
      );
    }

    // 5. Validar transición de estado
    if (status === "acknowledged" && alert.status !== "active") {
      return NextResponse.json(
        {
          error: "Solo se pueden reconocer alertas activas",
          currentStatus: alert.status,
        },
        { status: 400 }
      );
    }

    if (status === "resolved" && alert.status === "resolved") {
      return NextResponse.json(
        {
          error: "La alerta ya está resuelta",
          currentStatus: alert.status,
        },
        { status: 400 }
      );
    }

    // 6. Preparar datos de actualización
    const now = new Date();
    const updateData: any = {
      status: status,
      updatedAt: now,
    };

    if (status === "acknowledged") {
      updateData.acknowledgedAt = now;
      updateData.acknowledgedBy = userId;
    }

    if (status === "resolved") {
      updateData.resolvedAt = now;
      // Si no estaba acknowledged, marcar también
      if (!alert.acknowledgedAt) {
        updateData.acknowledgedAt = now;
        updateData.acknowledgedBy = userId;
      }
    }

    // 7. Actualizar alerta
    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: updateData,
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // 8. Crear log de actividad
    const action = status === "acknowledged" ? "alert.acknowledged" : "alert.resolved";
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: action,
        resource: "Alert",
        resourceId: alertId,
        metadata: {
          alertName: alert.name,
          severity: alert.severity,
          datasetId: alert.dataset.id,
          datasetName: alert.dataset.name,
          previousStatus: alert.status,
          newStatus: status,
          notes: notes || null,
          currentValue: alert.currentValue,
          thresholdValue: alert.thresholdValue,
        },
      },
    });

    // 9. Si se resolvió, crear notificación positiva
    if (status === "resolved") {
      await prisma.notification.create({
        data: {
          userId: alert.dataset.userId,
          type: "success",
          title: `✅ Alerta resuelta: ${alert.name}`,
          message: notes || `La alerta ha sido marcada como resuelta`,
          relatedType: "alert",
          relatedId: alertId,
          actionUrl: `/datasets/${alert.dataset.id}`,
        },
      });
    }

    // 10. Mensaje de éxito
    let successMessage: string;
    if (status === "acknowledged") {
      successMessage = "Alerta reconocida exitosamente";
    } else {
      const timeSinceTriggered = Math.floor(
        (now.getTime() - alert.triggeredAt.getTime()) / (1000 * 60)
      );
      successMessage = `Alerta resuelta en ${timeSinceTriggered} minutos`;
    }

    // 11. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: successMessage,
      data: {
        id: updatedAlert.id,
        name: updatedAlert.name,
        status: updatedAlert.status,
        severity: updatedAlert.severity,
        acknowledgedAt: updatedAlert.acknowledgedAt?.toISOString(),
        acknowledgedBy: updatedAlert.acknowledgedBy,
        resolvedAt: updatedAlert.resolvedAt?.toISOString(),
        dataset: {
          id: updatedAlert.dataset.id,
          name: updatedAlert.dataset.name,
        },
      },
    });

  } catch (error) {
    console.error("❌ Error actualizando alerta:", error);
    return NextResponse.json(
      {
        error: "Error al actualizar alerta",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar alerta (soft delete o hard delete)
 * 
 * Opcional: permite eliminar alertas antiguas o erróneas
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Validar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Obtener alerta
    const { id: alertId } = await params;
    const alert = await prisma.alert.findUnique({
      where: { id: alertId },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
      },
    });

    if (!alert) {
      return NextResponse.json(
        { error: "Alerta no encontrada" },
        { status: 404 }
      );
    }

    // 3. Validar ownership
    if (alert.dataset.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar esta alerta" },
        { status: 403 }
      );
    }

    // 4. Solo permitir eliminar alertas resueltas o muy antiguas
    const daysSinceTriggered = Math.floor(
      (new Date().getTime() - alert.triggeredAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (alert.status !== "resolved" && daysSinceTriggered < 7) {
      return NextResponse.json(
        {
          error: "Solo se pueden eliminar alertas resueltas o con más de 7 días de antigüedad",
          status: alert.status,
          daysSinceTriggered: daysSinceTriggered,
        },
        { status: 400 }
      );
    }

    // 5. Eliminar alerta
    await prisma.alert.delete({
      where: { id: alertId },
    });

    // 6. Log de actividad
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "alert.deleted",
        resource: "Alert",
        resourceId: alertId,
        metadata: {
          alertName: alert.name,
          severity: alert.severity,
          status: alert.status,
          datasetId: alert.dataset.id,
          datasetName: alert.dataset.name,
        },
      },
    });

    // 7. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Alerta eliminada exitosamente",
      data: {
        id: alertId,
        name: alert.name,
      },
    });

  } catch (error) {
    console.error("❌ Error eliminando alerta:", error);
    return NextResponse.json(
      {
        error: "Error al eliminar alerta",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}