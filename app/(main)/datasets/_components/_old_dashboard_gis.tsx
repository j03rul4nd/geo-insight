"use client";
import React, { useState } from 'react';
import { Database, Plus, Search, Filter, MoreVertical, TrendingUp, TrendingDown, Minus, ExternalLink, Play, Download, Bell, Archive, Trash2, Upload, Wifi, Globe, Webhook, X, Check, AlertCircle } from 'lucide-react';

type DatasetStatus = 'live' | 'idle' | 'error' | 'archived';
type DatasetSource = 'MQTT' | 'API' | 'CSV' | 'Webhook';
type TrendType = 'up' | 'down' | 'neutral';
type FilterType = 'all' | DatasetStatus;
type TabType = 'file' | 'mqtt' | 'api' | 'webhook';
type TestConnectionStatus = 'testing' | 'success' | 'error' | null;
type SortColumn = 'name' | 'dataPoints' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

interface Dataset {
  id: number;
  name: string;
  source: DatasetSource;
  status: DatasetStatus;
  dataPoints: number;
  todayPoints: number;
  trend: TrendType;
  trendPercent: number;
  lastUpdated: string;
  health: number;
  uptime: number;
}

interface StatusConfig {
  color: string;
  label: string;
  glow: string;
}

interface FilterButton {
  id: FilterType;
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
  brokerUrl: string;
  topic: string;
  username: string;
  password: string;
}

const DatasetManagement: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showNewDatasetModal, setShowNewDatasetModal] = useState<boolean>(false);
  const [selectedTab, setSelectedTab] = useState<TabType>('mqtt');
  const [sortColumn, setSortColumn] = useState<SortColumn>('lastUpdated');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showBulkActions, setShowBulkActions] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [testConnectionStatus, setTestConnectionStatus] = useState<TestConnectionStatus>(null);

  const datasets: Dataset[] = [
    {
      id: 1,
      name: 'Sector 7-B Sensors',
      source: 'MQTT',
      status: 'live',
      dataPoints: 847230,
      todayPoints: 12400,
      trend: 'up',
      trendPercent: 8,
      lastUpdated: '2 min ago',
      health: 99.2,
      uptime: 99.2
    },
    {
      id: 2,
      name: 'Logistics Fleet GPS',
      source: 'API',
      status: 'live',
      dataPoints: 523410,
      todayPoints: 8920,
      trend: 'up',
      trendPercent: 3,
      lastUpdated: '5 min ago',
      health: 97.8,
      uptime: 97.8
    },
    {
      id: 3,
      name: 'Temperature Readings Q3',
      source: 'CSV',
      status: 'idle',
      dataPoints: 194520,
      todayPoints: 0,
      trend: 'neutral',
      trendPercent: 0,
      lastUpdated: '4 hours ago',
      health: 85.3,
      uptime: 85.3
    },
    // {
    //   id: 4,
    //   name: 'Production Line Alpha',
    //   source: 'MQTT',
    //   status: 'error',
    //   dataPoints: 1203450,
    //   todayPoints: 0,
    //   trend: 'down',
    //   trendPercent: -100,
    //   lastUpdated: '12 hours ago',
    //   health: 45.2,
    //   uptime: 45.2
    // },
    // {
    //   id: 5,
    //   name: 'Site C Environmental',
    //   source: 'Webhook',
    //   status: 'archived',
    //   dataPoints: 89340,
    //   todayPoints: 0,
    //   trend: 'neutral',
    //   trendPercent: 0,
    //   lastUpdated: 'Sep 15, 2025',
    //   health: 0,
    //   uptime: 0
    // }
  ];

  const [formData, setFormData] = useState<FormData>({
    name: '',
    brokerUrl: '',
    topic: '',
    username: '',
    password: ''
  });

  const statusConfig: Record<DatasetStatus, StatusConfig> = {
    live: { color: 'bg-green-500', label: 'Live', glow: 'shadow-green-500/50' },
    idle: { color: 'bg-yellow-500', label: 'Idle', glow: 'shadow-yellow-500/50' },
    error: { color: 'bg-red-500', label: 'Error', glow: 'shadow-red-500/50' },
    archived: { color: 'bg-gray-500', label: 'Archived', glow: '' }
  };

  const filterButtons: FilterButton[] = [
    { id: 'all', label: 'All', icon: null },
    { id: 'live', label: 'Live', icon: '🟢' },
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

  const filteredDatasets = datasets.filter(ds => {
    const matchesFilter = activeFilter === 'all' || ds.status === activeFilter;
    const matchesSearch = ds.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         ds.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleSort = (column: SortColumn): void => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const handleTestConnection = (): void => {
    setTestConnectionStatus('testing');
    setTimeout(() => {
      setTestConnectionStatus('success');
      setTimeout(() => setTestConnectionStatus(null), 3000);
    }, 1500);
  };

  const getHealthColor = (health: number): string => {
    if (health >= 95) return 'bg-green-500';
    if (health >= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const toggleRowSelection = (id: number): void => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (checked: boolean): void => {
    if (checked) {
      setSelectedRows(filteredDatasets.map(ds => ds.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowClick = (e: React.MouseEvent, datasetId: number): void => {
    if (!e.currentTarget.contains(e.target as Node)) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    window.location.href = `/datasets/${datasetId}`;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6">
      {/* Free Plan Banner */}
      <div className="mb-4 bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-lg px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Database className="w-4 h-4 text-blue-400" />
          <span className="text-gray-300">1/1 datasets used</span>
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
          </div>
          <div className="flex items-center gap-3">
            {selectedRows.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowBulkActions(!showBulkActions)}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded flex items-center gap-2 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Bulk Actions ({selectedRows.length})
                </button>
                {showBulkActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#18181b] border border-gray-800 rounded-lg shadow-xl z-50">
                    <button className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm">
                      <Download className="w-4 h-4" /> Export
                    </button>
                    <button className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm">
                      <Archive className="w-4 h-4" /> Archive
                    </button>
                    <div className="border-t border-gray-800 my-1"></div>
                    <button className="w-full px-4 py-2 hover:bg-red-900/20 text-red-400 flex items-center gap-2 text-sm">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => setShowNewDatasetModal(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={datasets.length >= 5}
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
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter.id
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    checked={selectedRows.length === filteredDatasets.length && filteredDatasets.length > 0}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider w-24">
                  Status
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('name')}
                >
                  Name
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('dataPoints')}
                >
                  Data Points
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-300"
                  onClick={() => handleSort('lastUpdated')}
                >
                  Last Updated
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Health
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider w-20">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {filteredDatasets.map((dataset, idx) => (
                <tr
                  key={dataset.id}
                  className={`${
                    idx % 2 === 0 ? 'bg-[#0a0a0a]' : 'bg-[#18181b]'
                  } hover:bg-gray-800/50 transition-colors cursor-pointer group`}
                  onClick={(e) => handleRowClick(e, dataset.id)}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(dataset.id)}
                      onChange={() => toggleRowSelection(dataset.id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded bg-gray-800 border-gray-700"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${statusConfig[dataset.status].color} ${
                        dataset.status === 'live' ? 'animate-pulse shadow-lg ' + statusConfig[dataset.status].glow : ''
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
                      <span className="text-gray-100">{dataset.dataPoints.toLocaleString()}</span>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-500">{dataset.todayPoints.toLocaleString()} today</span>
                        {dataset.trend === 'up' && (
                          <span className="flex items-center text-green-500">
                            <TrendingUp className="w-3 h-3" />
                            {dataset.trendPercent}%
                          </span>
                        )}
                        {dataset.trend === 'down' && (
                          <span className="flex items-center text-red-500">
                            <TrendingDown className="w-3 h-3" />
                            {Math.abs(dataset.trendPercent)}%
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
                    <span className={`text-sm font-mono ${
                      dataset.lastUpdated.includes('hour') || dataset.lastUpdated.includes('Sep') 
                        ? 'text-yellow-500' 
                        : 'text-gray-400'
                    }`}>
                      {dataset.lastUpdated}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${getHealthColor(dataset.health)} transition-all`}
                          style={{ width: `${dataset.uptime}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-mono font-semibold ${
                        dataset.health >= 95 ? 'text-green-500' : 
                        dataset.health >= 80 ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {dataset.health.toFixed(1)}%
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
                          <button className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm text-left">
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
                          <button className="w-full px-4 py-2 hover:bg-gray-800 flex items-center gap-2 text-sm text-left">
                            <Archive className="w-4 h-4" /> Archive
                          </button>
                          <button className="w-full px-4 py-2 hover:bg-red-900/20 text-red-400 flex items-center gap-2 text-sm text-left">
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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

            {/* Form Content */}
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
                            defaultValue="60"
                            className="w-full px-3 py-2 bg-[#0a0a0a] border border-gray-800 rounded text-sm focus:outline-none focus:border-blue-500 font-mono"
                          />
                        </div>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded bg-gray-800 border-gray-700" />
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
                          <AlertCircle className="w-4 h-4 animate-spin" />
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
                onClick={() => setShowNewDatasetModal(false)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors"
              >
                Cancel
              </button>
              {selectedTab === 'mqtt' && (
                <button
                  onClick={handleTestConnection}
                  disabled={testConnectionStatus === 'testing'}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm transition-colors disabled:opacity-50"
                >
                  Test Connection
                </button>
              )}
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium transition-colors">
                Create Dataset →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatasetManagement;