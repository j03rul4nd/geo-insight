import type React from "react"
import { X, MoreHorizontal } from "lucide-react"
import { truncateText } from "./utils/calculations"

interface MetricChartHeaderProps {
  metricName: string
  metricSelector: string
  metricColor: string
  isNarrow: boolean
  onClose: () => void
  onEdit?: () => void
}

export const MetricChartHeader: React.FC<MetricChartHeaderProps> = ({
  metricName,
  metricSelector,
  metricColor,
  isNarrow,
  onClose,
  onEdit,
}) => {
  return (
    <div className="relative flex items-center justify-between p-3 sm:p-5 pb-2 gap-2">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <div
          className="w-1.5 sm:w-2 h-6 sm:h-8 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ backgroundColor: metricColor, boxShadow: `0 0 12px ${metricColor}60` }}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-semibold text-zinc-100 tracking-tight truncate">
            {truncateText(metricName, isNarrow ? 15 : 20)}
          </h3>
          <p className="text-[10px] sm:text-xs text-zinc-500 font-mono truncate">
            {truncateText(metricSelector, isNarrow ? 18 : 25)}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex-shrink-0">
        {onEdit && (
          <button
            onClick={onEdit}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
          >
            <MoreHorizontal size={14} className="sm:w-4 sm:h-4" />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-1.5 sm:p-2 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
        >
          <X size={14} className="sm:w-4 sm:h-4" />
        </button>
      </div>
    </div>
  )
}