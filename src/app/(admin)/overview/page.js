/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { getApiUrl } from '@/config/api';
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
  Activity,
  LucideLogOut
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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

export default function OverviewPage() {
  // State for metrics and data
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    validCalls: 0,
    qualifiedCalls: 0,
    qualificationRate: 0,
    avgCallDuration: '0:00',
  });

  const [callsData, setCallsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [callsOverTimeData, setCallsOverTimeData] = useState([]);
  const [durationData, setDurationData] = useState([]);

  // Calculate call distribution data based on real metrics
  const callDistributionData = [
    { name: 'Qualified', value: metrics.qualifiedCalls, color: '#10b981' },
    { name: 'Valid (Not Qualified)', value: metrics.validCalls - metrics.qualifiedCalls, color: '#3b82f6' },
    { name: 'Failed/Missed', value: metrics.totalCalls - metrics.validCalls, color: '#ef4444' },
  ].filter(item => item.value > 0); // Only show categories with values

  // Fetch data from API
  useEffect(() => {
    const fetchCallsSummary = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user_id from localStorage
        const userId = localStorage.getItem('user_id') || "68bedea50a1f8b06e6dac22e"; // Fallback for testing
        
        if (!userId) {
          setError('User ID not found. Please log in again.');
          setLoading(false);
          return;
        }

        // Make API call
        const apiUrl = getApiUrl(`/api/calls/user-calls-summary?user_id=${userId}`);
        console.log('Fetching from:', apiUrl); // Debug log
        const response = await fetch(apiUrl, {
          headers: {
            'ngrok-skip-browser-warning': 'true', // Skip ngrok warning page
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch calls summary');
        }

        const data = await response.json();

        // Format average duration from seconds to mm:ss
        const formatDuration = (seconds) => {
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return `${mins}:${secs.toString().padStart(2, '0')}`;
        };

        // Update metrics
        setMetrics({
          totalCalls: data.total_calls || 0,
          validCalls: data.valid_calls || 0,
          qualifiedCalls: data.qualified_calls || 0,
          qualificationRate: data.total_calls > 0 
            ? ((data.qualified_calls / data.total_calls) * 100).toFixed(1)
            : 0,
          avgCallDuration: formatDuration(data.average_duration_seconds || 0),
        });

        // Process calls for time-based chart
        const callsByDate = {};
        (data.calls || []).forEach((call) => {
          const date = new Date(call.started_at);
          const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          if (!callsByDate[dateKey]) {
            callsByDate[dateKey] = {
              date: dateKey,
              calls: 0,
              validCalls: 0,
              qualifiedCalls: 0,
            };
          }
          
          callsByDate[dateKey].calls += 1;
          
          if (call.status === 'completed') {
            callsByDate[dateKey].validCalls += 1;
            callsByDate[dateKey].qualifiedCalls += 1; // Assuming completed calls are qualified
          }
        });
        
        const timeData = Object.values(callsByDate).sort((a, b) => {
          const dateA = new Date(a.date + ' 2025');
          const dateB = new Date(b.date + ' 2025');
          return dateA - dateB;
        });
        
        setCallsOverTimeData(timeData);

        // Process calls for duration distribution
        const durationBuckets = {
          '0-1 min': 0,
          '1-2 min': 0,
          '2-5 min': 0,
          '5-10 min': 0,
          '10+ min': 0,
        };
        
        (data.calls || []).forEach((call) => {
          const minutes = call.duration_seconds / 60;
          
          if (minutes < 1) {
            durationBuckets['0-1 min'] += 1;
          } else if (minutes < 2) {
            durationBuckets['1-2 min'] += 1;
          } else if (minutes < 5) {
            durationBuckets['2-5 min'] += 1;
          } else if (minutes < 10) {
            durationBuckets['5-10 min'] += 1;
          } else {
            durationBuckets['10+ min'] += 1;
          }
        });
        
        const durData = Object.entries(durationBuckets).map(([duration, count]) => ({
          duration,
          count,
        }));
        
        setDurationData(durData);

        // Process calls data for activity timeline
        const processedCalls = (data.calls || []).map((call, index) => {
          const startTime = new Date(call.started_at);
          const now = new Date();
          const minutesAgo = Math.floor((now - startTime) / (1000 * 60));
          
          let timeAgo;
          if (minutesAgo < 1) {
            timeAgo = 'Just now';
          } else if (minutesAgo < 60) {
            timeAgo = `${minutesAgo} min ago`;
          } else if (minutesAgo < 1440) {
            const hoursAgo = Math.floor(minutesAgo / 60);
            timeAgo = `${hoursAgo} hour${hoursAgo > 1 ? 's' : ''} ago`;
          } else {
            const daysAgo = Math.floor(minutesAgo / 1440);
            timeAgo = `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago`;
          }

          const duration = formatDuration(call.duration_seconds);
          
          let type = 'valid';
          let status = 'Call Completed';
          
          if (call.status === 'no-answer') {
            type = 'failed';
            status = 'No Answer';
          } else if (call.status === 'completed') {
            type = 'qualified';
            status = 'Call Completed';
          } else if (call.status === 'ringing') {
            type = 'failed';
            status = 'Busy';
          }

          return {
            id: call.call_id,
            type,
            number: call.to || 'unknown number', // Display part of call_id
            status,
            time: timeAgo,
            duration,
          };
        }).reverse(); // Show most recent first

        setCallsData(processedCalls);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching calls summary:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCallsSummary();
  }, []);

  // Calculate qualification rate (qualified calls / total calls)
  const qualificationRate = metrics.totalCalls > 0 
    ? ((metrics.qualifiedCalls / metrics.totalCalls) * 100).toFixed(1)
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


  const router = useRouter();
    const handleLogout = () => {
      // Clear localStorage and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_id');
      router.push('/login');
    };

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Overview</h1>
            <p className="text-gray-600 mt-1">Analytics and performance metrics for your calling agent</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>

            <button
              onClick={() => handleLogout()}
              className="inline-flex items-center gap-2 bg-gray-700 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              <LucideLogOut size={16} />
              Logout
            </button>
          </div>
        </div>


        {/* Header before logout button */}
        {/* <div className="flex items-center px-5  justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Overview</h1>
            <p className="text-gray-600 mt-1">Analytics and performance metrics for your calling agents</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => window.location.reload()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              Refresh Data
            </button>
          </div>
        </div> */}

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <RefreshCw size={20} className="text-blue-600 animate-spin" />
            <p className="text-blue-800">Loading calls summary...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Total Calls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Phone className="text-blue-600" size={24} />
              </div>
              {!loading && <TrendingUp className="text-green-500" size={18} />}
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Calls</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? '...' : metrics.totalCalls}
              </p>
            </div>
          </div>

          {/* Valid Calls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-green-100 rounded-lg p-2">
                <PhoneCall className="text-green-600" size={24} />
              </div>
              {!loading && <TrendingUp className="text-green-500" size={18} />}
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Valid Calls</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? '...' : metrics.validCalls}
              </p>
            </div>
          </div>

          {/* Qualified Calls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-purple-100 rounded-lg p-2">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
              {!loading && <TrendingUp className="text-green-500" size={18} />}
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Qualified Calls</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? '...' : metrics.qualifiedCalls}
              </p>
            </div>
          </div>

          {/* Qualification Rate */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-100 rounded-lg p-2">
                <TrendingUp className="text-orange-600" size={24} />
              </div>
              {!loading && <TrendingUp className="text-green-500" size={18} />}
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Qualification Rate</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? '...' : `${qualificationRate}%`}
              </p>
            </div>
          </div>

          {/* Average Call Duration */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-indigo-100 rounded-lg p-2">
                <Clock className="text-indigo-600" size={24} />
              </div>
              {!loading && <TrendingUp className="text-green-500" size={18} />}
            </div>
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Call Duration</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {loading ? '...' : metrics.avgCallDuration}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Calls Over Time */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Calls Over Time</h3>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <RefreshCw className="animate-spin text-blue-600" size={24} />
              </div>
            ) : callsOverTimeData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No calls data available</p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Call Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Distribution</h3>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <RefreshCw className="animate-spin text-blue-600" size={24} />
              </div>
            ) : callDistributionData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No call data available</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={callDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      outerRadius={90}
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
              </>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Call Duration Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Call Duration Distribution</h3>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <RefreshCw className="animate-spin text-blue-600" size={24} />
              </div>
            ) : durationData.length === 0 || durationData.every(d => d.count === 0) ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No duration data available</p>
              </div>
            ) : (
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
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <Activity className="text-gray-400" size={20} />
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-[300px]">
                <RefreshCw className="animate-spin text-blue-600" size={24} />
              </div>
            ) : callsData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                <p>No recent calls found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                {callsData.map((activity) => (
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
            )}
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
