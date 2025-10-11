/**
 * NOTIFICATION DETAIL ENDPOINT
 * 
 * PATCH - OBJETIVO:
 * Marcar una notificación específica como leída.
 * 
 * PATCH - MISIÓN:
 * - Validar ownership (userId match)
 * - Actualizar Notification:
 *   · isRead = true
 *   · readAt = now
 * 
 * DELETE - OBJETIVO:
 * Eliminar notificación (opcional, puede ser solo soft delete).
 * 
 * DELETE - MISIÓN:
 * - Validar ownership
 * - Eliminar Notification de DB
 * - O marcar como deleted (si quieres soft delete)
 * 
 * USADO POR:
 * - Click en notificación → marca como leída + redirige a actionUrl
 * - Botón "X" para eliminar notificación individual
 * 
 * PRISMA MODELS:
 * - Notification
 */
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

/**
 * GET - Obtener detalles de una notificación específica
 * 
 * Opcional pero útil para debug o modal de detalles
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

    // 2. Obtener notificación
    const notification = await prisma.notification.findUnique({
      where: { id: id },
    });

    // 3. Validar existencia
    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    // 4. Validar ownership
    if (notification.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para ver esta notificación" },
        { status: 403 }
      );
    }

    // 5. Formatear respuesta
    const now = new Date();
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

    // Icono según tipo
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

    return NextResponse.json({
      success: true,
      data: {
        id: notification.id,
        type: notification.type,
        icon: icon,
        title: notification.title,
        message: notification.message,
        isRead: notification.isRead,
        readAt: notification.readAt?.toISOString() || null,
        relatedType: notification.relatedType,
        relatedId: notification.relatedId,
        actionUrl: notification.actionUrl,
        createdAt: notification.createdAt.toISOString(),
        timeLabel: timeLabel,
        minutesAgo: minutesAgo,
      },
    });

  } catch (error) {
    console.error("❌ Error obteniendo notificación:", error);
    return NextResponse.json(
      {
        error: "Error al obtener notificación",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Marcar notificación como leída
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

    // 2. Verificar que la notificación existe y pertenece al usuario
    const existingNotification = await prisma.notification.findUnique({
      where: { id: id },
      select: {
        id: true,
        userId: true,
        isRead: true,
        title: true,
      },
    });

    if (!existingNotification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    if (existingNotification.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar esta notificación" },
        { status: 403 }
      );
    }

    // 3. Si ya está leída, evitar query innecesaria
    if (existingNotification.isRead) {
      return NextResponse.json({
        success: true,
        message: "La notificación ya estaba marcada como leída",
        data: {
          id: existingNotification.id,
          isRead: true,
        },
      });
    }

    // 4. Marcar como leída
    const now = new Date();
    const updatedNotification = await prisma.notification.update({
      where: { id: id },
      data: {
        isRead: true,
        readAt: now,
      },
    });

    // 5. Obtener count actualizado de notificaciones sin leer
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    // 6. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Notificación marcada como leída",
      data: {
        id: updatedNotification.id,
        type: updatedNotification.type,
        title: updatedNotification.title,
        isRead: updatedNotification.isRead,
        readAt: updatedNotification.readAt?.toISOString(),
        unreadCount: unreadCount, // Para actualizar badge en UI
      },
    });

  } catch (error) {
    console.error("❌ Error actualizando notificación:", error);
    return NextResponse.json(
      {
        error: "Error al marcar notificación como leída",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Eliminar notificación
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
    const notification = await prisma.notification.findUnique({
      where: { id: id },
      select: {
        id: true,
        userId: true,
        title: true,
        type: true,
        isRead: true,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para eliminar esta notificación" },
        { status: 403 }
      );
    }

    // 3. Eliminar notificación (hard delete)
    await prisma.notification.delete({
      where: { id: id },
    });

    // 4. Obtener count actualizado de notificaciones sin leer
    const unreadCount = await prisma.notification.count({
      where: {
        userId: userId,
        isRead: false,
      },
    });

    // 5. Obtener total de notificaciones restantes
    const totalCount = await prisma.notification.count({
      where: { userId: userId },
    });

    // 6. Respuesta exitosa
    return NextResponse.json({
      success: true,
      message: "Notificación eliminada exitosamente",
      data: {
        id: notification.id,
        title: notification.title,
        counts: {
          unread: unreadCount,
          total: totalCount,
        },
      },
    });

  } catch (error) {
    console.error("❌ Error eliminando notificación:", error);
    return NextResponse.json(
      {
        error: "Error al eliminar notificación",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * PUT - Método alternativo: Soft delete (marcar como eliminada sin borrar)
 * 
 * Si prefieres mantener historial completo, puedes agregar un campo
 * "isDeleted" al schema de Notification y usar este método.
 * 
 * Schema addition needed:
 * model Notification {
 *   ...
 *   isDeleted Boolean @default(false)
 *   deletedAt DateTime?
 * }
 */
export async function PUT(
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

    // 2. Parsear body para acción
    const body = await req.json().catch(() => ({}));
    const { action } = body;

    if (action !== "soft_delete" && action !== "restore") {
      return NextResponse.json(
        { 
          error: "Acción inválida",
          validActions: ["soft_delete", "restore"]
        },
        { status: 400 }
      );
    }

    // 3. Verificar ownership
    const notification = await prisma.notification.findUnique({
      where: { id: id },
      select: {
        id: true,
        userId: true,
        title: true,
      },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notificación no encontrada" },
        { status: 404 }
      );
    }

    if (notification.userId !== userId) {
      return NextResponse.json(
        { error: "No tienes permiso para modificar esta notificación" },
        { status: 403 }
      );
    }

    // 4. Realizar soft delete o restore
    // NOTA: Esto requiere agregar campos isDeleted y deletedAt al schema
    // Por ahora retornamos un mensaje informativo
    
    return NextResponse.json({
      success: false,
      message: "Soft delete no implementado. Agrega los campos 'isDeleted' y 'deletedAt' al schema de Notification para usar esta función.",
      suggestion: "Usa DELETE para hard delete o implementa soft delete agregando los campos necesarios al schema.",
    });

    /* Implementación completa si agregas los campos:
    
    const now = new Date();
    
    if (action === "soft_delete") {
      await prisma.notification.update({
        where: { id: id },
        data: {
          isDeleted: true,
          deletedAt: now,
        },
      });
      
      return NextResponse.json({
        success: true,
        message: "Notificación ocultada exitosamente",
      });
    } else {
      await prisma.notification.update({
        where: { id: id },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      });
      
      return NextResponse.json({
        success: true,
        message: "Notificación restaurada exitosamente",
      });
    }
    */

  } catch (error) {
    console.error("❌ Error en soft delete:", error);
    return NextResponse.json(
      {
        error: "Error al procesar notificación",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}