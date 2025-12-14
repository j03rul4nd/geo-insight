import React from 'react';
import { AlertRule } from '@/types/alert-rules';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';

// ============================================
// TYPES
// ============================================

export interface AlertRuleDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<boolean>; // ✅ Cambiado de Promise<void> a Promise<boolean>
  rule: AlertRule | null;
  isDeleting: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function AlertRuleDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  rule,
  isDeleting,
}: AlertRuleDeleteDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  if (!rule) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-destructive/10 p-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Delete Alert Rule</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2">
            <p>
              Are you sure you want to delete <strong>"{rule.name}"</strong>?
            </p>
            <p>This action cannot be undone. The alert rule and all its history will be permanently removed.</p>
            {rule.enabled && (
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm text-amber-800 dark:text-amber-200 font-medium">
                  ⚠️ This rule is currently enabled and actively monitoring your metrics.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}