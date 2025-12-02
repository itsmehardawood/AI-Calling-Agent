import { Activity, CheckCircle, XCircle, Clock, Phone } from 'lucide-react';

export default function ActivityStatsCards({ activities, allActivities }) {
  const qualifiedCount = activities.filter(a => a.status === 'qualified').length;
  const notQualifiedCount = activities.filter(a => a.status === 'not_qualified').length;
  const inProgressCount = activities.filter(a => a.status === 'in_progress').length;
  const callbackCount = activities.filter(a => a.status === 'callback_requested').length;
  
  const avgDuration = activities.length > 0
    ? Math.floor(activities.reduce((sum, a) => sum + a.call_duration, 0) / activities.length)
    : 0;
  
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 px-3 sm:px-5">
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Activities</p>
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {activities.length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              of {allActivities.length} total
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Activity className="text-purple-600" size={16} />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Qualified</p>
            <p className="text-xl sm:text-2xl font-bold text-green-600">
              {qualifiedCount}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {activities.length > 0 ? ((qualifiedCount / activities.length) * 100).toFixed(1) : 0}% rate
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle className="text-green-600" size={16} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Not Qualified</p>
            <p className="text-xl sm:text-2xl font-bold text-red-600">
              {notQualifiedCount}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {activities.length > 0 ? ((notQualifiedCount / activities.length) * 100).toFixed(1) : 0}% rate
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <XCircle className="text-red-600" size={16} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">In Progress</p>
            <p className="text-xl sm:text-2xl font-bold text-blue-600">
              {inProgressCount}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              + {callbackCount} callbacks
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock className="text-blue-600" size={16} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg sm:rounded-xl border border-gray-200 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm font-medium text-gray-600">Avg Duration</p>
            <p className="text-xl sm:text-2xl font-bold text-indigo-600">
              {formatDuration(avgDuration)}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              minutes
            </p>
          </div>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Phone className="text-indigo-600" size={16} />
          </div>
        </div>
      </div>
    </div>
  );
}
