import { useState } from 'react';
import { Edit, Trash2, Check, Copy } from 'lucide-react';

export default function ProductCard({
  product,
  selectionMode,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  getStatusColor,
  formatDate
}) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCardClick = () => {
    if (selectionMode) {
      onSelect(product);
    }
  };

  const handleCopyId = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(product.id);
    setCopiedId(product.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white rounded-lg border-2 transition-all ${
        isSelected
          ? "border-green-500 shadow-lg bg-green-50"
          : selectionMode
          ? "border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer"
          : "border-gray-200 hover:shadow-md"
      }`}
    >
      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 mr-3">
            <div className="flex items-center gap-2 mb-1">
              {selectionMode && (
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  isSelected 
                    ? "bg-green-500 border-green-500" 
                    : "border-gray-300"
                }`}>
                  {isSelected && <Check size={12} className="text-white" />}
                </div>
              )}
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate" title={product.name}>
                {product.name}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 line-clamp-2" title={product.description}>
              {product.description || 'No description'}
            </p>
          </div>
          
          {!selectionMode && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* Toggle Status */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(product.id, product.status);
                }}
                className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors ${
                  product.status === 'active' 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                title={product.status === 'active' ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                    product.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Category</p>
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-full" title={product.category}>
              {product.category}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
              {product.status}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Language</p>
            <span className="text-xs font-medium text-gray-700 truncate block" title={product.agent_language}>
              {product.agent_language || 'English'}
            </span>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Product ID</p>
            <button
              onClick={handleCopyId}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
              title="Click to copy Product ID"
            >
              {copiedId === product.id ? (
                <span className="text-green-600">✓ Copied!</span>
              ) : (
                <>
                  <Copy size={12} />
                  <span className="truncate">Copy ID</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Prompt Preview */}
        {product.prompt && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">AI Prompt</p>
            <div 
              className="text-xs text-gray-600 line-clamp-2 leading-relaxed bg-gray-50 p-2 rounded border border-gray-200" 
              title={product.prompt}
            >
              {product.prompt}
            </div>
          </div>
        )}

        {/* Dates */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pt-3 border-t border-gray-100">
          <span>Created: {formatDate(product.created_at)}</span>
          <span>Updated: {formatDate(product.updated_at)}</span>
        </div>

        {/* Actions */}
        {!selectionMode && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(product);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium border border-blue-200"
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium border border-red-200"
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
