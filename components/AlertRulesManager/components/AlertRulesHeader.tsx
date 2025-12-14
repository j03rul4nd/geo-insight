import React from 'react';
import { Plus, MoreVertical, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

// ============================================
// TYPES
// ============================================

export interface AlertRulesHeaderProps {
  onCreateClick: () => void;
  selectedCount: number;
  onBulkEnable: () => void;
  onBulkDisable: () => void;
  onBulkDelete: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function AlertRulesHeader({
  onCreateClick,
  selectedCount,
  onBulkEnable,
  onBulkDisable,
  onBulkDelete,
}: AlertRulesHeaderProps) {
  return (
    <div className="space-y-3">
      {/* Title Section */}
      <div>
        <h2 className="text-base font-bold tracking-tight leading-tight">Alert Rules</h2>
        <p className="text-xs text-muted-foreground mt-0.5 leading-tight">
          Monitor metrics
        </p>
      </div>

      {/* Actions Section */}
      <div className="flex flex-col gap-2">
        {/* Create Button - Full Width */}
        <Button onClick={onCreateClick} size="sm" className="w-full justify-center h-8">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          <span className="text-xs">Create Rule</span>
        </Button>

        {/* Bulk Actions (shown when rules are selected) */}
        {selectedCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground flex-shrink-0 min-w-0">
              {selectedCount}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1 h-8 min-w-0">
                  <MoreVertical className="h-3.5 w-3.5" />
                  <span className="ml-1.5 text-xs">Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={onBulkEnable} className="text-xs py-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 mr-2" />
                  Enable All
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onBulkDisable} className="text-xs py-1.5">
                  <XCircle className="h-3.5 w-3.5 mr-2" />
                  Disable All
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onBulkDelete}
                  className="text-destructive focus:text-destructive text-xs py-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete All
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}