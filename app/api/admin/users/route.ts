/**
 * ADMIN USERS ENDPOINT
 * 
 * GET - OBJETIVO:
 * Listar todos los usuarios de la plataforma (solo para admin).
 * 
 * MISIÓN:
 * - Validar que el usuario actual es admin (ej: email en whitelist)
 * - Consultar User con agregaciones:
 *   · Total users
 *   · Active subscriptions count
 *   · Total datasets, insights, dataPoints
 * - Filtros opcionales:
 *   · subscription status (active/canceled)
 *   · createdAt range (last 7d, 30d, all)
 * - Ordenar por createdAt DESC
 * - Incluir por cada user:
 *   · email, name, createdAt
 *   · Subscription status y plan
 *   · Usage stats (datasets, insights)
 *   · lastActivityAt (última vez que hizo algo)
 * 
 * USADO POR:
 * - Panel de admin interno (futuro)
 * - Analytics de adopción
 * 
 * SEGURIDAD:
 * - Solo accesible por admin users
 * - Middleware: requireAdmin()
 * 
 * PRISMA MODELS:
 * - User (all users)
 * - Subscription
 * - Dataset (count per user)
 * - Insight (count per user)
 */
import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Lista de admin emails (en producción usar Clerk metadata)
const ADMIN_EMAILS = [
  "admin@yourdomain.com",
  // Agrega más admins aquí
];

/**
 * ADMIN USERS ENDPOINT
 * 
 * GET - Listar todos los usuarios de la plataforma
 * 
 * Query params:
 * - status: active | canceled | all (filter por subscription)
 * - period: 7d | 30d | all (filter por createdAt)
 * - page: número de página (default: 1)
 * - limit: items por página (default: 50, max: 100)
 * - search: búsqueda por email/name
 * - sortBy: createdAt | datasets | insights (default: createdAt)
 * - order: asc | desc (default: desc)
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

    // 2. Validar que sea admin
    const user = await currentUser();
    if (!user?.emailAddresses?.[0]?.emailAddress || 
        !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
      return NextResponse.json(
        { error: "No autorizado - Solo admins" },
        { status: 403 }
      );
    }

    // 3. Parsear query params
    const searchParams = req.nextUrl.searchParams;
    const status = searchParams.get("status") || "all"; // active, canceled, all
    const period = searchParams.get("period") || "all"; // 7d, 30d, all
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // 4. Calcular fechas de filtro
    const now = new Date();
    let dateFilter: Date | undefined;
    
    if (period === "7d") {
      dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === "30d") {
      dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // 5. Construir filtros de búsqueda
    const whereClause: any = {};

    // Filtro por fecha
    if (dateFilter) {
      whereClause.createdAt = { gte: dateFilter };
    }

    // Filtro por subscription status
    if (status !== "all") {
      whereClause.subscription = {
        status: status,
      };
    }

    // Filtro por búsqueda (email o name)
    if (search) {
      whereClause.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    // 6. Obtener total de usuarios (para paginación)
    const totalUsers = await prisma.user.count({
      where: whereClause,
    });

    // 7. Calcular offset para paginación
    const skip = (page - 1) * limit;

    // 8. Construir ordenamiento
    let orderBy: any = {};
    
    if (sortBy === "createdAt") {
      orderBy = { createdAt: order };
    } else if (sortBy === "datasets") {
      orderBy = { datasets: { _count: order } };
    } else if (sortBy === "insights") {
      orderBy = { insights: { _count: order } };
    }

    // 9. Obtener usuarios con todas sus relaciones
    const users = await prisma.user.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      orderBy: orderBy,
      include: {
        subscription: {
          select: {
            status: true,
            planId: true,
            currentPeriodEnd: true,
            cancelAtPeriodEnd: true,
            interval: true,
          },
        },
        _count: {
          select: {
            datasets: true,
            insights: true,
            notifications: true,
            apiKeys: true,
            activityLogs: true,
          },
        },
        activityLogs: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            createdAt: true,
            action: true,
          },
        },
        datasets: {
          select: {
            totalDataPoints: true,
          },
        },
      },
    });

    // 10. Formatear datos de usuarios
    const formattedUsers = users.map((u) => {
      // Calcular total de data points
      const totalDataPoints = u.datasets.reduce(
        (sum, ds) => sum + ds.totalDataPoints,
        0
      );

      // Última actividad
      const lastActivity = u.activityLogs[0];

      // Estado de suscripción amigable
      let subscriptionLabel = "Free";
      if (u.subscription) {
        if (u.subscription.status === "active") {
          subscriptionLabel = `Pro (${u.subscription.interval})`;
        } else if (u.subscription.status === "canceled") {
          subscriptionLabel = "Canceled";
        } else if (u.subscription.status === "past_due") {
          subscriptionLabel = "Past Due";
        } else if (u.subscription.status === "trialing") {
          subscriptionLabel = "Trial";
        }
      }

      // Límites actuales
      const isUnlimited = u.monthlyDatasetsLimit === -1;
      const datasetsUsagePercent = isUnlimited
        ? 0
        : Math.round((u.currentDatasetsUsage / u.monthlyDatasetsLimit) * 100);

      const aiInsightsUsagePercent = 
        u.monthlyAIInsightsLimit === -1
          ? 0
          : Math.round((u.currentAIInsightsUsage / u.monthlyAIInsightsLimit) * 100);

      return {
        id: u.id,
        email: u.email,
        name: u.name || "Sin nombre",
        createdAt: u.createdAt.toISOString(),
        
        // Subscription info
        subscription: {
          status: u.subscription?.status || "none",
          label: subscriptionLabel,
          planId: u.subscription?.planId || null,
          interval: u.subscription?.interval || null,
          periodEnd: u.subscription?.currentPeriodEnd?.toISOString() || null,
          willCancel: u.subscription?.cancelAtPeriodEnd || false,
        },

        // Usage stats
        usage: {
          datasets: {
            count: u._count.datasets,
            limit: u.monthlyDatasetsLimit,
            current: u.currentDatasetsUsage,
            percentage: datasetsUsagePercent,
            isUnlimited: isUnlimited,
          },
          insights: {
            count: u._count.insights,
            limit: u.monthlyAIInsightsLimit,
            current: u.currentAIInsightsUsage,
            percentage: aiInsightsUsagePercent,
            isUnlimited: u.monthlyAIInsightsLimit === -1,
          },
          dataPoints: {
            total: totalDataPoints,
            limit: u.dailyDataPointsLimit,
            current: u.currentDataPointsUsage,
            isUnlimited: u.dailyDataPointsLimit === -1,
          },
          notifications: u._count.notifications,
          apiKeys: u._count.apiKeys,
          activityLogs: u._count.activityLogs,
        },

        // Activity
        lastActivity: lastActivity
          ? {
              timestamp: lastActivity.createdAt.toISOString(),
              action: lastActivity.action,
              daysAgo: Math.floor(
                (now.getTime() - lastActivity.createdAt.getTime()) / 
                (1000 * 60 * 60 * 24)
              ),
            }
          : null,

        // Settings
        settings: {
          timezone: u.timezone,
          notificationsEmail: u.notificationsEmail,
          notificationsSlack: u.notificationsSlack,
          hasSlackWebhook: !!u.slackWebhookUrl,
        },

        // Stripe
        stripeCustomerId: u.stripeCustomerId,
      };
    });

    // 11. Calcular métricas agregadas del conjunto actual
    const aggregateStats = {
      totalInPage: formattedUsers.length,
      withActiveSubscription: formattedUsers.filter(
        (u) => u.subscription.status === "active"
      ).length,
      withCanceledSubscription: formattedUsers.filter(
        (u) => u.subscription.status === "canceled"
      ).length,
      onFreePlan: formattedUsers.filter(
        (u) => u.subscription.status === "none"
      ).length,
      totalDatasets: formattedUsers.reduce(
        (sum, u) => sum + u.usage.datasets.count,
        0
      ),
      totalInsights: formattedUsers.reduce(
        (sum, u) => sum + u.usage.insights.count,
        0
      ),
      totalDataPoints: formattedUsers.reduce(
        (sum, u) => sum + u.usage.dataPoints.total,
        0
      ),
      activeLastWeek: formattedUsers.filter(
        (u) => u.lastActivity && u.lastActivity.daysAgo <= 7
      ).length,
      inactiveOver30Days: formattedUsers.filter(
        (u) => !u.lastActivity || u.lastActivity.daysAgo > 30
      ).length,
    };

    // 12. Construir respuesta con paginación
    const totalPages = Math.ceil(totalUsers / limit);

    return NextResponse.json({
      success: true,
      data: {
        users: formattedUsers,
        pagination: {
          total: totalUsers,
          page: page,
          limit: limit,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        filters: {
          status: status,
          period: period,
          search: search || null,
          sortBy: sortBy,
          order: order,
        },
        aggregateStats: aggregateStats,
      },
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error("❌ Error en admin users:", error);
    
    return NextResponse.json(
      { 
        error: "Error al obtener usuarios",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Realizar acciones administrativas sobre usuarios
 * 
 * Body:
 * - action: "reset_limits" | "upgrade_plan" | "suspend"
 * - userId: ID del usuario target
 * - params: parámetros adicionales según la acción
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Validar autenticación y admin
    const { userId: adminUserId } = await auth();
    if (!adminUserId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const adminUser = await currentUser();
    if (!adminUser?.emailAddresses?.[0]?.emailAddress || 
        !ADMIN_EMAILS.includes(adminUser.emailAddresses[0].emailAddress)) {
      return NextResponse.json(
        { error: "No autorizado - Solo admins" },
        { status: 403 }
      );
    }

    // 2. Parsear body
    const body = await req.json();
    const { action, userId, params } = body;

    if (!action || !userId) {
      return NextResponse.json(
        { error: "Faltan campos requeridos: action, userId" },
        { status: 400 }
      );
    }

    // 3. Ejecutar acción según tipo
    let result;

    switch (action) {
      case "reset_limits":
        // Resetear límites de uso
        result = await prisma.user.update({
          where: { id: userId },
          data: {
            currentDatasetsUsage: 0,
            currentAIInsightsUsage: 0,
            currentDataPointsUsage: 0,
            lastAIReset: new Date(),
            lastDataPointsReset: new Date(),
          },
        });

        // Log la acción
        await prisma.activityLog.create({
          data: {
            userId: adminUserId,
            action: "admin.reset_limits",
            resource: "User",
            resourceId: userId,
            metadata: { targetUser: userId },
          },
        });
        break;

      case "upgrade_plan":
        // Actualizar límites manualmente (para testing o casos especiales)
        const { monthlyDatasets, monthlyInsights, dailyDataPoints } = params || {};
        
        result = await prisma.user.update({
          where: { id: userId },
          data: {
            monthlyDatasetsLimit: monthlyDatasets || -1,
            monthlyAIInsightsLimit: monthlyInsights || -1,
            dailyDataPointsLimit: dailyDataPoints || -1,
          },
        });

        await prisma.activityLog.create({
          data: {
            userId: adminUserId,
            action: "admin.upgrade_plan",
            resource: "User",
            resourceId: userId,
            metadata: { targetUser: userId, newLimits: params },
          },
        });
        break;

      case "suspend":
        // Marcar usuario como suspendido (podrías agregar un campo en el schema)
        // Por ahora, solo logeamos la acción
        await prisma.activityLog.create({
          data: {
            userId: adminUserId,
            action: "admin.suspend_user",
            resource: "User",
            resourceId: userId,
            metadata: { 
              targetUser: userId,
              reason: params?.reason || "No especificado"
            },
          },
        });

        result = { message: "Usuario marcado para suspensión" };
        break;

      default:
        return NextResponse.json(
          { error: `Acción desconocida: ${action}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      action: action,
      userId: userId,
      result: result,
    });

  } catch (error) {
    console.error("❌ Error en admin action:", error);
    
    return NextResponse.json(
      { 
        error: "Error al ejecutar acción administrativa",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}