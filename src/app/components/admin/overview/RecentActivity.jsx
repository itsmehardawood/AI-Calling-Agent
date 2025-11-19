import { Activity, RefreshCw, Phone, PhoneCall, CheckCircle } from 'lucide-react';

const getActivityIcon = (type) => {
  switch (type) {
    case 'qualified':
      return <CheckCircle size={16} className="text-green-600" />;
    case 'valid':
      return <PhoneCall size={16} className="text-blue-600" />;
    case 'failed':
      return <Phone size={16} className="text-red-600" />;
    default:
      return <Phone size={16} className="text-gray-600" />;
  }
};

const getActivityBgColor = (type) => {
  switch (type) {
    case 'qualified':
      return 'bg-green-100';
    case 'valid':
      return 'bg-blue-100';
    case 'failed':
      return 'bg-red-100';
    default:
      return 'bg-gray-100';
  }
};

export default function RecentActivity({ data, loading }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Activity</h3>
        <Activity className="text-gray-400" size={18} />
      </div>
      {loading ? (
        <div className="flex items-center justify-center h-[250px] sm:h-[300px]">
          <RefreshCw className="animate-spin text-blue-600" size={24} />
        </div>
      ) : data.length === 0 ? (
        <div className="flex items-center justify-center h-[250px] sm:h-[300px] text-gray-500">
          <p className="text-sm sm:text-base">No recent calls found</p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto custom-scrollbar">
          {data.map((activity) => (
            <div 
              key={activity.id}
              className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
            >
              <div className={`${getActivityBgColor(activity.type)} p-1.5 sm:p-2 rounded-lg flex-shrink-0`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">
                  {activity.number}
                </p>
                <p className="text-xs text-gray-600">{activity.status}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-gray-500">{activity.time}</p>
                <p className="text-xs font-medium text-gray-700">{activity.duration}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
