export interface Stats {
  min: number
  max: number
  avg: number
  median: number
  latest: number
  trend: number
}

export const calculateStats = (values: number[]): Stats => {
  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, median: 0, latest: 0, trend: 0 }
  }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const avg = values.reduce((a, b) => a + b, 0) / values.length
  const sorted = [...values].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const latest = values[values.length - 1]
  const trend = values.length > 1 ? ((latest - values[0]) / values[0]) * 100 : 0
  return { min, max, avg, median, latest, trend }
}

export const formatValue = (value: number, decimals = 2, unit?: string | null): string => {
  const formatted = value.toFixed(decimals)
  return unit ? `${formatted} ${unit}` : formatted
}

export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text
}