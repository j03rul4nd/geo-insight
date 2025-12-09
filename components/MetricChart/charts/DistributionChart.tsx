import type React from "react"
import { useMemo } from "react"

interface DistributionChartProps {
  data: number[]
  color: string
  width: number
  height: number
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ data, color, width, height }) => {
  const histogram = useMemo(() => {
    if (data.length === 0) return []
    const min = Math.min(...data)
    const max = Math.max(...data)
    const binCount = Math.min(20, Math.ceil(Math.sqrt(data.length)))
    const binSize = (max - min) / binCount
    const bins = Array(binCount).fill(0)

    data.forEach((value) => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), binCount - 1)
      bins[binIndex]++
    })

    const maxCount = Math.max(...bins)
    return bins.map((count, i) => ({
      x: (i / binCount) * width,
      width: width / binCount,
      height: (count / maxCount) * height * 0.8,
      count,
    }))
  }, [data, width, height])

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
      {histogram.map((bin, i) => (
        <rect
          key={i}
          x={bin.x}
          y={height - bin.height}
          width={bin.width * 0.9}
          height={bin.height}
          fill={color}
          opacity={0.8}
          rx={2}
        />
      ))}
    </svg>
  )
}