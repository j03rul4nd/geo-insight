// ============================================
// ENUMS & CONSTANTS
// ============================================

export const ALERT_CONDITIONS = {
  GREATER_THAN: 'greater_than',
  LESS_THAN: 'less_than',
  EQUALS: 'equals',
  NOT_EQUALS: 'not_equals',
  BETWEEN: 'between',
} as const;

export const ALERT_SEVERITIES = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
} as const;

export const DEFAULT_COOLDOWN_MINUTES = 15;
export const MIN_COOLDOWN_MINUTES = 1;
export const MAX_COOLDOWN_MINUTES = 1440; // 24 hours

// ============================================
// BASE TYPES
// ============================================

export type AlertCondition = 
  | 'greater_than' 
  | 'less_than' 
  | 'equals' 
  | 'not_equals' 
  | 'between';

export type AlertSeverity = 'info' | 'warning' | 'critical';

// ============================================
// ALERT RULE
// ============================================

export interface AlertRule {
  id: string;
  datasetId: string;
  
  // Configuration
  name: string;
  description?: string | null;
  metricPath: string;
  condition: AlertCondition;
  thresholdValue: number;
  thresholdMax?: number | null;
  severity: AlertSeverity;
  
  // Control
  enabled: boolean;
  cooldownMinutes: number;
  
  // Notifications
  notifyEmail: boolean;
  notifySlack: boolean;
  
  // Metadata
  lastTriggered?: Date | null;
  triggerCount: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  _count?: {
    alerts: number;
  };
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateAlertRuleInput {
  name: string;
  description?: string;
  metricPath: string;
  condition: AlertCondition;
  thresholdValue: number;
  thresholdMax?: number;
  severity: AlertSeverity;
  enabled?: boolean;
  cooldownMinutes?: number;
  notifyEmail?: boolean;
  notifySlack?: boolean;
}

export interface UpdateAlertRuleInput {
  name?: string;
  description?: string;
  metricPath?: string;
  condition?: AlertCondition;
  thresholdValue?: number;
  thresholdMax?: number;
  severity?: AlertSeverity;
  enabled?: boolean;
  cooldownMinutes?: number;
  notifyEmail?: boolean;
  notifySlack?: boolean;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface AlertRulesResponse {
  success: boolean;
  data: AlertRule[];
}

export interface AlertRuleResponse {
  success: boolean;
  data: AlertRule;
}

export interface DeleteAlertRuleResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  error: string;
  details?: unknown;
}

// ============================================
// FILTER & QUERY TYPES
// ============================================

export interface AlertRuleFilters {
  severity?: AlertSeverity | AlertSeverity[];
  enabled?: boolean;
  search?: string;
  metricPath?: string;
}

export interface AlertRuleSortOptions {
  field: 'name' | 'severity' | 'createdAt' | 'triggerCount' | 'lastTriggered';
  direction: 'asc' | 'desc';
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface AlertRuleStats {
  total: number;
  enabled: number;
  disabled: number;
  bySeverity: {
    info: number;
    warning: number;
    critical: number;
  };
  totalTriggered: number;
  recentlyTriggered: number; // Last 24h
}

// ============================================
// UI HELPER TYPES
// ============================================

export interface AlertConditionOption {
  value: AlertCondition;
  label: string;
  description: string;
  requiresMax: boolean;
  icon?: string;
}

export interface AlertSeverityOption {
  value: AlertSeverity;
  label: string;
  description: string;
  color: string;
  icon?: string;
}

// ============================================
// VALIDATION TYPES
// ============================================

export interface AlertRuleValidation {
  isValid: boolean;
  errors: {
    name?: string;
    metricPath?: string;
    thresholdValue?: string;
    thresholdMax?: string;
    cooldownMinutes?: string;
  };
}

// ============================================
// HOOK RETURN TYPES
// ============================================

export interface UseAlertRulesReturn {
  // Data
  alertRules: AlertRule[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  
  // Stats
  stats: AlertRuleStats;
  enabledRulesCount: number;
  totalAlertsTriggered: number;
  
  // Actions
  createAlertRule: (input: CreateAlertRuleInput) => Promise<AlertRule>;
  updateAlertRule: (ruleId: string, updates: UpdateAlertRuleInput) => Promise<AlertRule>;
  deleteAlertRule: (ruleId: string) => Promise<string>;
  toggleAlertRule: (ruleId: string, enabled: boolean) => Promise<AlertRule>;
  refetch: () => void;
  
  // Helpers
  getRulesBySeverity: (severity: AlertSeverity) => AlertRule[];
  getRulesByEnabled: (enabled: boolean) => AlertRule[];
  findRule: (ruleId: string) => AlertRule | undefined;
  filterRules: (filters: AlertRuleFilters) => AlertRule[];
  sortRules: (options: AlertRuleSortOptions) => AlertRule[];
  
  // Loading states
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
}

export interface UseAlertRuleReturn extends Omit<UseAlertRulesReturn, 'alertRules'> {
  alertRule: AlertRule | undefined;
}

// ============================================
// PRESET CONFIGURATIONS
// ============================================

export interface AlertRulePreset {
  id: string;
  name: string;
  description: string;
  category: 'temperature' | 'speed' | 'occupancy' | 'custom';
  template: Omit<CreateAlertRuleInput, 'name'>;
}

// ============================================
// CONDITION HELPERS
// ============================================

export const CONDITION_OPTIONS: AlertConditionOption[] = [
  {
    value: 'greater_than',
    label: 'Greater Than',
    description: 'Trigger when value exceeds threshold',
    requiresMax: false,
    icon: '>', 
  },
  {
    value: 'less_than',
    label: 'Less Than',
    description: 'Trigger when value is below threshold',
    requiresMax: false,
    icon: '<',
  },
  {
    value: 'equals',
    label: 'Equals',
    description: 'Trigger when value equals threshold',
    requiresMax: false,
    icon: '=',
  },
  {
    value: 'not_equals',
    label: 'Not Equals',
    description: 'Trigger when value differs from threshold',
    requiresMax: false,
    icon: '≠',
  },
  {
    value: 'between',
    label: 'Between',
    description: 'Trigger when value is within range',
    requiresMax: true,
    icon: '⟷',
  },
];

export const SEVERITY_OPTIONS: AlertSeverityOption[] = [
  {
    value: 'info',
    label: 'Info',
    description: 'Informational alerts',
    color: '#3b82f6', // blue-500
    icon: 'ℹ️',
  },
  {
    value: 'warning',
    label: 'Warning',
    description: 'Warning alerts requiring attention',
    color: '#f59e0b', // amber-500
    icon: '⚠️',
  },
  {
    value: 'critical',
    label: 'Critical',
    description: 'Critical alerts requiring immediate action',
    color: '#ef4444', // red-500
    icon: '🚨',
  },
];

// ============================================
// UTILITY TYPES
// ============================================

export type AlertRuleField = keyof AlertRule;
export type AlertRuleKeys = AlertRuleField[];

export interface AlertRuleFormData extends Omit<CreateAlertRuleInput, 'condition' | 'severity'> {
  condition: AlertCondition | '';
  severity: AlertSeverity | '';
}

// ============================================
// MUTATION CONTEXT TYPES
// ============================================

export interface CreateAlertRuleMutationContext {
  previousRules?: AlertRule[];
}

export interface UpdateAlertRuleMutationContext {
  previousRules?: AlertRule[];
  previousRule?: AlertRule;
}

export interface DeleteAlertRuleMutationContext {
  previousRules?: AlertRule[];
  deletedRule?: AlertRule;
}

// ============================================
// EXPORT ALL
// ============================================

export type {
  // Re-export commonly used types at top level
  AlertRule as default,
};