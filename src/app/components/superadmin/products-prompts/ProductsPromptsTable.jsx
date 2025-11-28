import React, { useState } from 'react';
import { 
  Eye, 
  Check, 
  X, 
  Lock, 
  Unlock, 
  Search, 
  Filter,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  Shield
} from 'lucide-react';

export default function ProductsPromptsTable({ data, loading, onApprove, onReject, onToggleLock }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewingPrompt, setViewingPrompt] = useState(null);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">
          Products & Prompts Review
        </h2>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  // Filter products
  const filteredProducts = (data || []).filter(product => {
    const matchesSearch = 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tenant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'pending' && product.compliance_status === 'pending') ||
      (statusFilter === 'approved' && product.compliance_status === 'approved') ||
      (statusFilter === 'rejected' && product.compliance_status === 'rejected') ||
      (statusFilter === 'locked' && product.is_locked);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        icon: AlertCircle,
        bg: 'bg-yellow-100',
        text: 'text-yellow-700',
        label: 'Pending Review'
      },
      approved: {
        icon: CheckCircle,
        bg: 'bg-green-100',
        text: 'text-green-700',
        label: 'Approved'
      },
      rejected: {
        icon: XCircle,
        bg: 'bg-red-100',
        text: 'text-red-700',
        label: 'Rejected'
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {config.label}
      </span>
    );
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">
            Products & Prompts Review
          </h2>
          <span className="text-sm text-gray-500">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by product, tenant, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border text-gray-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="locked">Locked</option>
            </select>
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Tenant
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Lock Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No products found
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <tr key={product.id || index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          {product.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">{product.tenant_name || 'Unknown'}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{product.category}</span>
                    </td>
                    <td className="px-4 py-4">
                      {getStatusBadge(product.compliance_status)}
                    </td>
                    <td className="px-4 py-4">
                      {product.is_locked ? (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-700">
                          <Lock size={14} className="text-red-600" />
                          Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                          <Unlock size={14} className="text-green-600" />
                          Unlocked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setViewingPrompt(product)}
                          className="text-blue-600 hover:bg-blue-50 rounded-lg p-2 transition-colors"
                          title="View Prompt"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {(product.compliance_status === 'pending' || product.compliance_status === 'rejected') && (
                          <button
                            onClick={() => onApprove(product.id)}
                            className="text-green-600 hover:bg-green-50 rounded-lg p-2 transition-colors"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                        )}
                        
                        {(product.compliance_status === 'pending' || product.compliance_status === 'approved') && (
                          <button
                            onClick={() => onReject(product.id)}
                            className="text-red-600 hover:bg-red-50 rounded-lg p-2 transition-colors"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => onToggleLock(product.id, !product.is_locked)}
                          className={`${
                            product.is_locked 
                              ? 'text-green-600 hover:bg-green-50' 
                              : 'text-red-600 hover:bg-red-50'
                          } rounded-lg p-2 transition-colors`}
                          title={product.is_locked ? 'Unlock' : 'Lock'}
                        >
                          {product.is_locked ? <Unlock size={18} /> : <Lock size={18} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No products found
            </div>
          ) : (
            filteredProducts.map((product, index) => (
              <div
                key={product.id || index}
                className="border border-gray-200 rounded-lg p-4 space-y-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                  </div>
                  {getStatusBadge(product.compliance_status)}
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Tenant</p>
                    <p className="font-medium text-gray-900">{product.tenant_name || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Category</p>
                    <p className="font-medium text-gray-900">{product.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setViewingPrompt(product)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  
                  {(product.compliance_status === 'pending' || product.compliance_status === 'rejected') && (
                    <button
                      onClick={() => onApprove(product.id)}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <Check size={16} />
                    </button>
                  )}
                  
                  {(product.compliance_status === 'pending' || product.compliance_status === 'approved') && (
                    <button
                      onClick={() => onReject(product.id)}
                      className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                  
                  <button
                    onClick={() => onToggleLock(product.id, !product.is_locked)}
                    className={`flex items-center justify-center gap-2 ${
                      product.is_locked 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white px-3 py-2 rounded-lg text-sm transition-colors`}
                  >
                    {product.is_locked ? <Unlock size={16} /> : <Lock size={16} />}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Prompt Viewer Modal */}
      {viewingPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{viewingPrompt.name}</h3>
                <p className="text-blue-100 text-sm mt-1">{viewingPrompt.tenant_name}</p>
              </div>
              <button
                onClick={() => setViewingPrompt(null)}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{viewingPrompt.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{viewingPrompt.category}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      {getStatusBadge(viewingPrompt.compliance_status)}
                    </div>
                  </div>
                </div>

                {viewingPrompt.objectives && viewingPrompt.objectives.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Objectives</label>
                    <ul className="space-y-2">
                      {viewingPrompt.objectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-gray-900 bg-gray-50 p-3 rounded-lg">
                          <span className="text-blue-600 font-semibold">{idx + 1}.</span>
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Call Script / Prompt</label>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
                      {viewingPrompt.prompt}
                    </pre>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  {viewingPrompt.compliance_status === 'pending' && (
                    <>
                      <button
                        onClick={() => {
                          onApprove(viewingPrompt.id);
                          setViewingPrompt(null);
                        }}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Check size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          onReject(viewingPrompt.id);
                          setViewingPrompt(null);
                        }}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <X size={18} />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      onToggleLock(viewingPrompt.id, !viewingPrompt.is_locked);
                      setViewingPrompt({ ...viewingPrompt, is_locked: !viewingPrompt.is_locked });
                    }}
                    className={`flex items-center gap-2 ${
                      viewingPrompt.is_locked 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white px-4 py-2 rounded-lg transition-colors`}
                  >
                    {viewingPrompt.is_locked ? (
                      <>
                        <Unlock size={18} />
                        Unlock
                      </>
                    ) : (
                      <>
                        <Lock size={18} />
                        Lock
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
