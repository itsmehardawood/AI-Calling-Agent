import { 
  Phone, 
  Calendar, 
  X, 
  MessageCircle,
  Loader2,
  AlertCircle,
  User,
  Bot,
  ArrowLeft
} from 'lucide-react';

export default function ConversationDisplay({
  selectedChat,
  conversation,
  conversationLoading,
  onClose,
  formatDate,
  isMobile = false
}) {
  if (!selectedChat) {
    return (
      <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden h-full flex flex-col items-center justify-center text-gray-500 p-6">
        <MessageCircle className="w-12 h-12 sm:w-16 sm:h-16 mb-4 text-gray-300" />
        <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2 text-center">
          Select a Conversation
        </h3>
        <p className="text-sm sm:text-base text-gray-500 text-center">
          Choose a chat from the list to view the full conversation
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg sm:rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
      {/* Conversation Header */}
      <div className="p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                aria-label="Back to list"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
              {selectedChat.customer_name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                {selectedChat.customer_name || 'Unknown User'}
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1 sm:gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{selectedChat.phone_number || 'N/A'}</span>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="truncate">{formatDate(selectedChat.created_at || selectedChat.date)}</span>
                </span>
              </p>
            </div>
          </div>
          {!isMobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
              aria-label="Close conversation"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 bg-gray-50">
        {conversationLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-blue-500" />
          </div>
        ) : !conversation || conversation.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3" />
            <p className="text-sm sm:text-base text-gray-600">No messages in this conversation</p>
          </div>
        ) : (
          conversation.map((message, index) => {
            const isBot = message.role === 'bot' || message.role === 'assistant' || message.sender === 'bot';
            return (
              <div
                key={index}
                className={`flex ${isBot ? 'justify-start' : 'justify-end'} animate-fade-in`}
              >
                <div
                  className={`flex items-start gap-2 sm:gap-3 max-w-[85%] sm:max-w-[75%] ${
                    isBot ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isBot
                        ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                        : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                    }`}
                  >
                    {isBot ? (
                      <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`rounded-xl sm:rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-md ${
                      isBot
                        ? 'bg-white border border-gray-200'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-semibold ${
                          isBot ? 'text-gray-700' : 'text-blue-100'
                        }`}
                      >
                        {isBot ? 'AI Assistant' : 'User'}
                      </span>
                    </div>
                    <p
                      className={`text-xs sm:text-sm leading-relaxed break-words ${
                        isBot ? 'text-gray-800' : 'text-white'
                      }`}
                    >
                      {message.text || message.content || message.message}
                    </p>
                    {message.timestamp && (
                      <p
                        className={`text-xs mt-2 ${
                          isBot ? 'text-gray-400' : 'text-blue-100'
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
