const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;
// const BASE_URL = "https://000cbf750982.ngrok-free.app";

export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  // console.log('API Request:', url, options.method || 'GET');
  
  try {
    // Check if body is FormData - don't set Content-Type header for FormData
    const isFormData = options.body instanceof FormData;
    
    const defaultHeaders = isFormData 
      ? {
          'ngrok-skip-browser-warning': '69420', // Skip ngrok browser warning
        }
      : {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': '69420', // Skip ngrok browser warning
        };
    
    // If headers is explicitly undefined (for FormData), use only default non-Content-Type headers
    const headers = options.headers === undefined && isFormData
      ? defaultHeaders
      : {
          ...defaultHeaders,
          ...(options.headers || {}),
        };
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    // console.log('API Response status:', response.status);
    return response;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}
