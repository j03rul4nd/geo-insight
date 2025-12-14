import React from 'react';
import { AlertRule } from '@/types/alert-rules';
import { AlertRuleCard } from './AlertRuleCard';
import { Checkbox } from '@/components/ui/checkbox';
import { ViewMode } from '../core/useAlertRulesState';

// ============================================
// TYPES
// ============================================

export interface AlertRulesListProps {
  rules: AlertRule[];
  viewMode: ViewMode;
  selectedRules: string[];
  allVisibleSelected: boolean;
  someVisibleSelected: boolean;
  onToggleSelection: (ruleId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onEditClick: (rule: AlertRule) => void;
  onDeleteClick: (rule: AlertRule) => void;
  onToggleEnabled: (ruleId: string, enabled: boolean) => Promise<boolean>;
  onDuplicate: (rule: AlertRule) => Promise<boolean>;
}

// ============================================
// COMPONENT
// ============================================

export function AlertRulesList({
  rules,
  viewMode,
  selectedRules,
  allVisibleSelected,
  someVisibleSelected,
  onToggleSelection,
  onSelectAll,
  onClearSelection,
  onEditClick,
  onDeleteClick,
  onToggleEnabled,
  onDuplicate,
}: AlertRulesListProps) {
  const handleSelectAllChange = () => {
    if (allVisibleSelected) {
      onClearSelection();
    } else {
      onSelectAll();
    }
  };

  // Lógica para determinar el estado visual del checkbox
  // Si hay algunos seleccionados pero no todos, es 'indeterminate'
  // De lo contrario, usamos el booleano allVisibleSelected
  const isChecked = (someVisibleSelected && !allVisibleSelected) 
    ? 'indeterminate' 
    : allVisibleSelected;

  return (
    <div className="space-y-3">
      {/* Select All Header - Optimizado para espacios reducidos */}
      {rules.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <Checkbox
            checked={isChecked} 
            onCheckedChange={handleSelectAllChange}
          />
          <span className="text-xs text-muted-foreground leading-tight">
            {allVisibleSelected
              ? `${rules.length} selected`
              : someVisibleSelected
              ? `${selectedRules.length}/${rules.length}`
              : `Select all`}
          </span>
        </div>
      )}

      {/* Grid View - Una sola columna para sidebars estrechos */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 gap-3">
          {rules.map((rule) => (
            <AlertRuleCard
              key={rule.id}
              rule={rule}
              isSelected={selectedRules.includes(rule.id)}
              onToggleSelection={() => onToggleSelection(rule.id)}
              onEdit={() => onEditClick(rule)}
              onDelete={() => onDeleteClick(rule)}
              onToggleEnabled={onToggleEnabled}
              onDuplicate={onDuplicate}
            />
          ))}
        </div>
      )}

      {/* List View - Espaciado reducido */}
      {viewMode === 'list' && (
        <div className="space-y-2">
          {rules.map((rule) => (
            <AlertRuleCard
              key={rule.id}
              rule={rule}
              isSelected={selectedRules.includes(rule.id)}
              onToggleSelection={() => onToggleSelection(rule.id)}
              onEdit={() => onEditClick(rule)}
              onDelete={() => onDeleteClick(rule)}
              onToggleEnabled={onToggleEnabled}
              onDuplicate={onDuplicate}
              variant="list"
            />
          ))}
        </div>
      )}
    </div>
  );
}