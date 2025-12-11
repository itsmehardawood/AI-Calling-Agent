const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(options.headers || {}),
      },
      ...options,
    });
    
    return response;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

/**
 * Fetch all chat histories for a business user
 * @param {string} userId - The user ID from localStorage
 * @returns {Promise} - Response with list of chat histories
 */
export async function getAllChatHistories(userId) {
  try {
    const response = await apiFetch(`/conversation/user/${userId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch chat histories: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if no conversations found (API returns detail field)
    if (data.detail && data.detail.includes('No conversations found')) {
      return { conversations: [] };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching chat histories:', error);
    throw error;
  }
}

/**
 * Fetch conversation details for a specific call
 * @param {string} conversationId - The conversation ID to fetch conversation for
 * @returns {Promise} - Response with conversation details
 */
export async function getConversationByCallId(conversationId) {
  try {
    const response = await apiFetch(`/conversation/${conversationId}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch conversation: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check if conversation not found (API returns detail field)
    if (data.detail && data.detail.includes('Conversation not found')) {
      return { conversation: [] };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
}
