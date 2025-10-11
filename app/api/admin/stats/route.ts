/**
 * ADMIN PLATFORM STATS ENDPOINT
 * 
 * GET - OBJETIVO:
 * Obtener métricas globales de la plataforma para dashboard interno.
 * 
 * MISIÓN:
 * - Validar admin user
 * - Calcular métricas agregadas:
 *   · Total users (all time)
 *   · Active users (last 30 days)
 *   · New signups (last 7d, 30d)
 *   · Total subscriptions (active/canceled/past_due)
 *   · MRR (Monthly Recurring Revenue)
 *   · Total datasets created
 *   · Total AI insights generated
 *   · Total data points stored
 *   · Average datasets per user
 *   · Conversion rate (free → pro)
 * - Timeline de crecimiento (por mes):
 *   · New users
 *   · New subscriptions
 *   · Churn rate
 * 
 * USADO POR:
 * - Panel de métricas interno
 * - Reportes mensuales
 * 
 * OPTIMIZACIÓN:
 * - Cachear estas queries (actualizar cada hora)
 * - Usar materialized views si la DB crece mucho
 * 
 * PRISMA MODELS:
 * - User (aggregate counts)
 * - Subscription (revenue calculations)
 * - Dataset, Insight, DataPoint (counts)
 * - ActivityLog (para actividad reciente)
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
 * ADMIN PLATFORM STATS ENDPOINT
 * 
 * GET - Obtener métricas globales de la plataforma
 * 
 * Requiere autenticación como admin
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

    // 3. Calcular fechas de referencia
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 4. MÉTRICAS DE USUARIOS
    const [
      totalUsers,
      activeUsers,
      newUsers7d,
      newUsers30d,
    ] = await Promise.all([
      // Total de usuarios
      prisma.user.count(),
      
      // Usuarios activos (con actividad en últimos 30 días)
      prisma.user.count({
        where: {
          activityLogs: {
            some: {
              createdAt: { gte: last30Days }
            }
          }
        }
      }),
      
      // Nuevos registros últimos 7 días
      prisma.user.count({
        where: { createdAt: { gte: last7Days } }
      }),
      
      // Nuevos registros últimos 30 días
      prisma.user.count({
        where: { createdAt: { gte: last30Days } }
      }),
    ]);

    // 5. MÉTRICAS DE SUSCRIPCIONES
    const [
      activeSubscriptions,
      canceledSubscriptions,
      pastDueSubscriptions,
      allSubscriptions,
    ] = await Promise.all([
      prisma.subscription.count({
        where: { status: "active" }
      }),
      
      prisma.subscription.count({
        where: { status: "canceled" }
      }),
      
      prisma.subscription.count({
        where: { status: "past_due" }
      }),
      
      prisma.subscription.findMany({
        where: { status: "active" },
        select: { planId: true }
      }),
    ]);

    // 6. CALCULAR MRR (Monthly Recurring Revenue)
    // Asumiendo precios estándar (ajusta según tus planes)
    const PLAN_PRICES: Record<string, number> = {
      'price_pro_monthly': 29,
      'price_pro_yearly': 290, // Dividido por 12 = ~24.17/mes
      // Agrega tus price IDs de Stripe aquí
    };

    let mrr = 0;
    allSubscriptions.forEach(sub => {
      const planPrice = PLAN_PRICES[sub.planId] || 0;
      mrr += planPrice;
    });

    // 7. MÉTRICAS DE CONTENIDO
    const [
      totalDatasets,
      totalInsights,
      totalDataPoints,
      totalAlerts,
    ] = await Promise.all([
      prisma.dataset.count(),
      prisma.insight.count(),
      prisma.dataPoint.count(),
      prisma.alert.count(),
    ]);

    // 8. MÉTRICAS PROMEDIO
    const avgDatasetsPerUser = totalUsers > 0 
      ? (totalDatasets / totalUsers).toFixed(2) 
      : "0";

    // 9. CONVERSION RATE (free → pro)
    const totalSubscriptions = activeSubscriptions + canceledSubscriptions + pastDueSubscriptions;
    const conversionRate = totalUsers > 0 
      ? ((totalSubscriptions / totalUsers) * 100).toFixed(2)
      : "0";

    // 10. TIMELINE DE CRECIMIENTO (últimos 6 meses)
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    
    const usersTimeline = await prisma.$queryRaw<Array<{
      month: string;
      count: bigint;
    }>>`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        COUNT(*) as count
      FROM "User"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    const subscriptionsTimeline = await prisma.$queryRaw<Array<{
      month: string;
      count: bigint;
    }>>`
      SELECT 
        TO_CHAR(DATE_TRUNC('month', "createdAt"), 'YYYY-MM') as month,
        COUNT(*) as count
      FROM "Subscription"
      WHERE "createdAt" >= ${sixMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `;

    // 11. CHURN RATE (cancelaciones vs activas)
    const churnRate = activeSubscriptions > 0
      ? ((canceledSubscriptions / (activeSubscriptions + canceledSubscriptions)) * 100).toFixed(2)
      : "0";

    // 12. TOP USERS (más datasets)
    const topUsers = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        _count: {
          select: {
            datasets: true,
            insights: true,
          }
        }
      },
      orderBy: {
        datasets: {
          _count: 'desc'
        }
      }
    });

    // 13. ACTIVIDAD RECIENTE
    const recentActivity = await prisma.activityLog.count({
      where: {
        createdAt: { gte: last7Days }
      }
    });

    // 14. DATASETS POR ESTADO
    const datasetsByStatus = await prisma.dataset.groupBy({
      by: ['status'],
      _count: true,
    });

    // 15. INSIGHTS POR SEVERIDAD
    const insightsBySeverity = await prisma.insight.groupBy({
      by: ['severity'],
      _count: true,
    });

    // 16. CONSTRUIR RESPUESTA
    const stats = {
      // Métricas de usuarios
      users: {
        total: totalUsers,
        active: activeUsers,
        new7d: newUsers7d,
        new30d: newUsers30d,
      },

      // Métricas de suscripciones
      subscriptions: {
        active: activeSubscriptions,
        canceled: canceledSubscriptions,
        pastDue: pastDueSubscriptions,
        total: totalSubscriptions,
      },

      // Revenue
      revenue: {
        mrr: `$${mrr.toFixed(2)}`,
        arr: `$${(mrr * 12).toFixed(2)}`, // Annual Recurring Revenue
      },

      // Métricas de contenido
      content: {
        datasets: totalDatasets,
        insights: totalInsights,
        dataPoints: totalDataPoints,
        alerts: totalAlerts,
      },

      // Métricas calculadas
      metrics: {
        avgDatasetsPerUser: parseFloat(avgDatasetsPerUser),
        conversionRate: `${conversionRate}%`,
        churnRate: `${churnRate}%`,
        recentActivity7d: recentActivity,
      },

      // Distribuciones
      distributions: {
        datasetsByStatus: datasetsByStatus.map(d => ({
          status: d.status,
          count: d._count,
        })),
        insightsBySeverity: insightsBySeverity.map(i => ({
          severity: i.severity,
          count: i._count,
        })),
      },

      // Top users
      topUsers: topUsers.map(u => ({
        email: u.email,
        name: u.name || 'Sin nombre',
        datasets: u._count.datasets,
        insights: u._count.insights,
      })),

      // Timeline
      timeline: {
        users: usersTimeline.map(t => ({
          month: t.month,
          count: Number(t.count),
        })),
        subscriptions: subscriptionsTimeline.map(t => ({
          month: t.month,
          count: Number(t.count),
        })),
      },

      // Metadata
      generatedAt: new Date().toISOString(),
      period: {
        last7Days: last7Days.toISOString(),
        last30Days: last30Days.toISOString(),
      },
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error("❌ Error en admin stats:", error);
    
    return NextResponse.json(
      { 
        error: "Error al obtener estadísticas",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Opcional: Endpoint para limpiar caché
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    if (!user?.emailAddresses?.[0]?.emailAddress || 
        !ADMIN_EMAILS.includes(user.emailAddresses[0].emailAddress)) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Aquí podrías limpiar Redis/caché si lo implementas
    // await redis.del('admin:stats')

    return NextResponse.json({
      success: true,
      message: "Caché limpiado (si está implementado)",
    });

  } catch (error) {
    console.error("❌ Error limpiando caché:", error);
    return NextResponse.json(
      { error: "Error al limpiar caché" },
      { status: 500 }
    );
  }
}

