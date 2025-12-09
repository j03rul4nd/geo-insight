import type React from "react"
import { useMemo } from "react"

interface SparklineProps {
  data: number[]
  color: string
  type: "line" | "area" | "bar"
  width: number
  height: number
  id: string
}

export const Sparkline: React.FC<SparklineProps> = ({ data, color, type, width, height, id }) => {
  const points = useMemo(() => {
    if (data.length === 0) return []
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    const padding = height * 0.1
    const availableHeight = height - padding * 2

    return data.map((value, index) => ({
      x: (index / (data.length - 1 || 1)) * width,
      y: height - padding - ((value - min) / range) * availableHeight,
    }))
  }, [data, width, height])

  if (data.length === 0) return null

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
  const areaPathD = type === "area" ? `${pathD} L ${width} ${height} L 0 ${height} Z` : ""
  const gradientId = `gradient-${id}`

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.5} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>

      {type === "area" && <path d={areaPathD} fill={`url(#${gradientId})`} />}

      {type === "bar" ? (
        data.map((value, i) => {
          const min = Math.min(...data)
          const max = Math.max(...data)
          const range = max - min || 1
          const barHeight = ((value - min) / range) * (height * 0.8)
          const barWidth = (width / data.length) * 0.6
          const x = i * (width / data.length) + (width / data.length - barWidth) / 2

          return (
            <rect
              key={i}
              x={x}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={2}
              opacity={0.8}
            />
          )
        })
      ) : (
        <path
          d={pathD}
          stroke={color}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: `drop-shadow(0 4px 6px ${color}40)` }}
        />
      )}

      {points.length > 0 && type !== "bar" && (
        <g>
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={6} fill={color} opacity={0.3}>
            <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle
            cx={points[points.length - 1].x}
            cy={points[points.length - 1].y}
            r={3}
            fill={color}
            stroke="#18181b"
            strokeWidth={1.5}
          />
        </g>
      )}
    </svg>
  )
}