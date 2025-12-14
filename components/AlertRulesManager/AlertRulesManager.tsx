import React from 'react';
import { useAlertRulesState } from './core/useAlertRulesState';
import { AlertRulesHeader } from './components/AlertRulesHeader';
import { AlertRulesStats } from './components/AlertRulesStats';
import { AlertRulesFilters } from './components/AlertRulesFilters';
import { AlertRulesList } from './components/AlertRulesList';
import { AlertRuleFormDialog } from './components/AlertRuleFormDialog';
import { AlertRuleDeleteDialog } from './components/AlertRuleDeleteDialog';
import { EmptyState } from './components/EmptyState';
import { Loader2 } from 'lucide-react';
import { CreateAlertRuleInput, UpdateAlertRuleInput } from '@/types/alert-rules';

// ============================================
// TYPES
// ============================================

export interface AlertRulesManagerProps {
  datasetId: string;
  className?: string;
}

// ============================================
// COMPONENT
// ============================================

export function AlertRulesManager({ datasetId, className }: AlertRulesManagerProps) {
  const state = useAlertRulesState(datasetId);

  // ============================================
  // LOADING STATE
  // ============================================

  if (state.isLoading) {
    return (
      <div className={`flex items-center justify-center py-8 px-3 ${className || ''}`}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground text-center">Loading alert rules...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================

  if (state.isError) {
    return (
      <div className={`flex items-center justify-center py-8 px-3 ${className || ''}`}>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="rounded-full bg-destructive/10 p-2">
            <svg
              className="h-5 w-5 text-destructive"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Failed to load</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {state.error?.message || 'An unexpected error occurred'}
            </p>
          </div>
          <button
            onClick={() => state.refetch()}
            className="mt-1 px-3 py-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // EMPTY STATE (no rules created yet)
  // ============================================

  if (state.allAlertRules.length === 0) {
    return (
      <div className={`${className || ''}`}>
        <AlertRulesHeader
          onCreateClick={state.openCreateDialog}
          selectedCount={0}
          onBulkEnable={() => {}}
          onBulkDisable={() => {}}
          onBulkDelete={() => {}}
        />
        <EmptyState onCreateClick={state.openCreateDialog} />
        <AlertRuleFormDialog
          mode="create"
          isOpen={state.dialogState.isOpen && state.dialogState.mode === 'create'}
          onClose={state.closeDialog}
          onSubmit={(input) => state.handleCreateRule(input as CreateAlertRuleInput)}
          rule={null}
          isSubmitting={state.isCreating}
        />
      </div>
    );
  }

  // ============================================
  // MAIN CONTENT
  // ============================================

  return (
    <div className={`space-y-3 ${className || ''}`}>
      {/* Header */}
      <AlertRulesHeader
        onCreateClick={state.openCreateDialog}
        selectedCount={state.selectedRules.length}
        onBulkEnable={state.handleBulkEnable}
        onBulkDisable={state.handleBulkDisable}
        onBulkDelete={state.handleBulkDelete}
      />

      {/* Stats */}
      <AlertRulesStats
        stats={state.stats}
        onSeverityClick={(severity) => {
          state.setSeverityFilter([severity]);
          if (!state.uiState.showFilters) {
            state.toggleFilters();
          }
        }}
      />

      {/* Filters */}
      <AlertRulesFilters
        isOpen={state.uiState.showFilters}
        onToggle={state.toggleFilters}
        filterState={state.filterState}
        sortState={state.sortState}
        onSearchChange={state.setSearch}
        onSeverityToggle={state.toggleSeverityFilter}
        onEnabledChange={state.setEnabledFilter}
        onMetricPathChange={state.setMetricPathFilter}
        onSortChange={state.setSort}
        onClearFilters={state.clearFilters}
        hasActiveFilters={state.hasActiveFilters}
        availableMetricPaths={state.availableMetricPaths}
        viewMode={state.uiState.viewMode}
        onViewModeChange={state.setViewMode}
      />

      {/* Rules List */}
      {state.alertRules.length === 0 ? (
        <div className="text-center py-8 px-3">
          <p className="text-xs text-muted-foreground">
            No alert rules match your filters.
          </p>
          <button
            onClick={state.clearFilters}
            className="mt-2 text-xs text-primary hover:text-primary/80"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <AlertRulesList
          rules={state.alertRules}
          viewMode={state.uiState.viewMode}
          selectedRules={state.selectedRules}
          allVisibleSelected={state.allVisibleSelected}
          someVisibleSelected={state.someVisibleSelected}
          onToggleSelection={state.toggleRuleSelection}
          onSelectAll={state.selectAllRules}
          onClearSelection={state.clearSelection}
          onEditClick={state.openEditDialog}
          onDeleteClick={state.openDeleteDialog}
          onToggleEnabled={state.handleToggleRule}
          onDuplicate={state.handleDuplicateRule}
        />
      )}

      {/* Dialogs */}
      <AlertRuleFormDialog
        mode={state.dialogState.mode === 'create' ? 'create' : 'edit'}
        isOpen={
          state.dialogState.isOpen &&
          (state.dialogState.mode === 'create' || state.dialogState.mode === 'edit')
        }
        onClose={state.closeDialog}
        onSubmit={
          state.dialogState.mode === 'create'
            ? (input) => state.handleCreateRule(input as CreateAlertRuleInput)
            : (input) => state.handleUpdateRule(state.dialogState.selectedRule!.id, input as UpdateAlertRuleInput)
        }
        rule={state.dialogState.selectedRule}
        isSubmitting={state.isCreating || state.isUpdating}
      />

      <AlertRuleDeleteDialog
        isOpen={state.dialogState.isOpen && state.dialogState.mode === 'delete'}
        onClose={state.closeDialog}
        onConfirm={() => state.handleDeleteRule(state.dialogState.selectedRule!.id)}
        rule={state.dialogState.selectedRule}
        isDeleting={state.isDeleting}
      />
    </div>
  );
}