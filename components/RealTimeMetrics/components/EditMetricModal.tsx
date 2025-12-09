"use client"

import type React from "react"
import { useState } from "react"
import { X, Check, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import type { MetricConfig, UpdateMetricData } from "@/hooks/useMetrics"
import { cn } from "@/lib/utils"

interface EditMetricModalProps {
  metric: MetricConfig
  onSave: (updates: UpdateMetricData) => Promise<void>
  onClose: () => void
  sampleDataPoint?: any
  isUpdating: boolean  // ⬅️ PROP AÑADIDA
}

const PRESET_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"]

const CHART_TYPES = [
  { value: "line", label: "Line", icon: "📈" },
  { value: "area", label: "Area", icon: "📊" },
  { value: "bar", label: "Bar", icon: "📊" },
]

const AGGREGATIONS = [
  { value: "none", label: "None (Raw)" },
  { value: "avg", label: "Average" },
  { value: "sum", label: "Sum" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
  { value: "count", label: "Count" },
]

const EditMetricModal: React.FC<EditMetricModalProps> = ({ 
  metric, 
  onSave, 
  onClose, 
  sampleDataPoint,
  isUpdating  // ⬅️ PROP DESESTRUCTURADA
}) => {
  const [name, setName] = useState(metric.name)
  const [color, setColor] = useState(metric.color)
  const [valueSelector, setValueSelector] = useState(metric.valueSelector)
  const [aggregation, setAggregation] = useState(metric.aggregation || "none")
  const [windowSize, setWindowSize] = useState(metric.windowSize || 50)
  const [chartType, setChartType] = useState(metric.chartType || "line")
  const [showStats, setShowStats] = useState(metric.showStats ?? true)
  const [unit, setUnit] = useState(metric.unit || "")
  const [decimals, setDecimals] = useState(metric.decimals ?? 2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      name: name.trim(),
      color,
      valueSelector: valueSelector.trim(),
      aggregation,
      windowSize,
      chartType,
      showStats,
      unit: unit.trim() || undefined,
      decimals,
    })
  }

  // Verificar si hay cambios
  const hasChanges = 
    name.trim() !== metric.name ||
    color !== metric.color ||
    valueSelector.trim() !== metric.valueSelector ||
    aggregation !== metric.aggregation ||
    windowSize !== metric.windowSize ||
    chartType !== metric.chartType ||
    showStats !== metric.showStats ||
    (unit.trim() || null) !== metric.unit ||
    decimals !== metric.decimals

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isUpdating ? undefined : onClose}  // ⬅️ Prevenir cerrar durante actualización
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-semibold text-white">Edit Metric</h2>
            <p className="text-sm text-zinc-400">Modify visualization settings</p>
          </div>
          <button
            onClick={onClose}
            disabled={isUpdating}  // ⬅️ Deshabilitar durante actualización
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="edit-metric-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Metric Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isUpdating}  // ⬅️ Deshabilitar durante actualización
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Data Path</label>
                  <input
                    type="text"
                    value={valueSelector}
                    onChange={(e) => setValueSelector(e.target.value)}
                    disabled={isUpdating}  // ⬅️ Deshabilitar durante actualización
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all font-mono disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="e.g., value or metadata.temperature"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Appearance</h3>
              <div className="space-y-3">
                <label className="text-sm font-medium text-zinc-300">Accent Color</label>
                <div className="flex flex-wrap gap-3">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      disabled={isUpdating}  // ⬅️ Deshabilitar durante actualización
                      className={cn(
                        "w-8 h-8 rounded-full transition-all relative disabled:opacity-50 disabled:cursor-not-allowed",
                        color === c
                          ? "ring-2 ring-white ring-offset-2 ring-offset-[#121214] scale-110"
                          : "hover:scale-110 opacity-70 hover:opacity-100",
                      )}
                      style={{ backgroundColor: c }}
                    >
                      {color === c && (
                        <Check
                          size={14}
                          className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {CHART_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setChartType(type.value as any)}
                    disabled={isUpdating}  // ⬅️ Deshabilitar durante actualización
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                      chartType === type.value
                        ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                        : "bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                    )}
                  >
                    <span className="text-2xl mb-2 filter grayscale opacity-80">{type.icon}</span>
                    <span className="text-xs font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Advanced */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Advanced</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Aggregation</label>
                  <select
                    value={aggregation}
                    onChange={(e) => setAggregation(e.target.value as any)}
                    disabled={isUpdating}  // ⬅️ Deshabilitar durante actualización
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {AGGREGATIONS.map((agg) => (
                      <option key={agg.value} value={agg.value} className="bg-[#121214]">
                        {agg.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Window Size</label>
                  <input
                    type="number"
                    value={windowSize}
                    onChange={(e) => setWindowSize(Number(e.target.value))}
                    disabled={isUpdating}  // ⬅️ Deshabilitar durante actualización
                    min={1}
                    max={1000}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Unit</label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    disabled={isUpdating}  // ⬅️ Deshabilitar durante actualización
                    placeholder="e.g., °C, km/h, %"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Decimals</label>
                  <input
                    type="number"
                    value={decimals}
                    onChange={(e) => setDecimals(Number(e.target.value))}
                    disabled={isUpdating}  // ⬅️ Deshabilitar durante actualización
                    min={0}
                    max={10}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-all",
                      showStats ? "bg-blue-500 border-blue-500" : "border-zinc-600 group-hover:border-zinc-400",
                      isUpdating && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {showStats && <Check size={12} className="text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={showStats}
                    onChange={(e) => setShowStats(e.target.checked)}
                    disabled={isUpdating}  // ⬅️ Deshabilitar durante actualización
                    className="hidden"
                  />
                  <span className={cn(
                    "text-sm text-zinc-300 transition-colors",
                    !isUpdating && "group-hover:text-white"
                  )}>
                    Show statistics
                  </span>
                </label>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/5 bg-black/20 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUpdating}  // ⬅️ Deshabilitar durante actualización
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-metric-form"
            disabled={isUpdating || !hasChanges}  // ⬅️ Deshabilitar durante actualización o sin cambios
            className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2"
          >
            {isUpdating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Updating...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default EditMetricModal