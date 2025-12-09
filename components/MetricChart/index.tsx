"use client"

import type React from "react"
import { useMemo, useState, useEffect, useRef } from "react"
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react"
import type { MetricConfig } from "@/hooks/useMetrics"
import { cn } from "@/lib/utils"
import { calculateStats, formatValue } from "./utils/calculations"
import { MetricChartHeader } from "./MetricChartHeader"
import { MetricChartStats } from "./MetricChartStats"
import { Sparkline } from "./charts/Sparkline"
import { ScatterPlot } from "./charts/ScatterPlot"
import { Gauge } from "./charts/GaugeChart"
import { DistributionChart } from "./charts/DistributionChart"

interface MetricChartProps {
  metric: MetricConfig
  values: Array<{ timestamp: Date; value: number; secondaryValue?: number }>
  isEmpty: boolean
  onClose: () => void
  onEdit?: () => void
}

const MetricChart: React.FC<MetricChartProps> = ({ metric, values, isEmpty, onClose, onEdit }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(400)

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const stats = useMemo(() => {
    const numValues = values.map((v) => v.value)
    return calculateStats(numValues)
  }, [values])

  const trendColor = stats.trend > 0 ? "text-emerald-400" : stats.trend < 0 ? "text-rose-400" : "text-zinc-400"
  const TrendIcon = stats.trend > 0 ? TrendingUp : stats.trend < 0 ? TrendingDown : Minus

  const scatterData = useMemo(() => {
    if (metric.chartType !== "scatter") return []
    return values
      .filter((v) => v.secondaryValue !== undefined)
      .map((v) => ({ x: v.value, y: v.secondaryValue! }))
  }, [values, metric.chartType])

  const isNarrow = containerWidth < 280

  return (
    <div
      ref={containerRef}
      className="relative group bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-white/20 hover:shadow-3xl hover:bg-zinc-900/70"
    >
      {/* Glass Reflection Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

      {/* Header */}
      <MetricChartHeader
        metricName={metric.name}
        metricSelector={metric.valueSelector}
        metricColor={metric.color}
        isNarrow={isNarrow}
        onClose={onClose}
        onEdit={onEdit}
      />

      {/* Content */}
      <div className="relative p-3 sm:p-6 pt-2">
        {isEmpty ? (
          <div className="h-[120px] sm:h-[160px] flex flex-col items-center justify-center text-zinc-600 border-2 border-dashed border-white/5 rounded-2xl bg-black/20">
            <Activity size={20} className="sm:w-6 sm:h-6 mb-2 opacity-50" />
            <span className="text-[10px] sm:text-xs font-medium">Waiting for data...</span>
          </div>
        ) : (
          <>
            {/* Main Value */}
            {metric.chartType !== "distribution" && (
              <div className="flex flex-wrap items-end gap-2 sm:gap-3 mb-4 sm:mb-6">
                <div
                  className={cn(
                    "font-bold text-white tracking-tight tabular-nums break-all",
                    isNarrow ? "text-xl" : "text-2xl sm:text-4xl"
                  )}
                >
                  {formatValue(stats.latest, metric.decimals, metric.unit)}
                </div>
                <div
                  className={cn(
                    "flex items-center gap-1 mb-0.5 sm:mb-1.5 text-xs sm:text-sm font-medium px-1.5 sm:px-2 py-0.5 rounded-full bg-white/5 border border-white/5 whitespace-nowrap",
                    trendColor
                  )}
                >
                  <TrendIcon size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span>{Math.abs(stats.trend).toFixed(1)}%</span>
                </div>
              </div>
            )}

            {/* Chart Area */}
            <div className="h-[100px] sm:h-[120px] w-full mb-4 sm:mb-6">
              {metric.chartType === "scatter" ? (
                <ScatterPlot data={scatterData} color={metric.color} width={400} height={120} />
              ) : metric.chartType === "gauge" ? (
                <Gauge
                  value={stats.latest}
                  min={stats.min}
                  max={stats.max}
                  thresholds={metric.thresholds || []}
                  width={400}
                  height={120}
                />
              ) : metric.chartType === "distribution" ? (
                <DistributionChart data={values.map((v) => v.value)} color={metric.color} width={400} height={120} />
              ) : (
                <Sparkline
                  id={metric.id}
                  data={values.map((v) => v.value)}
                  color={metric.color}
                  type={(metric.chartType as "line" | "area" | "bar") || "line"}
                  width={400}
                  height={120}
                />
              )}
            </div>

            {/* Stats Grid */}
            {metric.showStats && (
              <MetricChartStats stats={stats} decimals={metric.decimals} unit={metric.unit} isNarrow={isNarrow} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default MetricChart