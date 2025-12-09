/**
 * useDatasetFilters.ts
 * 
 * MISIÓN:
 * Gestionar todos los estados de filtrado, búsqueda y ordenamiento de la tabla
 * de datasets. Sincroniza filtros con URL params y localStorage para persistencia.
 * 
 * PROPÓSITO:
 * - Centralizar lógica de filtrado para mantener componente limpio
 * - Permitir compartir vistas filtradas vía URL (?status=error&sort=health&view=threejs)
 * - Guardar preferencias del usuario en localStorage
 * - Aplicar múltiples filtros simultáneos de forma eficiente
 * 
 * FILTROS DISPONIBLES:
 * 1. Status: 'all' | 'active' | 'idle' | 'error' | 'archived' | 'processing'
 * 2. ViewType: 'all' | 'gis' | 'threejs' 🆕
 * 3. Source: 'all' | 'csv_upload' | 'json_upload' | 'mqtt_stream' | 'webhook' | 'api'
 * 4. Search: búsqueda en name, source y description (case-insensitive)
 * 5. Sort: por 'name' | 'dataPoints' | 'lastUpdated' | 'health' | 'createdAt'
 * 6. Direction: 'asc' | 'desc'
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
import { Dataset, ViewType } from '@/types/Datasets';

// ============================================
// TYPES
// ============================================

type FilterStatus = 'all' | 'active' | 'idle' | 'error' | 'archived' | 'processing';
type FilterViewType = 'all' | ViewType; // 🆕
type FilterSource = 'all' | Dataset['source'];
type SortColumn = 'name' | 'dataPoints' | 'lastUpdated' | 'health' | 'createdAt';
type SortDirection = 'asc' | 'desc';

interface DatasetFilters {
  status: FilterStatus;
  viewType: FilterViewType; // 🆕
  source: FilterSource;
  search: string;
  sortBy: SortColumn;
  sortDirection: SortDirection;
}

interface UseDatasetFiltersReturn {
  filters: DatasetFilters;
  setStatusFilter: (status: FilterStatus) => void;
  setViewTypeFilter: (viewType: FilterViewType) => void; // 🆕
  setSourceFilter: (source: FilterSource) => void;
  setSearch: (query: string) => void;
  setSorting: (column: SortColumn) => void;
  clearFilters: () => void;
  filteredDatasets: Dataset[];
  totalCount: number;
  activeFiltersCount: number;
  isEmpty: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_FILTERS: DatasetFilters = {
  status: 'all',
  viewType: 'all', // 🆕
  source: 'all',
  search: '',
  sortBy: 'lastUpdated',
  sortDirection: 'desc'
};

const STORAGE_KEY = 'dataset-filters';

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calcular health score derivado de status y lastDataReceived
 */
const calculateHealth = (dataset: Dataset): number => {
  if (dataset.health !== undefined) return dataset.health;
  
  // Fallback si no viene calculado desde API
  let health = 100;
  
  if (dataset.status === 'error') health = 0;
  else if (dataset.status === 'idle') health = 50;
  else if (dataset.status === 'processing') health = 75;
  else if (dataset.activeAlertsCount > 0) {
    health = Math.max(30, 100 - (dataset.activeAlertsCount * 20));
  }
  
  // Penalizar si no ha recibido datos recientemente (más de 1 hora)
  if (dataset.lastDataReceived) {
    const hoursSinceLastData = (Date.now() - new Date(dataset.lastDataReceived).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastData > 1 && dataset.status === 'active') {
      health = Math.max(health - 20, 0);
    }
  }
  
  return health;
};

/**
 * Leer filtros desde localStorage
 */
const loadFiltersFromStorage = (): Partial<DatasetFilters> => {
  if (typeof window === 'undefined') return {};
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

/**
 * Guardar filtros en localStorage
 */
const saveFiltersToStorage = (filters: DatasetFilters) => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // Ignorar errores de localStorage
  }
};

/**
 * Parsear filtros desde URL params
 */
const parseFiltersFromURL = (searchParams: URLSearchParams): Partial<DatasetFilters> => {
  const filters: Partial<DatasetFilters> = {};
  
  const status = searchParams.get('status');
  if (status && ['all', 'active', 'idle', 'error', 'archived', 'processing'].includes(status)) {
    filters.status = status as FilterStatus;
  }
  
  // 🆕 ViewType filter
  const viewType = searchParams.get('view') || searchParams.get('viewType');
  if (viewType && ['all', 'gis', 'threejs'].includes(viewType)) {
    filters.viewType = viewType as FilterViewType;
  }
  
  const source = searchParams.get('source');
  if (source && ['all', 'csv_upload', 'json_upload', 'mqtt_stream', 'webhook', 'api'].includes(source)) {
    filters.source = source as FilterSource;
  }
  
  const search = searchParams.get('search');
  if (search) {
    filters.search = search;
  }
  
  const sort = searchParams.get('sort');
  if (sort && ['name', 'dataPoints', 'lastUpdated', 'health', 'createdAt'].includes(sort)) {
    filters.sortBy = sort as SortColumn;
  }
  
  const dir = searchParams.get('dir');
  if (dir && ['asc', 'desc'].includes(dir)) {
    filters.sortDirection = dir as SortDirection;
  }
  
  return filters;
};

/**
 * Sincronizar filtros con URL
 */
const syncFiltersToURL = (filters: DatasetFilters, searchParams: URLSearchParams): string => {
  const params = new URLSearchParams(searchParams);
  
  // Status
  if (filters.status !== 'all') {
    params.set('status', filters.status);
  } else {
    params.delete('status');
  }
  
  // 🆕 ViewType
  if (filters.viewType !== 'all') {
    params.set('view', filters.viewType);
  } else {
    params.delete('view');
    params.delete('viewType'); // Limpiar ambos posibles nombres
  }
  
  // Source
  if (filters.source !== 'all') {
    params.set('source', filters.source);
  } else {
    params.delete('source');
  }
  
  // Search
  if (filters.search) {
    params.set('search', filters.search);
  } else {
    params.delete('search');
  }
  
  // Sort
  if (filters.sortBy !== 'lastUpdated' || filters.sortDirection !== 'desc') {
    params.set('sort', filters.sortBy);
    params.set('dir', filters.sortDirection);
  } else {
    params.delete('sort');
    params.delete('dir');
  }
  
  return params.toString();
};

// ============================================
// MAIN HOOK
// ============================================

export function useDatasetFilters(datasets: Dataset[]): UseDatasetFiltersReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // ============================================
  // STATE INITIALIZATION
  // ============================================
  
  const [filters, setFilters] = useState<DatasetFilters>(() => {
    // 1. Primero intentar leer desde URL
    const urlFilters = parseFiltersFromURL(searchParams);
    
    // 2. Luego desde localStorage
    const storedFilters = loadFiltersFromStorage();
    
    // 3. Merge con defaults (URL > localStorage > Defaults)
    return {
      ...DEFAULT_FILTERS,
      ...storedFilters,
      ...urlFilters
    };
  });
  
  // Debounce para búsqueda (300ms)
  const debouncedSearch = useDebounce(filters.search, 300);
  
  // ============================================
  // SYNC EFFECTS
  // ============================================
  
  // Sincronizar con URL cuando cambien los filtros
  useEffect(() => {
    const queryString = syncFiltersToURL(filters, searchParams);
    const currentQuery = searchParams.toString();
    
    if (queryString !== currentQuery) {
      router.replace(`?${queryString}`, { scroll: false });
    }
  }, [filters, router, searchParams]);
  
  // Guardar en localStorage cuando cambien los filtros
  useEffect(() => {
    saveFiltersToStorage(filters);
  }, [filters]);
  
  // ============================================
  // FILTER ACTIONS
  // ============================================
  
  const setStatusFilter = useCallback((status: FilterStatus) => {
    setFilters(prev => ({ ...prev, status }));
  }, []);
  
  // 🆕 Filtro por tipo de visualización
  const setViewTypeFilter = useCallback((viewType: FilterViewType) => {
    setFilters(prev => ({ ...prev, viewType }));
  }, []);
  
  const setSourceFilter = useCallback((source: FilterSource) => {
    setFilters(prev => ({ ...prev, source }));
  }, []);
  
  const setSearch = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  }, []);
  
  const setSorting = useCallback((column: SortColumn) => {
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      // Toggle direction si es la misma columna
      sortDirection: prev.sortBy === column && prev.sortDirection === 'asc' ? 'desc' : 'asc'
    }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);
  
  // ============================================
  // FILTERING & SORTING LOGIC
  // ============================================
  
  const filteredDatasets = useMemo(() => {
    let result = [...datasets];
    
    // 1. FILTRAR POR STATUS
    if (filters.status !== 'all') {
      result = result.filter(ds => ds.status === filters.status);
    }
    
    // 🆕 2. FILTRAR POR VIEWTYPE
    if (filters.viewType !== 'all') {
      result = result.filter(ds => ds.viewType === filters.viewType);
    }
    
    // 3. FILTRAR POR SOURCE
    if (filters.source !== 'all') {
      result = result.filter(ds => ds.source === filters.source);
    }
    
    // 4. FILTRAR POR BÚSQUEDA (usar debounced search)
    if (debouncedSearch) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(ds => 
        ds.name.toLowerCase().includes(searchLower) ||
        ds.source.toLowerCase().includes(searchLower) ||
        ds.description?.toLowerCase().includes(searchLower)
      );
    }
    
    // 5. ORDENAR
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
          
        case 'dataPoints':
          comparison = a.totalDataPoints - b.totalDataPoints;
          break;
          
        case 'lastUpdated':
          const aTime = a.lastDataReceived ? new Date(a.lastDataReceived).getTime() : 0;
          const bTime = b.lastDataReceived ? new Date(b.lastDataReceived).getTime() : 0;
          comparison = aTime - bTime;
          break;
          
        case 'health':
          comparison = calculateHealth(a) - calculateHealth(b);
          break;
          
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return filters.sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return result;
  }, [datasets, filters.status, filters.viewType, filters.source, debouncedSearch, filters.sortBy, filters.sortDirection]);
  
  // ============================================
  // COMPUTED VALUES
  // ============================================
  
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    
    if (filters.status !== 'all') count++;
    if (filters.viewType !== 'all') count++; // 🆕
    if (filters.source !== 'all') count++;
    if (filters.search) count++;
    if (filters.sortBy !== 'lastUpdated' || filters.sortDirection !== 'desc') count++;
    
    return count;
  }, [filters]);
  
  const isEmpty = filteredDatasets.length === 0;
  const totalCount = filteredDatasets.length;
  
  // ============================================
  // RETURN
  // ============================================
  
  return {
    filters,
    setStatusFilter,
    setViewTypeFilter, // 🆕
    setSourceFilter,
    setSearch,
    setSorting,
    clearFilters,
    filteredDatasets,
    totalCount,
    activeFiltersCount,
    isEmpty
  };
}

// ============================================
// EXPORT TYPES
// ============================================

export type {
  FilterStatus,
  FilterViewType, // 🆕
  FilterSource,
  SortColumn,
  SortDirection,
  DatasetFilters,
  UseDatasetFiltersReturn
};