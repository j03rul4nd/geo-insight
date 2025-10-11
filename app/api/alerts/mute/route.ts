/**
 * ALERT MUTE ENDPOINT
 * 
 * POST - OBJETIVO:
 * Silenciar temporalmente una alerta para que no genere notificaciones.
 * 
 * MISIÓN:
 * - Validar ownership (via dataset.userId)
 * - Body params:
 *   · alertId (OBLIGATORIO)
 *   · duration (en minutos: 30, 60, 120, 1440=24h)
 * - Actualizar Alert:
 *   · status = "muted"
 *   · mutedUntil = now + duration
 * - La alerta seguirá existiendo pero no enviará emails/Slack
 * - Después de mutedUntil, un job debe reactivarla automáticamente
 * - Crear ActivityLog: action="alert.muted"
 * 
 * USADO POR:
 * - Menú contextual en alert cards
 * - "Mute for 1 hour" dropdown
 * 
 * CASO DE USO:
 * Usuario sabe que una máquina estará en mantenimiento → mute alerts por 2h
 * para evitar spam de notificaciones.
 * 
 * PRISMA MODELS:
 * - Alert (status, mutedUntil)
 * - Dataset (para validar ownership)
 * - ActivityLog
 * 
 * RUTA: /app/api/alerts/mute/route.ts
 * URL: POST /api/alerts/mute
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * POST - Silenciar alerta temporalmente
 * 
 * Body params:
 * - alertId: string (OBLIGATORIO)
 * - duration: 30 | 60 | 120 | 1440 (minutos)
 * 
 * Durante el periodo de mute:
 * - La alerta cambia a status="muted"
 * - No genera notificaciones
 * - Después de mutedUntil debe reactivarse (via cron job)
 */
export async function POST(req: NextRequest) {
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
    const { alertId, duration } = body;

    // Validar alertId
    if (!alertId) {
      return NextResponse.json(
        { error: "alertId es requerido" },
        { status: 400 }
      );
    }

    // Validar duration
    const validDurations = [30, 60, 120, 1440]; // 30min, 1h, 2h, 24h
    if (!duration || !validDurations.includes(duration)) {
      return NextResponse.json(
        {
          error: "Duración inválida",
          validDurations: [
            { value: 30, label: "30 minutos" },
            { value: 60, label: "1 hora" },
            { value: 120, label: "2 horas" },
            { value: 1440, label: "24 horas" },
          ],
        },
        { status: 400 }
      );
    }

    // 3. Obtener alerta con dataset incluido
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

    // Validar existencia
    if (!alert) {
      return NextResponse.json(
        { error: "Alerta no encontrada" },
        { status: 404 }
      );
    }

    // 4. Validar ownership via dataset.userId
    if (alert.dataset.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permisos para modificar esta alerta" },
        { status: 403 }
      );
    }

    // 5. Validar que la alerta pueda ser silenciada
    if (alert.status === "resolved") {
      return NextResponse.json(
        { 
          error: "No se puede silenciar una alerta resuelta",
          status: alert.status 
        },
        { status: 400 }
      );
    }

    // 6. Calcular mutedUntil
    const now = new Date();
    const mutedUntil = new Date(now.getTime() + duration * 60 * 1000);

    // 7. Actualizar alerta
    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "muted",
        mutedUntil: mutedUntil,
        updatedAt: now,
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

    // 8. Crear log de actividad
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "alert.muted",
        resource: "Alert",
        resourceId: alertId,
        metadata: {
          alertName: alert.name,
          datasetId: alert.dataset.id,
          datasetName: alert.dataset.name,
          previousStatus: alert.status,
          duration: duration,
          mutedUntil: mutedUntil.toISOString(),
        },
      },
    });

    // 9. Calcular tiempo humano legible
    let durationLabel: string;
    if (duration < 60) {
      durationLabel = `${duration} minutos`;
    } else if (duration === 60) {
      durationLabel = "1 hora";
    } else if (duration < 1440) {
      const hours = Math.floor(duration / 60);
      durationLabel = `${hours} horas`;
    } else {
      const days = Math.floor(duration / 1440);
      durationLabel = `${days} ${days === 1 ? 'día' : 'días'}`;
    }

    // 10. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: `Alerta silenciada por ${durationLabel}`,
      data: {
        id: updatedAlert.id,
        name: updatedAlert.name,
        status: updatedAlert.status,
        severity: updatedAlert.severity,
        mutedUntil: updatedAlert.mutedUntil?.toISOString(),
        durationMinutes: duration,
        durationLabel: durationLabel,
        dataset: {
          id: updatedAlert.dataset.id,
          name: updatedAlert.dataset.name,
        },
        willReactivateAt: mutedUntil.toISOString(),
      },
      meta: {
        note: "La alerta se reactivará automáticamente después del tiempo especificado",
        nextSteps: [
          "Configurar un cron job para verificar alertas con mutedUntil vencido",
          "Reactivar automáticamente cambiando status de 'muted' a 'active'",
        ],
      },
    });

  } catch (error) {
    console.error("❌ Error silenciando alerta:", error);
    return NextResponse.json(
      {
        error: "Error al silenciar alerta",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Deshacer mute (reactivar alerta antes de tiempo)
 * 
 * Body params:
 * - alertId: string (OBLIGATORIO)
 * 
 * Permite al usuario cancelar el mute manualmente
 */
export async function DELETE(req: NextRequest) {
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
    const { alertId } = body;

    // Validar alertId
    if (!alertId) {
      return NextResponse.json(
        { error: "alertId es requerido" },
        { status: 400 }
      );
    }

    // 3. Obtener alerta
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

    // 5. Validar que esté en mute
    if (alert.status !== "muted") {
      return NextResponse.json(
        { 
          error: "La alerta no está silenciada",
          currentStatus: alert.status 
        },
        { status: 400 }
      );
    }

    // 6. Reactivar alerta
    const now = new Date();
    const updatedAlert = await prisma.alert.update({
      where: { id: alertId },
      data: {
        status: "active",
        mutedUntil: null,
        updatedAt: now,
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

    // 7. Crear log de actividad
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "alert.unmuted",
        resource: "Alert",
        resourceId: alertId,
        metadata: {
          alertName: alert.name,
          datasetId: alert.dataset.id,
          datasetName: alert.dataset.name,
          previousStatus: "muted",
          wasScheduledUntil: alert.mutedUntil?.toISOString(),
        },
      },
    });

    // 8. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Alerta reactivada exitosamente",
      data: {
        id: updatedAlert.id,
        name: updatedAlert.name,
        status: updatedAlert.status,
        severity: updatedAlert.severity,
        dataset: {
          id: updatedAlert.dataset.id,
          name: updatedAlert.dataset.name,
        },
      },
    });

  } catch (error) {
    console.error("❌ Error reactivando alerta:", error);
    return NextResponse.json(
      {
        error: "Error al reactivar alerta",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}