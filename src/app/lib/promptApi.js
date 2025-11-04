/**
 * API functions for prompt management
 */
import { apiFetch } from './api.js.js';

/**
 * Generate AI prompt using OpenAI
 */
export async function generatePrompt(promptData) {
  try {
    const response = await apiFetch('/prompts/generate', {
      method: 'POST',
      body: JSON.stringify(promptData),
    }); 

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate prompt');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating prompt:', error);
    throw error;
  }
}

/**
 * Create a new prompt
 */
export async function createPrompt(promptData) {
  try {
    const response = await apiFetch('/prompts', {
      method: 'POST',
      body: JSON.stringify(promptData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create prompt');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
}

/**
 * Get all prompts with optional filters
 */
export async function getPrompts(filters = {}) {
  try {
    const params = new URLSearchParams();
    
    if (filters.prompt_type) params.append('prompt_type', filters.prompt_type);
    if (filters.business) params.append('business', filters.business);
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.skip) params.append('skip', filters.skip);

    const url = params.toString() ? `/prompts?${params.toString()}` : '/prompts';
    const response = await apiFetch(url);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch prompts');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching prompts:', error);
    throw error;
  }
}

/**
 * Get prompt by ID
 */
export async function getPromptById(promptId) {
  try {
    const response = await apiFetch(`/prompts/${promptId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch prompt');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching prompt:', error);
    throw error;
  }
}

/**
 * Update existing prompt
 */
export async function updatePrompt(promptId, promptData) {
  try {
    const response = await apiFetch(`/prompts/${promptId}`, {
      method: 'PUT',
      body: JSON.stringify(promptData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update prompt');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
}

/**
 * Delete prompt (soft delete)
 */
export async function deletePrompt(promptId) {
  try {
    const response = await apiFetch(`/prompts/${promptId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete prompt');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw error;
  }
}

/**
 * Activate prompt
 */
export async function activatePrompt(promptId) {
  try {
    const response = await apiFetch(`/prompts/${promptId}/activate`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to activate prompt');
    }

    return await response.json();
  } catch (error) {
    console.error('Error activating prompt:', error);
    throw error;
  }
}