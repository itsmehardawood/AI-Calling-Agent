import { Target, Users, TrendingUp } from 'lucide-react';

export default function StatsCards({ pagination, leads }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 px-3 sm:px-5">
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Leads</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {pagination?.total_leads || leads.length}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Target className="text-blue-600" size={16} />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Current Page</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {pagination?.page || 1} / {pagination?.total_pages || 1}
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="text-blue-600" size={16} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4 sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Showing</p>
            <p className="text-xl sm:text-2xl font-bold text-purple-600">
              {leads.length} Leads
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="text-purple-600" size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
