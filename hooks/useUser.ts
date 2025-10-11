// hooks/useUser.ts
import { useState, useEffect, useCallback } from 'react';

export interface UserLimits {
  monthlyDatasetsLimit: number;
  currentDatasetsUsage: number;
  monthlyAIInsightsLimit: number;
  currentAIInsightsUsage: number;
  dailyDataPointsLimit: number;
  currentDataPointsUsage: number;
  canCreateDataset: boolean;
  canRunAIAnalysis: boolean;
  isPro: boolean;
}

export interface UserData {
  id: string;
  email: string;
  name?: string;
  timezone: string;
  notificationsEmail: boolean;
  notificationsSlack: boolean;
  slackWebhookUrl?: string;
  limits: UserLimits;
  subscription?: {
    status: string;
    currentPeriodEnd: Date;
    planId: string;
  };
}

interface UseUser {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (data: UpdateProfilePayload) => Promise<void>;
}

interface UpdateProfilePayload {
  timezone?: string;
  notificationsEmail?: boolean;
  notificationsSlack?: boolean;
  slackWebhookUrl?: string;
}

export function useUser(): UseUser {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/auth/session', {
        headers: { 'Content-Type': 'application/json' }
      });

      if (!res.ok) {
        throw new Error('Failed to load user data');
      }

      const data = await res.json();
      
      setUser({
        ...data,
        subscription: data.subscription ? {
          ...data.subscription,
          currentPeriodEnd: new Date(data.subscription.currentPeriodEnd)
        } : undefined
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load user';
      setError(message);
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const updateProfile = async (payload: UpdateProfilePayload): Promise<void> => {
    try {
      setError(null);

      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      await fetchUser(); // Refetch to get updated data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    refetch: fetchUser,
    updateProfile
  };
}