import { Plus } from 'lucide-react';

export default function EmptyState({ selectionMode, onCreateClick }) {
  return (
    <div className="text-center py-12 sm:py-16 bg-white px-4">
      <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Plus size={24} className="sm:w-8 sm:h-8 text-gray-400" />
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
        {selectionMode ? "No products available" : "No products yet"}
      </h3>
      <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-sm mx-auto">
        {selectionMode 
          ? "There are no products available to select. Please create a product first."
          : "Get started by creating your first product with AI-generated prompts."
        }
      </p>
      {!selectionMode && (
        <button
          onClick={onCreateClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium inline-flex items-center gap-2 transition-colors shadow-sm text-sm sm:text-base"
        >
          <Plus size={18} />
          Create Your First Product
        </button>
      )}
    </div>
  );
}
