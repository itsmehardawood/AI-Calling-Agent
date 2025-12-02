import { Activity, Filter } from 'lucide-react';

export default function EmptyState({ hasFilters }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
      <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
        {hasFilters ? (
          <Filter className="text-purple-600" size={32} />
        ) : (
          <Activity className="text-purple-600" size={32} />
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {hasFilters ? 'No Activities Found' : 'No Activity Data'}
      </h3>
      
      <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
        {hasFilters 
          ? 'No activities match your current filters. Try adjusting your search criteria.'
          : 'There are no lead activities to display at the moment. Activities will appear here as calls are made across tenants.'
        }
      </p>

      {hasFilters && (
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}
