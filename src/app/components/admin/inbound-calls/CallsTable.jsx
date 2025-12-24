import { Phone, PhoneOff, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function CallsTable() {
  // Mock data for calls
  const mockCalls = [
    {
      id: 1,
      leadName: 'John Smith',
      phoneNumber: '+1 (555) 123-4567',
      duration: '5:34',
      status: 'answered',
      qualified: true,
      timestamp: '2025-12-16 10:30 AM',
      notes: 'Interested in premium plan'
    },
    {
      id: 2,
      leadName: 'Sarah Johnson',
      phoneNumber: '+1 (555) 234-5678',
      duration: '0:00',
      status: 'no-answer',
      qualified: false,
      timestamp: '2025-12-16 10:15 AM',
      notes: 'No answer after 3 rings'
    },
    {
      id: 3,
      leadName: 'Mike Wilson',
      phoneNumber: '+1 (555) 345-6789',
      duration: '8:12',
      status: 'answered',
      qualified: true,
      timestamp: '2025-12-16 09:45 AM',
      notes: 'Requested callback tomorrow'
    },
    {
      id: 4,
      leadName: 'Emily Davis',
      phoneNumber: '+1 (555) 456-7890',
      duration: '2:23',
      status: 'answered',
      qualified: false,
      timestamp: '2025-12-16 09:20 AM',
      notes: 'Not interested at this time'
    },
    {
      id: 5,
      leadName: 'Robert Brown',
      phoneNumber: '+1 (555) 567-8901',
      duration: '0:00',
      status: 'busy',
      qualified: false,
      timestamp: '2025-12-16 08:55 AM',
      notes: 'Line was busy'
    },
    {
      id: 6,
      leadName: 'Lisa Anderson',
      phoneNumber: '+1 (555) 678-9012',
      duration: '12:45',
      status: 'answered',
      qualified: true,
      timestamp: '2025-12-16 08:30 AM',
      notes: 'Very interested, scheduled demo'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'answered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            <Phone size={12} />
            Answered
          </span>
        );
      case 'no-answer':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">
            <PhoneOff size={12} />
            No Answer
          </span>
        );
      case 'busy':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            <PhoneOff size={12} />
            Busy
          </span>
        );
      default:
        return null;
    }
  };

  const getQualifiedBadge = (qualified, status) => {
    if (status !== 'answered') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-500 text-xs font-medium rounded-full">
          <Clock size={12} />
          Pending
        </span>
      );
    }

    return qualified ? (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
        <CheckCircle size={12} />
        Qualified
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        <XCircle size={12} />
        Not Qualified
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900">{mockCalls.length}</p>
            </div>
            <Phone className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Answered</p>
              <p className="text-2xl font-bold text-green-600">
                {mockCalls.filter(c => c.status === 'answered').length}
              </p>
            </div>
            <Phone className="text-green-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Qualified Leads</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockCalls.filter(c => c.qualified).length}
              </p>
            </div>
            <CheckCircle className="text-blue-600" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Missed</p>
              <p className="text-2xl font-bold text-red-600">
                {mockCalls.filter(c => c.status !== 'answered').length}
              </p>
            </div>
            <PhoneOff className="text-red-600" size={32} />
          </div>
        </div>
      </div>

      {/* Calls Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Inbound Call History</h3>
          <p className="text-sm text-gray-600 mt-1">View and manage your inbound call records</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockCalls.map((call) => (
                <tr key={call.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{call.leadName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{call.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono">{call.duration}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(call.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getQualifiedBadge(call.qualified, call.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{call.timestamp}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 max-w-xs truncate">
                      {call.notes}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
