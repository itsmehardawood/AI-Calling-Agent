/**
 * API functions for leads management
 */

// Use the correct base URL
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL  ;

export async function apiFetchLeads(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  // console.log('API Request:', url, options.method || 'GET');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(options.headers || {}),
      },
      ...options,
    });
    
    console.log('API Response status:', response.status);
    return response;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

/**
 * Get all leads for a user
 */
export async function getLeads(userId, page = 1, limit = 10) {
  try {
    const response = await apiFetchLeads(`/dynamics/leads/${userId}?page=${page}&limit=${limit}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch leads');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
}

/**
 * Delete a lead
 */
export async function deleteLead(leadId) {
  try {
    const response = await apiFetchLeads(`/dynamics/leads/${leadId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete lead');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
}

/**
 * Add a product prompt to a lead
 */
export async function addPromptToLead(productId, leadId) {
  try {
    const response = await apiFetchLeads(`/dynamics/lead/add-prompt`, {
      method: 'POST',
      body: JSON.stringify({
        product_id: productId,
        lead_id: leadId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add prompt to lead');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding prompt to lead:', error);
    throw error;
  }
}
