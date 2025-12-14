import React, { useState } from 'react';
import { AlertRule, SEVERITY_OPTIONS, CONDITION_OPTIONS } from '@/types/alert-rules';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Mail,
  MessageSquare,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ============================================
// TYPES
// ============================================

export interface AlertRuleCardProps {
  rule: AlertRule;
  isSelected: boolean;
  onToggleSelection: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleEnabled: (ruleId: string, enabled: boolean) => Promise<boolean>;
  onDuplicate: (rule: AlertRule) => Promise<boolean>;
  variant?: 'grid' | 'list';
}

// ============================================
// COMPONENT
// ============================================

export function AlertRuleCard({
  rule,
  isSelected,
  onToggleSelection,
  onEdit,
  onDelete,
  onToggleEnabled,
  onDuplicate,
  variant = 'grid',
}: AlertRuleCardProps) {
  const [isTogglingEnabled, setIsTogglingEnabled] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);

  const severityOption = SEVERITY_OPTIONS.find((s) => s.value === rule.severity);
  const conditionOption = CONDITION_OPTIONS.find((c) => c.value === rule.condition);

  const handleToggleEnabled = async () => {
    setIsTogglingEnabled(true);
    await onToggleEnabled(rule.id, !rule.enabled);
    setIsTogglingEnabled(false);
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    await onDuplicate(rule);
    setIsDuplicating(false);
  };

  // Format threshold display
  const getThresholdDisplay = () => {
    if (rule.condition === 'between') {
      return `${rule.thresholdValue} - ${rule.thresholdMax}`;
    }
    return rule.thresholdValue;
  };

  if (variant === 'list') {
    return (
      <Card className={`${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-3">
          <div className="space-y-3">
            {/* Primera fila: Checkbox, Nombre y Menu */}
            <div className="flex items-start gap-2">
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={onToggleSelection}
                className="mt-0.5" 
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">{rule.name}</h3>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {rule.metricPath}
                    </p>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={onEdit}>
                        <Edit className="h-3.5 w-3.5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                        <Copy className="h-3.5 w-3.5 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={onDelete}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>

            {/* Segunda fila: Severity y Condición */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                style={{ backgroundColor: severityOption?.color }}
                className="text-white text-xs"
              >
                {severityOption?.icon} {severityOption?.label}
              </Badge>
              
              <div className="text-xs">
                <span className="font-medium">{conditionOption?.label}</span>
                <span className="text-muted-foreground ml-1">{getThresholdDisplay()}</span>
              </div>
            </div>

            {/* Tercera fila: Stats, Notifications y Switch */}
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>{rule.triggerCount}</span>
                </div>
                {rule.lastTriggered && (
                  <div className="flex items-center gap-1 truncate">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span className="truncate">
                      {formatDistanceToNow(new Date(rule.lastTriggered), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {rule.notifyEmail && <Mail className="h-3.5 w-3.5 text-muted-foreground" />}
                {rule.notifySlack && <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />}
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={handleToggleEnabled}
                  disabled={isTogglingEnabled}
                  className="scale-75"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid variant - Compacto para sidebars
  return (
    <Card className={`${isSelected ? 'ring-2 ring-primary' : ''} relative group`}>
      <CardContent className="p-4">
        {/* Checkbox - Top Left */}
        <div className="absolute top-2 left-2">
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelection} />
        </div>

        {/* Actions Menu - Top Right */}
        <div className="absolute top-2 right-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-3.5 w-3.5 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicate} disabled={isDuplicating}>
                <Copy className="h-3.5 w-3.5 mr-2" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onDelete}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="space-y-3 mt-5">
          {/* Header */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <h3 className="font-semibold text-sm line-clamp-2 leading-tight">{rule.name}</h3>
              <Badge
                style={{ backgroundColor: severityOption?.color }}
                className="text-white shrink-0 text-xs px-1.5 py-0"
              >
                {severityOption?.icon}
              </Badge>
            </div>
            {rule.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                {rule.description}
              </p>
            )}
          </div>

          {/* Metric Path */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Metric:</span>
            <code className="bg-muted px-1.5 py-0.5 rounded text-xs block truncate">
              {rule.metricPath}
            </code>
          </div>

          {/* Condition */}
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground">Condition:</span>
            <div className="text-xs font-medium">
              {conditionOption?.label} {getThresholdDisplay()}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              <span>{rule.triggerCount}</span>
            </div>
            {rule.lastTriggered && (
              <div className="flex items-center gap-1 min-w-0">
                <Clock className="h-3 w-3 shrink-0" />
                <span className="truncate text-xs">
                  {formatDistanceToNow(new Date(rule.lastTriggered), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>

          {/* Footer - Notifications and Enable */}
          <div className="flex items-center justify-between border-t pt-2">
            <div className="flex items-center gap-1.5">
              {rule.notifyEmail && (
                <div title="Email notifications">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
              {rule.notifySlack && (
                <div title="Slack notifications">
                  <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">
                {rule.enabled ? 'On' : 'Off'}
              </span>
              <Switch
                checked={rule.enabled}
                onCheckedChange={handleToggleEnabled}
                disabled={isTogglingEnabled}
                className="scale-75"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}