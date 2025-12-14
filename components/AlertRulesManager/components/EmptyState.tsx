import React from 'react';
import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ============================================
// TYPES
// ============================================

export interface EmptyStateProps {
  onCreateClick: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-3 text-center">
      {/* Icon */}
      <div className="rounded-full bg-primary/10 p-4 mb-3">
        <Bell className="h-8 w-8 text-primary" />
      </div>

      {/* Content */}
      <h3 className="text-sm font-semibold mb-1.5">No alert rules yet</h3>
      <p className="text-xs text-muted-foreground mb-4">
        Create your first alert rule to monitor metrics and receive notifications.
      </p>

      {/* Action */}
      <Button onClick={onCreateClick} size="sm" className="w-full">
        <Plus className="h-3.5 w-3.5 mr-1.5" />
        <span className="text-xs">Create Alert Rule</span>
      </Button>

      {/* Help Text */}
      <div className="mt-6 w-full">
        <p className="text-xs text-muted-foreground mb-2">
          Alert rules help you:
        </p>
        <div className="space-y-2">
          <div className="flex flex-col items-start p-2.5 rounded-lg bg-muted/50 text-left">
            <div className="text-xs font-medium mb-0.5">Monitor Metrics</div>
            <div className="text-muted-foreground text-xs leading-tight">
              Track temperature, speed, occupancy and more
            </div>
          </div>
          <div className="flex flex-col items-start p-2.5 rounded-lg bg-muted/50 text-left">
            <div className="text-xs font-medium mb-0.5">Get Notified</div>
            <div className="text-muted-foreground text-xs leading-tight">
              Receive alerts via email or Slack
            </div>
          </div>
          <div className="flex flex-col items-start p-2.5 rounded-lg bg-muted/50 text-left">
            <div className="text-xs font-medium mb-0.5">Take Action</div>
            <div className="text-muted-foreground text-xs leading-tight">
              Respond quickly to critical conditions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}