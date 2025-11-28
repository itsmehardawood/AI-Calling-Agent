import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export default function TenantPerformanceTable({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Top Performing Tenants
        </h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
          Top Performing Tenants
        </h2>
        <span className="text-xs sm:text-sm text-gray-500">
          Top 10 by call volume
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
            <tr>
              <th className="px-3 xl:px-4 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-3 xl:px-4 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Tenant Name
              </th>
              <th className="px-3 xl:px-4 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Total Calls
              </th>
              <th className="px-3 xl:px-4 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Valid Calls
              </th>
              <th className="px-3 xl:px-4 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Qualified
              </th>
              <th className="px-3 xl:px-4 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Qual. Rate
              </th>
              <th className="px-3 xl:px-4 py-3.5 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              {/* <th className="px-3 xl:px-4 py-3.5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Last Active
              </th> */}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {(!data || data.length === 0) ? (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center text-gray-500">
                  No tenant data available
                </td>
              </tr>
            ) : (
              data.map((tenant, index) => (
                <tr key={tenant.tenant_id || index} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-3 xl:px-4 py-4">
                    <div className="flex items-center justify-center">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-200 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 xl:px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 xl:w-10 xl:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {tenant.tenant_name?.charAt(0).toUpperCase() || 'T'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm xl:text-base text-gray-900 truncate">
                          {tenant.tenant_name || 'Unknown'}
                        </p>
                       
                      </div>
                    </div>
                  </td>
                  <td className="px-3 xl:px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-blue-50 font-bold text-sm xl:text-base text-blue-700">
                      {tenant.total_calls || 0}
                    </span>
                  </td>
                  <td className="px-3 xl:px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-green-50 font-semibold text-sm xl:text-base text-green-700">
                      {tenant.valid_calls || 0}
                    </span>
                  </td>
                  <td className="px-3 xl:px-4 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-purple-50 font-semibold text-sm xl:text-base text-purple-700">
                      {tenant.qualified_calls || 0}
                    </span>
                  </td>
                  <td className="px-3 xl:px-4 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`font-bold text-base xl:text-lg ${
                        tenant.qualification_rate >= 70 ? 'text-green-600' :
                        tenant.qualification_rate >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {tenant.qualification_rate?.toFixed(1) || 0}%
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            tenant.qualification_rate >= 70 ? 'bg-green-500' :
                            tenant.qualification_rate >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min(tenant.qualification_rate || 0, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 xl:px-4 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                      tenant.status === 'active' 
                        ? 'bg-green-100 text-green-700 ring-1 ring-green-600/20' 
                        : 'bg-red-100 text-red-700 ring-1 ring-red-600/20'
                    }`}>
                      {tenant.status === 'active' ? (
                        <CheckCircle size={13} />
                      ) : (
                        <XCircle size={13} />
                      )}
                      {tenant.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  {/* <td className="px-3 xl:px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs xl:text-sm text-gray-600">
                      <Clock size={14} className="flex-shrink-0" />
                      <span className="font-medium">{formatTimestamp(tenant.last_active)}</span>
                    </div>
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-2 sm:space-y-3">
        {(!data || data.length === 0) ? (
          <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-500">
            No tenant data available
          </div>
        ) : (
          data.map((tenant, index) => (
            <div key={tenant.tenant_id || index} className="border border-gray-200 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                    {tenant.tenant_name?.charAt(0).toUpperCase() || 'T'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm sm:text-base text-gray-900 truncate">{tenant.tenant_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 truncate">{tenant.tenant_id}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                  tenant.status === 'active' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {tenant.status === 'active' ? (
                    <CheckCircle size={10} className="sm:w-3 sm:h-3" />
                  ) : (
                    <XCircle size={10} className="sm:w-3 sm:h-3" />
                  )}
                  <span className="hidden xs:inline">{tenant.status === 'active' ? 'Active' : 'Suspended'}</span>
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-600 text-xs">Total Calls</p>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">{tenant.total_calls || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Valid Calls</p>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">{tenant.valid_calls || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Qualified</p>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">{tenant.qualified_calls || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-xs">Qual. Rate</p>
                  <p className={`font-semibold text-sm sm:text-base ${
                    tenant.qualification_rate >= 70 ? 'text-green-600' :
                    tenant.qualification_rate >= 40 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {tenant.qualification_rate?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
              
              {/* <div className="flex items-center gap-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
                <Clock size={12} className="flex-shrink-0" />
                <span className="truncate">Last active {formatTimestamp(tenant.last_active)}</span>
              </div> */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
