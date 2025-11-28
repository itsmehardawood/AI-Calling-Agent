import React from 'react';
import { MapPin, Phone, TrendingUp, Users } from 'lucide-react';

export default function RegionOverview({ data, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
            <div className="h-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  const regions = data || [];
  const totalRegions = regions.length;
  const totalNumbers = regions.reduce((sum, r) => sum + (r.total_numbers || 0), 0);
  const totalCalls = regions.reduce((sum, r) => sum + (r.total_calls || 0), 0);
  const activeTenants = new Set(regions.flatMap(r => r.tenants?.map(t => t.tenant_id) || [])).size;

  const stats = [
    {
      icon: MapPin,
      title: 'Total Regions',
      value: totalRegions,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      icon: Phone,
      title: 'Total Numbers',
      value: totalNumbers.toLocaleString(),
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      icon: TrendingUp,
      title: 'Total Calls',
      value: totalCalls.toLocaleString(),
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      icon: Users,
      title: 'Active Tenants',
      value: activeTenants,
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1 sm:mb-2">
                  {stat.title}
                </p>
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bgColor} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
