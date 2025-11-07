const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://4e35f862ddef.ngrok-free.app";
// const BASE_URL = "https://d11cbcd484a5.ngrok-free.app";

export async function apiFetch(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  console.log('API Request:', url, options.method || 'GET');
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true', // Skip ngrok browser warning
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
