'use client';

import React, { useState } from 'react';
import { 
  User, Zap, Bell, CreditCard, Key, Users, Shield, 
  Upload, Check, X, Copy, Plus, Trash2, Edit2, 
  AlertCircle, ExternalLink, Lock, Globe, Power,
  FileText, Activity, Clock, ChevronRight
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

type TabId = 'profile' | 'integrations' | 'notifications' | 'billing' | 'api' | 'team' | 'security';

interface Broker {
  id: string;
  name: string;
  url: string;
  status: 'connected' | 'error' | 'idle';
  datasets: number;
}

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string | null;
}

interface Session {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

interface UsageDataPoint {
  date: string;
  aiInsights: number;
  dataPoints: number;
  apiCalls: number;
}

const StatusDot: React.FC<{ status: 'connected' | 'error' | 'idle' | 'active' }> = ({ status }) => {
  const colors = {
    connected: 'bg-emerald-500',
    active: 'bg-emerald-500',
    error: 'bg-red-500',
    idle: 'bg-gray-500'
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${colors[status]}`} />;
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [showApiModal, setShowApiModal] = useState(false);
  const [showKeyReveal, setShowKeyReveal] = useState(false);
  const [newApiKey] = useState('sk_live_abc123xyz789_this_is_your_secret_key_save_it_now');
  const [plan, setPlan] = useState<'free' | 'pro'>('free');
  
  const [profile, setProfile] = useState({
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@acme-industrial.com',
    timezone: 'Europe/Madrid',
    theme: 'dark',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1.234,56'
  });

  const [notifications, setNotifications] = useState({
    emailCritical: true,
    emailWarning: true,
    emailInfo: false,
    emailDaily: false,
    slackEnabled: false,
    slackWebhook: '',
    frequency: 'batched',
    quietHours: true,
    quietFrom: '22:00',
    quietTo: '08:00'
  });

  const [brokers] = useState<Broker[]>([
    { id: '1', name: 'Production EMQX', url: 'mqtt://emqx.acme.com:1883', status: 'connected', datasets: 3 },
    { id: '2', name: 'Testing HiveMQ', url: 'mqtt://test.hivemq.com:1883', status: 'idle', datasets: 0 }
  ]);

  const [apiKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Production Key', key: 'sk_live_abc1...', created: '2 days ago', lastUsed: '5 min ago' },
    { id: '2', name: 'Testing Key', key: 'sk_test_xyz9...', created: '1 week ago', lastUsed: null }
  ]);

  const [sessions] = useState<Session[]>([
    { id: '1', device: 'Chrome on macOS', location: 'Madrid, Spain', lastActive: 'Active now', isCurrent: true },
    { id: '2', device: 'Chrome on Windows', location: 'Barcelona, Spain', lastActive: '2 days ago', isCurrent: false }
  ]);

  const usageData: UsageDataPoint[] = [
    { date: 'Jan 1', aiInsights: 45, dataPoints: 1200, apiCalls: 890 },
    { date: 'Jan 5', aiInsights: 38, dataPoints: 1100, apiCalls: 750 },
    { date: 'Jan 10', aiInsights: 52, dataPoints: 1350, apiCalls: 920 },
    { date: 'Jan 15', aiInsights: 41, dataPoints: 980, apiCalls: 680 },
    { date: 'Jan 20', aiInsights: 49, dataPoints: 1280, apiCalls: 840 },
    { date: 'Jan 25', aiInsights: 55, dataPoints: 1420, apiCalls: 980 },
    { date: 'Jan 30', aiInsights: 43, dataPoints: 1150, apiCalls: 790 }
  ];

  const tabs = [
    { id: 'profile' as TabId, label: 'Profile', icon: User },
    { id: 'integrations' as TabId, label: 'Integrations', icon: Zap },
    { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
    { id: 'billing' as TabId, label: 'Billing & Usage', icon: CreditCard },
    { id: 'api' as TabId, label: 'API Keys', icon: Key },
    { id: 'team' as TabId, label: 'Team', icon: Users, disabled: plan === 'free' },
    { id: 'security' as TabId, label: 'Security', icon: Shield }
  ];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderProfile = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Personal Information</h2>
        <div className="space-y-6">
          <div className="flex items-start gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
                CM
              </div>
              <button className="mt-2 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                <Upload className="w-3 h-3" /> Change
              </button>
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                <input 
                  type="text" 
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
                <div className="relative">
                  <input 
                    type="email" 
                    value={profile.email}
                    disabled
                    className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-400 cursor-not-allowed pr-32"
                  />
                  <a href="#" className="absolute right-3 top-2.5 text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                    Change in Clerk <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Timezone</label>
                <select 
                  value={profile.timezone}
                  onChange={(e) => setProfile({...profile, timezone: e.target.value})}
                  className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option>Europe/Madrid</option>
                  <option>Europe/London</option>
                  <option>America/New_York</option>
                  <option>Asia/Tokyo</option>
                </select>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
            <div className="flex gap-4">
              {['dark', 'light', 'system'].map(theme => (
                <label key={theme} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="theme" 
                    value={theme}
                    checked={profile.theme === theme}
                    onChange={(e) => setProfile({...profile, theme: e.target.value})}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm text-gray-300 capitalize">{theme}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Date Format</label>
              <select 
                value={profile.dateFormat}
                onChange={(e) => setProfile({...profile, dateFormat: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100 text-sm"
              >
                <option>DD/MM/YYYY</option>
                <option>MM/DD/YYYY</option>
                <option>YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Number Format</label>
              <select 
                value={profile.numberFormat}
                onChange={(e) => setProfile({...profile, numberFormat: e.target.value})}
                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-gray-100 text-sm"
              >
                <option>1,234.56</option>
                <option>1.234,56</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Connected MQTT Brokers</h2>
          <button className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Broker
          </button>
        </div>
        <div className="space-y-3">
          {brokers.map(broker => (
            <div key={broker.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusDot status={broker.status} />
                    <h3 className="font-semibold text-gray-100">{broker.name}</h3>
                  </div>
                  <p className="text-sm text-gray-400 font-mono mb-2">{broker.url}</p>
                  <p className="text-xs text-gray-500">
                    {broker.status === 'connected' ? 'Connected' : 'Idle'} • {broker.datasets} datasets using this
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded">
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded">
                    Test
                  </button>
                  <button className="px-3 py-1.5 text-xs bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-gray-100 mb-2">Webhooks</h2>
        <p className="text-sm text-gray-400 mb-4">Use these URLs to push data to your datasets</p>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <pre className="text-sm text-gray-300 font-mono mb-3 whitespace-pre-wrap">
POST https://yoursaas.com/api/webhooks/dataset/cuid123
Authorization: Bearer sk_live_abc123...
          </pre>
          <div className="flex gap-2">
            <button 
              onClick={() => copyToClipboard('https://yoursaas.com/api/webhooks/dataset/cuid123')}
              className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center gap-1.5"
            >
              <Copy className="w-3 h-3" /> Copy URL
            </button>
            <button className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> View Docs
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">External Tools</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium text-gray-200">Slack</p>
                <p className="text-xs text-gray-500">Connect to receive alerts</p>
              </div>
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-300">Configure</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded">
            <div className="flex items-center gap-3">
              <input type="checkbox" className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium text-gray-200">Grafana</p>
                <p className="text-xs text-gray-500">Export dashboard</p>
              </div>
            </div>
            <button className="text-xs text-blue-400 hover:text-blue-300">Configure</button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked readOnly className="w-4 h-4" />
              <div>
                <p className="text-sm font-medium text-gray-200">Email Notifications</p>
                <p className="text-xs text-gray-500">Configured ✓</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Alert Channels</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Email Notifications</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked readOnly className="w-4 h-4" />
                <span className="text-sm text-gray-300">Critical Alerts <span className="text-xs text-gray-500">(always enabled)</span></span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={notifications.emailWarning}
                  onChange={(e) => setNotifications({...notifications, emailWarning: e.target.checked})}
                  className="w-4 h-4" 
                />
                <span className="text-sm text-gray-300">Warning Alerts</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={notifications.emailInfo}
                  onChange={(e) => setNotifications({...notifications, emailInfo: e.target.checked})}
                  className="w-4 h-4" 
                />
                <span className="text-sm text-gray-300">Info Updates</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={notifications.emailDaily}
                  onChange={(e) => setNotifications({...notifications, emailDaily: e.target.checked})}
                  className="w-4 h-4" 
                />
                <span className="text-sm text-gray-300">Daily Summary Report</span>
              </label>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-200">Slack Notifications</h3>
              <button className="text-xs text-blue-400 hover:text-blue-300">⚙️ Configure Integration</button>
            </div>
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input 
                type="checkbox"
                checked={notifications.slackEnabled}
                onChange={(e) => setNotifications({...notifications, slackEnabled: e.target.checked})}
                className="w-4 h-4" 
              />
              <span className="text-sm text-gray-300">Send alerts to Slack channel</span>
            </label>
            <input 
              type="text"
              placeholder="Webhook URL"
              value={notifications.slackWebhook}
              onChange={(e) => setNotifications({...notifications, slackWebhook: e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Notification Preferences</h2>
        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Frequency</h3>
            <div className="space-y-2">
              {[
                { value: 'realtime', label: 'Real-time (as they happen)' },
                { value: 'batched', label: 'Batched (every 15 minutes)' },
                { value: 'daily', label: 'Daily digest (9:00 AM)' }
              ].map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="frequency" 
                    value={option.value}
                    checked={notifications.frequency === option.value}
                    onChange={(e) => setNotifications({...notifications, frequency: e.target.value})}
                    className="w-4 h-4" 
                  />
                  <span className="text-sm text-gray-300">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4">
            <h3 className="text-sm font-semibold text-gray-200 mb-3">Quiet Hours</h3>
            <label className="flex items-center gap-2 cursor-pointer mb-3">
              <input 
                type="checkbox"
                checked={notifications.quietHours}
                onChange={(e) => setNotifications({...notifications, quietHours: e.target.checked})}
                className="w-4 h-4" 
              />
              <span className="text-sm text-gray-300">Enable quiet hours</span>
            </label>
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1">From</label>
                <input 
                  type="time"
                  value={notifications.quietFrom}
                  onChange={(e) => setNotifications({...notifications, quietFrom: e.target.value})}
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">To</label>
                <input 
                  type="time"
                  value={notifications.quietTo}
                  onChange={(e) => setNotifications({...notifications, quietTo: e.target.value})}
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBilling = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Current Plan</h2>
        <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-2 border-blue-500/30 rounded-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-100 mb-1">Free Plan</h3>
              <p className="text-sm text-gray-400">Perfect for testing and small projects</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-100">€0</div>
              <div className="text-xs text-gray-400">per month</div>
            </div>
          </div>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Datasets</span>
              <span className="font-mono text-gray-100">1/1 <span className="text-red-400">used</span></span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{width: '100%'}}></div>
            </div>

            <div className="flex items-center justify-between text-sm mt-4">
              <span className="text-gray-300">AI Insights</span>
              <span className="font-mono text-gray-100">3/3 <span className="text-red-400">used this month</span></span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full" style={{width: '100%'}}></div>
            </div>

            <div className="flex items-center justify-between text-sm mt-4">
              <span className="text-gray-300">Data Points</span>
              <span className="font-mono text-gray-100">42/100 <span className="text-yellow-400">used today</span></span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{width: '42%'}}></div>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-4">
            Resets: AI insights on Jan 1 | Data points daily
          </p>

          <button 
            onClick={() => setPlan('pro')}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
          >
            Upgrade to Pro <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {plan === 'pro' && (
        <>
          <div className="border-t border-gray-800 pt-8">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Usage History</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={usageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" style={{fontSize: '12px'}} />
                  <YAxis stroke="#9CA3AF" style={{fontSize: '12px'}} />
                  <Tooltip 
                    contentStyle={{backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '6px'}}
                    labelStyle={{color: '#F3F4F6'}}
                  />
                  <Bar dataKey="aiInsights" fill="#3B82F6" name="AI Insights" />
                  <Bar dataKey="dataPoints" fill="#10B981" name="Data Points" />
                  <Bar dataKey="apiCalls" fill="#F59E0B" name="API Calls" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <h2 className="text-lg font-semibold text-gray-100 mb-4">Billing</h2>
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Next billing date</span>
                <span className="text-sm font-semibold text-gray-100">January 15, 2025</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Amount</span>
                <span className="text-lg font-bold text-gray-100">€29.00 EUR</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <span className="text-sm text-gray-400">Payment method</span>
                <span className="text-sm font-mono text-gray-100">•••• 4242</span>
              </div>
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded text-sm font-medium">
                  Update Payment Method
                </button>
                <button className="flex-1 px-4 py-2 bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded text-sm font-medium">
                  Cancel Subscription
                </button>
              </div>
              <button className="w-full text-xs text-blue-400 hover:text-blue-300 flex items-center justify-center gap-1 pt-2">
                View Invoice History <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderApiKeys = () => (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-100">Your API Keys</h2>
          <button 
            onClick={() => setShowApiModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Create New API Key
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-800/50 border-b border-gray-800">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Key</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Created</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Last Used</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map(key => (
                <tr key={key.id} className="border-b border-gray-800 last:border-0">
                  <td className="px-4 py-3 text-sm text-gray-300">{key.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-gray-400">{key.key}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{key.created}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{key.lastUsed || 'Never'}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="px-3 py-1 text-xs bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded">
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">API Documentation</h2>
        <div className="bg-gradient-to-br from-blue-900/10 to-cyan-900/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500/10 rounded-lg p-3">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">📚 API Reference</h3>
              <div className="space-y-1 mb-4">
                <p className="text-sm text-gray-400">
                  <span className="font-semibold text-gray-300">Base URL:</span> <span className="font-mono">https://api.yoursaas.com/v1</span>
                </p>
                <p className="text-sm text-gray-400">
                  <span className="font-semibold text-gray-300">Authentication:</span> Bearer token in header
                </p>
              </div>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded font-medium flex items-center gap-1.5">
                View Full Docs <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showApiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">Create API Key</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name</label>
                <input 
                  type="text" 
                  placeholder="Production Key"
                  className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Expires</label>
                <select className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100">
                  <option>Never</option>
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>1 year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Rate Limit</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number" 
                    defaultValue="1000"
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-3 py-2 text-gray-100 focus:outline-none focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-400">requests/hour</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowApiModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded font-medium"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowApiModal(false);
                  setShowKeyReveal(true);
                }}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
              >
                Create Key
              </button>
            </div>
          </div>
        </div>
      )}

      {showKeyReveal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 w-full max-w-md">
            <div className="flex items-start gap-3 mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-yellow-400 mb-1">Save this key now!</h3>
                <p className="text-xs text-yellow-400/80">You won&apos;t be able to see it again.</p>
              </div>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded p-4 mb-4">
              <p className="text-xs text-gray-400 mb-2">Your API Key</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm font-mono text-gray-100 break-all">
                  {newApiKey}
                </code>
                <button 
                  onClick={() => copyToClipboard(newApiKey)}
                  className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                >
                  <Copy className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>
            <button 
              onClick={() => setShowKeyReveal(false)}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium"
            >
              I&apos;ve saved my key
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Active Sessions</h2>
        <div className="space-y-3">
          {sessions.map(session => (
            <div key={session.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-800 rounded-lg p-2">
                    <Globe className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-100">{session.device}</h3>
                      {session.isCurrent && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-400">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{session.location}</p>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <StatusDot status="active" />
                      {session.lastActive}
                    </p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <button className="px-3 py-1.5 text-xs bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded">
                    Revoke Session
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-800 pt-8">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Two-Factor Authentication</h2>
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-gray-100 mb-1">Enable 2FA</h3>
              <p className="text-sm text-gray-400">Managed by Clerk for enhanced security</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <a href="#" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Configure in Clerk Security Settings <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-56 border-r border-gray-800 min-h-screen bg-gray-950 p-4">
          <h1 className="text-xl font-bold text-gray-100 mb-6 px-2">Settings</h1>
          <nav className="space-y-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.disabled;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-medium transition-all
                    ${isActive 
                      ? 'bg-gray-900 text-gray-100 border-l-2 border-blue-500' 
                      : isDisabled
                        ? 'text-gray-600 cursor-not-allowed'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {isDisabled && <Lock className="w-3 h-3 ml-auto" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="max-w-4xl mx-auto p-8">
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'integrations' && renderIntegrations()}
            {activeTab === 'notifications' && renderNotifications()}
            {activeTab === 'billing' && renderBilling()}
            {activeTab === 'api' && renderApiKeys()}
            {activeTab === 'team' && (
              <div className="text-center py-12">
                <Lock className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-300 mb-2">Team Management</h2>
                <p className="text-gray-500 mb-6">Upgrade to Pro to unlock team features</p>
                <button className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">
                  Upgrade Now
                </button>
              </div>
            )}
            {activeTab === 'security' && renderSecurity()}
          </div>
        </div>
      </div>
    </div>
  );
}