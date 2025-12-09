// src/hooks/useSession.ts
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

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
  const queryClient = useQueryClient();
  
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
    // ✅ Solo se refresca cuando la ventana recupera el foco
    staleTime: Infinity,
    gcTime: 1000 * 60 * 30, // Mantener en caché 30 minutos
    refetchOnWindowFocus: true, // Refrescar cuando el usuario vuelve a la pestaña
    refetchOnMount: false, // No refrescar en cada mount
    refetchOnReconnect: true, // Refrescar si se recupera la conexión
    retry: 1,
  });

  // ✅ Listener para eventos custom que invalidan la sesión
  useEffect(() => {
    const handleInvalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
    };

    // Escuchar eventos personalizados
    window.addEventListener('session:invalidate', handleInvalidate);
    
    return () => {
      window.removeEventListener('session:invalidate', handleInvalidate);
    };
  }, [queryClient]);

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

// Hook para invalidar manualmente (úsalo después de acciones importantes)
export function useInvalidateSession() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['session'] });
    // También disparar evento para otros componentes
    window.dispatchEvent(new CustomEvent('session:invalidate'));
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

// ✅ Hook para actualizar optimísticamente los límites (sin llamada al servidor)
export function useOptimisticUpdateLimits() {
  const queryClient = useQueryClient();
  
  return (type: 'datasets' | 'aiInsights' | 'dataPoints', increment: number = 1) => {
    queryClient.setQueryData<SessionResponse>(['session'], (old) => {
      if (!old) return old;
      
      return {
        ...old,
        limits: {
          ...old.limits,
          [type]: {
            ...old.limits[type],
            used: old.limits[type].used + increment,
            remaining: old.limits[type].isUnlimited 
              ? -1 
              : Math.max(0, old.limits[type].remaining - increment),
            percentage: old.limits[type].isUnlimited 
              ? 0 
              : Math.min(100, ((old.limits[type].used + increment) / old.limits[type].limit) * 100),
          },
        },
      };
    });
  };
}