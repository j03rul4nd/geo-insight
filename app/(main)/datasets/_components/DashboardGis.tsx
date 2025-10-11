"use client";
import React, { useState } from 'react';
import { Database, Plus, Search, Filter, MoreVertical, TrendingUp, TrendingDown, Minus, ExternalLink, Play, Download, Bell, Archive, Trash2, Upload, Wifi, Globe, Webhook, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useDatasets } from '@/hooks/useDatasets';
import { useDatasetFilters } from '@/hooks/useDatasetFilters';
import { useDatasetMutations } from '@/hooks/useDatasetMutations';
import { useBulkSelection } from '@/hooks/useBulkSelection';

type TabType = 'file' | 'mqtt' | 'api' | 'webhook';
type TestConnectionStatus = 'testing' | 'success' | 'error' | null;

interface StatusConfig {
  color: string;
  label: string;
  glow: string;
}

interface FilterButton {
  id: string;
  label: string;
  icon: string | null;
}

interface TabConfig {
  id: TabType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface FormData {
  name: string;
  description: string;
  brokerUrl: string;
  topic: string;
  username: string;
  password: string;
  clientId: string;
  keepAlive: number;
  cleanSession: boolean;
}

const DatasetManagement: React.FC = () => {
  // ============================================
  // HOOKS - Data & Mutations
  // ============================================
  const { datasets, loading, error: datasetsError, testMQTTConnection } = useDatasets();
  const { createDataset, deleteDataset, archiveDataset, bulkArchive, bulkDelete } = useDatasetMutations();
  
  // ============================================
  // HOOKS - Filters & Selection
  // ============================================
  const {
    filters,
    filteredDatasets,
    setStatusFilter,
    setSearch,
    setSorting,
    clearFilters,
    activeFiltersCount,
    isEmpty
  } = useDatasetFilters(datasets);
  
  const {
    selectedIds,
    selectedCount,
    isAllSelected,
    isSomeSelected,
    toggleRow,
    toggleAll,
    clearSelection,
    isRowSelected,
    isRowDisabled
  } = useBulkSelection(filteredDatasets, {
    clearOnFilterChange: true,
    disableArchivedSelection: true
  });
  
  // ============================================
  // LOCAL STATE
  // ============================================
  const [showNewDatasetModal, setShowNewDatasetModal] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('mqtt');
  const [showBulkActions, setShowBulkActions] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestConnectionStatus>(null);
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    brokerUrl: '',
    topic: '',
    username: '',
    password: '',
    clientId: '',
    keepAlive: 60,
    cleanSession: true
  });

  // ============================================
  // CONSTANTS
  // ============================================
  const statusConfig: Record<string, StatusConfig> = {
    active: { color: 'bg-green-500', label: 'Live', glow: 'shadow-green-500/50' },
    idle: { color: 'bg-yellow-500', label: 'Idle', glow: 'shadow-yellow-500/50' },
    error: { color: 'bg-red-500', label: 'Error', glow: 'shadow-red-500/50' },
    archived: { color: 'bg-gray-500', label: 'Archived', glow: '' },
    processing: { color: 'bg-blue-500', label: 'Processing', glow: 'shadow-blue-500/50' }
  };

  const filterButtons: FilterButton[] = [
    { id: 'all', label: 'All', icon: null },
    { id: 'active', label: 'Live', icon: '🟢' },
    { id: 'idle', label: 'Idle', icon: '🟡' },
    { id: 'error', label: 'Error', icon: '🔴' },
    { id: 'archived', label: 'Archived', icon: '📦' }
  ];

  const tabConfigs: TabConfig[] = [
    { id: 'file', icon: Upload, label: 'Upload File' },
    { id: 'mqtt', icon: Wifi, label: 'Connect MQTT' },
    { id: 'api', icon: Globe, label: 'API Endpoint' },
    { id: 'webhook', icon: Webhook, label: 'Webhook' }
  ];

  // ============================================
  // HANDLERS
  // ============================================
  const handleTestConnection = async (): Promise<void> => {
    setTestConnectionStatus('testing');
    
    try {
      const success = await testMQTTConnection({
        brokerUrl: formData.brokerUrl,
        topic: formData.topic,
        username: formData.username || undefined,
        password: formData.password || undefined,
        clientId: formData.clientId || undefined,
        keepAlive: formData.keepAlive,
        cleanSession: formData.cleanSession
      });
      
      setTestConnectionStatus(success ? 'success' : 'error');
      setTimeout(() => setTestConnectionStatus(null), 3000);
    } catch (error) {
      setTestConnectionStatus('error');
      setTimeout(() => setTestConnectionStatus(null), 3000);
    }
  };

  const handleCreateDataset = async (): Promise<void> => {
    try {
      if (selectedTab === 'mqtt') {
        await createDataset.mutateAsync({
          name: formData.name,
          description: formData.description || undefined,
          source: 'mqtt_stream',
          mqttBroker: formData.brokerUrl,
          mqttTopic: formData.topic,
          mqttUsername: formData.username || undefined,
          mqttPassword: formData.password || undefined
        });
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        brokerUrl: '',
        topic: '',
        username: '',
        password: '',
        clientId: '',
        keepAlive: 60,
        cleanSession: true
      });
      setShowNewDatasetModal(false);
    } catch (error) {
      console.error('Failed to create dataset:', error);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this dataset? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteDataset.mutateAsync(id);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Failed to delete dataset:', error);
    }
  };

  const handleArchive = async (id: string): Promise<void> => {
    try {
      await archiveDataset.mutateAsync(id);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Failed to archive dataset:', error);
    }
  };

  const handleBulkArchive = async (): Promise<void> => {
    if (selectedCount === 0) return;
    
    try {
      await bulkArchive.mutateAsync({ datasetIds: selectedIds });
      clearSelection();
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to bulk archive:', error);
    }
  };

  const handleBulkDelete = async (): Promise<void> => {
    if (selectedCount === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedCount} dataset(s)? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await bulkDelete.mutateAsync({ datasetIds: selectedIds });
      clearSelection();
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    }
  };

  const handleRowClick = (e: React.MouseEvent, datasetId: string): void => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    window.location.href = `/datasets/${datasetId}`;
  };

  const getHealthColor = (health?: number): string => {
    if (!health) return 'bg-gray-500';
    if (health >= 95) return 'bg-green-500';
    if (health >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const formatLastUpdated = (date?: Date): string => {
    if (!date) return 'Never';
    
    const now = new Date();
    const lastUpdate = new Date(date);
    const diffMs = now.getTime() - lastUpdate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return lastUpdate.toLocaleDateString();
  };

  // ============================================
  // LOADING & ERROR STATES
  // ============================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-gray-400">Loading datasets...</p>
        </div>
      </div>
    );
  }

  if (datasetsError) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-gray-400">Error loading datasets: {datasetsError}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6">
      {/* Free Plan Banner */}
      <div className="mb-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Database className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">{datasets.length}/1 datasets used</span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-400">Upgrade for unlimited</span>
        </div>
        <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
          Upgrade to Pro
        </button>
      </div>

      {/* Header Zone */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Datasets</h1>
            <span className="px-2 py-1 bg-gray-800 rounded text-sm text-gray-400 font-mono">
              ({filteredDatasets.length} active)
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-400 flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                Clear filters
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            {selectedCount > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Bulk Actions ({selectedCount})
                </button>
                {showBulkActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#18181b] border border-gray-800 rounded-lg shadow-xl z-50">
                    <button 
                      onClick={handleBulkArchive}
                      disabled={bulkArchive.isPending}
                      className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      {bulkArchive.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Archive className="w-4 h-4" />
                      )}
                      Archive
                    </button>
                    <div className="border-t border-gray-800 my-1"></div>
                    <button 
                      onClick={handleBulkDelete}
                      disabled={bulkDelete.isPending}
                      className="w-full px-4 py-2 hover:bg-red-900/20 text-red-400 flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                      {bulkDelete.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setShowNewDatasetModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={datasets.length >= 1}
              title={datasets.length >= 1 ? "Upgrade to Pro for unlimited datasets" : ""}
            >
              <Plus className="w-4 h-4" />
              New Dataset
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            {filterButtons.map(filter => (
              <button
                key={filter.id}
                onClick={() => setStatusFilter(filter.id as any)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filters.status === filter.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {filter.icon && <span className="mr-1">{filter.icon}</span>}
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex-1 max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by name or source..."
              value={filters.search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#18181b] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table Zone */}
      <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#18181b] sticky top-0 z-10">
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    className="rounded bg-gray-800 border-gray-700"
                    onChange={(e) => toggleAll(filteredDatasets.map(ds => ds.id))}
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected && !isAllSelected;
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">
                  Status
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => setSorting('name')}
                >
                  Name {filters.sortBy === 'name' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => setSorting('dataPoints')}
                >
                  Data Points {filters.sortBy === 'dataPoints' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => setSorting('lastUpdated')}
                >
                  Last Updated {filters.sortBy === 'lastUpdated' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => setSorting('health')}
                >
                  Health {filters.sortBy === 'health' && (filters.sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {isEmpty ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Database className="w-12 h-12 text-gray-600" />
                      <p className="text-gray-400">No datasets found</p>
                      {activeFiltersCount > 0 && (
                        <button
                          onClick={clearFilters}
                          className="text-sm text-blue-500 hover:text-blue-400"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDatasets.map((dataset, idx) => (
                  <tr
                    key={dataset.id}
                    className={`${
                      idx % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#18181b]'
                    } hover:bg-gray-800/50 transition-colors cursor-pointer group ${
                      isRowDisabled(dataset) ? 'opacity-50' : ''
                    }`}
                    onClick={(e) => handleRowClick(e, dataset.id)}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={isRowSelected(dataset.id)}
                        onChange={() => toggleRow(dataset.id)}
                        onClick={(e) => e.stopPropagation()}
                        disabled={isRowDisabled(dataset)}
                        className="rounded bg-gray-800 border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${statusConfig[dataset.status].color} ${
                          dataset.status === 'active' ? 'animate-pulse shadow-lg ' + statusConfig[dataset.status].glow : ''
                        }`}></div>
                        <span className="text-sm text-gray-400">{statusConfig[dataset.status].label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-100">{dataset.name}</span>
                        <span className="text-xs text-gray-500 font-mono">{dataset.source}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col font-mono">
                        <span className="text-gray-100">{dataset.totalDataPoints.toLocaleString()}</span>
                        <div className="flex items-center gap-1 text-xs">
                          <span className="text-gray-500">{dataset.dataPointsToday.toLocaleString()} today</span>
                          {dataset.trend === 'up' && (
                            <span className="flex items-center text-green-500">
                              <TrendingUp className="w-3 h-3" />
                              {dataset.trendPercent}%
                            </span>
                          )}
                          {dataset.trend === 'down' && (
                            <span className="flex items-center text-red-500">
                              <TrendingDown className="w-3 h-3" />
                              {Math.abs(dataset.trendPercent || 0)}%
                            </span>
                          )}
                          {dataset.trend === 'neutral' && (
                            <span className="flex items-center text-gray-500">
                              <Minus className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-mono text-gray-400">
                        {formatLastUpdated(dataset.lastDataReceived ? new Date(dataset.lastDataReceived) : undefined)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getHealthColor(dataset.health)} transition-all`}
                            style={{ width: `${dataset.health || 0}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-mono font-semibold ${
                          (dataset.health || 0) >= 95 ? 'text-green-500' : 
                          (dataset.health || 0) >= 80 ? 'text-yellow-500' : 'text-red-500'
                        }`}>
                          {(dataset.health || 0).toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(openDropdown === dataset.id ? null : dataset.id);
                          }}
                          className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openDropdown === dataset.id && (
                          <div className="absolute right-0 mt-2 w-56 bg-[#18181b] border border-gray-800 rounded-lg shadow-xl z-50">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/datasets/${dataset.id}`;
                              }}
                              className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm text-left"
                            >
                              <ExternalLink className="w-4 h-4" /> View Details
                            </button>
                            <button className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm text-left">
                              <Play className="w-4 h-4" /> Run AI Analysis
                            </button>
                            <button className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm text-left">
                              <Download className="w-4 h-4" /> Export Data
                            </button>
                            <button className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm text-left">
                              <Bell className="w-4 h-4" /> Configure Alerts
                            </button>
                            <div className="border-t border-gray-800 my-1"></div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchive(dataset.id);
                              }}
                              disabled={archiveDataset.isPending}
                              className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm text-left disabled:opacity-50"
                            >
                              {archiveDataset.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Archive className="w-4 h-4" />
                              )}
                              Archive
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(dataset.id);
                              }}
                              disabled={deleteDataset.isPending}
                              className="w-full px-4 py-2 hover:bg-red-900/20 text-red-400 flex items-center gap-2 text-sm text-left disabled:opacity-50"
                            >
                              {deleteDataset.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-4 py-3 bg-[#18181b] border-t border-gray-800 flex items-center justify-between text-sm">
          <span className="text-gray-400 font-mono">
            Showing 1-{filteredDatasets.length} of {datasets.length}
          </span>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>

      {/* New Dataset Modal */}
      {showNewDatasetModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-gray-800 rounded-lg w-full max-w-2xl shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-xl font-bold">New Dataset</h2>
              <button
                onClick={() => setShowNewDatasetModal(false)}
                className="p-1 hover:bg-gray-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-800 px-6">
              {tabConfigs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                    selectedTab === tab.id
                      ? 'border-blue-500 text-blue-500'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Form Content - MQTT Tab */}
            <div className="px-6 py-6">
              {selectedTab === 'mqtt' && (
                <div className="space-y-4">
                  {/* Connection Info Banner */}
                  <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg px-4 py-3 flex items-start gap-3">
                    <Wifi className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-300 font-medium">MQTT Real-time Connection</p>
                      <p className="text-gray-400 mt-1">
                        Connect to any MQTT broker for live sensor data streaming
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dataset Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 bg-[#18181b] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500"
                      placeholder="e.g., Production Line Sensors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-3 py-2 bg-[#18181b] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500"
                      placeholder="Brief description of this dataset"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Broker URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.brokerUrl}
                      onChange={(e) => setFormData({...formData, brokerUrl: e.target.value})}
                      className="w-full px-3 py-2 bg-[#18181b] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="mqtt://broker.hivemq.com:1883"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Supports mqtt://, mqtts://, ws://, wss:// protocols
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Topic <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      className="w-full px-3 py-2 bg-[#18181b] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="factory/sensors/#"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">
                      Use # for multi-level wildcard or + for single-level
                    </p>
                  </div>

                  {/* Advanced Settings Accordion */}
                  <details className="bg-[#18181b] border border-gray-800 rounded-lg">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-300 hover:text-white">
                      Advanced Settings (Optional)
                    </summary>
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Password
                          </label>
                          <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Client ID
                          </label>
                          <input
                            type="text"
                            value={formData.clientId}
                            onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                            className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500 font-mono"
                            placeholder="auto-generated"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Keep Alive (seconds)
                          </label>
                          <input
                            type="number"
                            value={formData.keepAlive}
                            onChange={(e) => setFormData({...formData, keepAlive: parseInt(e.target.value) || 60})}
                            className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input 
                          type="checkbox" 
                          checked={formData.cleanSession}
                          onChange={(e) => setFormData({...formData, cleanSession: e.target.checked})}
                          className="rounded bg-gray-800 border-gray-700" 
                        />
                        <span className="text-gray-400">Clean Session</span>
                      </label>
                    </div>
                  </details>

                  {testConnectionStatus && (
                    <div className={`p-3 rounded flex items-center gap-2 ${
                      testConnectionStatus === 'testing' ? 'bg-blue-900/20 text-blue-400' :
                      testConnectionStatus === 'success' ? 'bg-green-900/20 text-green-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {testConnectionStatus === 'testing' && (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Testing connection to broker...</span>
                        </>
                      )}
                      {testConnectionStatus === 'success' && (
                        <>
                          <Check className="w-4 h-4" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">Connection successful!</span>
                            <p className="text-xs text-gray-400 mt-0.5">Broker: {formData.brokerUrl}</p>
                          </div>
                        </>
                      )}
                      {testConnectionStatus === 'error' && (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          <div className="flex-1">
                            <span className="text-sm font-medium">Connection failed</span>
                            <p className="text-xs text-gray-400 mt-0.5">Please check your broker URL and credentials</p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {selectedTab === 'file' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-800 rounded-lg p-12 text-center hover:border-gray-700 transition-colors">
                    <Upload className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-2 font-medium">Drag and drop your file here</p>
                    <p className="text-sm text-gray-600 mb-4">CSV, JSON, or Excel files up to 100MB</p>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                      Choose File
                    </button>
                  </div>
                  
                  <div className="bg-[#18181b] border border-gray-800 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Supported Formats</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>CSV (.csv)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>JSON (.json)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Excel (.xlsx)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'api' && (
                <div className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg px-4 py-3 flex items-start gap-3">
                    <Globe className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-300 font-medium">REST API Polling</p>
                      <p className="text-gray-400 mt-1">
                        Fetch data from any REST endpoint on a schedule
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dataset Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-[#18181b] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500"
                      placeholder="e.g., Weather API Data"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      API Endpoint <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-[#18181b] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500 font-mono"
                      placeholder="https://api.example.com/v1/data"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Poll Interval
                    </label>
                    <select className="w-full px-3 py-2 bg-[#18181b] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500">
                      <option>Every 30 seconds</option>
                      <option>Every 1 minute</option>
                      <option>Every 5 minutes</option>
                      <option>Every 15 minutes</option>
                      <option>Every 1 hour</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      HTTP Method
                    </label>
                    <div className="flex gap-2">
                      <button className="flex-1 px-4 py-2 bg-blue-600 border border-blue-500 rounded text-sm font-medium">
                        GET
                      </button>
                      <button className="flex-1 px-4 py-2 bg-[#18181b] border border-gray-800 hover:border-gray-700 rounded text-sm">
                        POST
                      </button>
                    </div>
                  </div>

                  <details className="bg-[#18181b] border border-gray-800 rounded-lg">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-300 hover:text-white">
                      Headers & Authentication
                    </summary>
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Authorization Header
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500 font-mono"
                          placeholder="Bearer your-token-here"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Custom Headers (JSON)
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500 font-mono"
                          placeholder='{"Content-Type": "application/json"}'
                        />
                      </div>
                    </div>
                  </details>
                </div>
              )}

              {selectedTab === 'webhook' && (
                <div className="space-y-4">
                  <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg px-4 py-3 flex items-start gap-3">
                    <Webhook className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-300 font-medium">Webhook Receiver</p>
                      <p className="text-gray-400 mt-1">
                        Get a unique URL to receive data from external systems
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Dataset Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-[#18181b] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500"
                      placeholder="e.g., External System Events"
                    />
                  </div>

                  <div className="bg-[#18181b] border border-gray-800 rounded-lg p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Webhook URL</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded text-xs font-mono text-gray-400">
                        https://api.yourapp.com/webhooks/abc123xyz
                      </code>
                      <button className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors">
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This URL will be generated after creating the dataset
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Expected Payload Format
                    </label>
                    <select className="w-full px-3 py-2 bg-[#18181b] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500">
                      <option>JSON</option>
                      <option>Form Data</option>
                      <option>XML</option>
                    </select>
                  </div>

                  <details className="bg-[#18181b] border border-gray-800 rounded-lg">
                    <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-gray-300 hover:text-white">
                      Security Settings
                    </summary>
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" defaultChecked className="rounded bg-gray-800 border-gray-700" />
                        <span className="text-gray-400">Require authentication token</span>
                      </label>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Allowed IP Addresses (one per line)
                        </label>
                        <textarea
                          rows={3}
                          className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500 font-mono"
                          placeholder="192.168.1.1&#10;10.0.0.0/8"
                        />
                      </div>
                    </div>
                  </details>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewDatasetModal(false);
                  setFormData({
                    name: '',
                    description: '',
                    brokerUrl: '',
                    topic: '',
                    username: '',
                    password: '',
                    clientId: '',
                    keepAlive: 60,
                    cleanSession: true
                  });
                  setTestConnectionStatus(null);
                }}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
              >
                Cancel
              </button>
              {selectedTab === 'mqtt' && (
                <button
                  onClick={handleTestConnection}
                  disabled={testConnectionStatus === 'testing' || !formData.brokerUrl || !formData.topic}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {testConnectionStatus === 'testing' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Testing...
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </button>
              )}
              <button 
                onClick={handleCreateDataset}
                disabled={
                  createDataset.isPending || 
                  !formData.name || 
                  (selectedTab === 'mqtt' && (!formData.brokerUrl || !formData.topic))
                }
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createDataset.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Creating...
                  </>
                ) : (
                  'Create Dataset →'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetManagement;