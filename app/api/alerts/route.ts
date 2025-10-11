/**
 * ALERTS LIST ENDPOINT
 * 
 * GET - OBJETIVO:
 * Listar alertas activas generadas por thresholds configurados.
 * Las alertas se crean automáticamente cuando DataPoints exceden thresholds.
 * 
 * MISIÓN:
 * - Obtener datasets del usuario actual
 * - Consultar Alert WHERE datasetId IN [userDatasets]
 * - Filtros opcionales:
 *   · status (active, acknowledged, resolved, muted)
 *   · severity (info, warning, critical)
 *   · datasetId
 * - Ordenar por triggeredAt DESC
 * - Incluir datos del Dataset relacionado
 * 
 * CONTEXTO IMPORTANTE:
 * Las alertas NO se crean desde este endpoint. Se crean:
 * 1. Por el servidor externo al detectar threshold breach en MQTT data
 * 2. Por /api/insights cuando AI detecta anomalía crítica
 * 3. Por jobs periódicos que revisan DataPoints vs alertThresholds
 * 
 * Este endpoint solo LISTA las alertas existentes.
 * 
 * USADO POR:
 * - /datasets/[id] panel (mostrar alertas activas)
 * - Dashboard notifications badge
 * - /alerts page (si implementas)
 * 
 * PRISMA MODELS:
 * - Alert (all fields)
 * - Dataset (para filtrar por userId y mostrar nombre)
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET - Listar alertas del usuario
 * 
 * Query params:
 * - status: active | acknowledged | resolved | muted
 * - severity: info | warning | critical
 * - datasetId: filtrar por dataset específico
 * - page: número de página
 * - limit: items por página
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Validar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Parsear query params
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const datasetId = searchParams.get("datasetId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

    // 3. Obtener datasets del usuario para filtrar alertas
    const userDatasets = await prisma.dataset.findMany({
      where: { userId: userId },
      select: { id: true },
    });

    const datasetIds = userDatasets.map((d) => d.id);

    // Si el usuario no tiene datasets, retornar vacío
    if (datasetIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          alerts: [],
          counts: {
            total: 0,
            active: 0,
            acknowledged: 0,
            resolved: 0,
            muted: 0,
            bySeverity: { info: 0, warning: 0, critical: 0 },
          },
          pagination: {
            total: 0,
            page: 1,
            limit: limit,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
        },
      });
    }

    // 4. Construir filtros de búsqueda
    const whereClause: any = {
      datasetId: { in: datasetIds },
    };

    // Filtro por datasetId específico
    if (datasetId) {
      // Validar que el dataset pertenece al usuario
      if (datasetIds.includes(datasetId)) {
        whereClause.datasetId = datasetId;
      } else {
        return NextResponse.json(
          { error: "No tienes acceso a ese dataset" },
          { status: 403 }
        );
      }
    }

    // Filtro por status
    if (status) {
      const validStatuses = ["active", "acknowledged", "resolved", "muted"];
      if (validStatuses.includes(status)) {
        whereClause.status = status;
      }
    }

    // Filtro por severity
    if (severity) {
      const validSeverities = ["info", "warning", "critical"];
      if (validSeverities.includes(severity)) {
        whereClause.severity = severity;
      }
    }

    // 5. Obtener counts totales para stats
    const [totalAlerts, countsByStatus, countsBySeverity] = await Promise.all([
      // Total de alertas
      prisma.alert.count({
        where: { datasetId: { in: datasetIds } },
      }),

      // Counts por status
      prisma.alert.groupBy({
        by: ["status"],
        where: { datasetId: { in: datasetIds } },
        _count: true,
      }),

      // Counts por severity (solo activas)
      prisma.alert.groupBy({
        by: ["severity"],
        where: {
          datasetId: { in: datasetIds },
          status: "active",
        },
        _count: true,
      }),
    ]);

    // 6. Obtener total para paginación con filtros aplicados
    const filteredTotal = await prisma.alert.count({
      where: whereClause,
    });

    // 7. Obtener alertas con paginación
    const skip = (page - 1) * limit;
    const alerts = await prisma.alert.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      orderBy: { triggeredAt: "desc" },
      include: {
        dataset: {
          select: {
            id: true,
            name: true,
            status: true,
            source: true,
          },
        },
      },
    });

    // 8. Formatear alertas con metadata adicional
    const now = new Date();
    const formattedAlerts = alerts.map((alert) => {
      // Calcular tiempo desde que se disparó
      const minutesSinceTriggered = Math.floor(
        (now.getTime() - alert.triggeredAt.getTime()) / (1000 * 60)
      );

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

      // Label de status amigable
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

      // Calcular si está "stale" (más de 24h sin resolver)
      const isStale =
        alert.status === "active" && minutesSinceTriggered > 1440;

      // Calcular si está "urgent" (crítica y activa < 1h)
      const isUrgent =
        alert.status === "active" &&
        alert.severity === "critical" &&
        minutesSinceTriggered < 60;

      // Tiempo hasta que termine el mute (si está muted)
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

      return {
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
          status: alert.dataset.status,
          source: alert.dataset.source,
        },

        // Timestamps
        triggeredAt: alert.triggeredAt.toISOString(),
        acknowledgedAt: alert.acknowledgedAt?.toISOString() || null,
        acknowledgedBy: alert.acknowledgedBy,
        resolvedAt: alert.resolvedAt?.toISOString() || null,
        mutedUntil: alert.mutedUntil?.toISOString() || null,
        muteTimeRemaining: muteTimeRemaining,
        createdAt: alert.createdAt.toISOString(),
        updatedAt: alert.updatedAt.toISOString(),

        // Metadata calculada
        timeLabel: timeLabel,
        minutesSinceTriggered: minutesSinceTriggered,
        isStale: isStale,
        isUrgent: isUrgent,
        isNew: minutesSinceTriggered < 5,
        requiresAction:
          alert.status === "active" && alert.severity === "critical",
      };
    });

    // 9. Construir stats consolidadas
    const stats = {
      total: totalAlerts,
      active: countsByStatus.find((s) => s.status === "active")?._count || 0,
      acknowledged:
        countsByStatus.find((s) => s.status === "acknowledged")?._count || 0,
      resolved:
        countsByStatus.find((s) => s.status === "resolved")?._count || 0,
      muted: countsByStatus.find((s) => s.status === "muted")?._count || 0,
      bySeverity: {
        info:
          countsBySeverity.find((s) => s.severity === "info")?._count || 0,
        warning:
          countsBySeverity.find((s) => s.severity === "warning")?._count || 0,
        critical:
          countsBySeverity.find((s) => s.severity === "critical")?._count || 0,
      },
    };

    // 10. Agrupar alertas por prioridad (para UI)
    const groupedAlerts = {
      urgent: formattedAlerts.filter((a) => a.isUrgent),
      active: formattedAlerts.filter((a) => a.status === "active" && !a.isUrgent),
      acknowledged: formattedAlerts.filter((a) => a.status === "acknowledged"),
      resolved: formattedAlerts.filter((a) => a.status === "resolved"),
      muted: formattedAlerts.filter((a) => a.status === "muted"),
    };

    // 11. Respuesta con paginación
    const totalPages = Math.ceil(filteredTotal / limit);

    return NextResponse.json({
      success: true,
      data: {
        alerts: formattedAlerts,
        grouped: groupedAlerts, // Para UI con secciones
        counts: stats,
        pagination: {
          total: filteredTotal,
          page: page,
          limit: limit,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          status: status || null,
          severity: severity || null,
          datasetId: datasetId || null,
        },
      },
    });

  } catch (error) {
    console.error("❌ Error obteniendo alertas:", error);
    return NextResponse.json(
      {
        error: "Error al obtener alertas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Crear alerta manualmente (opcional)
 * 
 * Útil para testing o crear alertas custom desde UI
 * En producción, las alertas normalmente se crean automáticamente
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
    const {
      datasetId,
      name,
      condition,
      thresholdValue,
      currentValue,
      severity = "warning",
      message,
    } = body;

    // Validar campos requeridos
    if (!datasetId || !name || !message) {
      return NextResponse.json(
        {
          error: "Campos requeridos: datasetId, name, message",
          required: ["datasetId", "name", "message"],
        },
        { status: 400 }
      );
    }

    // 3. Validar ownership del dataset
    const dataset = await prisma.dataset.findFirst({
      where: {
        id: datasetId,
        userId: userId,
      },
    });

    if (!dataset) {
      return NextResponse.json(
        { error: "Dataset no encontrado o sin acceso" },
        { status: 404 }
      );
    }

    // 4. Crear alerta
    const alert = await prisma.alert.create({
      data: {
        datasetId: datasetId,
        name: name,
        condition: condition || "manual",
        thresholdValue: thresholdValue || 0,
        currentValue: currentValue || 0,
        severity: severity,
        status: "active",
        message: message,
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

    // 5. Crear notificación para el usuario
    await prisma.notification.create({
      data: {
        userId: userId,
        type: severity === "critical" ? "error" : "warning",
        title: `🚨 Nueva alerta: ${name}`,
        message: message,
        relatedType: "alert",
        relatedId: alert.id,
        actionUrl: `/datasets/${datasetId}`,
      },
    });

    // 6. Log de actividad
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "alert.created",
        resource: "Alert",
        resourceId: alert.id,
        metadata: {
          datasetId: datasetId,
          severity: severity,
          manual: true,
        },
      },
    });

    // 7. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Alerta creada exitosamente",
      data: {
        id: alert.id,
        name: alert.name,
        severity: alert.severity,
        status: alert.status,
        message: alert.message,
        dataset: {
          id: alert.dataset.id,
          name: alert.dataset.name,
        },
        triggeredAt: alert.triggeredAt.toISOString(),
      },
    });

  } catch (error) {
    console.error("❌ Error creando alerta:", error);
    return NextResponse.json(
      {
        error: "Error al crear alerta",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}