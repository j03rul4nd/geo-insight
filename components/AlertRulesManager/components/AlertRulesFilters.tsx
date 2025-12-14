import React from 'react';
import { Search, Filter, X, LayoutGrid, List, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FilterState, SortState, ViewMode } from '../core/useAlertRulesState';
import { AlertSeverity, SEVERITY_OPTIONS } from '@/types/alert-rules';

// ============================================
// TYPES
// ============================================

export interface AlertRulesFiltersProps {
  isOpen: boolean;
  onToggle: () => void;
  filterState: FilterState;
  sortState: SortState;
  onSearchChange: (search: string) => void;
  onSeverityToggle: (severity: AlertSeverity) => void;
  onEnabledChange: (enabled: boolean | null) => void;
  onMetricPathChange: (metricPath: string | null) => void;
  onSortChange: (field: SortState['field'], direction?: SortState['direction']) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  availableMetricPaths: string[];
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

// ============================================
// COMPONENT
// ============================================

export function AlertRulesFilters({
  isOpen,
  onToggle,
  filterState,
  sortState,
  onSearchChange,
  onSeverityToggle,
  onEnabledChange,
  onMetricPathChange,
  onSortChange,
  onClearFilters,
  hasActiveFilters,
  availableMetricPaths,
  viewMode,
  onViewModeChange,
}: AlertRulesFiltersProps) {
  const activeFilterCount = 
    filterState.severity.length + 
    (filterState.enabled !== null ? 1 : 0) + 
    (filterState.metricPath !== null ? 1 : 0);

  return (
    <div className="space-y-3">
      {/* Search - Full Width */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={filterState.search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Controls Row - Stacked for narrow width */}
      <div className="space-y-2">
        {/* Filter & Clear Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant={isOpen ? 'default' : 'outline'}
            size="sm"
            onClick={onToggle}
            className="flex-1 h-9"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 min-w-[20px] px-1.5">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearFilters}
              className="h-9 px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* View Mode & Sort - Full Width */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 border rounded-md p-1">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="h-7 w-8 p-0"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="h-7 w-8 p-0"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Select
            value={`${sortState.field}-${sortState.direction}`}
            onValueChange={(value) => {
              const [field, direction] = value.split('-') as [SortState['field'], SortState['direction']];
              onSortChange(field, direction);
            }}
          >
            <SelectTrigger className="flex-1 h-9">
              <ArrowUpDown className="h-4 w-4 mr-2 flex-shrink-0" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="createdAt-desc">Newest</SelectItem>
              <SelectItem value="createdAt-asc">Oldest</SelectItem>
              <SelectItem value="severity-desc">Severity ↓</SelectItem>
              <SelectItem value="severity-asc">Severity ↑</SelectItem>
              <SelectItem value="triggerCount-desc">Most Triggered</SelectItem>
              <SelectItem value="lastTriggered-desc">Recent Trigger</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Expanded Filters Panel */}
      {isOpen && (
        <div className="border rounded-lg p-3 bg-muted/30 space-y-4">
          {/* Severity Filter */}
          <div>
            <label className="text-xs font-medium mb-2 block">Severity</label>
            <div className="grid grid-cols-2 gap-2">
              {SEVERITY_OPTIONS.map((option) => (
                <Badge
                  key={option.value}
                  variant={
                    filterState.severity.includes(option.value)
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer justify-center h-8 text-xs"
                  onClick={() => onSeverityToggle(option.value)}
                >
                  <span className="mr-1">{option.icon}</span>
                  {option.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-xs font-medium mb-2 block">Status</label>
            <Select
              value={
                filterState.enabled === null
                  ? 'all'
                  : filterState.enabled
                  ? 'enabled'
                  : 'disabled'
              }
              onValueChange={(value) => {
                if (value === 'all') onEnabledChange(null);
                else if (value === 'enabled') onEnabledChange(true);
                else onEnabledChange(false);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rules</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Metric Path Filter */}
          <div>
            <label className="text-xs font-medium mb-2 block">Metric Path</label>
            <Select
              value={filterState.metricPath || 'all'}
              onValueChange={(value) => {
                onMetricPathChange(value === 'all' ? null : value);
              }}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All Metrics" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Metrics</SelectItem>
                {availableMetricPaths.map((path) => (
                  <SelectItem key={path} value={path}>
                    {path}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}