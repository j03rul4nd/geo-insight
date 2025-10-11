/**
 * NOTIFICATIONS ENDPOINT
 * 
 * GET - OBJETIVO:
 * Listar notificaciones del usuario para mostrar en dropdown de header.
 * 
 * GET - MISIÓN:
 * - Consultar Notification WHERE userId = currentUser
 * - Filtros opcionales:
 *   · isRead (true/false)
 *   · type (info, warning, error, success)
 * - Ordenar por createdAt DESC
 * - Limitar a últimas 50 por defecto
 * - Incluir count de unread en response
 * 
 * PATCH - OBJETIVO:
 * Marcar todas las notificaciones como leídas (bulk action).
 * 
 * PATCH - MISIÓN:
 * - Actualizar Notification SET isRead=true, readAt=now
 *   WHERE userId=currentUser AND isRead=false
 * 
 * CONTEXTO IMPORTANTE:
 * Las notificaciones se crean automáticamente cuando:
 * - Se dispara una Alert crítica
 * - AI genera un Insight importante
 * - Webhook falla o Dataset entra en error
 * - Subscription expira o pago falla
 * 
 * Este endpoint solo LISTA y MARCA como leídas.
 * 
 * USADO POR:
 * - Notifications dropdown en header (bell icon)
 * - Badge con count de unread
 * - "Mark all as read" button
 * 
 * PRISMA MODELS:
 * - Notification (all fields)
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET - Listar notificaciones del usuario
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
    const isRead = searchParams.get("isRead");
    const type = searchParams.get("type");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50"),
      100
    );
    const page = parseInt(searchParams.get("page") || "1");

    // 3. Construir filtros
    const whereClause: any = {
      userId: userId,
    };

    // Filtro por estado de lectura
    if (isRead !== null && isRead !== undefined) {
      whereClause.isRead = isRead === "true";
    }

    // Filtro por tipo
    if (type) {
      const validTypes = ["info", "warning", "error", "success"];
      if (validTypes.includes(type)) {
        whereClause.type = type;
      }
    }

    // 4. Obtener count de notificaciones no leídas (siempre)
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    // 5. Obtener total para paginación
    const totalNotifications = await prisma.notification.count({
      where: whereClause,
    });

    // 6. Obtener notificaciones
    const skip = (page - 1) * limit;
    const notifications = await prisma.notification.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      orderBy: { createdAt: "desc" },
    });

    // 7. Formatear notificaciones con metadata adicional
    const now = new Date();
    const formattedNotifications = notifications.map((notification) => {
      // Calcular tiempo transcurrido
      const minutesAgo = Math.floor(
        (now.getTime() - notification.createdAt.getTime()) / (1000 * 60)
      );
      
      let timeLabel: string;
      if (minutesAgo < 1) {
        timeLabel = "Ahora mismo";
      } else if (minutesAgo < 60) {
        timeLabel = `Hace ${minutesAgo} min`;
      } else if (minutesAgo < 1440) {
        const hoursAgo = Math.floor(minutesAgo / 60);
        timeLabel = `Hace ${hoursAgo}h`;
      } else {
        const daysAgo = Math.floor(minutesAgo / 1440);
        timeLabel = `Hace ${daysAgo}d`;
      }

      // Determinar icono según tipo
      let icon: string;
      switch (notification.type) {
        case "success":
          icon = "✅";
          break;
        case "error":
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

      return {
        id: notification.id,
        type: notification.type,
        icon: icon,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        readAt: notification.readAt?.toISOString() || null,
        
        // Links y acciones
        relatedType: notification.relatedType,
        relatedId: notification.relatedId,
        actionUrl: notification.actionUrl,
        
        // Timestamps
        createdAt: notification.createdAt.toISOString(),
        timeLabel: timeLabel,
        minutesAgo: minutesAgo,
        
        // Estado visual
        isNew: minutesAgo < 5, // Consideramos "nuevo" si tiene menos de 5 min
        isRecent: minutesAgo < 60, // "Reciente" si tiene menos de 1 hora
      };
    });

    // 8. Agrupar notificaciones por fecha (para UI)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const groupedNotifications = {
      today: formattedNotifications.filter(
        (n) => new Date(n.createdAt) >= today
      ),
      yesterday: formattedNotifications.filter(
        (n) => new Date(n.createdAt) >= yesterday && new Date(n.createdAt) < today
      ),
      thisWeek: formattedNotifications.filter(
        (n) => new Date(n.createdAt) >= lastWeek && new Date(n.createdAt) < yesterday
      ),
      older: formattedNotifications.filter(
        (n) => new Date(n.createdAt) < lastWeek
      ),
    };

    // 9. Calcular stats por tipo
    const statsByType = await prisma.notification.groupBy({
      by: ["type"],
      where: {
        userId: userId,
        isRead: false, // Solo contar las no leídas
      },
      _count: true,
    });

    const typeStats = {
      info: statsByType.find((s) => s.type === "info")?._count || 0,
      warning: statsByType.find((s) => s.type === "warning")?._count || 0,
      error: statsByType.find((s) => s.type === "error")?._count || 0,
      success: statsByType.find((s) => s.type === "success")?._count || 0,
    };

    // 10. Respuesta completa
    const totalPages = Math.ceil(totalNotifications / limit);

    return NextResponse.json({
      success: true,
      data: {
        notifications: formattedNotifications,
        grouped: groupedNotifications, // Para dropdown con secciones
        counts: {
          total: totalNotifications,
          unread: unreadCount,
          read: totalNotifications - unreadCount,
          byType: typeStats,
        },
        pagination: {
          total: totalNotifications,
          page: page,
          limit: limit,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });

  } catch (error) {
    console.error("❌ Error obteniendo notificaciones:", error);
    return NextResponse.json(
      {
        error: "Error al obtener notificaciones",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Marcar todas las notificaciones como leídas
 */
export async function PATCH(req: NextRequest) {
  try {
    // 1. Validar autenticación
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // 2. Contar cuántas notificaciones no leídas hay antes de actualizar
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    // Si no hay notificaciones sin leer, evitar query innecesaria
    if (unreadCount === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay notificaciones sin leer",
        data: {
          marked: 0,
          remaining: 0,
        },
      });
    }

    // 3. Marcar todas como leídas
    const now = new Date();
    const result = await prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: now,
      },
    });

    // 4. Crear log de actividad (opcional, para auditoría)
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "notifications.mark_all_read",
        resource: "Notification",
        resourceId: null,
        metadata: {
          count: result.count,
          timestamp: now.toISOString(),
        },
      },
    });

    // 5. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: `${result.count} notificación${result.count !== 1 ? "es" : ""} marcada${result.count !== 1 ? "s" : ""} como leída${result.count !== 1 ? "s" : ""}`,
      data: {
        marked: result.count,
        remaining: 0, // Ya no quedan sin leer
        timestamp: now.toISOString(),
      },
    });

  } catch (error) {
    console.error("❌ Error marcando notificaciones:", error);
    return NextResponse.json(
      {
        error: "Error al marcar notificaciones como leídas",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar todas las notificaciones leídas (limpieza)
 * 
 * Opcional: útil para que el usuario pueda limpiar su bandeja
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

    // 2. Contar notificaciones leídas antes de eliminar
    const readCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: true,
      },
    });

    if (readCount === 0) {
      return NextResponse.json({
        success: true,
        message: "No hay notificaciones leídas para eliminar",
        data: {
          deleted: 0,
        },
      });
    }

    // 3. Eliminar solo las leídas (mantener las no leídas)
    const result = await prisma.notification.deleteMany({
      where: {
        userId: userId,
        isRead: true,
      },
    });

    // 4. Log de actividad
    await prisma.activityLog.create({
      data: {
        userId: userId,
        action: "notifications.clear_read",
        resource: "Notification",
        resourceId: null,
        metadata: {
          deletedCount: result.count,
        },
      },
    });

    // 5. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: `${result.count} notificación${result.count !== 1 ? "es" : ""} eliminada${result.count !== 1 ? "s" : ""}`,
      data: {
        deleted: result.count,
      },
    });

  } catch (error) {
    console.error("❌ Error eliminando notificaciones:", error);
    return NextResponse.json(
      {
        error: "Error al eliminar notificaciones",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}