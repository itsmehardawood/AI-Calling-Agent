/**
 * API functions for product management
 */
import { apiFetch } from './api.js.js';

/**
 * Generate AI prompt for a product
 */
export async function generateProductPrompt(productData) {
  try {
    const response = await apiFetch('/prompts/generate', {
      method: 'POST',
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate prompt');
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating product prompt:', error);
    throw error;
  }
}

/**
 * Create a new product
 */
export async function createProduct(productData) {
  try {
    const response = await apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

/**
 * Get all products for a business/user
 */
export async function getProducts(userId) {
  try {
    const response = await apiFetch(`/business/${userId}/products`);

    console.log('Get products response status:', response.status);
    
    if (!response.ok) {
      const contentType = response.headers.get("content-type");
      console.log('Response content-type:', contentType);
      
      if (contentType && contentType.includes("application/json")) {
        const error = await response.json();
        throw new Error(error.error || `Failed to fetch products. Status: ${response.status}`);
      } else {
        const text = await response.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}. Check if the endpoint exists.`);
      }
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

/**
 * Get product by ID
 */
export async function getProductById(productId) {
  try {
    const response = await apiFetch(`/products/${productId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
}

/**
 * Update existing product
 */
export async function updateProduct(productId, productData) {
  try {
    const response = await apiFetch(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

/**
 * Delete product
 */
export async function deleteProduct(productId) {
  try {
    const response = await apiFetch(`/products/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete product');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
}

/**
 * Update product status (activate/deactivate)
 */
export async function updateProductStatus(productId, status) {
  try {
    const response = await apiFetch(`/products/${productId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update product status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating product status:', error);
    throw error;
  }
}
