import { useState } from 'react';
import { Edit, Trash2, Check, Copy } from 'lucide-react';

export default function ProductTable({
  products,
  selectionMode,
  selectedProductForDashboard,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  getStatusColor,
  formatDate
}) {
  const [copiedId, setCopiedId] = useState(null);
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {selectionMode && (
              <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-16">
                Select
              </th>
            )}
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%]">
  Product ID
</th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[18%]">
              Product Name
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%]">
              Category
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[8%]">
              Status
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[10%]">
              Language
            </th>
           
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[8%]">
              Created
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-[8%]">
              Updated
            </th>
            {!selectionMode && (
              <th className="py-3 px-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-[13%]">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {products.map((product) => {
            const isSelected = selectionMode && selectedProductForDashboard?.id === product.id;
            return (
              <tr 
                key={product.id}
                onClick={() => selectionMode ? onSelect(product) : null}
                className={`transition-colors ${
                  isSelected
                    ? "bg-green-50 border-l-4 border-l-green-500"
                    : selectionMode
                    ? "hover:bg-blue-50 cursor-pointer"
                    : "hover:bg-gray-50"
                }`}
              >
                {selectionMode && (
                  <td className="py-4 px-4">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected 
                        ? "bg-green-500 border-green-500" 
                        : "border-gray-300"
                    }`}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>
                  </td>
                )}

                <td className="py-4 px-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(product.id);
                      setCopiedId(product.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="text-blue-600 hover:bg-blue-50 rounded-lg p-2.5 transition-colors flex-shrink-0"
                    title="Click to copy Product ID"
                  >
                    {copiedId === product.id ? 'Copied!' : <Copy size={16} />}
                  </button>
                </td>

                <td className="py-4 px-4">
                  <div className="font-medium text-gray-900 truncate" title={product.name}>
                    {product.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 truncate" title={product.description}>
                    {product.description || 'No description'}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-full" title={product.category}>
                    {product.category}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                    {product.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="text-xs text-gray-700 font-medium truncate max-w-full block" title={product.agent_language}>
                    {product.agent_language || 'English'}
                  </span>
                </td>
           
                <td className="py-4 px-4">
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {formatDate(product.created_at)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {formatDate(product.updated_at)}
                  </span>
                </td>
                {!selectionMode && (
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-center gap-2">
                      {/* Toggle Status Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(product.id, product.status);
                        }}
                        className={`relative inline-flex items-center h-7 w-12 rounded-full transition-colors flex-shrink-0 ${
                          product.status === 'active' 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                        title={product.status === 'active' ? 'Active - Click to deactivate' : 'Inactive - Click to activate'}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-sm ${
                            product.status === 'active' ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      
                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(product);
                        }}
                        className="text-blue-600 hover:bg-blue-50 rounded-lg p-2.5 transition-colors flex-shrink-0"
                        title="Edit Product"
                      >
                        <Edit size={17} />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(product.id);
                        }}
                        className="text-red-600 hover:bg-red-50 rounded-lg p-2.5 transition-colors flex-shrink-0"
                        title="Delete Product"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
