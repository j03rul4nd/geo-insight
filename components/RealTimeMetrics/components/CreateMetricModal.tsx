// CreateMetricModal.tsx - Versión completa con filtros

"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { X, Check, Plus, Trash2, Info, Filter } from "lucide-react"
import { motion } from "framer-motion"
import type { MetricConfig, CreateMetricData, FilterRule, FiltersConfig, FilterOperator } from "@/hooks/useMetrics"
import { cn } from "@/lib/utils"

interface CreateMetricModalProps {
  onSave: (config: CreateMetricData) => Promise<void>
  onClose: () => void
  existingMetrics: MetricConfig[]
  sampleDataPoint?: any
  isCreating?: boolean
}

const PRESET_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316"]

const CHART_TYPES = [
  { value: "line", label: "Line", icon: "📈", description: "Temporal trends" },
  { value: "area", label: "Area", icon: "📊", description: "Filled gradient" },
  { value: "bar", label: "Bar", icon: "📊", description: "Discrete values" },
  { value: "scatter", label: "Scatter", icon: "🎯", description: "X vs Y correlation" },
  { value: "gauge", label: "Gauge", icon: "⏱️", description: "Speedometer style" },
  { value: "distribution", label: "Distribution", icon: "📊", description: "Value frequency" },
]

const AGGREGATIONS = [
  { value: "none", label: "None (Raw)" },
  { value: "avg", label: "Average" },
  { value: "sum", label: "Sum" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" },
  { value: "count", label: "Count" },
]

const FILTER_OPERATORS: Array<{ value: FilterOperator; label: string; description?: string }> = [
  { value: "equals", label: "Equals (=)", description: "Exact match" },
  { value: "not_equals", label: "Not Equals (≠)", description: "Does not match" },
  { value: "contains", label: "Contains", description: "Text contains substring" },
  { value: "not_contains", label: "Not Contains", description: "Text doesn't contain" },
  { value: "greater_than", label: "Greater Than (>)", description: "Numeric comparison" },
  { value: "less_than", label: "Less Than (<)", description: "Numeric comparison" },
  { value: "greater_than_or_equal", label: "Greater or Equal (≥)", description: "Numeric comparison" },
  { value: "less_than_or_equal", label: "Less or Equal (≤)", description: "Numeric comparison" },
  { value: "in", label: "In (array)", description: 'Value in list: ["a","b"]' },
  { value: "not_in", label: "Not In (array)", description: "Value not in list" },
]

const extractPaths = (obj: any, prefix = ""): string[] => {
  const paths: string[] = []
  if (!obj || typeof obj !== "object") return paths
  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key
    const value = obj[key]
    if (["number", "string", "boolean"].includes(typeof value) || Array.isArray(value)) {
      paths.push(path)
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      paths.push(...extractPaths(value, path))
    }
  }
  return paths
}

const CreateMetricModal: React.FC<CreateMetricModalProps> = ({
  onSave,
  onClose,
  existingMetrics,
  sampleDataPoint,
  isCreating = false,
}) => {
  // Basic fields
  const [name, setName] = useState("")
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [valueSelector, setValueSelector] = useState("")
  const [aggregation, setAggregation] = useState<MetricConfig["aggregation"]>("none")
  const [windowSize, setWindowSize] = useState(50)
  const [chartType, setChartType] = useState<MetricConfig["chartType"]>("line")
  const [showStats, setShowStats] = useState(true)
  const [unit, setUnit] = useState("")
  const [decimals, setDecimals] = useState(2)
  const [showPathSuggestions, setShowPathSuggestions] = useState(false)
  const [showFilterPathSuggestions, setShowFilterPathSuggestions] = useState<number | null>(null)

  // Advanced fields for scatter/gauge
  const [secondaryValueSelector, setSecondaryValueSelector] = useState("")
  const [groupBySelector, setGroupBySelector] = useState("")
  const [thresholds, setThresholds] = useState<Array<{ value: number; color: string; label: string }>>([
    { value: 30, color: "#ef4444", label: "Low" },
    { value: 70, color: "#f59e0b", label: "Medium" },
    { value: 100, color: "#10b981", label: "High" },
  ])

  // Filters configuration
  const [enableFilters, setEnableFilters] = useState(false)
  const [filterLogic, setFilterLogic] = useState<'AND' | 'OR'>('AND')
  const [filterRules, setFilterRules] = useState<FilterRule[]>([
    { field: "", operator: "equals", value: "" }
  ])

  const suggestedPaths = useMemo(() => {
    if (!sampleDataPoint) return []
    return extractPaths(sampleDataPoint)
  }, [sampleDataPoint])

  const isValid = useMemo(() => {
    const basicValid = name.trim().length > 0 && 
                       valueSelector.trim().length > 0 && 
                       !existingMetrics.some((m) => m.name === name.trim())
    
    // Validar filtros si están habilitados
    if (enableFilters) {
      const validFilterRules = filterRules.every(rule => {
        // Si el field está vacío, no es válido
        if (!rule.field.trim()) return false
        
        // Si el operador es 'in' o 'not_in', validar que value sea un array
        if (rule.operator === 'in' || rule.operator === 'not_in') {
          if (typeof rule.value === 'string') {
            try {
              const parsed = JSON.parse(rule.value)
              return Array.isArray(parsed)
            } catch {
              return false
            }
          }
          return Array.isArray(rule.value)
        }
        
        // Para otros operadores, validar que value no esté vacío
        return rule.value !== "" && rule.value !== null && rule.value !== undefined
      })
      
      return basicValid && validFilterRules
    }
    
    return basicValid
  }, [name, valueSelector, existingMetrics, enableFilters, filterRules])

  // Threshold handlers
  const addThreshold = () => {
    setThresholds([...thresholds, { value: 0, color: "#3b82f6", label: "New" }])
  }

  const removeThreshold = (index: number) => {
    setThresholds(thresholds.filter((_, i) => i !== index))
  }

  const updateThreshold = (index: number, field: keyof typeof thresholds[0], value: any) => {
    const updated = [...thresholds]
    updated[index] = { ...updated[index], [field]: value }
    setThresholds(updated)
  }

  // Filter handlers
  const addFilterRule = () => {
    setFilterRules([...filterRules, { field: "", operator: "equals", value: "" }])
  }

  const removeFilterRule = (index: number) => {
    setFilterRules(filterRules.filter((_, i) => i !== index))
  }

  const updateFilterRule = (index: number, field: keyof FilterRule, value: any) => {
    const updated = [...filterRules]
    
    if (field === 'value') {
      const currentOperator = updated[index].operator
      
      // Para operadores 'in' y 'not_in', intentar parsear como array
      if (currentOperator === 'in' || currentOperator === 'not_in') {
        if (typeof value === 'string') {
          try {
            const parsed = JSON.parse(value)
            updated[index] = { ...updated[index], [field]: Array.isArray(parsed) ? parsed : value }
          } catch {
            updated[index] = { ...updated[index], [field]: value }
          }
        } else {
          updated[index] = { ...updated[index], [field]: value }
        }
      } else {
        // Para otros operadores, guardar el valor directamente
        updated[index] = { ...updated[index], [field]: value }
      }
    } else {
      updated[index] = { ...updated[index], [field]: value }
    }
    
    setFilterRules(updated)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid) return
    
    // Construir configuración de filtros
    const filtersConfig: FiltersConfig | undefined = enableFilters && filterRules.some(r => r.field.trim())
      ? {
          logic: filterLogic,
          rules: filterRules.filter(r => r.field.trim()) // Solo incluir reglas con field definido
        }
      : undefined

    onSave({
      name: name.trim(),
      color,
      valueSelector: valueSelector.trim(),
      aggregation,
      windowSize,
      chartType,
      showStats,
      unit: unit.trim() || undefined,
      decimals,
      filters: filtersConfig,
      secondaryValueSelector: secondaryValueSelector.trim() || undefined,
      groupBySelector: groupBySelector.trim() || undefined,
      thresholds: chartType === 'gauge' ? thresholds : undefined,
    })
  }

  const needsSecondaryValue = chartType === 'scatter'
  const needsThresholds = chartType === 'gauge'
  const canUseGroupBy = ['bar', 'distribution'].includes(chartType)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl bg-[#121214]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <div>
            <h2 className="text-xl font-semibold text-white">New Metric</h2>
            <p className="text-sm text-zinc-400">Configure a new data stream visualization</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form id="create-metric-form" onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Configuration</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Metric Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Train Speed"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all"
                    autoFocus
                  />
                  {name.trim().length > 0 && existingMetrics.some((m) => m.name === name.trim()) && (
                    <p className="text-xs text-red-400">A metric with this name already exists</p>
                  )}
                </div>

                <div className="space-y-2 relative">
                  <label className="text-sm font-medium text-zinc-300">Primary Value Path</label>
                  <input
                    type="text"
                    value={valueSelector}
                    onChange={(e) => setValueSelector(e.target.value)}
                    onFocus={() => setShowPathSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowPathSuggestions(false), 200)}
                    placeholder="value or metadata.speed"
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all font-mono"
                  />
                  {showPathSuggestions && suggestedPaths.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1c] border border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto z-20 p-1">
                      {suggestedPaths.map((path) => (
                        <button
                          key={path}
                          type="button"
                          onClick={() => {
                            setValueSelector(path)
                            setShowPathSuggestions(false)
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors font-mono"
                        >
                          {path}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Appearance Section */}
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
                      className={cn(
                        "w-8 h-8 rounded-full transition-all relative",
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
                  <div className="w-px h-8 bg-white/10 mx-2" />
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded-full bg-transparent cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CHART_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setChartType(type.value as any)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border transition-all",
                      chartType === type.value
                        ? "bg-blue-500/10 border-blue-500/50 text-blue-400"
                        : "bg-black/20 border-white/5 text-zinc-500 hover:bg-white/5 hover:text-zinc-300",
                    )}
                  >
                    <span className="text-2xl mb-2 filter grayscale opacity-80">{type.icon}</span>
                    <span className="text-xs font-medium mb-1">{type.label}</span>
                    <span className="text-[10px] text-zinc-600">{type.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Filters Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Filter size={12} />
                  Advanced Filters
                </h3>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div
                    className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center transition-all",
                      enableFilters ? "bg-purple-500 border-purple-500" : "border-zinc-600 group-hover:border-zinc-400",
                    )}
                  >
                    {enableFilters && <Check size={12} className="text-white" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={enableFilters}
                    onChange={(e) => setEnableFilters(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-sm text-zinc-400 group-hover:text-zinc-300 transition-colors">
                    Enable Filters
                  </span>
                </label>
              </div>

              {enableFilters && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-purple-300">Logic:</label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFilterLogic('AND')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          filterLogic === 'AND'
                            ? "bg-purple-500 text-white"
                            : "bg-black/20 text-zinc-400 hover:bg-white/5"
                        )}
                      >
                        AND
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterLogic('OR')}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                          filterLogic === 'OR'
                            ? "bg-purple-500 text-white"
                            : "bg-black/20 text-zinc-400 hover:bg-white/5"
                        )}
                      >
                        OR
                      </button>
                    </div>
                    <div className="ml-auto text-xs text-zinc-500">
                      {filterLogic === 'AND' ? 'All rules must match' : 'Any rule can match'}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {filterRules.map((rule, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <div className="flex-1 relative">
                          <input
                            type="text"
                            value={rule.field}
                            onChange={(e) => updateFilterRule(index, 'field', e.target.value)}
                            onFocus={() => setShowFilterPathSuggestions(index)}
                            onBlur={() => setTimeout(() => setShowFilterPathSuggestions(null), 200)}
                            placeholder="metadata.status"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-zinc-600"
                          />
                          {showFilterPathSuggestions === index && suggestedPaths.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1a1a1c] border border-white/10 rounded-lg shadow-xl max-h-40 overflow-y-auto z-30 p-1">
                              {suggestedPaths.map((path) => (
                                <button
                                  key={path}
                                  type="button"
                                  onClick={() => {
                                    updateFilterRule(index, 'field', path)
                                    setShowFilterPathSuggestions(null)
                                  }}
                                  className="w-full text-left px-2 py-1.5 text-xs text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-colors font-mono"
                                >
                                  {path}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <select
                          value={rule.operator}
                          onChange={(e) => updateFilterRule(index, 'operator', e.target.value as FilterOperator)}
                          className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white appearance-none cursor-pointer hover:bg-white/5 transition-colors min-w-[140px]"
                        >
                          {FILTER_OPERATORS.map(op => (
                            <option key={op.value} value={op.value} className="bg-[#121214]">
                              {op.label}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={typeof rule.value === 'object' ? JSON.stringify(rule.value) : String(rule.value)}
                          onChange={(e) => updateFilterRule(index, 'value', e.target.value)}
                          placeholder={
                            rule.operator === 'in' || rule.operator === 'not_in' 
                              ? '["value1", "value2"]' 
                              : 'value'
                          }
                          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono placeholder:text-zinc-600"
                        />
                        <button
                          type="button"
                          onClick={() => removeFilterRule(index)}
                          className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          disabled={filterRules.length <= 1}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={addFilterRule}
                    className="w-full py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus size={14} />
                    Add Filter Rule
                  </button>

                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-medium text-purple-300">💡 Filter Examples:</p>
                    <ul className="text-xs text-zinc-400 space-y-0.5 ml-4">
                      <li>• <code className="text-purple-400">metadata.type</code> equals <code className="text-purple-400">"temperature"</code></li>
                      <li>• <code className="text-purple-400">value</code> greater_than <code className="text-purple-400">100</code></li>
                      <li>• <code className="text-purple-400">metadata.status</code> in <code className="text-purple-400">["active", "pending"]</code></li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Chart Options */}
            {(needsSecondaryValue || needsThresholds || canUseGroupBy) && (
              <div className="space-y-4">
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <Info size={12} />
                  Chart-Specific Options
                </h3>

                {needsSecondaryValue && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 space-y-3">
                    <label className="text-sm font-medium text-blue-300 flex items-center gap-2">
                      🎯 Secondary Value (Y-axis)
                    </label>
                    <input
                      type="text"
                      value={secondaryValueSelector}
                      onChange={(e) => setSecondaryValueSelector(e.target.value)}
                      placeholder="e.g., metadata.occupancy"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all font-mono"
                    />
                    <p className="text-xs text-zinc-500">
                      For scatter plots: Primary = X-axis, Secondary = Y-axis
                    </p>
                  </div>
                )}

                {needsThresholds && (
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-purple-300 flex items-center gap-2">
                        ⏱️ Gauge Thresholds
                      </label>
                      <button
                        type="button"
                        onClick={addThreshold}
                        className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {thresholds.map((threshold, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="number"
                            value={threshold.value}
                            onChange={(e) => updateThreshold(index, 'value', Number(e.target.value))}
                            placeholder="Value"
                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                          />
                          <input
                            type="color"
                            value={threshold.color}
                            onChange={(e) => updateThreshold(index, 'color', e.target.value)}
                            className="w-10 h-9 rounded-lg cursor-pointer"
                          />
                          <input
                            type="text"
                            value={threshold.label}
                            onChange={(e) => updateThreshold(index, 'label', e.target.value)}
                            placeholder="Label"
                            className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={() => removeThreshold(index)}
                            className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            disabled={thresholds.length <= 1}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {canUseGroupBy && (
                  <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4 space-y-3">
                    <label className="text-sm font-medium text-green-300 flex items-center gap-2">
                      📊 Group By (Optional)
                    </label>
                    <input
                      type="text"
                      value={groupBySelector}
                      onChange={(e) => setGroupBySelector(e.target.value)}
                      placeholder="e.g., metadata.sensorType"
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-green-500/50 focus:bg-white/5 transition-all font-mono"
                    />
                    <p className="text-xs text-zinc-500">
                      Group data by category (e.g., sensor type, service type)
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Standard Advanced Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">General Settings</h3>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-zinc-300">Aggregation</label>
                  <select
                    value={aggregation}
                    onChange={(e) => setAggregation(e.target.value as any)}
                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all appearance-none cursor-pointer"
                >
                {AGGREGATIONS.map((agg) => (
                    <option key={agg.value} value={agg.value} className="bg-[#121214]">
                    {agg.label}
                    </option>
                ))}
                </select>
            </div><div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Window Size</label>
              <input
                type="number"
                value={windowSize}
                onChange={(e) => setWindowSize(Math.max(1, Number(e.target.value)))}
                min="1"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Unit (Optional)</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. km/h, °C, %"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Decimal Places</label>
              <input
                type="number"
                value={decimals}
                onChange={(e) => setDecimals(Math.max(0, Math.min(10, Number(e.target.value))))}
                min="0"
                max="10"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div
                className={cn(
                  "w-5 h-5 rounded border flex items-center justify-center transition-all",
                  showStats ? "bg-blue-500 border-blue-500" : "border-zinc-600 group-hover:border-zinc-400",
                )}
              >
                {showStats && <Check size={12} className="text-white" />}
              </div>
              <input
                type="checkbox"
                checked={showStats}
                onChange={(e) => setShowStats(e.target.checked)}
                className="hidden"
              />
              <span className="text-sm text-zinc-300 group-hover:text-white transition-colors">
                Show statistics (min, max, avg, median)
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
        disabled={isCreating}
        className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="create-metric-form"
        disabled={!isValid || isCreating}
        className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isCreating ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Check size={16} />
            Create Metric
          </>
        )}
      </button>
    </div>
  </motion.div>
</div>)
}
export default CreateMetricModal