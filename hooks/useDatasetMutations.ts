/**
 * useDatasetMutations.ts
 * 
 * MISIÓN:
 * Centralizar todas las operaciones de mutación (escritura) de datasets usando React Query.
 * Proporciona métodos optimizados para crear, actualizar, eliminar y archivar datasets
 * con manejo automático de caché, optimistic updates y sincronización con el backend.
 * 
 * PROPÓSITO:
 * - Separar la lógica de mutación del hook de lectura (useDatasets)
 * - Proveer feedback inmediato al usuario con optimistic updates
 * - Invalidar y refrescar automáticamente el cache de datasets tras cada operación
 * - Manejar límites del plan FREE (1 dataset) vs PRO (ilimitado)
 * - Mostrar toasts de éxito/error consistentes
 * 
 * ENDPOINTS API QUE USA:
 * - POST   /api/datasets              → Crear nuevo dataset
 * - PATCH  /api/datasets/[id]         → Actualizar dataset (nombre, descripción, status)
 * - DELETE /api/datasets/[id]         → Eliminar dataset permanentemente
 * - PATCH  /api/datasets/[id]         → Archivar dataset (status: 'archived')
 * 
 * DATOS PRISMA INVOLUCRADOS:
 * - Modelo: Dataset
 * - Campos críticos: id, userId, name, status, source, mqttBroker, mqttTopic, etc.
 * - Relaciones: user, dataPoints, insights, alerts, layers
 * 
 * USO EN COMPONENTE:
 * const { createDataset, updateDataset, deleteDataset, archiveDataset } = useDatasetMutations();
 * 
 * // Crear dataset MQTT
 * createDataset.mutate({
 *   name: 'Sensors A',
 *   source: 'mqtt_stream',
 *   mqttBroker: 'mqtt://broker.hivemq.com:1883',
 *   mqttTopic: 'factory/sensors/#'
 * });
 * 
 * // Eliminar dataset con confirmación
 * if (confirm('¿Seguro?')) {
 *   deleteDataset.mutate(datasetId);
 * }
 * 
 * // Acciones bulk (selección múltiple)
 * bulkArchive.mutate(['id1', 'id2', 'id3']);
 * 
 * VALIDACIONES REQUERIDAS:
 * - Verificar límites del usuario (useSession) antes de crear
 * - Validar que source tenga su config correspondiente (MQTT → broker + topic)
 * - No permitir eliminar datasets con status 'live' (primero pausar)
 * 
 * ESTADOS A RETORNAR:
 * {
 *   createDataset: { mutate, mutateAsync, isLoading, isSuccess, error },
 *   updateDataset: { mutate, mutateAsync, isLoading, isSuccess, error },
 *   deleteDataset: { mutate, mutateAsync, isLoading, isSuccess, error },
 *   archiveDataset: { mutate, mutateAsync, isLoading, isSuccess, error },
 *   bulkArchive: { mutate, mutateAsync, isLoading, isSuccess, error },
 *   bulkDelete: { mutate, mutateAsync, isLoading, isSuccess, error }
 * }
 * 
 * OPTIMISTIC UPDATES:
 * Al crear: añadir dataset temporal al cache con status 'processing'
 * Al eliminar: remover inmediatamente del cache
 * Al archivar: actualizar status a 'archived' antes de confirmar
 * 
 * INVALIDACIONES:
 * - Siempre invalidar ['datasets'] tras cualquier mutación
 * - Invalidar ['session'] tras crear/eliminar (actualiza contadores de límites)
 * - Invalidar ['dataset', id] si se actualiza un dataset específico
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dataset } from '@/types/Datasets';

/**
 * Dataset Status
 */
export type DatasetStatus = 'processing' | 'active' | 'idle' | 'error' | 'archived';

/**
 * Dataset Source
 */
export type DatasetSource = 'csv_upload' | 'json_upload' | 'mqtt_stream' | 'webhook' | 'api';

/**
 * Bounding Box
 */
export interface BoundingBox {
  min: { x: number; y: number; z: number };
  max: { x: number; y: number; z: number };
}



/**
 * Create Dataset Input
 */
export interface CreateDatasetInput {
  name: string;
  description?: string;
  source: Extract<DatasetSource, 'mqtt_stream' | 'webhook' | 'api'>;
  
  // MQTT fields
  mqttBroker?: string;
  mqttTopic?: string;
  mqttUsername?: string;
  mqttPassword?: string;
  
  // Webhook fields
  webhookSecret?: string;
  
  // API fields
  apiEndpoint?: string;
  apiMethod?: 'GET' | 'POST';
  apiHeaders?: Record<string, string>;
  pollInterval?: number;
}

/**
 * Update Dataset Input
 */
export interface UpdateDatasetInput {
  id: string;
  name?: string;
  description?: string;
  status?: Extract<DatasetStatus, 'active' | 'idle' | 'error' | 'archived'>;
  alertsEnabled?: boolean;
  alertThresholds?: Record<string, unknown>;
  boundingBox?: BoundingBox;
}

/**
 * Bulk Operation Input
 */
export interface BulkOperationInput {
  datasetIds: string[];
}

/**
 * Datasets Query Response
 */
interface DatasetsQueryResponse {
  datasets: Dataset[];
}

/**
 * Mutation Context for Create
 */
interface CreateDatasetContext {
  previousDatasets?: DatasetsQueryResponse;
}

/**
 * Mutation Context for Update
 */
interface UpdateDatasetContext {
  previousDatasets?: DatasetsQueryResponse;
  previousDataset?: Dataset;
}

/**
 * Mutation Context for Delete/Archive
 */
interface DatasetContext {
  previousDatasets?: DatasetsQueryResponse;
}

/**
 * API Error Response
 */
interface ApiErrorResponse {
  error?: string;
  message?: string;
}

/**
 * Hook Return Type
 */
export interface UseDatasetMutationsReturn {
  createDataset: UseMutationResult<Dataset, Error, CreateDatasetInput, CreateDatasetContext>;
  updateDataset: UseMutationResult<Dataset, Error, UpdateDatasetInput, UpdateDatasetContext>;
  deleteDataset: UseMutationResult<void, Error, string, DatasetContext>;
  archiveDataset: UseMutationResult<Dataset, Error, string, DatasetContext>;
  bulkArchive: UseMutationResult<void, Error, BulkOperationInput, unknown>;
  bulkDelete: UseMutationResult<void, Error, BulkOperationInput, unknown>;
}

/**
 * useDatasetMutations Hook
 * 
 * Centraliza todas las operaciones de mutación de datasets con
 * optimistic updates, invalidación de caché y manejo de errores.
 */
export function useDatasetMutations(): UseDatasetMutationsReturn {
  const queryClient = useQueryClient();
  const router = useRouter();

  /**
   * CREATE DATASET
   */
  const createDataset = useMutation<Dataset, Error, CreateDatasetInput, CreateDatasetContext>({
    mutationFn: async (input: CreateDatasetInput): Promise<Dataset> => {
      // Validaciones previas
      if (!input.name || input.name.trim().length === 0) {
        throw new Error('Dataset name is required');
      }

      // Validar configuración específica del source
      if (input.source === 'mqtt_stream') {
        if (!input.mqttBroker || !input.mqttTopic) {
          throw new Error('MQTT broker and topic are required');
        }
      }

      if (input.source === 'api') {
        if (!input.apiEndpoint) {
          throw new Error('API endpoint is required');
        }
      }

      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const error: ApiErrorResponse = await response.json();
        throw new Error(error.error || error.message || 'Failed to create dataset');
      }

      return response.json();
    },
    onMutate: async (newDataset): Promise<CreateDatasetContext> => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['datasets'] });

      // Snapshot previous value
      const previousDatasets = queryClient.getQueryData<DatasetsQueryResponse>(['datasets']);

      // Optimistic update: añadir dataset temporal
      if (previousDatasets) {
        const optimisticDataset: Dataset = {
  id: `temp-${Date.now()}`,
  userId: 'current-user',
  name: newDataset.name,
  description: newDataset.description,
  status: 'processing',
  source: newDataset.source,
  mqttBroker: newDataset.mqttBroker,
  mqttTopic: newDataset.mqttTopic,
  mqttUsername: newDataset.mqttUsername,
  // mqttPassword: // si tienes el dato, inclúyelo
  webhookUrl: newDataset.source === 'webhook' ? '/api/webhooks/dataset/pending' : undefined,
  // webhookSecret: // si lo usas,
  apiEndpoint: newDataset.apiEndpoint,
  // boundingBox: // si aplica (opcional)
  totalDataPoints: 0,
  dataPointsToday: 0,
  // lastDataReceived: // opcional
  // avgUpdateFreq: // opcional
  alertsEnabled: false,
  // alertThresholds: // si aplica
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  health: 100, // valor inicial por defecto, ajústalo si tienes otra lógica
  trend: 'neutral', // valor por defecto, o puede ser 'up'/'down'/'neutral' según tu lógica
  trendPercent: 0, // valor inicial por defecto
  activeAlertsCount: 0, // valor inicial por defecto
  // dataPoints, insights, alerts, layers: // si las necesitas
        };


        queryClient.setQueryData<DatasetsQueryResponse>(['datasets'], {
          ...previousDatasets,
          datasets: [optimisticDataset, ...previousDatasets.datasets],
        });
      }

      return { previousDatasets };
    },
    onSuccess: (data: Dataset): void => {
      toast.success('Dataset created successfully!', {
        description: `${data.name} is now ${data.status}`,
      });

      // Invalidar queries
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      
      // Redirigir al dataset creado
      setTimeout(() => {
        router.push(`/datasets/${data.id}`);
      }, 500);
    },
    onError: (error: Error, _newDataset: CreateDatasetInput, context?: CreateDatasetContext): void => {
      // Rollback optimistic update
      if (context?.previousDatasets) {
        queryClient.setQueryData(['datasets'], context.previousDatasets);
      }

      toast.error('Failed to create dataset', {
        description: error.message,
      });
    },
  });

  /**
   * UPDATE DATASET
   */
  const updateDataset = useMutation<Dataset, Error, UpdateDatasetInput, UpdateDatasetContext>({
    mutationFn: async (input: UpdateDatasetInput): Promise<Dataset> => {
      const { id, ...updateData } = input;

      const response = await fetch(`/api/datasets/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error: ApiErrorResponse = await response.json();
        throw new Error(error.error || 'Failed to update dataset');
      }

      return response.json();
    },
    onMutate: async (updatedDataset: UpdateDatasetInput): Promise<UpdateDatasetContext> => {
      await queryClient.cancelQueries({ queryKey: ['datasets'] });
      await queryClient.cancelQueries({ queryKey: ['dataset', updatedDataset.id] });

      const previousDatasets = queryClient.getQueryData<DatasetsQueryResponse>(['datasets']);
      const previousDataset = queryClient.getQueryData<Dataset>(['dataset', updatedDataset.id]);

      // Optimistic update en lista
      if (previousDatasets) {
        queryClient.setQueryData<DatasetsQueryResponse>(['datasets'], {
          ...previousDatasets,
          datasets: previousDatasets.datasets.map((ds: Dataset) =>
            ds.id === updatedDataset.id
              ? { ...ds, ...updatedDataset, updatedAt: new Date().toISOString() }
              : ds
          ),
        });
      }

      // Optimistic update en detalle
      if (previousDataset) {
        queryClient.setQueryData<Dataset>(['dataset', updatedDataset.id], {
          ...previousDataset,
          ...updatedDataset,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousDatasets, previousDataset };
    },
    onSuccess: (data: Dataset): void => {
      toast.success('Dataset updated successfully');
      
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset', data.id] });
    },
    onError: (error: Error, updatedDataset: UpdateDatasetInput, context?: UpdateDatasetContext): void => {
      if (context?.previousDatasets) {
        queryClient.setQueryData(['datasets'], context.previousDatasets);
      }
      if (context?.previousDataset) {
        queryClient.setQueryData(['dataset', updatedDataset.id], context.previousDataset);
      }

      toast.error('Failed to update dataset', {
        description: error.message,
      });
    },
  });

  /**
   * DELETE DATASET
   */
  const deleteDataset = useMutation<void, Error, string, DatasetContext>({
    mutationFn: async (datasetId: string): Promise<void> => {
      const response = await fetch(`/api/datasets/${datasetId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error: ApiErrorResponse = await response.json();
        throw new Error(error.error || 'Failed to delete dataset');
      }

      return response.json();
    },
    onMutate: async (datasetId: string): Promise<DatasetContext> => {
      await queryClient.cancelQueries({ queryKey: ['datasets'] });

      const previousDatasets = queryClient.getQueryData<DatasetsQueryResponse>(['datasets']);

      // Optimistic update: remover del cache
      if (previousDatasets) {
        queryClient.setQueryData<DatasetsQueryResponse>(['datasets'], {
          ...previousDatasets,
          datasets: previousDatasets.datasets.filter((ds: Dataset) => ds.id !== datasetId),
        });
      }

      return { previousDatasets };
    },
    onSuccess: (): void => {
      toast.success('Dataset deleted successfully');
      
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
      
      // Redirigir a /datasets si estamos en la página del dataset
      router.push('/datasets');
    },
    onError: (error: Error, _datasetId: string, context?: DatasetContext): void => {
      if (context?.previousDatasets) {
        queryClient.setQueryData(['datasets'], context.previousDatasets);
      }

      toast.error('Failed to delete dataset', {
        description: error.message,
      });
    },
  });

  /**
   * ARCHIVE DATASET
   */
  const archiveDataset = useMutation<Dataset, Error, string, DatasetContext>({
    mutationFn: async (datasetId: string): Promise<Dataset> => {
      const response = await fetch(`/api/datasets/${datasetId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'archived' }),
      });

      if (!response.ok) {
        const error: ApiErrorResponse = await response.json();
        throw new Error(error.error || 'Failed to archive dataset');
      }

      return response.json();
    },
    onMutate: async (datasetId: string): Promise<DatasetContext> => {
      await queryClient.cancelQueries({ queryKey: ['datasets'] });

      const previousDatasets = queryClient.getQueryData<DatasetsQueryResponse>(['datasets']);

      // Optimistic update: cambiar status a archived
      if (previousDatasets) {
        queryClient.setQueryData<DatasetsQueryResponse>(['datasets'], {
          ...previousDatasets,
          datasets: previousDatasets.datasets.map((ds: Dataset) =>
            ds.id === datasetId
              ? { ...ds, status: 'archived' as const, updatedAt: new Date().toISOString() }
              : ds
          ),
        });
      }

      return { previousDatasets };
    },
    onSuccess: (data: Dataset): void => {
      toast.success('Dataset archived successfully');
      
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset', data.id] });
    },
    onError: (error: Error, _datasetId: string, context?: DatasetContext): void => {
      if (context?.previousDatasets) {
        queryClient.setQueryData(['datasets'], context.previousDatasets);
      }

      toast.error('Failed to archive dataset', {
        description: error.message,
      });
    },
  });

  /**
   * BULK ARCHIVE
   */
  const bulkArchive = useMutation<void, Error, BulkOperationInput>({
    mutationFn: async ({ datasetIds }: BulkOperationInput): Promise<void> => {
      const results = await Promise.allSettled(
        datasetIds.map((id: string) =>
          fetch(`/api/datasets/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'archived' }),
          })
        )
      );

      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        throw new Error(`Failed to archive ${failed.length} datasets`);
      }
    },
    onSuccess: (_data: void, { datasetIds }: BulkOperationInput): void => {
      toast.success(`${datasetIds.length} datasets archived successfully`);
      
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
    onError: (error: Error): void => {
      toast.error('Bulk archive failed', {
        description: error.message,
      });
    },
  });

  /**
   * BULK DELETE
   */
  const bulkDelete = useMutation<void, Error, BulkOperationInput>({
    mutationFn: async ({ datasetIds }: BulkOperationInput): Promise<void> => {
      const results = await Promise.allSettled(
        datasetIds.map((id: string) =>
          fetch(`/api/datasets/${id}`, {
            method: 'DELETE',
          })
        )
      );

      const failed = results.filter((r) => r.status === 'rejected');
      if (failed.length > 0) {
        throw new Error(`Failed to delete ${failed.length} datasets`);
      }
    },
    onSuccess: (_data: void, { datasetIds }: BulkOperationInput): void => {
      toast.success(`${datasetIds.length} datasets deleted successfully`);
      
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['session'] });
    },
    onError: (error: Error): void => {
      toast.error('Bulk delete failed', {
        description: error.message,
      });
    },
  });

  return {
    createDataset,
    updateDataset,
    deleteDataset,
    archiveDataset,
    bulkArchive,
    bulkDelete,
  };
}