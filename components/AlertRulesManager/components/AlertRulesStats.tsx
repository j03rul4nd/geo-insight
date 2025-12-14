import React, { useState } from 'react';
import { Info, AlertTriangle, AlertCircle, Bell } from 'lucide-react';

// ============================================
// TYPES
// ============================================
type AlertSeverity = 'info' | 'warning' | 'critical';

interface AlertRuleStats {
  total: number;
  enabled: number;
  disabled: number;
  bySeverity: {
    info: number;
    warning: number;
    critical: number;
  };
}

export interface AlertRulesStatsProps {
  stats: AlertRuleStats;
  onSeverityClick?: (severity: AlertSeverity) => void;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  onClick?: () => void;
}

// ============================================
// STAT CARD SUB-COMPONENT
// ============================================
function StatCard({ title, value, icon, color, bgColor, onClick }: StatCardProps) {
  const isClickable = !!onClick;
  return (
    <div
      className={`bg-zinc-900 rounded border border-zinc-800 p-2 ${
        isClickable ? 'cursor-pointer hover:bg-zinc-800 hover:border-zinc-700 transition-all' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-zinc-400 truncate mb-0.5">{title}</p>
          <p className="text-lg font-bold text-white">{value}</p>
        </div>
        <div className={`flex-shrink-0 rounded p-1 ${bgColor}`}>
          <div className={`${color} h-3 w-3`}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
export function AlertRulesStats({ stats, onSeverityClick }: AlertRulesStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-1.5">
      {/* Total Rules */}
      <StatCard
        title="Total Rules"
        value={stats.total}
        icon={<Bell />}
        color="text-blue-400"
        bgColor="bg-blue-950"
      />
      {/* Enabled Rules */}
      <StatCard
        title="Enabled"
        value={stats.enabled}
        icon={<Bell />}
        color="text-emerald-400"
        bgColor="bg-emerald-950"
      />
      {/* Info Severity */}
      <StatCard
        title="Info"
        value={stats.bySeverity.info}
        icon={<Info />}
        color="text-blue-400"
        bgColor="bg-blue-950"
        onClick={() => onSeverityClick?.('info')}
      />
      {/* Warning Severity */}
      <StatCard
        title="Warning"
        value={stats.bySeverity.warning}
        icon={<AlertTriangle />}
        color="text-amber-400"
        bgColor="bg-amber-950"
        onClick={() => onSeverityClick?.('warning')}
      />
      {/* Critical Severity */}
      <StatCard
        title="Critical"
        value={stats.bySeverity.critical}
        icon={<AlertCircle />}
        color="text-red-400"
        bgColor="bg-red-950"
        onClick={() => onSeverityClick?.('critical')}
      />
    </div>
  );
}