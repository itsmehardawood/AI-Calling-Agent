import { Building2, Mail, Phone, Clock, Calendar, Package } from 'lucide-react';

export default function ActivityCard({ activity }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      qualified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Qualified' },
      not_qualified: { bg: 'bg-red-100', text: 'text-red-800', label: 'Not Qualified' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In Progress' },
      callback_requested: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Callback Requested' },
    };

    const config = statusConfig[status] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Building2 className="text-purple-600 flex-shrink-0" size={16} />
          <span className="font-semibold text-gray-900 text-sm">{activity.tenant_name}</span>
        </div>
        {getStatusBadge(activity.status)}
      </div>

      {/* Lead Contact Info */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Mail size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-700 truncate">{activity.lead_email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Phone size={14} className="text-gray-400 flex-shrink-0" />
          <span className="text-gray-700">{activity.lead_phone}</span>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <Package size={12} />
            <span>Product</span>
          </div>
          <p className="text-sm font-medium text-gray-900">{activity.product_name}</p>
        </div>
        
        <div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
            <Clock size={12} />
            <span>Duration</span>
          </div>
          <p className="text-sm font-medium text-gray-900">{formatDuration(activity.call_duration)}</p>
        </div>
      </div>

      {activity.company_name && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500">Company</p>
          <p className="text-sm font-medium text-gray-900 mt-0.5">{activity.company_name}</p>
        </div>
      )}

      {/* Timestamp */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-500">
        <Calendar size={12} />
        <span>{formatDate(activity.created_at)}</span>
      </div>

      {activity.notes && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-600 italic">{activity.notes}</p>
        </div>
      )}
    </div>
  );
}
