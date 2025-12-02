import { Search, Filter } from 'lucide-react';

export default function ActivityFilters({ filters, onFilterChange, tenants }) {
  return (
    <div className="px-3 sm:px-5">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by email, phone, tenant..."
              value={filters.searchTerm}
              onChange={(e) => onFilterChange('searchTerm', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Tenant Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <select
              value={filters.tenant}
              onChange={(e) => onFilterChange('tenant', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm appearance-none bg-white"
            >
              <option value="">All Tenants</option>
              {tenants.map((tenant) => (
                <option key={tenant} value={tenant}>
                  {tenant}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => onFilterChange('status', e.target.value)}
              className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm appearance-none bg-white"
            >
              <option value="">All Statuses</option>
              <option value="qualified">Qualified</option>
              <option value="not_qualified">Not Qualified</option>
              <option value="in_progress">In Progress</option>
              <option value="callback_requested">Callback Requested</option>
            </select>
          </div>

          {/* Date Range Filter */}
          <div>
            <select
              value={filters.dateRange}
              onChange={(e) => onFilterChange('dateRange', e.target.value)}
              className="w-full text-gray-500 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm appearance-none bg-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(filters.searchTerm || filters.tenant || filters.status || filters.dateRange !== 'all') && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-medium text-gray-600">Active Filters:</span>
              {filters.searchTerm && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                  Search: {filters.searchTerm}
                </span>
              )}
              {filters.tenant && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                  Tenant: {filters.tenant}
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                  Status: {filters.status.replace('_', ' ')}
                </span>
              )}
              {filters.dateRange !== 'all' && (
                <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-medium">
                  Date: {filters.dateRange}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
