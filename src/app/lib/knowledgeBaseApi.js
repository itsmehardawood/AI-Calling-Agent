/**
 * API functions for knowledge base management (inbound calls)
 */
import { apiFetch } from './api.js.js';

/**
 * Get knowledge base for a specific product
 */
export async function getKnowledgeBase(userId, productId) {
  try {
    const response = await apiFetch(`/api/inbound/knowledge/${userId}/${productId}`);

    if (!response.ok) {
      // If 404, return null (no knowledge base exists yet)
      if (response.status === 404) {
        return null;
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch knowledge base');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching knowledge base:', error);
    throw error;
  }
}

/**
 * Save Q&A pairs for a product
 */
export async function saveQAPairs(userId, productId, qaPairs) {
  try {
    const response = await apiFetch('/api/inbound/knowledge/qa', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        qa_pairs: qaPairs
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save Q&A pairs');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving Q&A pairs:', error);
    throw error;
  }
}

/**
 * Save knowledge sources (URLs) for a product
 */
export async function saveKnowledgeSources(userId, productId, urls) {
  try {
    const sources = urls.map(url => ({
      url: url,
      source_type: 'website'
    }));

    const response = await apiFetch('/api/inbound/knowledge/sources', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        product_id: productId,
        sources: sources
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to save knowledge sources');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving knowledge sources:', error);
    throw error;
  }
}

/**
 * Delete knowledge base for a product
 */
export async function deleteKnowledgeBase(userId, productId) {
  try {
    const response = await apiFetch(`/api/inbound/knowledge/${userId}/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete knowledge base');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting knowledge base:', error);
    throw error;
  }
}

/**
 * Upload a document for a product
 */
export async function uploadDocument(userId, productId, file, documentName, documentType) {
  try {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('product_id', productId);
    formData.append('document_name', documentName);
    formData.append('document_type', documentType);
    formData.append('file', file);

    const response = await apiFetch('/api/inbound/knowledge/documents/upload', {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - browser will set it with boundary for multipart/form-data
      headers: undefined,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload document');
    }

    return await response.json();
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

/**
 * Get documents for a product
 */
export async function getDocuments(userId, productId) {
  try {
    const response = await apiFetch(`/api/inbound/knowledge/documents/${userId}/${productId}`);

    if (!response.ok) {
      // If 404, return empty array (no documents exist yet)
      if (response.status === 404) {
        return [];
      }
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch documents');
    }

    const data = await response.json();
    return data.documents || [];
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
}

/**
 * Delete a document for a product
 */
export async function deleteDocument(userId, productId, documentName) {
  try {
    const response = await apiFetch(`/api/inbound/knowledge/documents/${userId}/${productId}/${encodeURIComponent(documentName)}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete document');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}
