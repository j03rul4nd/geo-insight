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
 * DATOS PRISMA INVOLUCRADOS:
 * - Modelo: Dataset
 * - Solo IDs, no carga datos completos
 * - Se usa con useDatasetMutations para acciones bulk
 * 
 * USO EN COMPONENTE:
 * const { 
 *   selectedIds, 
 *   toggleRow, 
 *   toggleAll, 
 *   clearSelection,
 *   getSelectedDatasets 
 * } = useBulkSelection(datasets);
 * 
 * // Checkbox en header (select all)
 * <input
 *   type="checkbox"
 *   checked={isAllSelected}
 *   indeterminate={isSomeSelected && !isAllSelected}
 *   onChange={(e) => toggleAll(e.target.checked ? datasets.map(d => d.id) : [])}
 * />
 * 
 * // Checkbox individual en cada fila
 * <input
 *   type="checkbox"
 *   checked={selectedIds.includes(dataset.id)}
 *   onChange={() => toggleRow(dataset.id)}
 * />
 * 
 * // Botón de acciones bulk (solo visible si hay selección)
 * {selectedCount > 0 && (
 *   <button onClick={() => handleBulkArchive(selectedIds)}>
 *     Archive ({selectedCount})
 *   </button>
 * )}
 * 
 * // Después de operación bulk exitosa
 * onSuccess: () => {
 *   clearSelection();
 *   toast.success(`${selectedCount} datasets archived`);
 * }
 * 
 * ESTADOS A RETORNAR:
 * {
 *   selectedIds: string[],
 *   selectedCount: number,
 *   isAllSelected: boolean,      // Todos los visibles están seleccionados
 *   isSomeSelected: boolean,     // Algunos (pero no todos) están seleccionados
 *   isNoneSelected: boolean,     // Ninguno seleccionado
 *   
 *   toggleRow: (id: string) => void,
 *   toggleAll: (ids: string[]) => void,  // Pasar array de IDs visibles actuales
 *   clearSelection: () => void,
 *   selectOnly: (ids: string[]) => void, // Reemplazar selección actual
 *   
 *   getSelectedDatasets: () => Dataset[] // Retorna objetos completos de datasets seleccionados
 * }
 * 
 * LÓGICA DE TOGGLE ALL:
 * - Si isAllSelected → clearSelection()
 * - Si !isAllSelected → seleccionar todos los IDs pasados
 * - IMPORTANTE: toggleAll recibe array de datasets VISIBLES (post-filtrado)
 * 
 * COMPORTAMIENTO CON FILTROS:
 * Opción A (Recomendado): Limpiar selección al cambiar filtros
 * Opción B: Mantener selección pero mostrar "(2 of 5 hidden by filters)"
 * 
 * VALIDACIONES:
 * - No permitir seleccionar datasets con status 'archived' (opcional)
 * - No permitir seleccionar datasets en 'processing' (opcional)
 * 
 * INTEGRACIÓN CON MUTATIONS:
 * const { bulkArchive } = useDatasetMutations();
 * 
 * const handleArchiveSelected = () => {
 *   bulkArchive.mutate(selectedIds, {
 *     onSuccess: () => {
 *       clearSelection();
 *       toast.success(`${selectedCount} datasets archived`);
 *     }
 *   });
 * };
 */

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
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Dataset } from '@/types/Datasets';


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
  
  // Acciones
  toggleRow: (id: string) => void;
  toggleAll: (ids: string[]) => void;
  clearSelection: () => void;
  selectOnly: (ids: string[]) => void;
  isRowSelected: (id: string) => boolean;
  isRowDisabled: (dataset: Dataset) => boolean;
  
  // Utilities
  getSelectedDatasets: () => Dataset[];
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
  }, [datasets, disableArchivedSelection, disableProcessingSelection]);
  
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
  }, [datasets.length, clearOnFilterChange]); // Trigger cuando cambia el length
  
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
  }, [datasets, disableArchivedSelection, disableProcessingSelection]);
  
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
  }, [datasets, disableArchivedSelection, disableProcessingSelection]);
  
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
  }, [datasets, disableArchivedSelection, disableProcessingSelection]);
  
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
  }, [disableArchivedSelection, disableProcessingSelection]);
  
  /**
   * Obtener objetos completos de datasets seleccionados
   */
  const getSelectedDatasets = useCallback((): Dataset[] => {
    const selectedSet = new Set(validSelectedIds);
    return datasets.filter(ds => selectedSet.has(ds.id));
  }, [datasets, validSelectedIds]);
  
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
    
    // Acciones
    toggleRow,
    toggleAll,
    clearSelection,
    selectOnly,
    isRowSelected,
    isRowDisabled,
    
    // Utilities
    getSelectedDatasets
  };
}

// ============================================
// EXPORT TYPES
// ============================================

export type {
  UseBulkSelectionOptions,
  UseBulkSelectionReturn
};