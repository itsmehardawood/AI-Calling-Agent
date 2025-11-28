import React from 'react';
import { RefreshCw } from 'lucide-react';
import dynamic from 'next/dynamic';

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
const CartesianGrid = dynamic(
  () => import('recharts').then((mod) => mod.CartesianGrid),
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
const Tooltip = dynamic(
  () => import('recharts').then((mod) => mod.Tooltip),
  { ssr: false }
);
const Legend = dynamic(
  () => import('recharts').then((mod) => mod.Legend),
  { ssr: false }
);

export default function CallAnalyticsChart({ tenantsData, loading }) {
  // Transform tenant data into chart format (top 5 tenants)
  const chartData = (tenantsData || []).slice(0, 5).map(tenant => ({
    name: tenant.tenant_name || 'Unknown',
    calls: tenant.total_calls || 0,
    validCalls: tenant.valid_calls || 0,
    qualifiedCalls: tenant.qualified_calls || 0,
  }));

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
        Call Performance Analytics
      </h3>
      {loading ? (
        <div className="flex items-center justify-center h-[250px] sm:h-[300px]">
          <RefreshCw className="animate-spin text-blue-600" size={24} />
        </div>
      ) : chartData.length === 0 ? (
        <div className="flex items-center justify-center h-[250px] sm:h-[300px] text-gray-500">
          <p className="text-sm sm:text-base">No data available for chart</p>
        </div>
      ) : (
        <div className="w-full overflow-x-auto">
          <div className="min-w-[400px]">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={chartData}>
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
                <XAxis dataKey="name" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb', 
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
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
        </div>
      )}
    </div>
  );
}
