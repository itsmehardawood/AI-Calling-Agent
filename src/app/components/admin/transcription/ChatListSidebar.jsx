import { 
  Search, 
  ChevronRight, 
  Calendar,
  MessageCircle,
  Loader2,
  AlertCircle 
} from 'lucide-react';

export default function ChatListSidebar({
  chatHistories,
  selectedChat,
  loading,
  error,
  searchTerm,
  onSearchChange,
  onChatSelect,
  formatDate
}) {
  const filteredHistories = chatHistories.filter((chat) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (chat.customer_name?.toLowerCase().includes(searchLower)) ||
      (chat.phone_number?.includes(searchTerm)) ||
      (chat.from_number?.includes(searchTerm)) ||
      (chat.call_id?.toLowerCase().includes(searchLower)) ||
      (chat.id?.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden h-full">
      {/* Search Bar */}
      <div className="p-3 sm:p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 border text-sm sm:text-base text-gray-600 border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="overflow-y-auto h-[calc(100vh-280px)] sm:h-[calc(100vh-280px)]">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500" />
          </div>
        ) : error && !chatHistories.length ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mb-3" />
            <p className="text-sm sm:text-base text-gray-600 text-center">{error}</p>
          </div>
        ) : filteredHistories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <MessageCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3" />
            <p className="text-sm sm:text-base text-gray-600 text-center">
              {searchTerm ? 'No matching conversations found' : 'No chat histories available'}
            </p>
          </div>
        ) : (
          filteredHistories.map((chat) => (
            <div
              key={chat.call_id || chat.id}
              onClick={() => onChatSelect(chat)}
              className={`p-3 sm:p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-blue-50 active:bg-blue-100 ${
                selectedChat?.call_id === chat.call_id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                    {chat.customer_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base text-gray-900 truncate">
                      {chat.customer_name || 'Unknown'}
                    </h3>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{formatDate(chat.created_at || chat.date)}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 ml-2" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
