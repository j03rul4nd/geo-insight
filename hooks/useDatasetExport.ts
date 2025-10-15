/**
 * Hook para exportar datasets a CSV/PDF
 * 
 * CARACTERÍSTICAS CLAVE:
 * - Exportación a CSV o PDF con filtros personalizados
 * - Gestión de límites FREE vs PRO tier
 * - Progress tracking para exports grandes
 * - Auto-descarga del archivo generado
 * - Validación de tier antes de exportar
 * - Incluir AI Insights en PDF (PRO only)
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

// ============================================================================
// TIPOS
// ============================================================================

export type ExportFormat = 'csv' | 'pdf';
export type TimeRange = '24h' | '7d' | '30d' | 'all';

export interface ExportFilters {
  sensorType?: string;
  sensorId?: string;
  minValue?: number;
  maxValue?: number;
}

export interface ExportOptions {
  format: ExportFormat;
  timeRange: TimeRange;
  includeInsights?: boolean;
  filters?: ExportFilters;
}

export interface ExportMetadata {
  format: ExportFormat;
  timeRange: TimeRange;
  dataPointsExported: number;
  includeInsights: boolean;
  generatedAt: string;
}

export interface ExportResponse {
  success: boolean;
  downloadUrl: string;
  fileName: string;
  expiresIn: number; // segundos
  metadata: ExportMetadata;
}

export interface ExportError {
  error: string;
  details?: string;
  tier?: 'free' | 'pro';
  message?: string;
}

export interface UseDatasetExportOptions {
  // Auto-download cuando se complete
  autoDownload?: boolean;
  
  // Callbacks
  onExportStart?: () => void;
  onExportComplete?: (result: ExportResponse) => void;
  onExportError?: (error: ExportError) => void;
  
  // Tier del usuario (para validación client-side)
  userTier?: 'free' | 'pro';
}

// ============================================================================
// HOOK PRINCIPAL
// ============================================================================

export function useDatasetExport(
  datasetId: string,
  options: UseDatasetExportOptions = {}
) {
  const {
    autoDownload = true,
    onExportStart,
    onExportComplete,
    onExportError,
    userTier = 'free',
  } = options;

  // ========== ESTADO ==========
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastExport, setLastExport] = useState<ExportResponse | null>(null);
  const [error, setError] = useState<ExportError | null>(null);

  // ========== VALIDAR ANTES DE EXPORTAR ==========
  const validateExport = useCallback(
    (exportOptions: ExportOptions): { valid: boolean; error?: string } => {
      // Validar formato PDF para FREE tier
      if (userTier === 'free' && exportOptions.format === 'pdf') {
        return {
          valid: false,
          error: 'PDF export is only available for PRO users. Upgrade to unlock PDF exports.',
        };
      }

      // Validar insights para FREE tier
      if (userTier === 'free' && exportOptions.includeInsights) {
        return {
          valid: false,
          error: 'AI Insights export is only available for PRO users.',
        };
      }

      return { valid: true };
    },
    [userTier]
  );

  // ========== EXPORTAR DATASET ==========
  const exportDataset = useCallback(
    async (exportOptions: ExportOptions): Promise<ExportResponse | null> => {
      // Validación client-side
      const validation = validateExport(exportOptions);
      if (!validation.valid) {
        const errorObj: ExportError = {
          error: 'Validation failed',
          message: validation.error,
          tier: userTier,
        };
        
        setError(errorObj);
        
        if (onExportError) {
          onExportError(errorObj);
        } else {
          toast.error('Export Failed', {
            description: validation.error,
          });
        }
        
        return null;
      }

      setIsExporting(true);
      setProgress(0);
      setError(null);

      if (onExportStart) {
        onExportStart();
      }

      // Simular progreso (ya que no tenemos progreso real del servidor)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 300);

      try {
        const response = await fetch(`/api/datasets/${datasetId}/export`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(exportOptions),
        });

        clearInterval(progressInterval);
        setProgress(95);

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || result.details || 'Export failed');
        }

        setProgress(100);
        setLastExport(result);

        // Toast de éxito
        toast.success('Export Complete! 🎉', {
          description: `${result.metadata.dataPointsExported} data points exported as ${exportOptions.format.toUpperCase()}`,
          duration: 5000,
        });

        // Auto-download si está habilitado
        if (autoDownload && result.downloadUrl) {
          downloadFile(result.downloadUrl, result.fileName);
          
          toast.info('Download Started', {
            description: `File expires in ${Math.round(result.expiresIn / 60)} minutes`,
          });
        }

        // Callback
        if (onExportComplete) {
          onExportComplete(result);
        }

        return result;
      } catch (err) {
        clearInterval(progressInterval);
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        const errorObj: ExportError = {
          error: 'Export failed',
          details: errorMessage,
          tier: userTier,
        };
        
        setError(errorObj);

        if (onExportError) {
          onExportError(errorObj);
        } else {
          toast.error('Export Failed', {
            description: errorMessage,
          });
        }

        return null;
      } finally {
        setIsExporting(false);
        setProgress(0);
      }
    },
    [
      datasetId,
      userTier,
      autoDownload,
      validateExport,
      onExportStart,
      onExportComplete,
      onExportError,
    ]
  );

  // ========== EXPORTAR CSV ==========
  const exportToCSV = useCallback(
    (options: Omit<ExportOptions, 'format'> = { timeRange: '24h' }) => {
      return exportDataset({
        ...options,
        format: 'csv',
      });
    },
    [exportDataset]
  );

  // ========== EXPORTAR PDF ==========
  const exportToPDF = useCallback(
    (options: Omit<ExportOptions, 'format'> = { timeRange: '24h' }) => {
      return exportDataset({
        ...options,
        format: 'pdf',
      });
    },
    [exportDataset]
  );

  // ========== DESCARGAR ARCHIVO ==========
  const downloadFile = useCallback((url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // ========== RE-DESCARGAR ÚLTIMO EXPORT ==========
  const redownloadLastExport = useCallback(() => {
    if (!lastExport) {
      toast.error('No export available', {
        description: 'Please create a new export first',
      });
      return;
    }

    // Verificar si el link aún es válido (no expiró)
    const now = Date.now();
    const generatedAt = new Date(lastExport.metadata.generatedAt).getTime();
    const expiresAt = generatedAt + lastExport.expiresIn * 1000;

    if (now > expiresAt) {
      toast.error('Export Expired', {
        description: 'This export link has expired. Please create a new export.',
      });
      return;
    }

    downloadFile(lastExport.downloadUrl, lastExport.fileName);
    
    toast.success('Download Started', {
      description: lastExport.fileName,
    });
  }, [lastExport, downloadFile]);

  // ========== VERIFICAR SI PDF ESTÁ DISPONIBLE ==========
  const isPDFAvailable = useCallback(() => {
    return userTier === 'pro';
  }, [userTier]);

  // ========== VERIFICAR SI INSIGHTS ESTÁ DISPONIBLE ==========
  const isInsightsAvailable = useCallback(() => {
    return userTier === 'pro';
  }, [userTier]);

  // ========== OBTENER LÍMITE DE PUNTOS SEGÚN TIER ==========
  const getPointsLimit = useCallback(() => {
    return userTier === 'free' ? 100 : null; // null = sin límite
  }, [userTier]);

  // ========== CALCULAR TIEMPO ESTIMADO ==========
  const estimateExportTime = useCallback(
    (pointsCount: number, format: ExportFormat): number => {
      // Estimación básica: CSV ~1s por 1000 puntos, PDF ~3s por 1000 puntos
      const baseTime = format === 'csv' ? 1 : 3;
      return Math.ceil((pointsCount / 1000) * baseTime);
    },
    []
  );

  // ========== VERIFICAR SI EXPORT ESTÁ EXPIRADO ==========
  const isExportExpired = useCallback(() => {
    if (!lastExport) return true;

    const now = Date.now();
    const generatedAt = new Date(lastExport.metadata.generatedAt).getTime();
    const expiresAt = generatedAt + lastExport.expiresIn * 1000;

    return now > expiresAt;
  }, [lastExport]);

  // ========== OBTENER TIEMPO RESTANTE HASTA EXPIRACIÓN ==========
  const getTimeUntilExpiry = useCallback((): number | null => {
    if (!lastExport || isExportExpired()) return null;

    const now = Date.now();
    const generatedAt = new Date(lastExport.metadata.generatedAt).getTime();
    const expiresAt = generatedAt + lastExport.expiresIn * 1000;

    return Math.floor((expiresAt - now) / 1000); // segundos
  }, [lastExport, isExportExpired]);

  // ========== RETURN ==========
  return {
    // Estado
    isExporting,
    progress,
    lastExport,
    error,

    // Acciones principales
    exportDataset,
    exportToCSV,
    exportToPDF,
    redownloadLastExport,

    // Validaciones
    validateExport,
    isPDFAvailable,
    isInsightsAvailable,

    // Utilidades
    getPointsLimit,
    estimateExportTime,
    isExportExpired,
    getTimeUntilExpiry,

    // Info útil
    hasLastExport: !!lastExport,
    lastExportFormat: lastExport?.metadata.format || null,
    lastExportPointsCount: lastExport?.metadata.dataPointsExported || 0,
    canExportPDF: userTier === 'pro',
    canIncludeInsights: userTier === 'pro',
    pointsLimit: getPointsLimit(),
  };
}

// ============================================================================
// PRESET EXPORT OPTIONS
// ============================================================================

export const PRESET_EXPORT_OPTIONS: Record<string, ExportOptions> = {
  // CSV presets
  csvLast24h: {
    format: 'csv',
    timeRange: '24h',
    includeInsights: false,
  },
  csvLast7d: {
    format: 'csv',
    timeRange: '7d',
    includeInsights: false,
  },
  csvAll: {
    format: 'csv',
    timeRange: 'all',
    includeInsights: false,
  },

  // PDF presets (PRO only)
  pdfReport24h: {
    format: 'pdf',
    timeRange: '24h',
    includeInsights: true,
  },
  pdfReport7d: {
    format: 'pdf',
    timeRange: '7d',
    includeInsights: true,
  },
  pdfReportAll: {
    format: 'pdf',
    timeRange: 'all',
    includeInsights: true,
  },
};

// ============================================================================
// HELPER: Format time range label
// ============================================================================

export function formatTimeRangeLabel(range: TimeRange): string {
  const labels: Record<TimeRange, string> = {
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    'all': 'All Time',
  };
  return labels[range];
}

// ============================================================================
// HELPER: Format file size estimate
// ============================================================================

export function estimateFileSize(
  pointsCount: number,
  format: ExportFormat
): string {
  // Estimación aproximada
  const bytesPerPoint = format === 'csv' ? 150 : 50; // CSV más verboso, PDF comprimido
  const totalBytes = pointsCount * bytesPerPoint;

  if (totalBytes < 1024) return `${totalBytes} B`;
  if (totalBytes < 1024 * 1024) return `${(totalBytes / 1024).toFixed(1)} KB`;
  return `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
}