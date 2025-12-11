/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from 'react';
import AdminLayout from '@/app/components/admin/AdminLayout';
import AdminSubscriptionGate from '@/app/components/AdminSubscriptionGate';
import { getApiUrl } from '@/config/api';
import { 
  Phone, 
  PhoneCall, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  RefreshCw
} from 'lucide-react';
import MetricCard from '@/app/components/admin/overview/MetricCard';
import CallsOverTimeChart from '@/app/components/admin/overview/CallsOverTimeChart';
import CallDistributionChart from '@/app/components/admin/overview/CallDistributionChart';
import DurationDistributionChart from '@/app/components/admin/overview/DurationDistributionChart';
import RecentActivity from '@/app/components/admin/overview/RecentActivity';
import QuickActions from '@/app/components/admin/overview/QuickActions';

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
        // console.log('User ID:', userId); // Debug log
        if (!userId) {
          setError('User ID not found. Please log in again.');
          setLoading(false);
          return;
        }

        // Make API call
        const apiUrl = getApiUrl(`/api/calls/user-calls-summary?user_id=${userId}`);
        // console.log('Fetching from:', apiUrl); // Debug log
        const response = await fetch(apiUrl, {
          headers: {
            'ngrok-skip-browser-warning': 'true', 
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch calls summary');
        }

        const data = await response.json();

        // Check if there's no data (API returns a message field when no calls found)
        if (data.message && data.message.includes('No calls found')) {
          // Set everything to empty/zero state
          setMetrics({
            totalCalls: 0,
            validCalls: 0,
            qualifiedCalls: 0,
            qualificationRate: 0,
            avgCallDuration: '0:00',
          });
          setCallsOverTimeData([]);
          setDurationData([]);
          setCallsData([]);
          setLoading(false);
          return;
        }

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

  const metricCards = [
    {
      icon: Phone,
      title: 'Total Calls',
      value: metrics.totalCalls,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: PhoneCall,
      title: 'Valid Calls',
      value: metrics.validCalls,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: CheckCircle,
      title: 'Qualified Calls',
      value: metrics.qualifiedCalls,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: TrendingUp,
      title: 'Qualification Rate',
      value: `${qualificationRate}%`,
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
    <AdminLayout>
      <AdminSubscriptionGate>
      <div className="space-y-4 sm:space-y-6 py-4 sm:py-5">
        {/* Header */}
        <div className="px-3 sm:px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                Overview
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">
                Analytics and performance metrics for your calling agent
              </p>
            </div>
            <button 
              onClick={() => window.location.reload()}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm w-full sm:w-auto"
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
              <p className="text-sm sm:text-base text-blue-800">Loading calls summary...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="px-3 sm:px-5">
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <p className="text-sm sm:text-base text-red-800 font-medium">Error: {error}</p>
            </div>
          </div>
        )}

        {/* Metric Cards */}
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

        {/* Charts Row 1 */}
        <div className="px-3 sm:px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <CallsOverTimeChart data={callsOverTimeData} loading={loading} />
            <CallDistributionChart data={callDistributionData} loading={loading} />
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="px-3 sm:px-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <DurationDistributionChart data={durationData} loading={loading} />
            <RecentActivity data={callsData} loading={loading} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-3 sm:px-5">
          <QuickActions />
        </div>
      </div>
      </AdminSubscriptionGate>
    </AdminLayout>
  );
}
