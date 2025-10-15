// ============================================
// HELPER: Get color based on value & range
// ============================================

export const getHeatmapColor = (value: number, min: number, max: number): string => {
  const normalized = (value - min) / (max - min);
  
  if (normalized < 0.25) return '#3b82f6'; // blue
  if (normalized < 0.5) return '#10b981'; // green
  if (normalized < 0.75) return '#f59e0b'; // orange
  return '#ef4444'; // red
};