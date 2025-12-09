/**
 * useDatasetMutations.ts
 * 
 * MISIÓN:
 * Centralizar todas las operaciones de mutación (escritura) de datasets usando React Query.
 * Proporciona métodos optimizados para crear, actualizar, eliminar y archivar datasets
 * con manejo automático de caché, optimistic updates y sincronización con el backend.
 * 
 * 🆕 Ahora soporta viewType: 'gis' | 'threejs' para nuevos datasets
 */

import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Dataset, ViewType } from '@/types/Datasets';

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
  
  // 🆕 View type - define cómo se visualizan los datos
  viewType?: ViewType;
  
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
  
  // 🆕 Bounding box para ThreeJS (opcional)
  boundingBox?: BoundingBox;
}
/**
 * Alert Threshold Configuration
 */
export interface AlertThreshold {
  max?: number;
  min?: number;
}
/**
 * Update Dataset Input
 */
export interface UpdateDatasetInput {
  id: string;
  name?: string;
  description?: string;
  status?: Extract<DatasetStatus, 'active' | 'idle' | 'error' | 'archived'>;
  viewType?: ViewType; // 🆕 Permitir cambiar el tipo de visualización
  alertsEnabled?: boolean;
  alertThresholds?: Record<string, AlertThreshold>;
  boundingBox?: BoundingBox; // 🆕 Actualizar bounding box
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

      // 🆕 Validar viewType
      if (input.viewType && !['gis', 'threejs'].includes(input.viewType)) {
        throw new Error('viewType must be either "gis" or "threejs"');
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

      // 🆕 Validar boundingBox para ThreeJS (opcional pero recomendado)
      if (input.viewType === 'threejs' && input.boundingBox) {
        const { min, max } = input.boundingBox;
        if (min.x >= max.x || min.y >= max.y || min.z >= max.z) {
          throw new Error('Invalid bounding box: min values must be less than max values');
        }
      }

      const response = await fetch('/api/datasets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...input,
          viewType: input.viewType || 'gis' // Default a GIS
        }),
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
          viewType: newDataset.viewType || 'gis', // 🆕
          mqttBroker: newDataset.mqttBroker,
          mqttTopic: newDataset.mqttTopic,
          mqttUsername: newDataset.mqttUsername,
          webhookUrl: newDataset.source === 'webhook' ? '/api/webhooks/dataset/pending' : undefined,
          apiEndpoint: newDataset.apiEndpoint,
          boundingBox: newDataset.boundingBox, // 🆕
          totalDataPoints: 0,
          dataPointsToday: 0,
          alertsEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          health: 100,
          trend: 'neutral',
          trendPercent: 0,
          activeAlertsCount: 0,
        };

        queryClient.setQueryData<DatasetsQueryResponse>(['datasets'], {
          ...previousDatasets,
          datasets: [optimisticDataset, ...previousDatasets.datasets],
        });
      }

      return { previousDatasets };
    },
    onSuccess: (data: Dataset): void => {
      // 🆕 Mensaje personalizado según viewType
      const viewTypeLabel = data.viewType === 'threejs' ? '3D' : 'GIS';
      
      toast.success('Dataset created successfully!', {
        description: `${data.name} (${viewTypeLabel}) is now ${data.status}`,
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

      // 🆕 Validar viewType si se está actualizando
      if (updateData.viewType && !['gis', 'threejs'].includes(updateData.viewType)) {
        throw new Error('viewType must be either "gis" or "threejs"');
      }

      // 🆕 Validar boundingBox si se está actualizando
      if (updateData.boundingBox) {
        const { min, max } = updateData.boundingBox;
        if (min.x >= max.x || min.y >= max.y || min.z >= max.z) {
          throw new Error('Invalid bounding box: min values must be less than max values');
        }
      }

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
      // 🆕 Mensaje contextual si se cambió viewType
      const message = data.viewType 
        ? `Dataset updated successfully (now using ${data.viewType === 'threejs' ? '3D' : 'GIS'} view)`
        : 'Dataset updated successfully';
      
      toast.success(message);
      
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