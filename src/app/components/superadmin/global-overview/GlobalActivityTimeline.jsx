import React from 'react';
import { 
  PhoneCall, 
  PhoneIncoming, 
  PhoneMissed, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react';

export default function GlobalActivityTimeline({ data, loading }) {
  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'started':
        return { icon: PhoneIncoming, color: 'text-blue-600', bg: 'bg-blue-100' };
      case 'completed':
        return { icon: PhoneCall, color: 'text-green-600', bg: 'bg-green-100' };
      case 'qualified':
        return { icon: CheckCircle, color: 'text-purple-600', bg: 'bg-purple-100' };
      case 'no answer':
      case 'no-answer':
        return { icon: PhoneMissed, color: 'text-red-600', bg: 'bg-red-100' };
      case 'no consent':
        return { icon: XCircle, color: 'text-orange-600', bg: 'bg-orange-100' };
      default:
        return { icon: PhoneCall, color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return 'Unknown';
    // Format as +1 (XXX) XXX-XXXX if possible
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `+${cleaned[0]} (${cleaned.slice(1,4)}) ${cleaned.slice(4,7)}-${cleaned.slice(7)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Global Activity Timeline
        </h2>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4 lg:p-6 border border-gray-200 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3 sm:mb-4 pb-3 border-b border-gray-200">
        <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
          Global Activity Timeline
        </h2>
        <span className="text-xs sm:text-sm text-gray-500 font-medium">
          Last 20 events
        </span>
      </div>

      <div className="space-y-2.5 sm:space-y-3 overflow-y-auto flex-1 pr-1 sm:pr-2 -mr-1 sm:-mr-2 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 450px)', minHeight: '400px' }}>
        {(!data || data.length === 0) ? (
          <div className="flex-1 flex items-center justify-center text-sm sm:text-base text-gray-500">
            No recent activity
          </div>
        ) : (
          data.map((event, index) => {
            const statusConfig = getStatusIcon(event.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div 
                key={event.call_id || index} 
                className="flex gap-2 sm:gap-3 pb-2.5 sm:pb-3 border-b border-gray-100 last:border-0 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 -mx-1 sm:-mx-2 px-1 sm:px-2 py-1.5 rounded-lg transition-all duration-200"
              >
                {/* Icon */}
                <div className={`${statusConfig.bg} w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ring-2 ring-white`}>
                  <StatusIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${statusConfig.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <p className="font-semibold text-gray-900 text-xs sm:text-sm lg:text-base capitalize">
                      {event.status?.replace('-', ' ') || 'Unknown Status'}
                    </p>
                    <span className="text-xs text-gray-500 flex items-center gap-1 flex-shrink-0 font-medium">
                      <Clock size={11} className="sm:w-3 sm:h-3" />
                      <span className="hidden xs:inline">{formatTimestamp(event.timestamp)}</span>
                      <span className="xs:hidden">{formatTimestamp(event.timestamp).split(' ')[0]}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-700">
                      <span className="inline-flex items-center gap-1 text-gray-500 font-medium">
                        <PhoneCall size={12} className="flex-shrink-0" />
                        <span className="hidden sm:inline">Phone:</span>
                      </span>
                      <span className="font-mono text-xs font-semibold truncate">{event.phone_number || 'Unknown'}</span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-1.5 text-xs">
                      <span className="inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md truncate max-w-full border border-blue-100">
                        <span className="font-semibold text-blue-700">Tenant:</span>
                        <span className="truncate text-blue-900">{event.tenant_name || 'Unknown'}</span>
                      </span>
                      {event.product && (
                        <span className="inline-flex items-center gap-1 bg-purple-50 px-2 py-1 rounded-md truncate max-w-full border border-purple-100">
                          <span className="font-semibold text-purple-700">Product:</span>
                          <span className="truncate text-purple-900">{event.product}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
