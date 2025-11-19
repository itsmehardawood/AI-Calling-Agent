import { PhoneOutgoing, Package, RefreshCw, Phone } from 'lucide-react';

export default function QuickActions() {
  const actions = [
    {
      title: 'Add Caller Number',
      description: 'Twilio or Business',
      icon: PhoneOutgoing,
      iconColor: 'text-blue-600',
      iconHoverColor: 'group-hover:text-white',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      hoverBg: 'hover:bg-blue-100',
      iconBg: 'bg-blue-100',
      iconHoverBg: 'group-hover:bg-blue-600',
    },
    {
      title: 'Add Product',
      description: 'New product/service',
      icon: Package,
      iconColor: 'text-green-600',
      iconHoverColor: 'group-hover:text-white',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      hoverBg: 'hover:bg-green-100',
      iconBg: 'bg-green-100',
      iconHoverBg: 'group-hover:bg-green-600',
    },
    {
      title: 'Sync Leads',
      description: 'Update CRM data',
      icon: RefreshCw,
      iconColor: 'text-purple-600',
      iconHoverColor: 'group-hover:text-white',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      hoverBg: 'hover:bg-purple-100',
      iconBg: 'bg-purple-100',
      iconHoverBg: 'group-hover:bg-purple-600',
    },
    {
      title: 'Start Instant Call',
      description: 'Make a call now',
      icon: Phone,
      iconColor: 'text-orange-600',
      iconHoverColor: 'group-hover:text-white',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      hoverBg: 'hover:bg-orange-100',
      iconBg: 'bg-orange-100',
      iconHoverBg: 'group-hover:bg-orange-600',
    },
  ];

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-sm border border-blue-200 p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
        <div className="w-1 h-5 sm:h-6 bg-blue-600 rounded-full"></div>
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <button
              key={index}
              className="flex items-center gap-3 bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 transition-all hover:shadow-md group text-left"
            >
              <div className={`${action.iconBg} ${action.iconHoverBg} p-2 sm:p-3 rounded-lg transition-colors flex-shrink-0`}>
                <Icon className={`${action.iconColor} ${action.iconHoverColor} transition-colors`} size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                  {action.title}
                </p>
                <p className="text-xs text-gray-600 truncate">{action.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
