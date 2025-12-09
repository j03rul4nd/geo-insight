"use client"

import type React from "react"
import { Edit2, Copy, Trash2, TrendingUp, Activity, BarChart3, Eye, EyeOff } from "lucide-react"
import type { MetricConfig } from "@/hooks/useMetrics"
import { cn } from "@/lib/utils"

interface MetricsListProps {
  metrics: MetricConfig[]
  expandedMetrics: Set<string>
  selectedMetrics: Set<string>
  onToggleExpand: (id: string) => void
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
  onEdit: (metric: MetricConfig) => void
  onDelete: (id: string) => void
  onDuplicate: (id: string) => void
  onReorder: (metrics: MetricConfig[]) => void
  isProcessing: boolean
}

const getChartIcon = (chartType?: string) => {
  switch (chartType) {
    case "area":
      return Activity
    case "bar":
      return BarChart3
    default:
      return TrendingUp
  }
}

const MetricsList: React.FC<MetricsListProps> = ({
  metrics,
  expandedMetrics,
  selectedMetrics,
  onToggleExpand,
  onToggleSelect,
  onSelectAll,
  onEdit,
  onDelete,
  onDuplicate,
  onReorder,
  isProcessing,
}) => {
  return (
    <div className="divide-y divide-white/5">
      {/* Header con checkbox para seleccionar todo */}
      {metrics.length > 0 && (
        <div className="flex items-center gap-2 px-2 py-1.5 bg-zinc-900/50 border-b border-white/5">
          <input
            type="checkbox"
            checked={selectedMetrics.size === metrics.length && metrics.length > 0}
            onChange={onSelectAll}
            className="w-3.5 h-3.5 flex-shrink-0 rounded border-white/10 bg-zinc-800 checked:bg-blue-500 cursor-pointer"
            title={selectedMetrics.size > 0 ? `Deselect all (${selectedMetrics.size} selected)` : "Select all metrics"}
          />
          <span className="text-[10px] font-medium text-zinc-400 truncate">
            {selectedMetrics.size > 0 
              ? `${selectedMetrics.size}/${metrics.length}` 
              : `All (${metrics.length})`}
          </span>
        </div>
      )}

      {/* Lista de métricas */}
      {metrics.map((metric) => {
        const isExpanded = expandedMetrics.has(metric.id)
        const isSelected = selectedMetrics.has(metric.id)
        const ChartIcon = getChartIcon(metric.chartType)
        const aggregationLabel = metric.aggregation && metric.aggregation !== "none" 
          ? metric.aggregation.toUpperCase() 
          : null

        return (
          <div 
            key={metric.id} 
            className={cn(
              "group relative px-2 py-2 hover:bg-white/[0.03] transition-colors",
              isSelected && "bg-blue-500/5 border-l-2 border-l-blue-500/50"
            )}
          >
            {/* Layout vertical compacto */}
            <div className="flex flex-col gap-1.5 w-full">
              
              {/* Fila 1: Checkbox + Color + Nombre */}
              <div className="flex items-start gap-2 w-full min-w-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect(metric.id)}
                  className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 rounded border-white/10 bg-zinc-800 checked:bg-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={isProcessing}
                  title={isSelected ? `Deselect "${metric.name}"` : `Select "${metric.name}"`}
                />

                <div 
                  className="w-5 h-5 mt-0.5 flex-shrink-0 rounded-full bg-zinc-800/50 border border-white/5 flex items-center justify-center"
                  title={`Color: ${metric.color}`}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ 
                      backgroundColor: metric.color, 
                      boxShadow: `0 0 6px ${metric.color}60` 
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span 
                      className="text-[11px] font-medium text-zinc-200 break-words leading-tight"
                      title={metric.name}
                    >
                      {metric.name}
                    </span>
                    {aggregationLabel && (
                      <span 
                        className="text-[7px] font-bold px-1 py-0.5 bg-white/5 text-zinc-400 rounded uppercase tracking-wider whitespace-nowrap"
                        title={`Aggregation: ${aggregationLabel}`}
                      >
                        {aggregationLabel}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Fila 2: Selector (con indentación) */}
              <div className="pl-[38px] flex items-start gap-1.5 text-[9px] text-zinc-500 min-w-0">
                <ChartIcon size={9} className="mt-0.5 flex-shrink-0" />
                <span 
                  className="font-mono opacity-70 break-all leading-tight"
                  title={`Selector: ${metric.valueSelector}`}
                >
                  {metric.valueSelector}
                </span>
              </div>

              {/* Fila 3: Acciones (con indentación) */}
              <div className="pl-[38px] flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onToggleExpand(metric.id)}
                  disabled={isProcessing}
                  className={cn(
                    "p-1 rounded transition-all disabled:opacity-30",
                    isExpanded
                      ? "bg-blue-500/15 text-blue-400"
                      : "hover:bg-white/5 text-zinc-500"
                  )}
                  title={isExpanded ? "Hide" : "Show"}
                >
                  {isExpanded ? <Eye size={11} /> : <EyeOff size={11} />}
                </button>

                <div className="w-px h-2.5 bg-white/10" />

                <button
                  onClick={() => onEdit(metric)}
                  disabled={isProcessing}
                  className="p-1 hover:bg-white/5 text-zinc-500 hover:text-zinc-300 rounded transition-colors disabled:opacity-30"
                  title="Edit"
                >
                  <Edit2 size={11} />
                </button>

                <button
                  onClick={() => onDuplicate(metric.id)}
                  disabled={isProcessing}
                  className="p-1 hover:bg-white/5 text-zinc-500 hover:text-zinc-300 rounded transition-colors disabled:opacity-30"
                  title="Duplicate"
                >
                  <Copy size={11} />
                </button>

                <button
                  onClick={() => {
                    if (confirm(`Delete "${metric.name}"?`)) {
                      onDelete(metric.id)
                    }
                  }}
                  disabled={isProcessing}
                  className="p-1 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 rounded transition-colors disabled:opacity-30"
                  title="Delete"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          </div>
        )
      })}

      {/* Empty state */}
      {metrics.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="w-12 h-12 rounded-full bg-zinc-800/50 border border-white/5 flex items-center justify-center mb-3">
            <BarChart3 size={20} className="text-zinc-600" />
          </div>
          <p className="text-sm font-medium text-zinc-400 mb-1">No metrics yet</p>
          <p className="text-xs text-zinc-600">Click the + button to create your first metric</p>
        </div>
      )}
    </div>
  )
}

export default MetricsList