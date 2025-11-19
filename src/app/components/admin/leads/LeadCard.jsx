import { Mail, Phone, Building2, Calendar, Package } from 'lucide-react';

export default function LeadCard({ lead, products, onProductChange }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* Email */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Mail className="text-blue-600" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Email</p>
            <p className="text-sm font-medium text-gray-900 truncate">{lead.email}</p>
          </div>
        </div>

        {/* Phone */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Phone className="text-green-600" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Phone</p>
            <p className="text-sm font-medium text-gray-900">{lead.phone_number}</p>
          </div>
        </div>

        {/* Company */}
        {lead.company_name && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="text-purple-600" size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-0.5">Company</p>
              <p className="text-sm font-medium text-gray-900 truncate">{lead.company_name}</p>
            </div>
          </div>
        )}

        {/* Created On */}
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="text-orange-600" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-0.5">Created On</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(lead.created_at)}</p>
          </div>
        </div>

        {/* Assign Product */}
        <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
          <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Package className="text-indigo-600" size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1.5">Assign Product</p>
            <select
              value={lead.product_id || ''}
              onChange={(e) => onProductChange(lead.id, e.target.value)}
              className="w-full px-3 py-2 text-sm text-gray-800 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="" className="text-gray-800">Select Product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id} className="text-gray-800">
                  {product.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Current Product */}
        {lead.product_name && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
            <p className="text-xs text-blue-600 font-medium">Current: {lead.product_name}</p>
          </div>
        )}
      </div>
    </div>
  );
}
