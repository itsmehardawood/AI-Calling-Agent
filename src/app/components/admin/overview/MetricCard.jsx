import { TrendingUp } from 'lucide-react';

export default function MetricCard({ icon: Icon, title, value, loading, bgColor, iconColor }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`${bgColor} rounded-lg p-1.5 sm:p-2`}>
          <Icon className={iconColor} size={20} />
        </div>
        {!loading && <TrendingUp className="text-green-500" size={16} />}
      </div>
      <div>
        <p className="text-gray-600 text-xs sm:text-sm font-medium">{title}</p>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
          {loading ? '...' : value}
        </p>
      </div>
    </div>
  );
}
