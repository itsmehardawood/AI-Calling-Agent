import { Users } from 'lucide-react';

export default function EmptyState({ searchTerm }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Users className="text-gray-400" size={32} />
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
        {searchTerm ? 'No leads found' : 'No leads yet'}
      </h3>
      <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto">
        {searchTerm
          ? `No leads match your search for "${searchTerm}"`
          : 'Leads will appear here once they start coming in'}
      </p>
    </div>
  );
}
