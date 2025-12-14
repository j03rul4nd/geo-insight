import React, { useState, useEffect } from 'react';
import { Loader2, Info, AlertCircle } from 'lucide-react';

// ============================================
// TYPES
// ============================================

type AlertCondition = 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'between';
type AlertSeverity = 'info' | 'warning' | 'critical';

interface AlertRule {
  id: string;
  name: string;
  description?: string | null;
  metricPath: string;
  condition: AlertCondition;
  thresholdValue: number;
  thresholdMax?: number | null;
  severity: AlertSeverity;
  enabled: boolean;
  cooldownMinutes: number;
  notifyEmail: boolean;
  notifySlack: boolean;
}

interface CreateAlertRuleInput {
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

interface UpdateAlertRuleInput {
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

export interface AlertRuleFormDialogProps {
  mode: 'create' | 'edit';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: CreateAlertRuleInput | UpdateAlertRuleInput) => Promise<boolean>;
  rule: AlertRule | null;
  isSubmitting: boolean;
}

interface FormData {
  name: string;
  description: string;
  metricPath: string;
  condition: AlertCondition | '';
  thresholdValue: string;
  thresholdMax: string;
  severity: AlertSeverity | '';
  enabled: boolean;
  cooldownMinutes: string;
  notifyEmail: boolean;
  notifySlack: boolean;
}

interface FormErrors {
  name?: string;
  metricPath?: string;
  condition?: string;
  thresholdValue?: string;
  thresholdMax?: string;
  severity?: string;
  cooldownMinutes?: string;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_COOLDOWN_MINUTES = 15;

const CONDITION_OPTIONS = [
  {
    value: 'greater_than' as const,
    label: 'Greater Than',
    description: 'Trigger when value exceeds threshold',
    requiresMax: false,
    icon: '>',
  },
  {
    value: 'less_than' as const,
    label: 'Less Than',
    description: 'Trigger when value is below threshold',
    requiresMax: false,
    icon: '<',
  },
  {
    value: 'equals' as const,
    label: 'Equals',
    description: 'Trigger when value equals threshold',
    requiresMax: false,
    icon: '=',
  },
  {
    value: 'not_equals' as const,
    label: 'Not Equals',
    description: 'Trigger when value differs from threshold',
    requiresMax: false,
    icon: '≠',
  },
  {
    value: 'between' as const,
    label: 'Between',
    description: 'Trigger when value is within range',
    requiresMax: true,
    icon: '⟷',
  },
];

const SEVERITY_OPTIONS = [
  {
    value: 'info' as const,
    label: 'Info',
    description: 'Informational alerts',
    color: '#3b82f6',
    icon: 'ℹ️',
  },
  {
    value: 'warning' as const,
    label: 'Warning',
    description: 'Warning alerts requiring attention',
    color: '#f59e0b',
    icon: '⚠️',
  },
  {
    value: 'critical' as const,
    label: 'Critical',
    description: 'Critical alerts requiring immediate action',
    color: '#ef4444',
    icon: '🚨',
  },
];

// ============================================
// COMPONENT
// ============================================

export function AlertRuleFormDialog({
  mode,
  isOpen,
  onClose,
  onSubmit,
  rule,
  isSubmitting,
}: AlertRuleFormDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    metricPath: '',
    condition: '',
    thresholdValue: '',
    thresholdMax: '',
    severity: '',
    enabled: true,
    cooldownMinutes: DEFAULT_COOLDOWN_MINUTES.toString(),
    notifyEmail: true,
    notifySlack: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Load rule data when editing
  useEffect(() => {
    if (mode === 'edit' && rule) {
      setFormData({
        name: rule.name,
        description: rule.description || '',
        metricPath: rule.metricPath,
        condition: rule.condition,
        thresholdValue: rule.thresholdValue.toString(),
        thresholdMax: rule.thresholdMax?.toString() || '',
        severity: rule.severity,
        enabled: rule.enabled,
        cooldownMinutes: rule.cooldownMinutes.toString(),
        notifyEmail: rule.notifyEmail,
        notifySlack: rule.notifySlack,
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        description: '',
        metricPath: '',
        condition: '',
        thresholdValue: '',
        thresholdMax: '',
        severity: '',
        enabled: true,
        cooldownMinutes: DEFAULT_COOLDOWN_MINUTES.toString(),
        notifyEmail: true,
        notifySlack: false,
      });
    }
    setErrors({});
  }, [mode, rule, isOpen]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be 100 characters or less';
    }

    if (!formData.metricPath.trim()) {
      newErrors.metricPath = 'Metric path is required';
    }

    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }

    if (!formData.thresholdValue) {
      newErrors.thresholdValue = 'Threshold value is required';
    } else if (isNaN(Number(formData.thresholdValue))) {
      newErrors.thresholdValue = 'Must be a valid number';
    }

    if (formData.condition === 'between') {
      if (!formData.thresholdMax) {
        newErrors.thresholdMax = 'Max threshold is required for "between" condition';
      } else if (isNaN(Number(formData.thresholdMax))) {
        newErrors.thresholdMax = 'Must be a valid number';
      } else if (Number(formData.thresholdMax) <= Number(formData.thresholdValue)) {
        newErrors.thresholdMax = 'Max threshold must be greater than threshold value';
      }
    }

    if (!formData.severity) {
      newErrors.severity = 'Severity is required';
    }

    const cooldown = Number(formData.cooldownMinutes);
    if (isNaN(cooldown) || cooldown < 1 || cooldown > 1440) {
      newErrors.cooldownMinutes = 'Cooldown must be between 1 and 1440 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!validate()) return;

    const input: CreateAlertRuleInput | UpdateAlertRuleInput = {
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      metricPath: formData.metricPath.trim(),
      condition: formData.condition as AlertCondition,
      thresholdValue: Number(formData.thresholdValue),
      thresholdMax:
        formData.condition === 'between' && formData.thresholdMax
          ? Number(formData.thresholdMax)
          : undefined,
      severity: formData.severity as AlertSeverity,
      enabled: formData.enabled,
      cooldownMinutes: Number(formData.cooldownMinutes),
      notifyEmail: formData.notifyEmail,
      notifySlack: formData.notifySlack,
    };

    const success = await onSubmit(input);
    if (success) {
      onClose();
    }
  };

  const selectedCondition = CONDITION_OPTIONS.find((c) => c.value === formData.condition);
  const requiresMaxThreshold = selectedCondition?.requiresMax || false;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4" onClick={onClose}>
      <div 
        className="bg-[#18181b] border-b border-[#27272a] rounded-lg shadow-xl w-full max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-[#18181b]  border-b border-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-4 z-10">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white">
            {mode === 'create' ? 'Create Alert Rule' : 'Edit Alert Rule'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            {mode === 'create'
              ? 'Configure a new alert rule to monitor your dataset metrics.'
              : 'Update the alert rule configuration.'}
          </p>
        </div>

        {/* Form */}
        <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-5 md:space-y-6">
          {/* Basic Info */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="name" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="High temperature alert"
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-gray-800 text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.name && (
                <p className="text-xs sm:text-sm text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <span className="break-words">{errors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="description" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Alert when temperature exceeds normal operating range"
                rows={2}
                className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
              />
            </div>

            <div>
              <label htmlFor="metricPath" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                Metric Path <span className="text-red-400">*</span>
              </label>
              <input
                id="metricPath"
                type="text"
                value={formData.metricPath}
                onChange={(e) => setFormData({ ...formData, metricPath: e.target.value })}
                placeholder="temperature.celsius"
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-gray-800 text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 ${
                  errors.metricPath ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.metricPath && (
                <p className="text-xs sm:text-sm text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <span className="break-words">{errors.metricPath}</span>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
                <span>The metric path to monitor (e.g., temperature.celsius)</span>
              </p>
            </div>
          </div>

          {/* Condition & Thresholds */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="condition" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                Condition <span className="text-red-400">*</span>
              </label>
              <select
                id="condition"
                value={formData.condition}
                onChange={(e) =>
                  setFormData({ ...formData, condition: e.target.value as AlertCondition | '' })
                }
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-gray-800 text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.condition ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select condition</option>
                {CONDITION_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
              {errors.condition && (
                <p className="text-xs sm:text-sm text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <span className="break-words">{errors.condition}</span>
                </p>
              )}
            </div>

            <div className={`grid gap-3 ${requiresMaxThreshold ? 'grid-cols-2' : 'grid-cols-1'}`}>
              <div>
                <label htmlFor="thresholdValue" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                  Threshold <span className="text-red-400">*</span>
                </label>
                <input
                  id="thresholdValue"
                  type="number"
                  step="any"
                  value={formData.thresholdValue}
                  onChange={(e) => setFormData({ ...formData, thresholdValue: e.target.value })}
                  placeholder="30"
                  className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-gray-800 text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 ${
                    errors.thresholdValue ? 'border-red-500' : 'border-gray-600'
                  }`}
                />
                {errors.thresholdValue && (
                  <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 flex-shrink-0" />
                    <span className="break-words">{errors.thresholdValue}</span>
                  </p>
                )}
              </div>

              {requiresMaxThreshold && (
                <div>
                  <label htmlFor="thresholdMax" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                    Max <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="thresholdMax"
                    type="number"
                    step="any"
                    value={formData.thresholdMax}
                    onChange={(e) => setFormData({ ...formData, thresholdMax: e.target.value })}
                    placeholder="40"
                    className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-gray-800 text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 ${
                      errors.thresholdMax ? 'border-red-500' : 'border-gray-600'
                    }`}
                  />
                  {errors.thresholdMax && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 flex-shrink-0" />
                      <span className="break-words">{errors.thresholdMax}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Severity & Settings */}
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label htmlFor="severity" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                Severity <span className="text-red-400">*</span>
              </label>
              <select
                id="severity"
                value={formData.severity}
                onChange={(e) =>
                  setFormData({ ...formData, severity: e.target.value as AlertSeverity | '' })
                }
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-gray-800 text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.severity ? 'border-red-500' : 'border-gray-600'
                }`}
              >
                <option value="">Select severity</option>
                {SEVERITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
              {errors.severity && (
                <p className="text-xs sm:text-sm text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <span className="break-words">{errors.severity}</span>
                </p>
              )}
            </div>

            <div>
              <label htmlFor="cooldownMinutes" className="block text-xs sm:text-sm font-medium text-gray-300 mb-1">
                Cooldown (minutes)
              </label>
              <input
                id="cooldownMinutes"
                type="number"
                min="1"
                max="1440"
                value={formData.cooldownMinutes}
                onChange={(e) => setFormData({ ...formData, cooldownMinutes: e.target.value })}
                className={`w-full px-2 sm:px-3 py-1.5 sm:py-2 text-sm bg-gray-800 text-white border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500 ${
                  errors.cooldownMinutes ? 'border-red-500' : 'border-gray-600'
                }`}
              />
              {errors.cooldownMinutes && (
                <p className="text-xs sm:text-sm text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3 flex-shrink-0" />
                  <span className="break-words">{errors.cooldownMinutes}</span>
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1 flex items-start gap-1">
                <Info className="h-3 w-3 flex-shrink-0 mt-0.5" />
                <span>Minimum time between alerts (1-1440 min)</span>
              </p>
            </div>
          </div>

          {/* Notifications & Status */}
          <div className="space-y-2 sm:space-y-3">
            <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-gray-800 rounded-md border border-gray-700">
              <div className="flex-1 min-w-0 pr-2">
                <label htmlFor="enabled" className="block text-xs sm:text-sm font-medium text-gray-300">
                  Rule Status
                </label>
                <p className="text-xs text-gray-400 truncate">Enable or disable this alert rule</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.enabled}
                onClick={() => setFormData({ ...formData, enabled: !formData.enabled })}
                className={`flex-shrink-0 relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                  formData.enabled ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    formData.enabled ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-gray-800 rounded-md border border-gray-700">
              <div className="flex-1 min-w-0 pr-2">
                <label htmlFor="notifyEmail" className="block text-xs sm:text-sm font-medium text-gray-300">
                  Email Notifications
                </label>
                <p className="text-xs text-gray-400 truncate">Send alerts via email</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.notifyEmail}
                onClick={() => setFormData({ ...formData, notifyEmail: !formData.notifyEmail })}
                className={`flex-shrink-0 relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                  formData.notifyEmail ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    formData.notifyEmail ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-gray-800 rounded-md border border-gray-700">
              <div className="flex-1 min-w-0 pr-2">
                <label htmlFor="notifySlack" className="block text-xs sm:text-sm font-medium text-gray-300">
                  Slack Notifications
                </label>
                <p className="text-xs text-gray-400 truncate">Send alerts to Slack</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={formData.notifySlack}
                onClick={() => setFormData({ ...formData, notifySlack: !formData.notifySlack })}
                className={`flex-shrink-0 relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors ${
                  formData.notifySlack ? 'bg-blue-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform ${
                    formData.notifySlack ? 'translate-x-5 sm:translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-[#18181b] flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-700 -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                  <span className="whitespace-nowrap">{mode === 'create' ? 'Creating...' : 'Updating...'}</span>
                </>
              ) : mode === 'create' ? (
                <span className="whitespace-nowrap">Create Alert Rule</span>
              ) : (
                <span className="whitespace-nowrap">Update Alert Rule</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}