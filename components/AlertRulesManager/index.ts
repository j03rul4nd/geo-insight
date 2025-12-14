// ============================================
// MAIN COMPONENT
// ============================================

export { AlertRulesManager } from './AlertRulesManager';
export type { AlertRulesManagerProps } from './AlertRulesManager';

// ============================================
// COMPONENTS (if you need them separately)
// ============================================

export { AlertRulesHeader } from './components/AlertRulesHeader';
export type { AlertRulesHeaderProps } from './components/AlertRulesHeader';

export { AlertRulesStats } from './components/AlertRulesStats';
export type { AlertRulesStatsProps } from './components/AlertRulesStats';

export { AlertRulesFilters } from './components/AlertRulesFilters';
export type { AlertRulesFiltersProps } from './components/AlertRulesFilters';

export { AlertRulesList } from './components/AlertRulesList';
export type { AlertRulesListProps } from './components/AlertRulesList';

export { AlertRuleCard } from './components/AlertRuleCard';
export type { AlertRuleCardProps } from './components/AlertRuleCard';

export { AlertRuleFormDialog } from './components/AlertRuleFormDialog';
export type { AlertRuleFormDialogProps } from './components/AlertRuleFormDialog';

export { AlertRuleDeleteDialog } from './components/AlertRuleDeleteDialog';
export type { AlertRuleDeleteDialogProps } from './components/AlertRuleDeleteDialog';

export { EmptyState } from './components/EmptyState';
export type { EmptyStateProps } from './components/EmptyState';

// ============================================
// HOOKS
// ============================================

export { useAlertRulesState } from './core/useAlertRulesState';
export type {
  UseAlertRulesStateReturn,
  ViewMode,
  DialogMode,
  DialogState,
  FilterState,
  SortState,
  UIState,
} from './core/useAlertRulesState';