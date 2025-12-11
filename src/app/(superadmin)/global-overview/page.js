/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from 'react';
import SuperAdminLayout from '@/app/components/superadmin/SuperAdminLayout';
import { getApiUrl } from '@/config/api';
import { 
  Phone, 
  PhoneCall, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  RefreshCw,
  Globe
} from 'lucide-react';
import MetricCard from '@/app/components/superadmin/global-overview/MetricCard';
import TenantPerformanceTable from '@/app/components/superadmin/global-overview/TenantPerformanceTable';
import GlobalActivityTimeline from '@/app/components/superadmin/global-overview/GlobalActivityTimeline';
import CallAnalyticsChart from '@/app/components/superadmin/global-overview/CallAnalyticsChart';

export default function GlobalOverviewPage() {
  // State for metrics and data
  const [metrics, setMetrics] = useState({
    totalCalls: 0,
    validCalls: 0,
    qualifiedCalls: 0,
    qualificationRate: 0,
    avgCallDuration: '0:00',
  });

  const [tenantsData, setTenantsData] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data from API
  useEffect(() => {
    const fetchGlobalData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get role from localStorage
        const role = localStorage.getItem('role') || 'superadmin';

        // Make API call to get global overview
        const apiUrl = getApiUrl(`/super_admin/global-overview/${role}`);
        // console.log('Fetching from:', apiUrl);
        
        const response = await fetch(apiUrl, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch global overview');
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

        // Process tenant data
        const processedTenants = (data.tenants || []).map(tenant => ({
          tenant_id: tenant.tenant_id,
          tenant_name: tenant.tenant_name || tenant.business_name || 'Unknown Tenant',
          total_calls: tenant.total_calls || 0,
          valid_calls: tenant.valid_calls || 0,
          qualified_calls: tenant.qualified_calls || 0,
          qualification_rate: tenant.total_calls > 0 
            ? (tenant.qualified_calls / tenant.total_calls) * 100
            : 0,
          status: tenant.status || 'active',
          last_active: tenant.last_call_timestamp || tenant.last_active,
        }))
        .sort((a, b) => b.total_calls - a.total_calls)
        .slice(0, 10);

        setTenantsData(processedTenants);

        // Process activity timeline
        const processedActivity = (data.recent_calls || []).map(call => ({
          call_id: call.call_id,
          status: call.status || 'Unknown',
          phone_number: call.to,
          tenant_name: call.tenant_name || call.business_name || 'Unknown',
          product: call.product_name || call.product,
          timestamp: call.started_at || call.created_at,
        }))
        .slice(0, 20);

        setActivityData(processedActivity);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching global overview:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchGlobalData();
  }, []);

  const metricCards = [
    {
      icon: Phone,
      title: 'Total Calls',
      value: metrics.totalCalls.toLocaleString(),
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: PhoneCall,
      title: 'Valid Calls',
      value: metrics.validCalls.toLocaleString(),
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: CheckCircle,
      title: 'Qualified Calls',
      value: metrics.qualifiedCalls.toLocaleString(),
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: TrendingUp,
      title: 'Qualification Rate',
      value: `${metrics.qualificationRate}%`,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
    {
      icon: Clock,
      title: 'Avg Call Duration',
      value: metrics.avgCallDuration,
      bgColor: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
    },
  ];

  return (
    <SuperAdminLayout>
      <div className="space-y-4 sm:space-y-6 py-4 sm:py-5">
        {/* Header */}
        <div className="px-3 sm:px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="w-8 h-8 text-purple-600" />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                  Global Overview
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                System-wide analytics and tenant performance metrics
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 flex items-center gap-3">
              <RefreshCw size={18} className="text-blue-600 animate-spin flex-shrink-0" />
              <p className="text-sm sm:text-base text-blue-800">Loading global data...</p>
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

        {/* SECTION 1: Metric Cards */}
        <div className="px-3 sm:px-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {metricCards.map((card, index) => (
              <MetricCard
                key={index}
                icon={card.icon}
                title={card.title}
                value={card.value}
                loading={loading}
                bgColor={card.bgColor}
                iconColor={card.iconColor}
              />
            ))}
          </div>
        </div>

        {/* SECTION 2: Analytics Chart */}
        <div className="px-3 sm:px-5">
          <CallAnalyticsChart tenantsData={tenantsData} loading={loading} />
        </div>

        {/* SECTION 3 & 4: Tenant Table and Activity Timeline */}
        <div className="px-3 sm:px-5">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
            {/* Tenant Performance Table - Full width on mobile, half on XL screens */}
            <div className="xl:col-span-1">
              <TenantPerformanceTable data={tenantsData} loading={loading} />
            </div>
            
            {/* Global Activity Timeline - Full width on mobile, half on XL screens */}
            <div className="xl:col-span-1">
              <GlobalActivityTimeline data={activityData} loading={loading} />
            </div>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
