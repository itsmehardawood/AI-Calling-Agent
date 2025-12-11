'use client';

import { useState, useEffect } from 'react';
import { getAllChatHistories, getConversationByCallId } from '../../lib/transcriptionApi';
import AdminLayout from '@/app/components/admin/AdminLayout';
import AdminSubscriptionGate from '@/app/components/AdminSubscriptionGate';
import ChatListSidebar from '@/app/components/admin/transcription/ChatListSidebar';
import ConversationDisplay from '@/app/components/admin/transcription/ConversationDisplay';

export default function TranscriptionHistory() {
  const [chatHistories, setChatHistories] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [businessId, setBusinessId] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showConversation, setShowConversation] = useState(false);

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

    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
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
      setError('No history found. Start making calls to see transcriptions here.');
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
    if (isMobile) {
      setShowConversation(true);
    }
  };

  const handleCloseConversation = () => {
    setSelectedChat(null);
    setConversation(null);
    if (isMobile) {
      setShowConversation(false);
    }
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
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <AdminLayout>
      <AdminSubscriptionGate>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-3 sm:p-4 lg:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6 lg:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">
              Transcription History
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              View and manage all your call transcriptions and conversations
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Chat List Sidebar - Hidden on mobile when conversation is shown */}
            <div className={`lg:col-span-1 ${isMobile && showConversation ? 'hidden' : 'block'}`}>
              <ChatListSidebar
                chatHistories={chatHistories}
                selectedChat={selectedChat}
                loading={loading}
                error={error}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onChatSelect={handleChatSelect}
                formatDate={formatDate}
              />
            </div>

            {/* Conversation Display - Full screen on mobile when shown */}
            <div className={`lg:col-span-2 ${isMobile && !showConversation ? 'hidden' : 'block'}`}>
              <div className="h-[calc(100vh-140px)] sm:h-[calc(100vh-160px)]">
                <ConversationDisplay
                  selectedChat={selectedChat}
                  conversation={conversation}
                  conversationLoading={conversationLoading}
                  onClose={handleCloseConversation}
                  formatDate={formatDate}
                  isMobile={isMobile}
                />
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
      </AdminSubscriptionGate>
    </AdminLayout>
  );
}
