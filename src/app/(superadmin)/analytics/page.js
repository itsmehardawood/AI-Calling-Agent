/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from 'react';
import SuperAdminLayout from '@/app/components/superadmin/SuperAdminLayout';
import { getApiUrl } from '@/config/api';
import { 
  BarChart3,
  RefreshCw,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AnalyticsPage() {
  const [globalData, setGlobalData] = useState(null);
  const [regionsData, setRegionsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from both APIs
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        const role = localStorage.getItem('role') || 'superadmin';
        const token = localStorage.getItem('access_token');

        // Fetch global overview data
        const globalUrl = getApiUrl(`/super_admin/global-overview/${role}`);
        const globalResponse = await fetch(globalUrl, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!globalResponse.ok) {
          throw new Error('Failed to fetch global data');
        }

        const globalJson = await globalResponse.json();

        // Fetch regional data
        const regionsUrl = getApiUrl('/super_admin/numbers-regions');
        const regionsResponse = await fetch(regionsUrl, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!regionsResponse.ok) {
          throw new Error('Failed to fetch regional data');
        }

        const regionsJson = await regionsResponse.json();

        setGlobalData(globalJson);
        setRegionsData(regionsJson.regions || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  // Calculate regional statistics - merge regions with same name
  const regionalStats = regionsData.reduce((acc, region) => {
    const regionName = region.region_name || 'Unknown';
    if (!acc[regionName]) {
      acc[regionName] = {
        totalNumbers: 0,
        totalCalls: 0,
        tenants: new Set()
      };
    }
    acc[regionName].totalNumbers += region.total_numbers || 0;
    acc[regionName].totalCalls += region.total_calls || 0;
    region.numbers?.forEach(number => {
      if (number.tenant_name && number.tenant_name !== 'Unknown') {
        acc[regionName].tenants.add(number.tenant_name);
      }
    });
    return acc;
  }, {});

  // Tenant comparison data
  const tenantComparison = globalData?.tenants?.map(tenant => {
    const totalCalls = tenant.total_calls || 0;
    const qualifiedCalls = tenant.qualified_calls || 0;
    const qualificationRate = totalCalls > 0 
      ? ((qualifiedCalls / totalCalls) * 100)
      : 0;
    const avgDurationSeconds = tenant.average_duration_seconds || 0;
    const mins = Math.floor(avgDurationSeconds / 60);
    const secs = Math.floor(avgDurationSeconds % 60);
    const avgDuration = `${mins}:${secs.toString().padStart(2, '0')}`;

    return {
      name: tenant.tenant_name || tenant.business_name || 'Unknown',
      totalCalls,
      qualifiedCalls,
      validCalls: tenant.valid_calls || 0,
      qualificationRate,
      avgDuration
    };
  }) || [];

  // Prepare chart data for call trends by day (last 7 days from recent calls)
  const callTrendsData = (() => {
    if (!globalData?.recent_calls) return [];
    
    const callsByDate = {};
    globalData.recent_calls.forEach(call => {
      const date = new Date(call.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!callsByDate[date]) {
        callsByDate[date] = { date, total: 0, completed: 0, noAnswer: 0 };
      }
      callsByDate[date].total++;
      if (call.status === 'completed') callsByDate[date].completed++;
      if (call.status === 'no-answer') callsByDate[date].noAnswer++;
    });
    
    return Object.values(callsByDate).slice(-7);
  })();

  // Regional distribution for pie chart
  const regionalPieData = Object.entries(regionalStats)
    .filter(([_, stats]) => stats.totalCalls > 0)
    .map(([region, stats]) => ({
      name: region,
      value: stats.totalCalls
    }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <SuperAdminLayout>
      <div className="space-y-4 sm:space-y-6 py-4 sm:py-5">
        {/* Header */}
        <div className="px-3 sm:px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Analytics
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Access global performance graphs and run comparisons between different tenants or regions
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="px-3 sm:px-5">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 sm:p-4 flex items-center gap-3">
              <RefreshCw size={18} className="text-purple-600 animate-spin flex-shrink-0" />
              <p className="text-sm sm:text-base text-purple-800">Loading analytics data...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="px-3 sm:px-5">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-sm sm:text-base text-red-800 font-medium">
                Error loading data: {error}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Global Performance Metrics */}
            <div className="px-3 sm:px-5">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  Global Performance Overview
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                    <p className="text-xs sm:text-sm text-blue-600 font-medium">Total Calls</p>
                    <p className="text-2xl sm:text-3xl font-bold text-blue-900 mt-1">
                      {globalData?.total_calls?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                    <p className="text-xs sm:text-sm text-green-600 font-medium">Qualified Calls</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900 mt-1">
                      {globalData?.qualified_calls?.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                    <p className="text-xs sm:text-sm text-purple-600 font-medium">Qualification Rate</p>
                    <p className="text-2xl sm:text-3xl font-bold text-purple-900 mt-1">
                      {globalData?.total_calls > 0 
                        ? ((globalData.qualified_calls / globalData.total_calls) * 100).toFixed(1)
                        : 0}%
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4 border border-orange-200">
                    <p className="text-xs sm:text-sm text-orange-600 font-medium">Avg Duration</p>
                    <p className="text-2xl sm:text-3xl font-bold text-orange-900 mt-1">
                      {(() => {
                        const seconds = globalData?.average_duration_seconds || 0;
                        const mins = Math.floor(seconds / 60);
                        const secs = Math.floor(seconds % 60);
                        return `${mins}:${secs.toString().padStart(2, '0')}`;
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="px-3 sm:px-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Call Trends Line Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                    Call Activity Trends
                  </h3>
                  {callTrendsData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      No trend data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={callTrendsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          name="Total Calls"
                          dot={{ fill: '#3b82f6', r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="completed" 
                          stroke="#10b981" 
                          strokeWidth={2}
                          name="Completed"
                          dot={{ fill: '#10b981', r: 4 }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="noAnswer" 
                          stroke="#f59e0b" 
                          strokeWidth={2}
                          name="No Answer"
                          dot={{ fill: '#f59e0b', r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Regional Call Distribution Pie Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                    Call Volume by Region
                  </h3>
                  {regionalPieData.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      No regional data available
                    </div>
                  ) : (
                    <div className="flex flex-col lg:flex-row items-center">
                      <ResponsiveContainer width="100%" height={320}>
                        <PieChart>
                          <Pie
                            data={regionalPieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {regionalPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#ffffff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '14px',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Tenant Performance Bar Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 lg:col-span-2">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                    Tenant Performance Comparison
                  </h3>
                  {tenantComparison.length === 0 ? (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                      No tenant data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={tenantComparison}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#6b7280', fontSize: 12 }}
                          angle={-15}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#ffffff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '14px',
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: '14px' }} />
                        <Bar dataKey="totalCalls" fill="#3b82f6" name="Total Calls" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="validCalls" fill="#10b981" name="Valid Calls" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="qualifiedCalls" fill="#8b5cf6" name="Qualified Calls" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>

            {/* Tenant Comparison */}
            <div className="px-3 sm:px-5">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Tenant Performance Comparison
                </h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tenant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Calls
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qualified Calls
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qualification Rate
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Avg Duration
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {tenantComparison.map((tenant, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {tenant.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {tenant.totalCalls.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {tenant.qualifiedCalls.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              tenant.qualificationRate >= 70 ? 'bg-green-100 text-green-800' :
                              tenant.qualificationRate >= 40 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {tenant.qualificationRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                            {tenant.avgDuration}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Regional Performance */}
            <div className="px-3 sm:px-5">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-600" />
                  Regional Performance Breakdown
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(regionalStats).map(([region, stats]) => (
                    <div key={region} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200">
                      <h3 className="text-sm font-semibold text-slate-900 mb-3">{region}</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600">Phone Numbers</span>
                          <span className="text-sm font-bold text-slate-900">{stats.totalNumbers}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600">Total Calls</span>
                          <span className="text-sm font-bold text-slate-900">{stats.totalCalls.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-slate-600">Active Tenants</span>
                          <span className="text-sm font-bold text-slate-900">{stats.tenants.size}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Call Volume Trends */}
            {globalData?.recent_calls && globalData.recent_calls.length > 0 && (
              <div className="px-3 sm:px-5">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                    Recent Activity Timeline
                  </h2>
                  <div className="space-y-3">
                    {globalData.recent_calls.slice(0, 10).map((call, index) => {
                      const statusColors = {
                        'completed': 'bg-green-500',
                        'no-answer': 'bg-yellow-500',
                        'failed': 'bg-red-500',
                        'busy': 'bg-orange-500'
                      };
                      const statusColor = statusColors[call.status] || 'bg-gray-500';
                      
                      return (
                        <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0">
                          <div className={`w-2 h-2 mt-2 rounded-full ${statusColor} flex-shrink-0`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-900 font-medium truncate">
                                {call.tenant_name || call.business_name || 'Unknown Tenant'}
                              </p>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                call.status === 'completed' ? 'bg-green-100 text-green-700' :
                                call.status === 'no-answer' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {call.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {call.product_name || 'Unknown Product'} • To: {call.to} • {new Date(call.started_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </SuperAdminLayout>
  );
}
