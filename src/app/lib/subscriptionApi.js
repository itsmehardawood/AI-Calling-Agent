import { apiFetch } from './api.js';

/**
 * Get all available plans
 */
export async function getPlans() {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await apiFetch('/api/plans', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to fetch plans');
    }

    return { success: true, data: data };
  } catch (error) {
    console.error('Error fetching plans:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to a plan
 */
export async function subscribeToPlan(userId, planId) {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await apiFetch('/api/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        plan_id: planId,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to subscribe');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's subscription by user_id
 */
export async function getUserSubscriptionById(userId) {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await apiFetch(`/api/subscription/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to fetch subscription');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetch all subscriptions (Admin only)
 */
export async function getAllSubscriptions() {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await apiFetch('/api/subscriptions/admin/all', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to fetch subscriptions');
    }

    return { success: true, data: data.subscriptions || [] };
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId) {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await apiFetch(`/api/subscriptions/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to fetch user subscription');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create or update subscription for a user
 */
export async function createSubscription(subscriptionData) {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await apiFetch('/api/subscriptions/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to create subscription');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update subscription status
 */
export async function updateSubscription(subscriptionId, updateData) {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await apiFetch(`/api/subscriptions/${subscriptionId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to update subscription');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId) {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await apiFetch(`/api/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to cancel subscription');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get subscription history for a user
 */
export async function getSubscriptionHistory(userId) {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await apiFetch(`/api/subscriptions/history/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to fetch subscription history');
    }

    return { success: true, data: data.history || [] };
  } catch (error) {
    console.error('Error fetching subscription history:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if user has active subscription
 */
export function checkSubscriptionStatus() {
  try {
    const isSubscribed = localStorage.getItem('isSubscribed');
    return isSubscribed === 'true';
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return false;
  }
}

/**
 * Get remaining minutes for user
 */
export async function getRemainingMinutes(userId) {
  try {
    const token = localStorage.getItem('access_token');
    
    const response = await apiFetch(`/api/subscriptions/minutes/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data?.detail || 'Failed to fetch remaining minutes');
    }

    return { success: true, minutes: data.remaining_minutes || 0 };
  } catch (error) {
    console.error('Error fetching remaining minutes:', error);
    return { success: false, error: error.message };
  }
}
