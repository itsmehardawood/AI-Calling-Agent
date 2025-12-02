import { Building2, Mail, Phone, Clock } from 'lucide-react';

export default function ActivityTable({ activities }) {
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Tenant
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Lead Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Company
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Product
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Building2 className="text-gray-400 flex-shrink-0" size={14} />
                    <span className="font-medium text-gray-900">{activity.tenant_name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <Mail size={12} className="text-gray-400" />
                      <span className="text-xs">{activity.lead_email}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Phone size={12} className="text-gray-400" />
                      <span className="text-xs">{activity.lead_phone}</span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {activity.company_name || <span className="text-gray-400">-</span>}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {activity.product_name}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {getStatusBadge(activity.status)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-700">
                    <Clock size={12} className="text-gray-400" />
                    <span>{formatDuration(activity.call_duration)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                  {formatDate(activity.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
