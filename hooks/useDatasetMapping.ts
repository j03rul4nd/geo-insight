/**
 * Hook para gestionar la configuración de mapping de un dataset
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { MappingConfig, validateMapping, detectMapping } from '@/lib/normalizePayload';

interface DatasetMapping extends MappingConfig {
  id: string;
  datasetId: string;
  metadata?: Record<string, any>;
  updatedAt: string;
}

interface UseDatasetMappingOptions {
  autoLoad?: boolean;
  onSuccess?: (mapping: DatasetMapping) => void;
  onError?: (error: string) => void;
}

export function useDatasetMapping(
  datasetId: string,
  options: UseDatasetMappingOptions = {}
) {
  const {
    autoLoad = true,
    onSuccess,
    onError,
  } = options;

  const [mapping, setMapping] = useState<DatasetMapping | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mantener una copia del último mapping guardado para detectar cambios
  const savedMappingRef = useRef<DatasetMapping | null>(null);

  /**
   * Carga la configuración de mapping desde la API
   */
  const loadMapping = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/datasets/${datasetId}/mapping`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to load mapping configuration');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      setMapping(data.mapping);
      savedMappingRef.current = data.mapping;
      
      if (onSuccess) {
        onSuccess(data.mapping);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load mapping';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      toast.error('Failed to load mapping configuration');
    } finally {
      setIsLoading(false);
    }
  }, [datasetId, onSuccess, onError]);

  /**
   * Guarda la configuración de mapping
   */
  const saveMapping = useCallback(async (
    updates?: Partial<MappingConfig>
  ): Promise<boolean> => {
    setIsSaving(true);
    setError(null);

    try {
      // Usar el mapping actual si no se pasan updates
      const dataToSave = updates ? { ...mapping, ...updates } as MappingConfig : mapping;
      
      if (!dataToSave) {
        throw new Error('No mapping data to save');
      }

      // Validar antes de guardar
      const validation = validateMapping(dataToSave);
      
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await fetch(`/api/datasets/${datasetId}/mapping`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const data = await response.json();
        
        // Manejar errores de validación de Zod
        if (data.details) {
          const zodErrors = data.details.map((d: any) => d.message).join(', ');
          throw new Error(zodErrors);
        }
        
        throw new Error(data.error || 'Failed to save mapping configuration');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      setMapping(data.mapping);
      savedMappingRef.current = data.mapping;
      toast.success('Mapping configuration saved');
      
      if (onSuccess) {
        onSuccess(data.mapping);
      }
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save mapping';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [datasetId, mapping, onSuccess, onError]);

  /**
   * Actualiza un campo específico del mapping (solo en estado local)
   */
  const updateField = useCallback((
    field: keyof MappingConfig,
    value: any
  ) => {
    setMapping((prev: DatasetMapping | null): DatasetMapping | null => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  }, []);

  /**
   * Detecta automáticamente el mapping basándose en un payload
   * @param samplePayload - Ejemplo de payload para analizar
   * @param applyImmediately - Si true, guarda automáticamente en la BD
   */
  const autoDetect = useCallback(async (
    samplePayload: any,
    applyImmediately: boolean = false
  ): Promise<Partial<MappingConfig> | null> => {
    try {

      // ✅ SI el payload tiene metadata.originalPayload, úsalo
    const rawPayload = samplePayload?.metadata?.originalPayload 
      ? samplePayload.metadata.originalPayload 
      : samplePayload;

    const response = await fetch(`/api/datasets/${datasetId}/mapping/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        payload: rawPayload,  // ✅ Enviar el payload RAW
        applyToDataset: applyImmediately 
      }),
    });


      

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.details || data.error || 'Auto-detection failed');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Auto-detection failed');
      }

      const detected = data.detected;
      
      // Aplicar detección al estado local
      setMapping((prev: DatasetMapping | null): DatasetMapping | null => {
        if (!prev) return prev;
        return { ...prev, ...detected };
      });
      
      if (applyImmediately) {
        // Si se aplicó en el servidor, actualizar también la referencia guardada
        savedMappingRef.current = { ...savedMappingRef.current, ...detected } as DatasetMapping;
        toast.success('Mapping detected and saved successfully!');
      } else {
        toast.success('Mapping detected! Review and save changes.');
      }
      
      return detected;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Auto-detection failed';
      toast.error(errorMessage);
      return null;
    }
  }, [datasetId]);

  /**
   * Resetea el mapping a valores por defecto (sin guardar)
   */
  const reset = useCallback(() => {
    setMapping((prev: DatasetMapping | null): DatasetMapping | null => {
      if (!prev) return prev;
      return {
        ...prev,
        valuePath: 'value',
        xPath: 'x',
        yPath: 'y',
        zPath: 'z',
        sensorIdPath: 'sensorId',
        sensorTypePath: 'sensorType',
        timestampPath: 'timestamp',
        unitPath: 'unit',
        transforms: undefined, // Cambiado de null a undefined
      };
    });
    toast.info('Mapping reset to defaults (not saved)');
  }, []);

  /**
   * Valida la configuración actual
   */
  const validate = useCallback((
    samplePayload?: any
  ) => {
    if (!mapping) {
      return { valid: false, errors: ['No mapping configuration loaded'] };
    }
    
    return validateMapping(mapping, samplePayload);
  }, [mapping]);

  /**
   * Verifica si hay cambios sin guardar
   */
  const hasUnsavedChanges = useCallback(() => {
    if (!mapping || !savedMappingRef.current) return false;
    
    // Comparar campos relevantes
    const current = mapping;
    const saved = savedMappingRef.current;
    
    return (
      current.valuePath !== saved.valuePath ||
      current.xPath !== saved.xPath ||
      current.yPath !== saved.yPath ||
      current.zPath !== saved.zPath ||
      current.sensorIdPath !== saved.sensorIdPath ||
      current.sensorTypePath !== saved.sensorTypePath ||
      current.timestampPath !== saved.timestampPath ||
      current.unitPath !== saved.unitPath ||
      JSON.stringify(current.transforms) !== JSON.stringify(saved.transforms) ||
      JSON.stringify(current.metadata) !== JSON.stringify(saved.metadata)
    );
  }, [mapping]);

  // Auto-cargar al montar
  useEffect(() => {
    if (autoLoad && datasetId) {
      loadMapping();
    }
  }, [autoLoad, datasetId, loadMapping]);

  return {
    // Estado
    mapping,
    isLoading,
    isSaving,
    error,
    
    // Acciones
    loadMapping,
    saveMapping,
    updateField,
    autoDetect,
    reset,
    validate,
    hasUnsavedChanges,
    
    // Estado derivado
    isReady: !isLoading && mapping !== null,
    hasError: error !== null,
  };
}