import type React from "react"
import { useMemo } from "react"

interface ScatterPlotProps {
  data: Array<{ x: number; y: number }>
  color: string
  width: number
  height: number
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data, color, width, height }) => {
  const points = useMemo(() => {
    if (data.length === 0) return []
    const xValues = data.map((d) => d.x)
    const yValues = data.map((d) => d.y)
    const xMin = Math.min(...xValues)
    const xMax = Math.max(...xValues)
    const yMin = Math.min(...yValues)
    const yMax = Math.max(...yValues)
    const xRange = xMax - xMin || 1
    const yRange = yMax - yMin || 1
    const padding = 20

    return data.map((d) => ({
      x: padding + ((d.x - xMin) / xRange) * (width - padding * 2),
      y: height - padding - ((d.y - yMin) / yRange) * (height - padding * 2),
    }))
  }, [data, width, height])

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} opacity={0.7} />
      ))}
    </svg>
  )
}