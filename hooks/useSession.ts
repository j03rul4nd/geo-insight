// src/hooks/use-session.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Tipos
export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  timezone: string;
  notifications: {
    email: boolean;
    slack: boolean;
    slackConfigured: boolean;
  };
}

export interface LimitInfo {
  limit: number;
  used: number;
  remaining: number;
  isUnlimited: boolean;
  percentage: number;
  resetsAt?: string;
}

export interface SessionLimits {
  datasets: LimitInfo;
  aiInsights: LimitInfo;
  dataPoints: LimitInfo;
}

export interface SubscriptionData {
  status: string;
  planId: string;
  interval: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface SessionResponse {
  user: SessionUser;
  plan: 'FREE' | 'PRO';
  subscription: SubscriptionData | null;
  limits: SessionLimits;
  shouldShowUpgrade: boolean;
}

// Hook principal
export function useSession() {
  const query = useQuery<SessionResponse>({
    queryKey: ['session'],
    queryFn: async () => {
      const response = await fetch('/api/auth/session');
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch session');
      }
      
      return response.json();
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  return {
    ...query,
    user: query.data?.user,
    plan: query.data?.plan,
    subscription: query.data?.subscription,
    limits: query.data?.limits,
    shouldShowUpgrade: query.data?.shouldShowUpgrade ?? false,
    
    isPro: query.data?.plan === 'PRO',
    isFree: query.data?.plan === 'FREE',
    isSubscriptionActive: query.data?.subscription?.status === 'active',
    isSubscriptionCanceled: query.data?.subscription?.cancelAtPeriodEnd ?? false,
    
    canCreateDataset: 
      query.data?.limits.datasets.isUnlimited || 
      (query.data?.limits.datasets.remaining ?? 0) > 0,
    canGenerateInsight: 
      query.data?.limits.aiInsights.isUnlimited || 
      (query.data?.limits.aiInsights.remaining ?? 0) > 0,
    canAddDataPoints: 
      query.data?.limits.dataPoints.isUnlimited || 
      (query.data?.limits.dataPoints.remaining ?? 0) > 0,
  };
}

// Hook para invalidar
export function useInvalidateSession() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['session'] });
  };
}

// Hook para límites específicos
export function useLimit(type: 'datasets' | 'aiInsights' | 'dataPoints') {
  const { limits } = useSession();
  
  if (!limits) {
    return {
      limit: 0,
      used: 0,
      remaining: 0,
      isUnlimited: false,
      percentage: 0,
      canUse: false,
      isNearLimit: false,
      isCritical: false,
    };
  }
  
  const limitData = limits[type];
  
  return {
    ...limitData,
    canUse: limitData.isUnlimited || limitData.remaining > 0,
    isNearLimit: limitData.percentage >= 80 && !limitData.isUnlimited,
    isCritical: limitData.percentage >= 95 && !limitData.isUnlimited,
  };
}