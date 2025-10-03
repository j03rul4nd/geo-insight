'use client';

import React, { useState } from 'react';
import { AlertTriangle, Info, XCircle, CheckCircle, Clock, TrendingDown, TrendingUp, Zap, FileText, ExternalLink, ChevronDown, ChevronUp, Lock, Activity, Thermometer, Wind, LucideIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

type Severity = 'critical' | 'warning' | 'info';
type Status = 'unresolved' | 'pending' | 'resolved';
type Trend = 'up' | 'down' | 'stable' | 'neutral';

interface Metric {
  label: string;
  value: string;
  trend: Trend;
  icon: LucideIcon;
}

interface ChartDataPoint {
  time: string;
  value: number;
}

interface Insight {
  id: number;
  severity: Severity;
  title: string;
  time: string;
  dataset: string;
  summary: string;
  metrics: Metric[];
  recommendation: string;
  status: Status;
  resolvedBy?: string;
  resolvedTime?: string;
  confidence: number;
  model: string;
  chartData: ChartDataPoint[];
}

const InsightsPage: React.FC = () => {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(['All']);
  const [sortBy, setSortBy] = useState<string>('Newest First');
  const [selectedDataset, setSelectedDataset] = useState<string>('All Datasets');
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [resolveModal, setResolveModal] = useState<number | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  const insights: Insight[] = [
    {
      id: 1,
      severity: 'critical',
      title: 'Anomaly Detected: Sector 3 Efficiency Drop',
      time: '2 hours ago',
      dataset: 'Factory Floor A',
      summary: 'AI detected 18% drop in throughput correlating with vibration spike in Zone 3B between 14:00-15:30.',
      metrics: [
        { label: 'Efficiency', value: '-18%', trend: 'down', icon: Activity },
        { label: 'Vibration', value: '+45%', trend: 'up', icon: Wind },
        { label: 'Temperature', value: 'Stable', trend: 'stable', icon: Thermometer }
      ],
      recommendation: 'Immediate inspection of conveyor belt in Zone 3B recommended. Estimated downtime if ignored: 4-6 hours.',
      status: 'unresolved',
      confidence: 87,
      model: 'Gemini 2.0 Flash',
      chartData: [
        { time: '14:00', value: 100 },
        { time: '14:15', value: 95 },
        { time: '14:30', value: 85 },
        { time: '14:45', value: 82 },
        { time: '15:00', value: 82 },
        { time: '15:15', value: 83 },
        { time: '15:30', value: 82 }
      ]
    },
    {
      id: 2,
      severity: 'warning',
      title: 'Pattern Recognition: Warehouse Peak Load Shift',
      time: '5 hours ago',
      dataset: 'Warehouse B',
      summary: 'ML analysis shows 23% increase in peak load times shifting from 10:00-12:00 to 14:00-16:00 over last 14 days.',
      metrics: [
        { label: 'Peak Shift', value: '+2.5h', trend: 'neutral', icon: Clock },
        { label: 'Load Volume', value: '+23%', trend: 'up', icon: TrendingUp },
        { label: 'Efficiency', value: '-8%', trend: 'down', icon: Activity }
      ],
      recommendation: 'Consider adjusting staff schedules to align with new peak periods. Potential efficiency gain: 12-15%.',
      status: 'pending',
      confidence: 92,
      model: 'Gemini 2.0 Flash',
      chartData: [
        { time: 'W1', value: 10 },
        { time: 'W2', value: 10.5 },
        { time: 'W3', value: 11.2 },
        { time: 'W4', value: 12.5 }
      ]
    },
    {
      id: 3,
      severity: 'info',
      title: 'Optimization Opportunity: Smart Grid Load Balancing',
      time: '8 hours ago',
      dataset: 'Smart Grid',
      summary: 'AI identified potential 7% energy savings through optimized load distribution across Grid Sections A-D.',
      metrics: [
        { label: 'Savings', value: '7%', trend: 'neutral', icon: Zap },
        { label: 'Load Balance', value: '+12%', trend: 'up', icon: Activity },
        { label: 'Peak Demand', value: '-4%', trend: 'down', icon: TrendingDown }
      ],
      recommendation: 'Implement load balancing algorithm during off-peak hours. Estimated annual savings: $45K.',
      status: 'resolved',
      resolvedBy: 'John Doe',
      resolvedTime: '3h ago',
      confidence: 78,
      model: 'Gemini 2.0 Flash',
      chartData: [
        { time: '00:00', value: 60 },
        { time: '06:00', value: 85 },
        { time: '12:00', value: 95 },
        { time: '18:00', value: 90 },
        { time: '24:00', value: 65 }
      ]
    },
    {
      id: 4,
      severity: 'critical',
      title: 'Critical: Unexpected Sensor Failure Pattern',
      time: '12 hours ago',
      dataset: 'Factory Floor A',
      summary: 'Deep learning detected correlated sensor failures suggesting systematic issue in calibration system.',
      metrics: [
        { label: 'Failed Sensors', value: '12', trend: 'up', icon: AlertTriangle },
        { label: 'Pattern Match', value: '94%', trend: 'neutral', icon: Activity },
        { label: 'Impact Area', value: '3 zones', trend: 'neutral', icon: XCircle }
      ],
      recommendation: 'Emergency calibration system audit required. Risk of cascade failure in 24-48 hours.',
      status: 'unresolved',
      confidence: 94,
      model: 'Gemini 2.0 Flash',
      chartData: [
        { time: 'D-7', value: 2 },
        { time: 'D-5', value: 3 },
        { time: 'D-3', value: 5 },
        { time: 'D-1', value: 8 },
        { time: 'Today', value: 12 }
      ]
    }
  ];

  const datasets: string[] = ['All Datasets', 'Factory Floor A', 'Warehouse B', 'Smart Grid'];

  const severityConfig: Record<Severity, { color: string; icon: LucideIcon; label: string }> = {
    critical: { color: '#ef4444', icon: XCircle, label: 'Critical' },
    warning: { color: '#f59e0b', icon: AlertTriangle, label: 'Warning' },
    info: { color: '#3b82f6', icon: Info, label: 'Info' }
  };

  const statusConfig: Record<Status, { color: string; label: string }> = {
    unresolved: { color: '#ef4444', label: 'UNRESOLVED' },
    pending: { color: '#f59e0b', label: 'PENDING REVIEW' },
    resolved: { color: '#10b981', label: 'RESOLVED' }
  };

  const filterInsights = () => {
    let filtered = insights;
    
    if (!selectedFilters.includes('All')) {
      filtered = filtered.filter(insight => {
        if (selectedFilters.includes('Critical') && insight.severity === 'critical') return true;
        if (selectedFilters.includes('Warning') && insight.severity === 'warning') return true;
        if (selectedFilters.includes('Info') && insight.severity === 'info') return true;
        if (selectedFilters.includes('Resolved') && insight.status === 'resolved') return true;
        if (selectedFilters.includes('Pending Review') && insight.status === 'pending') return true;
        return false;
      });
    }

    if (selectedDataset !== 'All Datasets') {
      filtered = filtered.filter(i => i.dataset === selectedDataset);
    }

    return filtered;
  };

  const toggleFilter = (filter: string) => {
    if (filter === 'All') {
      setSelectedFilters(['All']);
    } else {
      const newFilters = selectedFilters.filter(f => f !== 'All');
      if (selectedFilters.includes(filter)) {
        const updated = newFilters.filter(f => f !== filter);
        setSelectedFilters(updated.length === 0 ? ['All'] : updated);
      } else {
        setSelectedFilters([...newFilters, filter]);
      }
    }
  };

  const handleResolve = (id:number) => {
    setResolveModal(id);
  };

  const confirmResolve = () => {
    setResolveModal(null);
    setResolutionNotes('');
  };

  const filteredInsights = filterInsights();
  const isPaidUser = true; // Set to false to show paywall

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 font-sans">
      <div className="flex">
        {/* Main Content */}
        <div className="flex-1 p-6 pr-0">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold mb-1">AI Insights</h1>
                <p className="text-sm text-gray-400">
                  <span className="text-white font-mono">24 total</span>, 
                  <span className="text-red-400 font-mono ml-2">3 unresolved</span>
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {['All', 'Critical', 'Warning', 'Info', 'Resolved', 'Pending Review'].map(filter => (
                <button
                  key={filter}
                  onClick={() => toggleFilter(filter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedFilters.includes(filter)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {filter === 'Critical' && '🔴 '}
                  {filter === 'Warning' && '🟡 '}
                  {filter === 'Info' && '🔵 '}
                  {filter === 'Resolved' && '✓ '}
                  {filter === 'Pending Review' && '⏳ '}
                  {filter}
                </button>
              ))}
            </div>

            {/* Sort and Dataset Filter */}
            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option>Newest First</option>
                <option>Oldest First</option>
                <option>By Severity</option>
                <option>By Dataset</option>
              </select>

              <select
                value={selectedDataset}
                onChange={(e) => setSelectedDataset(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                {datasets.map(ds => (
                  <option key={ds}>{ds}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Insights Grid */}
          <div className="space-y-4 pr-6">
            {filteredInsights.map((insight, index) => {
              const SeverityIcon = severityConfig[insight.severity].icon;
              const isExpanded = expandedCard === insight.id;
              const isBlurred = !isPaidUser && index >= 3;

              return (
                <div key={insight.id} className="relative">
                  <div
                    className={`bg-gray-900 rounded-lg border transition-all ${
                      isExpanded ? 'border-blue-500' : 'border-gray-800'
                    } hover:shadow-lg hover:shadow-${insight.severity === 'critical' ? 'red' : insight.severity === 'warning' ? 'yellow' : 'blue'}-900/20 ${
                      isBlurred ? 'blur-sm' : ''
                    }`}
                    style={{
                      borderLeftWidth: '4px',
                      borderLeftColor: severityConfig[insight.severity].color
                    }}
                  >
                    {/* Card Header */}
                    <div
                      className="p-4 cursor-pointer"
                      onClick={() => !isBlurred && setExpandedCard(isExpanded ? null : insight.id)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start gap-2 flex-1">
                          <SeverityIcon
                            className={`w-5 h-5 mt-0.5 ${
                              insight.severity === 'critical' ? 'animate-pulse' : ''
                            }`}
                            style={{ color: severityConfig[insight.severity].color }}
                          />
                          <div className="flex-1">
                            <h3 className="text-base font-semibold mb-1">{insight.title}</h3>
                            <p className="text-xs text-gray-400">
                              Generated {insight.time} • Dataset: <span className="text-gray-300">{insight.dataset}</span>
                            </p>
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
                      </div>

                      {/* Summary */}
                      <p className="text-sm text-gray-300 mb-3 leading-relaxed">{insight.summary}</p>

                      {/* Metrics */}
                      <div className="mb-3">
                        <h4 className="text-xs font-semibold text-gray-400 mb-2">📊 KEY METRICS</h4>
                        <div className="grid grid-cols-3 gap-3">
                          {insight.metrics.map((metric, idx) => {
                            const MetricIcon = metric.icon;
                            return (
                              <div key={idx} className="bg-gray-800 rounded p-2">
                                <div className="flex items-center gap-1 mb-1">
                                  <MetricIcon className="w-3 h-3 text-gray-400" />
                                  <span className="text-xs text-gray-400">{metric.label}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span className={`text-sm font-mono font-bold ${
                                    metric.trend === 'up' ? 'text-red-400' :
                                    metric.trend === 'down' ? 'text-green-400' :
                                    'text-gray-300'
                                  }`}>
                                    {metric.value}
                                  </span>
                                  {metric.trend === 'up' && <TrendingUp className="w-3 h-3 text-red-400" />}
                                  {metric.trend === 'down' && <TrendingDown className="w-3 h-3 text-green-400" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Recommendation */}
                      <div className="bg-blue-950/30 border border-blue-900/50 rounded p-3 mb-3">
                        <h4 className="text-xs font-semibold text-blue-400 mb-1 flex items-center gap-1">
                          💡 RECOMMENDATION
                        </h4>
                        <p className="text-sm text-gray-300">{insight.recommendation}</p>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-gray-800 pt-3 mt-3">
                          <h4 className="text-xs font-semibold text-gray-400 mb-3">DETAILS</h4>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Confidence Score</p>
                              <p className="text-lg font-mono font-bold text-green-400">{insight.confidence}%</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400 mb-1">Model Used</p>
                              <p className="text-sm text-gray-300">{insight.model}</p>
                            </div>
                          </div>

                          <div className="bg-gray-800 rounded p-3">
                            <p className="text-xs text-gray-400 mb-2">Trend Analysis</p>
                            <ResponsiveContainer width="100%" height={120}>
                              <LineChart data={insight.chartData}>
                                <XAxis dataKey="time" stroke="#6b7280" style={{ fontSize: '10px' }} />
                                <YAxis stroke="#6b7280" style={{ fontSize: '10px' }} />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '4px' }}
                                  labelStyle={{ color: '#9ca3af' }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="value"
                                  stroke={severityConfig[insight.severity].color}
                                  strokeWidth={2}
                                  dot={{ fill: severityConfig[insight.severity].color }}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="px-4 pb-4 flex items-center justify-between border-t border-gray-800 pt-3">
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs font-medium flex items-center gap-1 transition-colors">
                          <ExternalLink className="w-3 h-3" />
                          View Dataset
                        </button>
                        <button className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded text-xs font-medium flex items-center gap-1 transition-colors">
                          <FileText className="w-3 h-3" />
                          Export Report
                        </button>
                        {insight.status !== 'resolved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolve(insight.id);
                            }}
                            className="px-3 py-1.5 bg-green-800 hover:bg-green-700 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle className="w-3 h-3" />
                            Mark as Resolved
                          </button>
                        )}
                      </div>
                      
                      <div>
                        {insight.status === 'resolved' ? (
                          <span className="px-2 py-1 rounded-full text-xs font-mono font-bold bg-green-900/50 text-green-400">
                            ✅ Resolved {insight.resolvedTime} by {insight.resolvedBy}
                          </span>
                        ) : (
                          <span
                            className="px-2 py-1 rounded-full text-xs font-mono font-bold"
                            style={{
                              backgroundColor: `${statusConfig[insight.status].color}20`,
                              color: statusConfig[insight.status].color
                            }}
                          >
                            {statusConfig[insight.status].label}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Paywall Overlay */}
                  {isBlurred && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 rounded-lg">
                      <div className="text-center p-6">
                        <Lock className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <h3 className="text-lg font-bold mb-2">🔒 Upgrade to Pro for Unlimited Insights</h3>
                        <p className="text-sm text-gray-400 mb-1">Free plan: 3/3 insights used this month</p>
                        <p className="text-sm text-gray-300 mb-4">Pro plan: Unlimited + priority processing</p>
                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-medium text-sm transition-colors">
                          View Pricing →
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sticky Sidebar */}
        <div className="w-80 p-6 space-y-4 overflow-y-auto h-screen sticky top-0">
          {/* Insights Summary */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <h3 className="text-sm font-bold mb-3 text-gray-300">INSIGHTS SUMMARY</h3>
            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">This Month</p>
              <p className="text-3xl font-bold font-mono">24</p>
              <p className="text-xs text-gray-400">Total Insights</p>
            </div>
            <div className="space-y-2 mb-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">🔴 Critical</span>
                <span className="font-mono text-red-400">3</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">🟡 Warnings</span>
                <span className="font-mono text-yellow-400">8</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">🔵 Info</span>
                <span className="font-mono text-blue-400">13</span>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-800">
              <p className="text-sm">
                <span className="font-mono text-green-400 font-bold">18</span>
                <span className="text-gray-400 ml-1">Resolved (75%)</span>
              </p>
            </div>
          </div>

          {/* Top Affected Datasets */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <h3 className="text-sm font-bold mb-3 text-gray-300">TOP AFFECTED DATASETS</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">1. Factory Floor A</span>
                <span className="font-mono text-xs text-gray-400">12 insights</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">2. Warehouse B</span>
                <span className="font-mono text-xs text-gray-400">7 insights</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">3. Smart Grid</span>
                <span className="font-mono text-xs text-gray-400">5 insights</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <h3 className="text-sm font-bold mb-3 text-gray-300">QUICK ACTIONS</h3>
            <div className="space-y-2">
              <button className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Zap className="w-4 h-4" />
                Run New Analysis
              </button>
              <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Clock className="w-4 h-4" />
                Schedule Auto-Analysis
              </button>
              <button className="w-full px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Configure Alerts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setResolveModal(null)}>
          <div className="bg-gray-900 rounded-lg border border-gray-700 p-6 max-w-md w-full m-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Mark insight as resolved?</h3>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Optional notes about resolution"
              className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-sm focus:outline-none focus:border-blue-500 mb-4"
              rows={4}
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setResolveModal(null)}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmResolve}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded text-sm font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InsightsPage;