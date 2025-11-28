import React from 'react';

export default function MetricCard({ icon: Icon, title, value, loading, bgColor, iconColor }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-600 font-medium mb-1.5 sm:mb-2 truncate">
            {title}
          </p>
          {loading ? (
            <div className="h-6 sm:h-7 lg:h-8 bg-gray-200 rounded animate-pulse w-16 sm:w-20"></div>
          ) : (
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 truncate">
              {value}
            </p>
          )}
        </div>
        <div className={`${bgColor} p-1.5 sm:p-2 lg:p-3 rounded-lg flex-shrink-0`}>
          <Icon className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
