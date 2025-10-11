/**
 * USAGE LIMITS ENDPOINT
 * 
 * GET - OBJETIVO:
 * Devolver el uso actual vs límites del plan del usuario para mostrar
 * en widgets de /settings y paywalls.
 * 
 * MISIÓN:
 * - Consultar User WHERE id = currentUser
 * - Calcular para cada límite:
 *   · datasets: {limit, used, remaining, percentage}
 *   · aiInsights: {limit, used, remaining, resetsAt}
 *   · dataPoints: {limit, used, remaining, resetsAt}
 * - Si limit = -1 (Pro plan): remaining = "unlimited"
 * - Determinar si debe mostrar upgrade prompt:
 *   · Si FREE y usage > 80% en cualquier límite
 *   · Si FREE y ha bloqueado alguna acción recientemente
 * - Incluir próxima fecha de reset:
 *   · aiInsights: primer día del mes siguiente
 *   · dataPoints: medianoche del día siguiente
 * 
 * USADO POR:
 * - Usage cards en /settings/billing
 * - Progress bars en dashboard
 * - Lógica de paywall (si remaining ≤ 0, mostrar upgrade CTA)
 * - Badge "3/3 insights used" en botón "Run AI Analysis"
 * 
 * CRON JOBS REQUERIDOS:
 * - Diariamente a 00:00 UTC: resetear currentDataPointsUsage = 0
 * - Mensualmente día 1: resetear currentAIInsightsUsage = 0
 * 
 * PRISMA MODELS:
 * - User (all *Limit and *Usage fields, lastAIReset, lastDataPointsReset)
 * - Subscription (para determinar si es Pro/Free)
 */

// app/api/usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET /api/usage - Get current user usage and limits
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        monthlyDatasetsLimit: true,
        currentDatasetsUsage: true,
        monthlyAIInsightsLimit: true,
        currentAIInsightsUsage: true,
        dailyDataPointsLimit: true,
        currentDataPointsUsage: true,
        lastAIReset: true,
        lastDataPointsReset: true,
        subscription: {
          select: {
            status: true,
            planId: true,
            currentPeriodEnd: true
          }
        },
        _count: {
          select: {
            datasets: true,
            insights: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if we need to reset daily/monthly counters
    const now = new Date();
    const shouldResetDaily = checkShouldResetDaily(user.lastDataPointsReset, now);
    const shouldResetMonthly = checkShouldResetMonthly(user.lastAIReset, now);

    // Reset counters if needed
    if (shouldResetDaily || shouldResetMonthly) {
      const updates: any = {};
      
      if (shouldResetDaily) {
        updates.currentDataPointsUsage = 0;
        updates.lastDataPointsReset = now;
      }
      
      if (shouldResetMonthly) {
        updates.currentAIInsightsUsage = 0;
        updates.lastAIReset = now;
      }

      await prisma.user.update({
        where: { id: userId },
        data: updates
      });

      // Update local values
      if (shouldResetDaily) {
        user.currentDataPointsUsage = 0;
        user.lastDataPointsReset = now;
      }
      if (shouldResetMonthly) {
        user.currentAIInsightsUsage = 0;
        user.lastAIReset = now;
      }
    }

    const isPro = user.subscription?.status === 'active';

    return NextResponse.json({
      plan: isPro ? 'pro' : 'free',
      subscription: user.subscription,
      limits: {
        datasets: {
          limit: user.monthlyDatasetsLimit,
          used: user._count.datasets,
          remaining: user.monthlyDatasetsLimit === -1 
            ? 'unlimited' 
            : user.monthlyDatasetsLimit - user._count.datasets,
          isUnlimited: user.monthlyDatasetsLimit === -1
        },
        aiInsights: {
          limit: user.monthlyAIInsightsLimit,
          used: user.currentAIInsightsUsage,
          remaining: user.monthlyAIInsightsLimit === -1
            ? 'unlimited'
            : user.monthlyAIInsightsLimit - user.currentAIInsightsUsage,
          isUnlimited: user.monthlyAIInsightsLimit === -1,
          resetsAt: getNextMonthReset(user.lastAIReset)
        },
        dataPoints: {
          limit: user.dailyDataPointsLimit,
          used: user.currentDataPointsUsage,
          remaining: user.dailyDataPointsLimit === -1
            ? 'unlimited'
            : user.dailyDataPointsLimit - user.currentDataPointsUsage,
          isUnlimited: user.dailyDataPointsLimit === -1,
          resetsAt: getNextDayReset(user.lastDataPointsReset)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching usage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function checkShouldResetDaily(lastReset: Date, now: Date): boolean {
  const lastResetDay = new Date(lastReset).setHours(0, 0, 0, 0);
  const todayDay = new Date(now).setHours(0, 0, 0, 0);
  return lastResetDay < todayDay;
}

function checkShouldResetMonthly(lastReset: Date, now: Date): boolean {
  const lastResetMonth = new Date(lastReset).getMonth();
  const currentMonth = new Date(now).getMonth();
  const lastResetYear = new Date(lastReset).getFullYear();
  const currentYear = new Date(now).getFullYear();
  
  return lastResetYear < currentYear || 
         (lastResetYear === currentYear && lastResetMonth < currentMonth);
}

function getNextDayReset(lastReset: Date): Date {
  const next = new Date(lastReset);
  next.setDate(next.getDate() + 1);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getNextMonthReset(lastReset: Date): Date {
  const next = new Date(lastReset);
  next.setMonth(next.getMonth() + 1);
  next.setDate(1);
  next.setHours(0, 0, 0, 0);
  return next;
}