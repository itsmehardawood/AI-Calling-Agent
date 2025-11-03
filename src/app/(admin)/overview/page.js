/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { 
  Phone, 
  PhoneCall, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  Plus,
  PhoneOutgoing,
  Package,
  RefreshCw,
  Activity
} from 'lucide-react';

// Dynamic imports for recharts to avoid SSR issues
const ResponsiveContainer = dynamic(
  () => import('recharts').then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);
const AreaChart = dynamic(
  () => import('recharts').then((mod) => mod.AreaChart),
  { ssr: false }
);
const Area = dynamic(
  () => import('recharts').then((mod) => mod.Area),
  { ssr: false }
);
const BarChart = dynamic(
  () => import('recharts').then((mod) => mod.BarChart),
  { ssr: false }
);
const Bar = dynamic(
  () => import('recharts').then((mod) => mod.Bar),
  { ssr: false }
);
const PieChart = dynamic(
  () => import('recharts').then((mod) => mod.PieChart),
  { ssr: false }
);
const Pie = dynamic(
  () => import('recharts').then((mod) => mod.Pie),
  { ssr: false }
);
const Cell = dynamic(
  () => import('recharts').then((mod) => mod.Cell),
  { ssr: false }
);
const XAxis = dynamic(
  () => import('recharts').then((mod) => mod.XAxis),
  { ssr: false }
);
const YAxis = dynamic(
  () => import('recharts').then((mod) => mod.YAxis),
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
  { ssr: false }
);
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
);
const LineChart = dynamic(
  () => import('recharts').then((mod) => mod.LineChart),
  { ssr: false }
);
const Line = dynamic(
  () => import('recharts').then((mod) => mod.Line),
  { ssr: false }
);

// Mock data for calls over time
const callsOverTimeData = [
  { date: 'Oct 28', calls: 45, validCalls: 38, qualifiedCalls: 15 },
  { date: 'Oct 29', calls: 52, validCalls: 44, qualifiedCalls: 18 },
  { date: 'Oct 30', calls: 48, validCalls: 40, qualifiedCalls: 16 },
  { date: 'Oct 31', calls: 61, validCalls: 53, qualifiedCalls: 22 },
  { date: 'Nov 1', calls: 55, validCalls: 47, qualifiedCalls: 19 },
  { date: 'Nov 2', calls: 58, validCalls: 50, qualifiedCalls: 21 },
  { date: 'Nov 3', calls: 67, validCalls: 58, qualifiedCalls: 25 },
];

// Mock data for call distribution
const callDistributionData = [
  { name: 'Qualified', value: 136, color: '#10b981' },
  { name: 'Valid (Not Qualified)', value: 194, color: '#3b82f6' },
  { name: 'Failed/Missed', value: 56, color: '#ef4444' },
];

// Mock data for call duration distribution
const durationData = [
  { duration: '0-1 min', count: 45 },
  { duration: '1-2 min', count: 120 },
  { duration: '2-5 min', count: 150 },
  { duration: '5-10 min', count: 55 },
  { duration: '10+ min', count: 16 },
];

// Mock data for recent activity timeline
const recentActivityData = [
  { id: 1, type: 'qualified', number: '+1-555-0123', status: 'Qualified Lead', time: '2 min ago', duration: '4:32' },
  { id: 2, type: 'valid', number: '+1-555-0456', status: 'Call Completed', time: '5 min ago', duration: '2:15' },
  { id: 3, type: 'qualified', number: '+1-555-0789', status: 'Meeting Scheduled', time: '8 min ago', duration: '5:48' },
  { id: 4, type: 'failed', number: '+1-555-0234', status: 'No Answer', time: '12 min ago', duration: '0:00' },
  { id: 5, type: 'valid', number: '+1-555-0567', status: 'Call Completed', time: '15 min ago', duration: '3:22' },
  { id: 6, type: 'qualified', number: '+1-555-0890', status: 'Details Shared', time: '18 min ago', duration: '6:10' },
  { id: 7, type: 'valid', number: '+1-555-0345', status: 'Call Completed', time: '22 min ago', duration: '1:45' },
  { id: 8, type: 'failed', number: '+1-555-0678', status: 'Busy', time: '25 min ago', duration: '0:00' },
  { id: 9, type: 'qualified', number: '+1-555-0901', status: 'Lead Updated', time: '28 min ago', duration: '4:05' },
  { id: 10, type: 'valid', number: '+1-555-0432', status: 'Call Completed', time: '32 min ago', duration: '2:50' },
];

export default function OverviewPage() {
  // Mock metrics - Replace with real API data
  const [metrics, setMetrics] = useState({
    totalCalls: 386,
    validCalls: 330,
    qualifiedCalls: 136,
    qualificationRate: 41.2,
    avgCallDuration: '3:24',
  });

  const [loading, setLoading] = useState(false);

  // Calculate qualification rate
  const qualificationRate = metrics.validCalls > 0 
    ? ((metrics.qualifiedCalls / metrics.validCalls) * 100).toFixed(1)
    : 0;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'qualified':
        return <CheckCircle size={16} className="text-green-600" />;
      case 'valid':
        return <PhoneCall size={16} className="text-blue-600" />;
      case 'failed':
        return <Phone size={16} className="text-red-600" />;
      default:
        return <Phone size={16} className="text-gray-600" />;
    }
  };

  const getActivityBgColor = (type) => {
    switch (type) {
      case 'qualified':
        return 'bg-green-100';
      case 'valid':
        return 'bg-blue-100';
      case 'failed':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
            <p className="text-gray-600 mt-1">Analytics and performance metrics for your calling agents</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <RefreshCw size={18} />
              Refresh Data
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Calls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Phone className="text-blue-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={18} />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Calls</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.totalCalls}</p>
              <p className="text-xs text-green-600 mt-2">↑ 12% from last week</p>
            </div>
          </div>

          {/* Valid Calls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 rounded-lg p-2">
                <PhoneCall className="text-green-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={18} />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Valid Calls</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.validCalls}</p>
              <p className="text-xs text-green-600 mt-2">↑ 8% from last week</p>
            </div>
          </div>

          {/* Qualified Calls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={18} />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Qualified Calls</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.qualifiedCalls}</p>
              <p className="text-xs text-green-600 mt-2">↑ 15% from last week</p>
            </div>
          </div>

          {/* Qualification Rate */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-100 rounded-lg p-2">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={18} />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Qualification Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{qualificationRate}%</p>
              <p className="text-xs text-green-600 mt-2">↑ 3% from last week</p>
            </div>
          </div>

          {/* Average Call Duration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-indigo-100 rounded-lg p-2">
                <Clock className="text-indigo-600" size={24} />
              </div>
              <TrendingUp className="text-green-500" size={18} />
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Call Duration</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{metrics.avgCallDuration}</p>
              <p className="text-xs text-green-600 mt-2">↑ 5% from last week</p>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calls Over Time */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={callsOverTimeData}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorValid" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="calls" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorCalls)" 
                  name="Total Calls"
                />
                <Area 
                  type="monotone" 
                  dataKey="validCalls" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorValid)" 
                  name="Valid Calls"
                />
                <Area 
                  type="monotone" 
                  dataKey="qualifiedCalls" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorQualified)" 
                  name="Qualified Calls"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Call Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={callDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {callDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {callDistributionData.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call Duration Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Duration Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="duration" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Activity className="text-gray-400" size={20} />
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
              {recentActivityData.map((activity) => (
                <div 
                  key={activity.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <div className={`${getActivityBgColor(activity.type)} p-2 rounded-lg`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{activity.number}</p>
                    <p className="text-xs text-gray-600">{activity.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{activity.time}</p>
                    <p className="text-xs font-medium text-gray-700">{activity.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex items-center gap-3 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-4 transition-all hover:shadow-md group">
              <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-600 transition-colors">
                <PhoneOutgoing className="text-blue-600 group-hover:text-white" size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Add Caller Number</p>
                <p className="text-xs text-gray-600">Twilio or Business</p>
              </div>
            </button>

            <button className="flex items-center gap-3 bg-white hover:bg-green-50 border border-green-200 rounded-lg p-4 transition-all hover:shadow-md group">
              <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-600 transition-colors">
                <Package className="text-green-600 group-hover:text-white" size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Add Product</p>
                <p className="text-xs text-gray-600">New product/service</p>
              </div>
            </button>

            <button className="flex items-center gap-3 bg-white hover:bg-purple-50 border border-purple-200 rounded-lg p-4 transition-all hover:shadow-md group">
              <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-600 transition-colors">
                <RefreshCw className="text-purple-600 group-hover:text-white" size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Sync Leads</p>
                <p className="text-xs text-gray-600">Update CRM data</p>
              </div>
            </button>

            <button className="flex items-center gap-3 bg-white hover:bg-orange-50 border border-orange-200 rounded-lg p-4 transition-all hover:shadow-md group">
              <div className="bg-orange-100 p-3 rounded-lg group-hover:bg-orange-600 transition-colors">
                <Phone className="text-orange-600 group-hover:text-white" size={20} />
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-900">Start Instant Call</p>
                <p className="text-xs text-gray-600">Make a call now</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </AdminLayout>
  );
}
