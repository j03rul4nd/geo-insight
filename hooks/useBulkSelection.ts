/**
 * useBulkSelection.ts
 * 
 * MISIÓN:
 * Gestionar la selección múltiple de filas en la tabla de datasets mediante
 * checkboxes individuales y "select all". Proporciona helpers para acciones bulk.
 * 
 * PROPÓSITO:
 * - Permitir operaciones en masa: archive, delete, export múltiples datasets
 * - Sincronizar checkbox "select all" con estado de selección individual
 * - Mantener selección persistente durante filtrado (opcional)
 * - Limpiar selección automáticamente tras operaciones bulk exitosas
 * 
 * 🆕 Ahora soporta filtrado por viewType: 'gis' | 'threejs'
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Dataset, ViewType } from '@/types/Datasets';

// ============================================
// TYPES
// ============================================

interface UseBulkSelectionOptions {
  /**
   * Limpiar selección cuando cambien los filtros
   * @default true
   */
  clearOnFilterChange?: boolean;
  
  /**
   * No permitir seleccionar datasets archivados
   * @default false
   */
  disableArchivedSelection?: boolean;
  
  /**
   * No permitir seleccionar datasets en processing
   * @default false
   */
  disableProcessingSelection?: boolean;
  
  /**
   * 🆕 Solo permitir seleccionar datasets de un tipo específico
   * Útil para operaciones bulk que solo aplican a GIS o ThreeJS
   * @default undefined (permite todos)
   */
  onlyViewType?: ViewType;
  
  /**
   * Callback cuando cambia la selección
   */
  onSelectionChange?: (selectedIds: string[]) => void;
}

interface UseBulkSelectionReturn {
  // Estado
  selectedIds: string[];
  selectedCount: number;
  isAllSelected: boolean;
  isSomeSelected: boolean;
  isNoneSelected: boolean;
  
  // 🆕 Información adicional sobre selección
  selectionStats: {
    gisCount: number;      // Cuántos GIS seleccionados
    threejsCount: number;  // Cuántos ThreeJS seleccionados
    hasMixedTypes: boolean; // Si hay mezcla de tipos
  };
  
  // Acciones
  toggleRow: (id: string) => void;
  toggleAll: (ids: string[]) => void;
  clearSelection: () => void;
  selectOnly: (ids: string[]) => void;
  isRowSelected: (id: string) => boolean;
  isRowDisabled: (dataset: Dataset) => boolean;
  
  // Utilities
  getSelectedDatasets: () => Dataset[];
  getSelectedByViewType: (viewType: ViewType) => Dataset[]; // 🆕
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Verificar si un dataset puede ser seleccionado
 */
const canSelectDataset = (
  dataset: Dataset,
  options: UseBulkSelectionOptions
): boolean => {
  // No seleccionar archived si está deshabilitado
  if (options.disableArchivedSelection && dataset.status === 'archived') {
    return false;
  }
  
  // No seleccionar processing si está deshabilitado
  if (options.disableProcessingSelection && dataset.status === 'processing') {
    return false;
  }
  
  // 🆕 Filtrar por viewType si está especificado
  if (options.onlyViewType && dataset.viewType !== options.onlyViewType) {
    return false;
  }
  
  return true;
};

/**
 * Filtrar IDs válidos para selección
 */
const filterSelectableIds = (
  ids: string[],
  datasets: Dataset[],
  options: UseBulkSelectionOptions
): string[] => {
  const datasetsMap = new Map(datasets.map(ds => [ds.id, ds]));
  
  return ids.filter(id => {
    const dataset = datasetsMap.get(id);
    return dataset && canSelectDataset(dataset, options);
  });
};

/**
 * 🆕 Calcular estadísticas de selección por tipo
 */
const calculateSelectionStats = (selectedDatasets: Dataset[]) => {
  const gisCount = selectedDatasets.filter(ds => ds.viewType === 'gis').length;
  const threejsCount = selectedDatasets.filter(ds => ds.viewType === 'threejs').length;
  const hasMixedTypes = gisCount > 0 && threejsCount > 0;
  
  return {
    gisCount,
    threejsCount,
    hasMixedTypes
  };
};

// ============================================
// MAIN HOOK
// ============================================

export function useBulkSelection(
  datasets: Dataset[],
  options: UseBulkSelectionOptions = {}
): UseBulkSelectionReturn {
  
  const {
    clearOnFilterChange = true,
    disableArchivedSelection = false,
    disableProcessingSelection = false,
    onlyViewType,
    onSelectionChange
  } = options;
  
  // ============================================
  // STATE
  // ============================================
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // ============================================
  // MEMOIZED VALUES
  // ============================================
  
  /**
   * IDs de datasets seleccionables (respetando restricciones)
   */
  const selectableIds = useMemo(() => {
    return datasets
      .filter(ds => canSelectDataset(ds, options))
      .map(ds => ds.id);
  }, [datasets, disableArchivedSelection, disableProcessingSelection, onlyViewType]);
  
  /**
   * Selección válida actual (filtrar IDs que ya no existen)
   */
  const validSelectedIds = useMemo(() => {
    const validIds = new Set(selectableIds);
    return selectedIds.filter(id => validIds.has(id));
  }, [selectedIds, selectableIds]);
  
  /**
   * Count de seleccionados
   */
  const selectedCount = validSelectedIds.length;
  
  /**
   * Flags de estado de selección
   */
  const isAllSelected = useMemo(() => {
    return selectableIds.length > 0 && 
           validSelectedIds.length === selectableIds.length;
  }, [validSelectedIds.length, selectableIds.length]);
  
  const isSomeSelected = useMemo(() => {
    return validSelectedIds.length > 0 && !isAllSelected;
  }, [validSelectedIds.length, isAllSelected]);
  
  const isNoneSelected = useMemo(() => {
    return validSelectedIds.length === 0;
  }, [validSelectedIds.length]);
  
  /**
   * 🆕 Datasets seleccionados completos (para calcular stats)
   */
  const selectedDatasets = useMemo(() => {
    const selectedSet = new Set(validSelectedIds);
    return datasets.filter(ds => selectedSet.has(ds.id));
  }, [datasets, validSelectedIds]);
  
  /**
   * 🆕 Estadísticas de selección por tipo
   */
  const selectionStats = useMemo(() => {
    return calculateSelectionStats(selectedDatasets);
  }, [selectedDatasets]);
  
  // ============================================
  // EFFECTS
  // ============================================
  
  /**
   * Limpiar selección inválida automáticamente
   */
  useEffect(() => {
    if (validSelectedIds.length !== selectedIds.length) {
      setSelectedIds(validSelectedIds);
    }
  }, [validSelectedIds, selectedIds.length]);
  
  /**
   * Callback cuando cambia la selección
   */
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(validSelectedIds);
    }
  }, [validSelectedIds, onSelectionChange]);
  
  /**
   * Limpiar selección cuando cambien los datasets (filtros)
   */
  useEffect(() => {
    if (clearOnFilterChange && validSelectedIds.length > 0) {
      // Solo limpiar si algún ID seleccionado ya no está en selectableIds
      const stillExists = validSelectedIds.every(id => 
        selectableIds.includes(id)
      );
      
      if (!stillExists) {
        setSelectedIds([]);
      }
    }
  }, [datasets.length, clearOnFilterChange]);
  
  // ============================================
  // ACTIONS
  // ============================================
  
  /**
   * Toggle selección de una fila individual
   */
  const toggleRow = useCallback((id: string) => {
    const dataset = datasets.find(ds => ds.id === id);
    
    // Verificar si puede ser seleccionado
    if (!dataset || !canSelectDataset(dataset, options)) {
      return;
    }
    
    setSelectedIds(prev => {
      const isSelected = prev.includes(id);
      
      if (isSelected) {
        // Deseleccionar
        return prev.filter(selectedId => selectedId !== id);
      } else {
        // Seleccionar
        return [...prev, id];
      }
    });
  }, [datasets, disableArchivedSelection, disableProcessingSelection, onlyViewType]);
  
  /**
   * Toggle all - Seleccionar/deseleccionar todos los IDs visibles
   */
  const toggleAll = useCallback((visibleIds: string[]) => {
    // Filtrar solo IDs seleccionables
    const selectableVisibleIds = filterSelectableIds(
      visibleIds, 
      datasets, 
      options
    );
    
    setSelectedIds(prev => {
      // Si todos los visibles están seleccionados → deseleccionar todos
      const allVisibleSelected = selectableVisibleIds.every(id => 
        prev.includes(id)
      );
      
      if (allVisibleSelected) {
        // Deseleccionar todos los visibles pero mantener otros seleccionados
        return prev.filter(id => !selectableVisibleIds.includes(id));
      } else {
        // Seleccionar todos los visibles (merge con selección actual)
        const newIds = new Set([...prev, ...selectableVisibleIds]);
        return Array.from(newIds);
      }
    });
  }, [datasets, disableArchivedSelection, disableProcessingSelection, onlyViewType]);
  
  /**
   * Limpiar toda la selección
   */
  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);
  
  /**
   * Reemplazar selección actual con nuevos IDs
   */
  const selectOnly = useCallback((ids: string[]) => {
    const selectableNewIds = filterSelectableIds(ids, datasets, options);
    setSelectedIds(selectableNewIds);
  }, [datasets, disableArchivedSelection, disableProcessingSelection, onlyViewType]);
  
  /**
   * Verificar si una fila está seleccionada
   */
  const isRowSelected = useCallback((id: string): boolean => {
    return validSelectedIds.includes(id);
  }, [validSelectedIds]);
  
  /**
   * Verificar si una fila está deshabilitada para selección
   */
  const isRowDisabled = useCallback((dataset: Dataset): boolean => {
    return !canSelectDataset(dataset, options);
  }, [disableArchivedSelection, disableProcessingSelection, onlyViewType]);
  
  /**
   * Obtener objetos completos de datasets seleccionados
   */
  const getSelectedDatasets = useCallback((): Dataset[] => {
    return selectedDatasets;
  }, [selectedDatasets]);
  
  /**
   * 🆕 Obtener datasets seleccionados filtrados por tipo
   */
  const getSelectedByViewType = useCallback((viewType: ViewType): Dataset[] => {
    return selectedDatasets.filter(ds => ds.viewType === viewType);
  }, [selectedDatasets]);
  
  // ============================================
  // RETURN
  // ============================================
  
  return {
    // Estado
    selectedIds: validSelectedIds,
    selectedCount,
    isAllSelected,
    isSomeSelected,
    isNoneSelected,
    
    // 🆕 Stats
    selectionStats,
    
    // Acciones
    toggleRow,
    toggleAll,
    clearSelection,
    selectOnly,
    isRowSelected,
    isRowDisabled,
    
    // Utilities
    getSelectedDatasets,
    getSelectedByViewType // 🆕
  };
}

// ============================================
// EXPORT TYPES
// ============================================

export type {
  UseBulkSelectionOptions,
  UseBulkSelectionReturn
};