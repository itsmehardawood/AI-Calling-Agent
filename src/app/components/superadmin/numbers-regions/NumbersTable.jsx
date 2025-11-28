import React, { useState } from 'react';
import { Phone, MapPin, Search, Eye, Building2 } from 'lucide-react';

export default function NumbersTable({ data, loading }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Phone Numbers by Region
        </h2>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Flatten all numbers from all regions
  const allNumbers = (data || []).flatMap(region =>
    (region.numbers || []).map(num => ({
      ...num,
      region_name: region.region_name,
      region_code: region.region_code,
    }))
  );

  // Filter numbers
  const filteredNumbers = allNumbers.filter(num => {
    const matchesSearch = 
      num.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      num.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      num.region_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRegion = selectedRegion === 'all' || num.region_code === selectedRegion;
    
    return matchesSearch && matchesRegion;
  });

  // Get unique regions for filter
  const regions = data || [];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900">
          Phone Numbers by Region
        </h2>
        <span className="text-sm text-gray-500">
          {filteredNumbers.length} number{filteredNumbers.length !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by number, tenant, or region..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-gray-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>

        {/* Region Filter */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2  text-gray-400 w-4 h-4" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full text-gray-600 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
          >
            <option value="all">All Regions</option>
            {regions.map((region) => (
              <option key={region.region_code} value={region.region_code}>
                {region.region_name} ({region.total_numbers || 0} numbers)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Phone Number
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Region
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Tenant
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Total Calls
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Last Used
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredNumbers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                  No phone numbers found
                </td>
              </tr>
            ) : (
              filteredNumbers.map((number, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="font-mono text-sm font-medium text-gray-900">
                        {number.phone_number || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {number.region_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">{number.region_code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-gray-900">{number.tenant_name || 'Unassigned'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        number.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : number.status === 'inactive'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {number.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {(number.total_calls || 0).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-600">
                      {number.last_used
                        ? new Date(number.last_used).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Never'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {filteredNumbers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No phone numbers found
          </div>
        ) : (
          filteredNumbers.map((number, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="font-mono text-sm font-semibold text-gray-900">
                    {number.phone_number || 'N/A'}
                  </span>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    number.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : number.status === 'inactive'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {number.status || 'Unknown'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Region
                  </p>
                  <p className="font-medium text-gray-900">{number.region_name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{number.region_code}</p>
                </div>
                <div>
                  <p className="text-gray-600 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Tenant
                  </p>
                  <p className="font-medium text-gray-900">{number.tenant_name || 'Unassigned'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                <div>
                  <span className="text-gray-600">Total Calls: </span>
                  <span className="font-semibold text-gray-900">
                    {(number.total_calls || 0).toLocaleString()}
                  </span>
                </div>
                <div className="text-gray-600">
                  Last used:{' '}
                  {number.last_used
                    ? new Date(number.last_used).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Never'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
