import { Search } from 'lucide-react';

export default function SearchBar({ searchTerm, onSearchChange }) {
  return (
    <div className="px-3 sm:px-5">
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search by email, phone, or company..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full  pl-10 pr-4 py-2 sm:py-2.5 text-sm sm:text-base border text-gray-600 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>
    </div>
  );
}
