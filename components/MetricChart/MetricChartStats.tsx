import type React from "react"
import { cn } from "@/lib/utils"
import { formatValue, type Stats } from "./utils/calculations"

interface MetricChartStatsProps {
  stats: Stats
  decimals: number
  unit?: string | null
  isNarrow: boolean
}

export const MetricChartStats: React.FC<MetricChartStatsProps> = ({ stats, decimals, unit, isNarrow }) => {
  const statItems = [
    { label: "Min", value: stats.min },
    { label: "Avg", value: stats.avg },
    { label: "Median", value: stats.median },
    { label: "Max", value: stats.max },
  ]

  return (
    <div
      className={cn("gap-2 sm:gap-3", isNarrow ? "flex flex-col" : "grid grid-cols-2 sm:grid-cols-4")}
    >
      {statItems.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            "bg-black/20 rounded-xl p-2 sm:p-3 border border-white/5",
            isNarrow ? "flex items-center justify-between" : "flex flex-col"
          )}
        >
          <div className="text-[10px] sm:text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">
            {stat.label}
          </div>
          <div className="text-sm sm:text-sm font-medium text-zinc-200 tabular-nums">
            {formatValue(stat.value, decimals, unit)}
          </div>
        </div>
      ))}
    </div>
  )
}