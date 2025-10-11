/**
 * useUploadFile.ts
 * 
 * MISIÓN:
 * Manejar la carga de archivos CSV/JSON/Excel con validación previa, preview de datos,
 * y creación automática de dataset. Soporta drag & drop y progress tracking.
 * 
 * PROPÓSITO:
 * - Validar formato y tamaño de archivo antes de subir
 * - Parsear CSV/JSON en el cliente para mostrar preview
 * - Detectar automáticamente headers y tipos de datos
 * - Mostrar barra de progreso durante upload
 * - Crear dataset con source 'csv_upload' o 'json_upload'
 * 
 * ENDPOINT API QUE USA:
 * - POST /api/datasets/upload → Multipart form-data con archivo
 * 
 * PAYLOAD ENVIADO:
 * FormData {
 *   file: File,                  // Archivo binario
 *   name: string,                // Nombre del dataset
 *   description?: string,        // Opcional
 *   hasHeaders: boolean,         // Si primera fila son headers
 *   delimiter?: string,          // Para CSV: ',' | ';' | '\t'
 *   encoding?: string            // 'utf-8' | 'latin1'
 * }
 * 
 * RESPUESTA API:
 * {
 *   dataset: Dataset,            // Dataset creado
 *   stats: {
 *     rowsProcessed: number,
 *     dataPointsCreated: number,
 *     errors: number,
 *     warnings: string[]
 *   }
 * }
 * 
 * DATOS PRISMA INVOLUCRADOS:
 * - Modelo: Dataset (se crea con source: 'csv_upload' o 'json_upload')
 * - Modelo: DataPoint (se crean N puntos según filas del archivo)
 * - Campos críticos: x, y, z, value, timestamp, metadata
 * 
 * USO EN COMPONENTE:
 * const { 
 *   uploadFile, 
 *   isUploading, 
 *   progress,
 *   previewData,
 *   validateFile 
 * } = useUploadFile();
 * 
 * // Drag & drop zone
 * <div
 *   onDrop={(e) => {
 *     e.preventDefault();
 *     const file = e.dataTransfer.files[0];
 *     const validation = validateFile(file);
 *     if (validation.valid) {
 *       uploadFile(file, { name: 'My Dataset' });
 *     }
 *   }}
 * >
 *   Drop CSV here
 * </div>
 * 
 * // Input manual
 * <input
 *   type="file"
 *   accept=".csv,.json,.xlsx"
 *   onChange={(e) => {
 *     const file = e.target.files[0];
 *     uploadFile(file, { name: 'My Dataset' });
 *   }}
 * />
 * 
 * // Progress bar
 * {isUploading && (
 *   <div className="progress-bar" style={{ width: `${progress}%` }} />
 * )}
 * 
 * // Preview antes de confirmar (opcional)
 * {previewData && (
 *   <table>
 *     {previewData.slice(0, 5).map(row => (
 *       <tr>{Object.values(row).map(val => <td>{val}</td>)}</tr>
 *     ))}
 *   </table>
 * )}
 * 
 * ESTADOS A RETORNAR:
 * {
 *   uploadFile: (file: File, options: UploadOptions) => Promise<Dataset>,
 *   isUploading: boolean,
 *   progress: number,            // 0-100
 *   error: string | null,
 *   
 *   previewData: any[] | null,   // Primeras 10 filas parseadas
 *   detectedHeaders: string[],   // Headers detectados del CSV
 *   detectedFormat: 'csv' | 'json' | 'xlsx',
 *   
 *   validateFile: (file: File) => { valid: boolean; error?: string },
 *   cancelUpload: () => void,
 *   clearPreview: () => void
 * }
 * 
 * VALIDACIONES:
 * - Extensión: .csv, .json, .xlsx solamente
 * - Tamaño máximo: 100MB (FREE), 500MB (PRO)
 * - CSV: detectar delimiter automático (, ; \t)
 * - JSON: validar estructura (debe ser array de objetos)
 * - Excel: convertir a JSON primero
 * 
 * PARSEO CSV (usar Papaparse):
 * Papa.parse(file, {
 *   header: true,
 *   dynamicTyping: true,
 *   skipEmptyLines: true,
 *   preview: 10,  // Solo primeras 10 para preview
 *   complete: (results) => setPreviewData(results.data)
 * });
 * 
 * PROGRESS TRACKING:
 * - Usar XMLHttpRequest con evento onprogress
 * - O axios con onUploadProgress callback
 * 
 * INTEGRACIÓN CON useDatasetMutations:
 * - Tras upload exitoso, invalidar cache ['datasets']
 * - Añadir dataset al cache optimísticamente
 * - Redirigir a /datasets/[id] tras éxito
 */

import { useState, useCallback, useRef } from 'react';
import Papa from 'papaparse';
import { useRouter } from 'next/navigation';

/**
 * Upload Options
 */
interface UploadOptions {
  name: string;
  description?: string;
  hasHeaders?: boolean;
  delimiter?: ',' | ';' | '\t';
  encoding?: 'utf-8' | 'latin1';
}

/**
 * Dataset Type (from API response)
 */
interface Dataset {
  id: string;
  name: string;
  description?: string;
  source: string;
  status: string;
  totalDataPoints: number;
  boundingBox?: any;
  createdAt: string;
  updatedAt: string;
}

/**
 * API Response Structure
 */
interface UploadResponse {
  id: string;
  name: string;
  description?: string;
  source: string;
  status: string;
  totalDataPoints: number;
  boundingBox?: any;
  message?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Validation Result
 */
interface ValidationResult {
  valid: boolean;
  error?: string;
  fileSize?: number;
  fileType?: string;
}

/**
 * Preview Data Row
 */
type PreviewDataRow = Record<string, any>;

/**
 * Hook Return Type
 */
interface UseUploadFileReturn {
  uploadFile: (file: File, options: UploadOptions) => Promise<Dataset | null>;
  isUploading: boolean;
  progress: number;
  error: string | null;
  
  previewData: PreviewDataRow[] | null;
  detectedHeaders: string[];
  detectedFormat: 'csv' | 'json' | 'xlsx' | null;
  
  validateFile: (file: File) => ValidationResult;
  cancelUpload: () => void;
  clearPreview: () => void;
  loadPreview: (file: File) => Promise<void>;
}

// Constants
const MAX_FILE_SIZE_FREE = 100 * 1024 * 1024; // 100MB
const MAX_FILE_SIZE_PRO = 500 * 1024 * 1024; // 500MB
const PREVIEW_ROWS = 10;

const ALLOWED_EXTENSIONS = ['.csv', '.json', '.xlsx', '.xls'];
const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/json',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel'
];

/**
 * useUploadFile Hook
 * 
 * Maneja la carga de archivos CSV/JSON/Excel con validación previa,
 * preview de datos y progress tracking.
 */
export function useUploadFile(): UseUploadFileReturn {
  const router = useRouter();
  
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const [previewData, setPreviewData] = useState<PreviewDataRow[] | null>(null);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [detectedFormat, setDetectedFormat] = useState<'csv' | 'json' | 'xlsx' | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  /**
   * Detecta el formato del archivo
   */
  const detectFileFormat = useCallback((file: File): 'csv' | 'json' | 'xlsx' | null => {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.csv')) return 'csv';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return 'xlsx';
    
    // Fallback a MIME type
    if (file.type === 'text/csv') return 'csv';
    if (file.type === 'application/json') return 'json';
    if (file.type.includes('spreadsheet')) return 'xlsx';
    
    return null;
  }, []);

  /**
   * Valida el archivo antes de subir
   */
  const validateFile = useCallback((file: File): ValidationResult => {
    // Validar que existe
    if (!file) {
      return { valid: false, error: 'No file provided' };
    }

    // Validar extensión
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
      return {
        valid: false,
        error: `Invalid file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
      };
    }

    // Validar MIME type
    const hasValidMimeType = ALLOWED_MIME_TYPES.some(mime => 
      file.type === mime || file.type.includes(mime.split('/')[1])
    );
    
    if (!hasValidMimeType && file.type !== '') {
      return {
        valid: false,
        error: 'Invalid file type detected'
      };
    }

    // Validar tamaño (usar límite PRO por defecto, el servidor validará el real)
    if (file.size > MAX_FILE_SIZE_PRO) {
      const maxSizeMB = MAX_FILE_SIZE_PRO / (1024 * 1024);
      return {
        valid: false,
        error: `File too large. Maximum size: ${maxSizeMB}MB`,
        fileSize: file.size
      };
    }

    // Validar tamaño mínimo (1KB)
    if (file.size < 1024) {
      return {
        valid: false,
        error: 'File too small. Must be at least 1KB'
      };
    }

    return {
      valid: true,
      fileSize: file.size,
      fileType: detectFileFormat(file) || undefined
    };
  }, [detectFileFormat]);

  /**
   * Parsea CSV y genera preview
   */
  const parseCSVPreview = useCallback((file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        preview: PREVIEW_ROWS,
        transformHeader: (header: string) => header.trim(),
        complete: (results: Papa.ParseResult<any>) => {
          if (results.errors.length > 0) {
            console.warn('[CSV Parse] Warnings:', results.errors);
          }

          setPreviewData(results.data);
          
          if (results.meta.fields) {
            setDetectedHeaders(results.meta.fields);
          }
          
          resolve();
        },
        error: (error: any) => {
          reject(new Error(`CSV parse error: ${error.message}`));
        }
      });
    });
  }, []);

  /**
   * Parsea JSON y genera preview
   */
  const parseJSONPreview = useCallback(async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of objects');
      }

      if (data.length === 0) {
        throw new Error('JSON array is empty');
      }

      // Preview primeros N elementos
      const preview = data.slice(0, PREVIEW_ROWS);
      setPreviewData(preview);

      // Detectar headers del primer objeto
      const headers = Object.keys(data[0]);
      setDetectedHeaders(headers);

    } catch (err) {
      throw new Error(`JSON parse error: ${err instanceof Error ? err.message : 'Invalid JSON'}`);
    }
  }, []);

  /**
   * Carga preview del archivo (sin subir)
   */
  const loadPreview = useCallback(async (file: File): Promise<void> => {
    setError(null);
    setPreviewData(null);
    setDetectedHeaders([]);

    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      throw new Error(validation.error);
    }

    const format = detectFileFormat(file);
    setDetectedFormat(format);

    try {
      if (format === 'csv') {
        await parseCSVPreview(file);
      } else if (format === 'json') {
        await parseJSONPreview(file);
      } else if (format === 'xlsx') {
        // Excel requiere librería adicional (xlsx/sheetjs)
        setError('Excel preview not implemented. Upload to process.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse file';
      setError(errorMessage);
      throw err;
    }
  }, [validateFile, detectFileFormat, parseCSVPreview, parseJSONPreview]);

  /**
   * Sube el archivo al servidor con progress tracking
   */
  const uploadFile = useCallback(async (
    file: File,
    options: UploadOptions
  ): Promise<Dataset | null> => {
    // Validar archivo
    const validation = validateFile(file);
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      return null;
    }

    // Validar nombre del dataset
    if (!options.name || options.name.trim().length === 0) {
      setError('Dataset name is required');
      return null;
    }

    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Crear FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', options.name.trim());
      
      if (options.description) {
        formData.append('description', options.description.trim());
      }

      // Upload con XMLHttpRequest para progress tracking
      const result = await uploadWithProgress(formData);

      // Redirect a la página del dataset
      if (result?.id) {
        setTimeout(() => {
          router.push(`/datasets/${result.id}`);
        }, 500);
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  }, [validateFile, router]);

  /**
   * Upload con XMLHttpRequest para progress tracking
   */
  const uploadWithProgress = useCallback((formData: FormData): Promise<Dataset> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      // Progress event
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setProgress(percentComplete);
        }
      });

      // Success
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response: UploadResponse = JSON.parse(xhr.responseText);
            resolve(response as Dataset);
          } catch (err) {
            reject(new Error('Invalid response from server'));
          }
        } else {
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            reject(new Error(errorResponse.error || errorResponse.message || 'Upload failed'));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      // Error
      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      // Abort
      xhr.addEventListener('abort', () => {
        reject(new Error('Upload cancelled'));
      });

      // Send request
      xhr.open('POST', '/api/datasets/upload');
      xhr.send(formData);
    });
  }, []);

  /**
   * Cancela el upload en progreso
   */
  const cancelUpload = useCallback(() => {
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsUploading(false);
    setProgress(0);
    setError('Upload cancelled');
  }, []);

  /**
   * Limpia el preview
   */
  const clearPreview = useCallback(() => {
    setPreviewData(null);
    setDetectedHeaders([]);
    setDetectedFormat(null);
    setError(null);
  }, []);

  return {
    uploadFile,
    isUploading,
    progress,
    error,
    
    previewData,
    detectedHeaders,
    detectedFormat,
    
    validateFile,
    cancelUpload,
    clearPreview,
    loadPreview,
  };
}