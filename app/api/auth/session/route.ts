/**
 * SESSION ENDPOINT
 * 
 * OBJETIVO:
 * Proporcionar al cliente los datos del usuario actual, su suscripción activa
 * y los límites de uso en tiempo real para mostrar en la UI.
 * 
 * MISIÓN:
 * - Devolver información del User desde Prisma (synced con Clerk)
 * - Incluir estado de Subscription (active/canceled/past_due)
 * - Calcular límites vs uso actual de:
 *   · monthlyDatasetsLimit / currentDatasetsUsage
 *   · monthlyAIInsightsLimit / currentAIInsightsUsage
 *   · dailyDataPointsLimit / currentDataPointsUsage
 * - Determinar si debe mostrar prompts de upgrade
 * 
 * USADO POR:
 * - Dashboard header (mostrar plan actual)
 * - Usage widgets en /settings
 * - Lógica de paywall en frontend
 * 
 * PRISMA MODELS:
 * - User (id, email, name, *Limit, *Usage, timezone, notifications*)
 * - Subscription (status, currentPeriodEnd, planId)
 */
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // 1. Verificar autenticación con Clerk
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // 2. Obtener usuario con suscripción desde Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // 3. Determinar el plan actual
    const hasActiveSubscription = 
      user.subscription?.status === "active" || 
      user.subscription?.status === "trialing";
    
    const plan = hasActiveSubscription ? "PRO" : "FREE";

    // 4. Calcular límites y uso
    const limits = {
      datasets: {
        limit: user.monthlyDatasetsLimit,
        used: user.currentDatasetsUsage,
        remaining: user.monthlyDatasetsLimit === -1 
          ? -1 
          : Math.max(0, user.monthlyDatasetsLimit - user.currentDatasetsUsage),
        isUnlimited: user.monthlyDatasetsLimit === -1,
        percentage: user.monthlyDatasetsLimit === -1 
          ? 0 
          : Math.min(100, (user.currentDatasetsUsage / user.monthlyDatasetsLimit) * 100),
      },
      aiInsights: {
        limit: user.monthlyAIInsightsLimit,
        used: user.currentAIInsightsUsage,
        remaining: user.monthlyAIInsightsLimit === -1 
          ? -1 
          : Math.max(0, user.monthlyAIInsightsLimit - user.currentAIInsightsUsage),
        isUnlimited: user.monthlyAIInsightsLimit === -1,
        percentage: user.monthlyAIInsightsLimit === -1 
          ? 0 
          : Math.min(100, (user.currentAIInsightsUsage / user.monthlyAIInsightsLimit) * 100),
        resetsAt: user.lastAIReset,
      },
      dataPoints: {
        limit: user.dailyDataPointsLimit,
        used: user.currentDataPointsUsage,
        remaining: user.dailyDataPointsLimit === -1 
          ? -1 
          : Math.max(0, user.dailyDataPointsLimit - user.currentDataPointsUsage),
        isUnlimited: user.dailyDataPointsLimit === -1,
        percentage: user.dailyDataPointsLimit === -1 
          ? 0 
          : Math.min(100, (user.currentDataPointsUsage / user.dailyDataPointsLimit) * 100),
        resetsAt: user.lastDataPointsReset,
      },
    };

    // 5. Determinar si debe mostrar upgrade prompt
    const shouldShowUpgrade = 
      plan === "FREE" && (
        limits.datasets.percentage >= 80 ||
        limits.aiInsights.percentage >= 80 ||
        limits.dataPoints.percentage >= 80
      );

    // 6. Preparar datos de suscripción
    const subscriptionData = user.subscription ? {
      status: user.subscription.status,
      planId: user.subscription.planId,
      interval: user.subscription.interval,
      currentPeriodEnd: user.subscription.currentPeriodEnd,
      cancelAtPeriodEnd: user.subscription.cancelAtPeriodEnd,
    } : null;

    // 7. Respuesta completa
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        timezone: user.timezone,
        notifications: {
          email: user.notificationsEmail,
          slack: user.notificationsSlack,
          slackConfigured: !!user.slackWebhookUrl,
        },
      },
      plan,
      subscription: subscriptionData,
      limits,
      shouldShowUpgrade,
    });

  } catch (error) {
    console.error("[SESSION_GET_ERROR]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}