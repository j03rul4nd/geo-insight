import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  AlertRule,
  CreateAlertRuleInput,
  UpdateAlertRuleInput,
  AlertSeverity,
  AlertRulesResponse,
  AlertRuleResponse,
  AlertRuleFilters,
  AlertRuleSortOptions,
  AlertRuleStats,
} from '@/types/alert-rules';

// ============================================
// HOOK
// ============================================

export function useAlertRules(datasetId: string) {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ============================================
  // QUERY - Fetch alert rules
  // ============================================

  const {
    data: alertRules,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<AlertRule[]>({
    queryKey: ['alert-rules', datasetId],
    queryFn: async () => {
      const response = await fetch(`/api/datasets/${datasetId}/alert-rules`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch alert rules');
      }
      
      const data: AlertRulesResponse = await response.json();
      return data.data;
    },
    enabled: !!datasetId,
    staleTime: 30000, // 30 seconds
  });

  // ============================================
  // MUTATION - Create alert rule
  // ============================================

  const createAlertRuleMutation = useMutation({
    mutationFn: async (input: CreateAlertRuleInput) => {
      const response = await fetch(`/api/datasets/${datasetId}/alert-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create alert rule');
      }

      const data: AlertRuleResponse = await response.json();
      return data.data;
    },
    onMutate: () => {
      setIsCreating(true);
    },
    onSuccess: (data) => {
      // Invalidar y refetch
      queryClient.invalidateQueries({ queryKey: ['alert-rules', datasetId] });
      
      toast.success('Alert rule created successfully', {
        description: `"${data.name}" is now active`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to create alert rule', {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsCreating(false);
    },
  });

  // ============================================
  // MUTATION - Update alert rule
  // ============================================

  const updateAlertRuleMutation = useMutation({
    mutationFn: async ({ 
      ruleId, 
      updates 
    }: { 
      ruleId: string; 
      updates: UpdateAlertRuleInput 
    }) => {
      const response = await fetch(
        `/api/datasets/${datasetId}/alert-rules/${ruleId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update alert rule');
      }

      const data: AlertRuleResponse = await response.json();
      return data.data;
    },
    onMutate: () => {
      setIsUpdating(true);
    },
    onSuccess: (data) => {
      // Optimistic update
      queryClient.setQueryData<AlertRule[]>(
        ['alert-rules', datasetId],
        (old) => {
          if (!old) return [];
          return old.map((rule) => 
            rule.id === data.id ? data : rule
          );
        }
      );

      toast.success('Alert rule updated', {
        description: `"${data.name}" has been updated`,
      });
    },
    onError: (error: Error) => {
      toast.error('Failed to update alert rule', {
        description: error.message,
      });
      // Refetch on error to restore correct state
      queryClient.invalidateQueries({ queryKey: ['alert-rules', datasetId] });
    },
    onSettled: () => {
      setIsUpdating(false);
    },
  });

  // ============================================
  // MUTATION - Delete alert rule
  // ============================================

  const deleteAlertRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      const response = await fetch(
        `/api/datasets/${datasetId}/alert-rules/${ruleId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete alert rule');
      }

      return ruleId;
    },
    onMutate: async (ruleId) => {
      setIsDeleting(true);

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['alert-rules', datasetId] });

      // Snapshot previous value
      const previousRules = queryClient.getQueryData<AlertRule[]>([
        'alert-rules',
        datasetId,
      ]);

      // Optimistically remove the rule
      queryClient.setQueryData<AlertRule[]>(
        ['alert-rules', datasetId],
        (old) => {
          if (!old) return [];
          return old.filter((rule) => rule.id !== ruleId);
        }
      );

      return { previousRules };
    },
    onSuccess: () => {
      toast.success('Alert rule deleted', {
        description: 'The alert rule has been removed',
      });
    },
    onError: (error: Error, _, context) => {
      // Rollback on error
      if (context?.previousRules) {
        queryClient.setQueryData(
          ['alert-rules', datasetId],
          context.previousRules
        );
      }

      toast.error('Failed to delete alert rule', {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsDeleting(false);
      queryClient.invalidateQueries({ queryKey: ['alert-rules', datasetId] });
    },
  });

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  const createAlertRule = useCallback(
    (input: CreateAlertRuleInput) => {
      return createAlertRuleMutation.mutateAsync(input);
    },
    [createAlertRuleMutation]
  );

  const updateAlertRule = useCallback(
    (ruleId: string, updates: UpdateAlertRuleInput) => {
      return updateAlertRuleMutation.mutateAsync({ ruleId, updates });
    },
    [updateAlertRuleMutation]
  );

  const deleteAlertRule = useCallback(
    (ruleId: string) => {
      return deleteAlertRuleMutation.mutateAsync(ruleId);
    },
    [deleteAlertRuleMutation]
  );

  const toggleAlertRule = useCallback(
    async (ruleId: string, enabled: boolean) => {
      return updateAlertRule(ruleId, { enabled });
    },
    [updateAlertRule]
  );

  // Get rules by severity
  const getRulesBySeverity = useCallback(
    (severity: AlertSeverity) => {
      return alertRules?.filter((rule) => rule.severity === severity) || [];
    },
    [alertRules]
  );

  // Get rules by enabled status
  const getRulesByEnabled = useCallback(
    (enabled: boolean) => {
      return alertRules?.filter((rule) => rule.enabled === enabled) || [];
    },
    [alertRules]
  );

  // Find specific rule
  const findRule = useCallback(
    (ruleId: string) => {
      return alertRules?.find((rule) => rule.id === ruleId);
    },
    [alertRules]
  );

  // Filter rules
  const filterRules = useCallback(
    (filters: AlertRuleFilters) => {
      let filtered = alertRules || [];

      if (filters.severity) {
        const severities = Array.isArray(filters.severity) 
          ? filters.severity 
          : [filters.severity];
        filtered = filtered.filter((rule) => 
          severities.includes(rule.severity)
        );
      }

      if (filters.enabled !== undefined) {
        filtered = filtered.filter((rule) => rule.enabled === filters.enabled);
      }

      if (filters.search) {
        const search = filters.search.toLowerCase();
        filtered = filtered.filter(
          (rule) =>
            rule.name.toLowerCase().includes(search) ||
            rule.description?.toLowerCase().includes(search) ||
            rule.metricPath.toLowerCase().includes(search)
        );
      }

      if (filters.metricPath) {
        filtered = filtered.filter((rule) => 
          rule.metricPath === filters.metricPath
        );
      }

      return filtered;
    },
    [alertRules]
  );

  // Sort rules
  const sortRules = useCallback(
    (options: AlertRuleSortOptions) => {
      const sorted = [...(alertRules || [])];
      
      sorted.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (options.field) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'severity':
            const severityOrder = { info: 0, warning: 1, critical: 2 };
            aValue = severityOrder[a.severity];
            bValue = severityOrder[b.severity];
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'triggerCount':
            aValue = a.triggerCount;
            bValue = b.triggerCount;
            break;
          case 'lastTriggered':
            aValue = a.lastTriggered ? new Date(a.lastTriggered).getTime() : 0;
            bValue = b.lastTriggered ? new Date(b.lastTriggered).getTime() : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return options.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return options.direction === 'asc' ? 1 : -1;
        return 0;
      });

      return sorted;
    },
    [alertRules]
  );

  // ============================================
  // COMPUTED VALUES
  // ============================================

  // Get enabled rules count
  const enabledRulesCount = alertRules?.filter((rule) => rule.enabled).length || 0;

  // Get total alerts triggered
  const totalAlertsTriggered = alertRules?.reduce(
    (sum, rule) => sum + rule.triggerCount,
    0
  ) || 0;

  // Calculate complete stats
  const stats: AlertRuleStats = {
    total: alertRules?.length || 0,
    enabled: alertRules?.filter((rule) => rule.enabled).length || 0,
    disabled: alertRules?.filter((rule) => !rule.enabled).length || 0,
    bySeverity: {
      info: alertRules?.filter((rule) => rule.severity === 'info').length || 0,
      warning: alertRules?.filter((rule) => rule.severity === 'warning').length || 0,
      critical: alertRules?.filter((rule) => rule.severity === 'critical').length || 0,
    },
    totalTriggered: totalAlertsTriggered,
    recentlyTriggered: alertRules?.filter((rule) => {
      if (!rule.lastTriggered) return false;
      const lastTriggered = new Date(rule.lastTriggered);
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      return lastTriggered > oneDayAgo;
    }).length || 0,
  };

  return {
    // Data
    alertRules: alertRules || [],
    isLoading,
    isError,
    error: error as Error | null,

    // Stats
    stats,
    enabledRulesCount,
    totalAlertsTriggered,

    // Actions
    createAlertRule,
    updateAlertRule,
    deleteAlertRule,
    toggleAlertRule,
    refetch,

    // Helpers
    getRulesBySeverity,
    getRulesByEnabled,
    findRule,
    filterRules,
    sortRules,

    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
  };
}

// ============================================
// HELPER HOOK - Single alert rule
// ============================================

export function useAlertRule(datasetId: string, ruleId: string) {
  const { alertRules, ...rest } = useAlertRules(datasetId);

  const alertRule = alertRules.find((rule) => rule.id === ruleId);

  return {
    alertRule,
    ...rest,
  };
}