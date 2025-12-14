import { useState, useCallback, useMemo } from 'react';
import { useAlertRules } from '@/hooks/useAlertRules';
import {
  AlertRule,
  CreateAlertRuleInput,
  UpdateAlertRuleInput,
  AlertSeverity,
  AlertCondition,
  AlertRuleFilters,
  AlertRuleSortOptions,
} from '@/types/alert-rules';

// ============================================
// TYPES
// ============================================

export type ViewMode = 'grid' | 'list';

export type DialogMode = 'create' | 'edit' | 'delete' | null;

export interface DialogState {
  mode: DialogMode;
  isOpen: boolean;
  selectedRule: AlertRule | null;
}

export interface FilterState {
  search: string;
  severity: AlertSeverity[];
  enabled: boolean | null;
  metricPath: string | null;
}

export interface SortState {
  field: AlertRuleSortOptions['field'];
  direction: AlertRuleSortOptions['direction'];
}

export interface UIState {
  viewMode: ViewMode;
  showFilters: boolean;
  selectedRules: string[];
}

// ============================================
// CONSTANTS
// ============================================

const INITIAL_FILTER_STATE: FilterState = {
  search: '',
  severity: [],
  enabled: null,
  metricPath: null,
};

const INITIAL_SORT_STATE: SortState = {
  field: 'createdAt',
  direction: 'desc',
};

const INITIAL_DIALOG_STATE: DialogState = {
  mode: null,
  isOpen: false,
  selectedRule: null,
};

const INITIAL_UI_STATE: UIState = {
  viewMode: 'grid',
  showFilters: false,
  selectedRules: [],
};

// ============================================
// HOOK
// ============================================

export function useAlertRulesState(datasetId: string) {
  // ============================================
  // DATA LAYER - React Query Hook
  // ============================================
  
  const alertRulesQuery = useAlertRules(datasetId);

  // ============================================
  // UI STATE
  // ============================================

  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER_STATE);
  const [sortState, setSortState] = useState<SortState>(INITIAL_SORT_STATE);
  const [dialogState, setDialogState] = useState<DialogState>(INITIAL_DIALOG_STATE);
  const [uiState, setUIState] = useState<UIState>(INITIAL_UI_STATE);

  // ============================================
  // FILTER ACTIONS
  // ============================================

  const setSearch = useCallback((search: string) => {
    setFilterState((prev) => ({ ...prev, search }));
  }, []);

  const toggleSeverityFilter = useCallback((severity: AlertSeverity) => {
    setFilterState((prev) => {
      const severities = prev.severity.includes(severity)
        ? prev.severity.filter((s) => s !== severity)
        : [...prev.severity, severity];
      return { ...prev, severity: severities };
    });
  }, []);

  const setSeverityFilter = useCallback((severity: AlertSeverity[]) => {
    setFilterState((prev) => ({ ...prev, severity }));
  }, []);

  const setEnabledFilter = useCallback((enabled: boolean | null) => {
    setFilterState((prev) => ({ ...prev, enabled }));
  }, []);

  const setMetricPathFilter = useCallback((metricPath: string | null) => {
    setFilterState((prev) => ({ ...prev, metricPath }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState(INITIAL_FILTER_STATE);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      filterState.search !== '' ||
      filterState.severity.length > 0 ||
      filterState.enabled !== null ||
      filterState.metricPath !== null
    );
  }, [filterState]);

  // ============================================
  // SORT ACTIONS
  // ============================================

  const setSort = useCallback((field: SortState['field'], direction?: SortState['direction']) => {
    setSortState((prev) => ({
      field,
      direction: direction || (prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'),
    }));
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSortState((prev) => ({
      ...prev,
      direction: prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  }, []);

  // ============================================
  // DIALOG ACTIONS
  // ============================================

  const openCreateDialog = useCallback(() => {
    setDialogState({
      mode: 'create',
      isOpen: true,
      selectedRule: null,
    });
  }, []);

  const openEditDialog = useCallback((rule: AlertRule) => {
    setDialogState({
      mode: 'edit',
      isOpen: true,
      selectedRule: rule,
    });
  }, []);

  const openDeleteDialog = useCallback((rule: AlertRule) => {
    setDialogState({
      mode: 'delete',
      isOpen: true,
      selectedRule: rule,
    });
  }, []);

  const closeDialog = useCallback(() => {
    setDialogState(INITIAL_DIALOG_STATE);
  }, []);

  // ============================================
  // UI ACTIONS
  // ============================================

  const setViewMode = useCallback((viewMode: ViewMode) => {
    setUIState((prev) => ({ ...prev, viewMode }));
  }, []);

  const toggleFilters = useCallback(() => {
    setUIState((prev) => ({ ...prev, showFilters: !prev.showFilters }));
  }, []);

  const toggleRuleSelection = useCallback((ruleId: string) => {
    setUIState((prev) => {
      const selectedRules = prev.selectedRules.includes(ruleId)
        ? prev.selectedRules.filter((id) => id !== ruleId)
        : [...prev.selectedRules, ruleId];
      return { ...prev, selectedRules };
    });
  }, []);

  const selectAllRules = useCallback(() => {
    setUIState((prev) => ({
      ...prev,
      selectedRules: alertRulesQuery.alertRules.map((rule) => rule.id),
    }));
  }, [alertRulesQuery.alertRules]);

  const clearSelection = useCallback(() => {
    setUIState((prev) => ({ ...prev, selectedRules: [] }));
  }, []);

  // ============================================
  // DATA ACTIONS (Wrapped from useAlertRules)
  // ============================================

  const handleCreateRule = useCallback(
    async (input: CreateAlertRuleInput) => {
      try {
        await alertRulesQuery.createAlertRule(input);
        closeDialog();
        return true;
      } catch (error) {
        console.error('Error creating alert rule:', error);
        return false;
      }
    },
    [alertRulesQuery, closeDialog]
  );

  const handleUpdateRule = useCallback(
    async (ruleId: string, updates: UpdateAlertRuleInput) => {
      try {
        await alertRulesQuery.updateAlertRule(ruleId, updates);
        closeDialog();
        return true;
      } catch (error) {
        console.error('Error updating alert rule:', error);
        return false;
      }
    },
    [alertRulesQuery, closeDialog]
  );

  const handleDeleteRule = useCallback(
    async (ruleId: string) => {
      try {
        await alertRulesQuery.deleteAlertRule(ruleId);
        closeDialog();
        return true;
      } catch (error) {
        console.error('Error deleting alert rule:', error);
        return false;
      }
    },
    [alertRulesQuery, closeDialog]
  );

  const handleToggleRule = useCallback(
    async (ruleId: string, enabled: boolean) => {
      try {
        await alertRulesQuery.toggleAlertRule(ruleId, enabled);
        return true;
      } catch (error) {
        console.error('Error toggling alert rule:', error);
        return false;
      }
    },
    [alertRulesQuery]
  );

  const handleDuplicateRule = useCallback(
    async (rule: AlertRule) => {
      const duplicateInput: CreateAlertRuleInput = {
        name: `${rule.name} (Copy)`,
        description: rule.description || undefined,
        metricPath: rule.metricPath,
        condition: rule.condition,
        thresholdValue: rule.thresholdValue,
        thresholdMax: rule.thresholdMax || undefined,
        severity: rule.severity,
        enabled: false, // Start disabled
        cooldownMinutes: rule.cooldownMinutes,
        notifyEmail: rule.notifyEmail,
        notifySlack: rule.notifySlack,
      };

      try {
        await alertRulesQuery.createAlertRule(duplicateInput);
        return true;
      } catch (error) {
        console.error('Error duplicating alert rule:', error);
        return false;
      }
    },
    [alertRulesQuery]
  );

  // ============================================
  // BULK ACTIONS
  // ============================================

  const handleBulkEnable = useCallback(async () => {
    const promises = uiState.selectedRules.map((ruleId) =>
      alertRulesQuery.updateAlertRule(ruleId, { enabled: true })
    );

    try {
      await Promise.all(promises);
      clearSelection();
      return true;
    } catch (error) {
      console.error('Error in bulk enable:', error);
      return false;
    }
  }, [uiState.selectedRules, alertRulesQuery, clearSelection]);

  const handleBulkDisable = useCallback(async () => {
    const promises = uiState.selectedRules.map((ruleId) =>
      alertRulesQuery.updateAlertRule(ruleId, { enabled: false })
    );

    try {
      await Promise.all(promises);
      clearSelection();
      return true;
    } catch (error) {
      console.error('Error in bulk disable:', error);
      return false;
    }
  }, [uiState.selectedRules, alertRulesQuery, clearSelection]);

  const handleBulkDelete = useCallback(async () => {
    const promises = uiState.selectedRules.map((ruleId) =>
      alertRulesQuery.deleteAlertRule(ruleId)
    );

    try {
      await Promise.all(promises);
      clearSelection();
      return true;
    } catch (error) {
      console.error('Error in bulk delete:', error);
      return false;
    }
  }, [uiState.selectedRules, alertRulesQuery, clearSelection]);

  // ============================================
  // COMPUTED DATA
  // ============================================

  // Apply filters and sorting
  const processedRules = useMemo(() => {
    let rules = [...alertRulesQuery.alertRules];

    // Apply filters
    if (hasActiveFilters) {
      const filters: AlertRuleFilters = {
        search: filterState.search || undefined,
        severity: filterState.severity.length > 0 ? filterState.severity : undefined,
        enabled: filterState.enabled !== null ? filterState.enabled : undefined,
        metricPath: filterState.metricPath || undefined,
      };
      rules = alertRulesQuery.filterRules(filters);
    }

    // Apply sorting
    rules = alertRulesQuery.sortRules({
      field: sortState.field,
      direction: sortState.direction,
    });

    return rules;
  }, [
    alertRulesQuery.alertRules,
    alertRulesQuery.filterRules,
    alertRulesQuery.sortRules,
    filterState,
    sortState,
    hasActiveFilters,
  ]);

  // Selected rules data
  const selectedRulesData = useMemo(() => {
    return alertRulesQuery.alertRules.filter((rule) =>
      uiState.selectedRules.includes(rule.id)
    );
  }, [alertRulesQuery.alertRules, uiState.selectedRules]);

  // Check if all visible rules are selected
  const allVisibleSelected = useMemo(() => {
    if (processedRules.length === 0) return false;
    return processedRules.every((rule) => uiState.selectedRules.includes(rule.id));
  }, [processedRules, uiState.selectedRules]);

  // Some visible rules are selected (for indeterminate state)
  const someVisibleSelected = useMemo(() => {
    if (processedRules.length === 0) return false;
    return (
      processedRules.some((rule) => uiState.selectedRules.includes(rule.id)) &&
      !allVisibleSelected
    );
  }, [processedRules, uiState.selectedRules, allVisibleSelected]);

  // ============================================
  // GROUPED DATA FOR STATS
  // ============================================

  const groupedBySeverity = useMemo(() => {
    return {
      info: alertRulesQuery.getRulesBySeverity('info'),
      warning: alertRulesQuery.getRulesBySeverity('warning'),
      critical: alertRulesQuery.getRulesBySeverity('critical'),
    };
  }, [alertRulesQuery.alertRules]);

  const groupedByEnabled = useMemo(() => {
    return {
      enabled: alertRulesQuery.getRulesByEnabled(true),
      disabled: alertRulesQuery.getRulesByEnabled(false),
    };
  }, [alertRulesQuery.alertRules]);

  // ============================================
  // AVAILABLE METRIC PATHS (for filter dropdown)
  // ============================================

  const availableMetricPaths = useMemo(() => {
    const paths = new Set<string>();
    alertRulesQuery.alertRules.forEach((rule) => {
      paths.add(rule.metricPath);
    });
    return Array.from(paths).sort();
  }, [alertRulesQuery.alertRules]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data from useAlertRules
    alertRules: processedRules,
    allAlertRules: alertRulesQuery.alertRules,
    isLoading: alertRulesQuery.isLoading,
    isError: alertRulesQuery.isError,
    error: alertRulesQuery.error,
    stats: alertRulesQuery.stats,

    // Computed data
    groupedBySeverity,
    groupedByEnabled,
    availableMetricPaths,

    // Filter state
    filterState,
    hasActiveFilters,
    setSearch,
    toggleSeverityFilter,
    setSeverityFilter,
    setEnabledFilter,
    setMetricPathFilter,
    clearFilters,

    // Sort state
    sortState,
    setSort,
    toggleSortDirection,

    // Dialog state
    dialogState,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialog,

    // UI state
    uiState,
    setViewMode,
    toggleFilters,

    // Selection state
    selectedRules: uiState.selectedRules,
    selectedRulesData,
    allVisibleSelected,
    someVisibleSelected,
    toggleRuleSelection,
    selectAllRules,
    clearSelection,

    // CRUD actions
    handleCreateRule,
    handleUpdateRule,
    handleDeleteRule,
    handleToggleRule,
    handleDuplicateRule,

    // Bulk actions
    handleBulkEnable,
    handleBulkDisable,
    handleBulkDelete,

    // Loading states
    isCreating: alertRulesQuery.isCreating,
    isUpdating: alertRulesQuery.isUpdating,
    isDeleting: alertRulesQuery.isDeleting,

    // Utility
    refetch: alertRulesQuery.refetch,
    findRule: alertRulesQuery.findRule,
  };
}

// ============================================
// EXPORT TYPES
// ============================================

export type UseAlertRulesStateReturn = ReturnType<typeof useAlertRulesState>;