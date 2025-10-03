import "server-only";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export type AuthCheckResult = {
  userId: string | null;
  isAuthenticated: boolean;
  hasSubscription: boolean;
  subscriptionStatus?: string;
  redirectTo?: string;
};

export async function checkAuthenticationAndSubscription(
  waitMs = 0
): Promise<AuthCheckResult> {
  const { userId } = await auth();

  if (!userId) {
    return {
      userId: null,
      isAuthenticated: false,
      hasSubscription: false,
      redirectTo: "/sign-in?redirect_url=/dashboard",
    };
  }

  if (waitMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  let subscription = null;
  try {
    subscription = await prisma.subscription.findUnique({
      where: { userId },
    });
  } catch (error) {
    console.error("Error checking subscription:", error);
    return {
      userId,
      isAuthenticated: true,
      hasSubscription: false,
    };
  }

  // Con tu nuevo schema, status puede ser: active, canceled, past_due, trialing
  const hasActiveSubscription =
    subscription?.status === "active" || subscription?.status === "trialing";

  return {
    userId,
    isAuthenticated: true,
    hasSubscription: hasActiveSubscription,
    subscriptionStatus: subscription?.status,
    redirectTo: hasActiveSubscription ? undefined : "/pricing",
  };
}