'use client';

import { useState, useEffect } from 'react';
import { getAllChatHistories, getConversationByCallId } from '../../lib/transcriptionApi';
import AdminLayout from '@/app/components/admin/AdminLayout';
import { 
  MessageCircle, 
  Phone, 
  Clock, 
  User, 
  Bot, 
  Calendar,
  Search,
  ChevronRight,
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';

export default function TranscriptionHistory() {
  const [chatHistories, setChatHistories] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessId, setBusinessId] = useState(null);

  useEffect(() => {
    // Get business_id from localStorage
    const userId = localStorage.getItem('user_id');
    if (userId) {
      setBusinessId(userId);
      fetchChatHistories(userId);
    } else {
      setError('User ID not found in localStorage');
      setLoading(false);
    }
  }, []);

  const fetchChatHistories = async (userId) => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllChatHistories(userId);
      // Map the API response to match our component structure
      const mappedConversations = data.conversations.map(conv => ({
        call_id: conv._id,
        id: conv._id,
        customer_name: conv.to, // Using phone number as name for now
        phone_number: conv.to,
        from_number: conv.from,
        created_at: conv.created_at,
        date: conv.created_at,
        duration: null // Duration not provided in this API
      }));
      
      // Sort by created_at in descending order (newest first)
      const sortedConversations = mappedConversations.sort((a, b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      setChatHistories(sortedConversations || []);
    } catch (err) {
      setError('Failed to load chat histories. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchConversation = async (callId) => {
    try {
      setConversationLoading(true);
      setError(null);
      const data = await getConversationByCallId(callId);
      // Map the API response to match our component structure
      const mappedConversation = data.conversation?.map(msg => ({
        role: msg.speaker === 'assistant' ? 'bot' : 'user',
        text: msg.message,
        content: msg.message,
        message: msg.message,
        timestamp: msg.timestamp,
        sender: msg.speaker
      })) || [];
      setConversation(mappedConversation);
    } catch (err) {
      setError('Failed to load conversation. Please try again.');
      console.error('Error:', err);
    } finally {
      setConversationLoading(false);
    }
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat);
    fetchConversation(chat.call_id || chat.id);
  };

  const handleCloseConversation = () => {
    setSelectedChat(null);
    setConversation(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return ;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

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
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Transcription History
            </h1>
            <p className="text-gray-600">
              View and manage all your call transcriptions and conversations
            </p>
          </div>

          {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat List Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border text-gray-600 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="overflow-y-auto max-h-[calc(100vh-280px)]">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : error && !chatHistories.length ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
                    <p className="text-gray-600 text-center">{error}</p>
                  </div>
                ) : filteredHistories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4">
                    <MessageCircle className="w-12 h-12 text-gray-400 mb-3" />
                    <p className="text-gray-600 text-center">
                      {searchTerm ? 'No matching conversations found' : 'No chat histories available'}
                    </p>
                  </div>
                ) : (
                  filteredHistories.map((chat) => (
                    <div
                      key={chat.call_id || chat.id}
                      onClick={() => handleChatSelect(chat)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-blue-50 ${
                        selectedChat?.call_id === chat.call_id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                            {chat.customer_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {chat.customer_name || 'Unknown'}
                            </h3>
                            <div className="flex items-center justify-between pl-1 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(chat.created_at || chat.date)}
                        </span>
                      
                      </div>
                         
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                      
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Conversation Display */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-[calc(100vh-160px)]">
              {!selectedChat ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <MessageCircle className="w-16 h-16 mb-4 text-gray-300" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    Select a Conversation
                  </h3>
                  <p className="text-gray-500">
                    Choose a chat from the list to view the full conversation
                  </p>
                </div>
              ) : (
                <>
                  {/* Conversation Header */}
                  <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                          {selectedChat.customer_name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">
                            {selectedChat.customer_name || 'Unknown User'}
                          </h2>
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {selectedChat.phone_number || 'N/A'}
                            <span className="mx-2">•</span>
                            <Calendar className="w-4 h-4" />
                            {formatDate(selectedChat.created_at || selectedChat.date)}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleCloseConversation}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X className="w-6 h-6 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="overflow-y-auto p-6 space-y-4 h-[calc(100%-100px)] bg-gray-50">
                    {conversationLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                      </div>
                    ) : !conversation || conversation.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12">
                        <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
                        <p className="text-gray-600">No messages in this conversation</p>
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
                              className={`flex items-start gap-3 max-w-[75%] ${
                                isBot ? 'flex-row' : 'flex-row-reverse'
                              }`}
                            >
                              {/* Avatar */}
                              <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  isBot
                                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                                    : 'bg-gradient-to-br from-blue-500 to-cyan-600'
                                }`}
                              >
                                {isBot ? (
                                  <Bot className="w-5 h-5 text-white" />
                                ) : (
                                  <User className="w-5 h-5 text-white" />
                                )}
                              </div>

                              {/* Message Bubble */}
                              <div
                                className={`rounded-2xl px-4 py-3 shadow-md ${
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
                                  className={`text-sm leading-relaxed ${
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
                </>
              )}
            </div>
          </div>
        </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </AdminLayout>
  );
}
