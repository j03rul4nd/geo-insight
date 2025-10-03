'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, Activity, AlertTriangle, TrendingUp, 
  Eye, Download, Plus, Upload, Wifi, Play, Bell,
  ChevronRight, Sparkles, Server, MapPin
} from 'lucide-react';

// Types
interface KPICard {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  trend?: number;
  icon: React.ReactNode;
  color: string;
  gauge?: boolean;
  critical?: boolean;
}

interface AIInsight {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  title: string;
  timestamp: string;
  location: string;
  description?: string;
}

interface ActivityEvent {
  id: string;
  type: 'connection' | 'data' | 'alert' | 'update' | 'analysis';
  message: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

interface Dataset {
  id: string;
  name: string;
  points: string;
  status: 'live' | 'idle' | 'error';
  lastUpdate: string;
}

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const [showQuickActions, setShowQuickActions] = useState(false);

  // Simulate real-time updates
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // KPI Data
  const kpis: KPICard[] = [
    {
      id: 'datasets',
      title: 'ACTIVE DATASETS',
      value: '3',
      subtitle: '12.4K data points today',
      trend: 8,
      icon: <Database className="w-5 h-5" />,
      color: 'text-blue-400'
    },
    {
      id: 'health',
      title: 'SYSTEM HEALTH',
      value: '99.9%',
      subtitle: 'uptime',
      icon: <Activity className="w-5 h-5" />,
      color: 'text-emerald-400',
      gauge: true
    },
    {
      id: 'alerts',
      title: 'CRITICAL ALERTS',
      value: '2',
      subtitle: 'Requires immediate attention',
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-red-400',
      critical: true
    },
    {
      id: 'insights',
      title: 'AI INSIGHTS GENERATED',
      value: '47',
      subtitle: 'this month • 3 pending review',
      icon: <Sparkles className="w-5 h-5" />,
      color: 'text-purple-400'
    }
  ];

  // AI Insights Data
  const insights: AIInsight[] = [
    {
      id: '1',
      severity: 'critical',
      title: 'Unusual pattern in Sector 7-B',
      timestamp: '5 min ago',
      location: 'Factory Floor A'
    },
    {
      id: '2',
      severity: 'info',
      title: 'Route efficiency can improve 23%',
      timestamp: '23 min ago',
      location: 'Warehouse B'
    },
    {
      id: '3',
      severity: 'warning',
      title: 'Maintenance needed in 48-72h',
      timestamp: '1 hour ago',
      location: 'Zone 3B Sensors'
    }
  ];

  // Activity Feed Data
  const activities: ActivityEvent[] = [
    {
      id: '1',
      type: 'connection',
      message: 'Dataset "Warehouse B" connected',
      timestamp: '2 min ago',
      status: 'success'
    },
    {
      id: '2',
      type: 'data',
      message: 'New data received: 1,245 points',
      timestamp: '5 min ago',
      status: 'info'
    },
    {
      id: '3',
      type: 'alert',
      message: 'Temperature threshold exceeded in Zone 3B',
      timestamp: '12 min ago',
      status: 'warning'
    },
    {
      id: '4',
      type: 'update',
      message: 'Dataset "Factory Floor A" updated',
      timestamp: '18 min ago',
      status: 'success'
    },
    {
      id: '5',
      type: 'analysis',
      message: 'AI analysis completed: Route optimization',
      timestamp: '25 min ago',
      status: 'info'
    }
  ];

  // Datasets
  const datasets: Dataset[] = [
    {
      id: '1',
      name: 'Factory Floor A',
      points: '8.2K',
      status: 'live',
      lastUpdate: '2 min ago'
    },
    {
      id: '2',
      name: 'Warehouse B',
      points: '12.4K',
      status: 'live',
      lastUpdate: '5 min ago'
    },
    {
      id: '3',
      name: 'Zone 3B Sensors',
      points: '3.1K',
      status: 'idle',
      lastUpdate: '45 min ago'
    }
  ];

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/20 text-red-400';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400';
      default:
        return 'bg-blue-500/10 border-blue-500/20 text-blue-400';
    }
  };

  const getStatusDot = (status: string) => {
    const baseClass = "w-2 h-2 rounded-full";
    switch (status) {
      case 'live':
      case 'success':
        return `${baseClass} bg-emerald-400 animate-pulse`;
      case 'warning':
        return `${baseClass} bg-yellow-400 animate-pulse`;
      case 'error':
        return `${baseClass} bg-red-400 animate-pulse`;
      default:
        return `${baseClass} bg-gray-500`;
    }
  };

  const getActivityIcon = (type: string, status: string) => {
    const iconClass = "w-4 h-4";
    const color = status === 'success' ? 'text-emerald-400' : 
                  status === 'warning' ? 'text-yellow-400' : 
                  status === 'error' ? 'text-red-400' : 'text-blue-400';
    
    switch (type) {
      case 'connection':
        return <Wifi className={`${iconClass} ${color}`} />;
      case 'data':
        return <Database className={`${iconClass} ${color}`} />;
      case 'alert':
        return <AlertTriangle className={`${iconClass} ${color}`} />;
      case 'analysis':
        return <Sparkles className={`${iconClass} ${color}`} />;
      default:
        return <Activity className={`${iconClass} ${color}`} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold text-sm">
                IA
              </div>
              <span className="font-semibold text-lg">IndustrialAI</span>
            </div>
            <span className="text-gray-500">|</span>
            <h1 className="text-gray-400 text-sm">Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search... (Cmd+K)"
                className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 w-80 text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <button className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-8 h-8 bg-gray-700 rounded-full"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.id}
              className={`bg-[#18181b] border ${
                kpi.critical ? 'border-red-500/30' : 'border-[#27272a]'
              } rounded-lg p-5 hover:border-gray-700 transition-colors`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 tracking-wide">
                  {kpi.title}
                </span>
                <div className={kpi.color}>{kpi.icon}</div>
              </div>
              
              <div className="space-y-2">
                <div className={`font-mono text-4xl font-bold ${
                  kpi.critical ? 'text-red-400 animate-pulse' : ''
                }`}>
                  {kpi.value}
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">{kpi.subtitle}</span>
                  {kpi.trend && (
                    <span className={`flex items-center ${
                      kpi.trend > 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {kpi.trend}%
                    </span>
                  )}
                </div>

                {kpi.gauge && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
                        style={{ width: kpi.value }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-3 gap-4">
          {/* Latest AI Insights */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Latest AI Insights</h2>
              <button className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`border rounded-lg p-4 ${getSeverityStyles(insight.severity)} hover:bg-opacity-80 transition-all cursor-pointer`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      insight.severity === 'critical' ? 'bg-red-500/20' :
                      insight.severity === 'warning' ? 'bg-yellow-500/20' :
                      'bg-blue-500/20'
                    }`}>
                      {insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">{insight.timestamp}</span>
                  </div>
                  
                  <h3 className="font-medium mb-1">{insight.title}</h3>
                  <p className="text-xs text-gray-400 mb-3">{insight.location}</p>
                  
                  <button className="text-sm flex items-center gap-1 hover:gap-2 transition-all">
                    View Details
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">Live Activity</h2>
              <div className={getStatusDot('live')}></div>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {activities.map((activity, index) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                      {getActivityIcon(activity.type, activity.status)}
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-px h-full bg-gray-800 my-1"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-gray-200">{activity.message}</p>
                    <span className="text-xs text-gray-500">{activity.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Your Datasets */}
          <div className="bg-[#18181b] border border-[#27272a] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Datasets</h2>
              <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                <Plus className="w-4 h-4" />
                New Dataset
              </button>
            </div>

            <div className="space-y-3">
              {datasets.map((dataset) => (
                <div
                  key={dataset.id}
                  className="border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
                >
                  <div className="flex items-start gap-2 mb-3">
                    <div className={getStatusDot(dataset.status)}></div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{dataset.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="font-mono">{dataset.points} points</span>
                        <span>•</span>
                        <span className={dataset.status === 'live' ? 'text-emerald-400' : ''}>
                          {dataset.status.charAt(0).toUpperCase() + dataset.status.slice(1)}
                        </span>
                        <span>•</span>
                        <span>Updated {dataset.lastUpdate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs px-3 py-2 rounded flex items-center justify-center gap-1 transition-colors">
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                    <button className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs px-3 py-2 rounded flex items-center justify-center gap-1 transition-colors">
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Quick Actions Floating Button */}
      <div className="fixed bottom-8 right-8 z-50">
        {showQuickActions && (
          <div className="absolute bottom-16 right-0 bg-[#18181b] border border-[#27272a] rounded-lg shadow-2xl p-2 min-w-[200px] mb-2">
            {[
              { icon: <Upload className="w-4 h-4" />, label: 'Upload CSV' },
              { icon: <Wifi className="w-4 h-4" />, label: 'Connect MQTT' },
              { icon: <Play className="w-4 h-4" />, label: 'Run AI Analysis' },
              { icon: <Bell className="w-4 h-4" />, label: 'Create Alert' }
            ].map((action, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-800 rounded transition-colors text-sm"
              >
                {action.icon}
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        )}
        
        <button
          onClick={() => setShowQuickActions(!showQuickActions)}
          className="w-14 h-14 bg-blue-500 hover:bg-blue-600 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        >
          <Plus className={`w-6 h-6 transition-transform ${showQuickActions ? 'rotate-45' : ''}`} />
        </button>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #18181b;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #27272a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;