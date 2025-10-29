import { apiFetch } from "./api.js";

// Helper function to extract user_id from JWT
function getUserIdFromToken(token) {
  try {
    if (!token) return null;

    // JWT format: header.payload.signature
    const payloadBase64 = token.split('.')[1];
    if (!payloadBase64) return null;

    // Decode Base64 (URL-safe)
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson);

    // backend sets subject in 'sub' and/or may include 'user_id'
    return payload.sub || payload.user_id || null;
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
}

export async function loginUser({ username, password }) {
  try {
    const body = new URLSearchParams();
    body.append('grant_type', 'password');
    body.append('username', username);
    body.append('password', password);
    body.append('scope', '');
    body.append('client_id', 'string');
    body.append('client_secret', 'string');

    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
      body: body.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      const message = data?.detail || JSON.stringify(data);
      throw new Error(message);
    }

    if (data.access_token) {
      // Store token
      localStorage.setItem('access_token', data.access_token);

      // Extract user_id and store it (token may use 'sub')
      const userId = getUserIdFromToken(data.access_token);
      if (userId) {
        localStorage.setItem('user_id', userId);
        console.log("✅ Extracted and stored user_id:", userId);
      } else {
        console.warn("⚠️ user_id not found in token");
      }
    }

    // If backend includes role in login response, persist it for client logic
    if (data.role) {
      localStorage.setItem('role', data.role);
    }

    return { success: true, token: data.access_token, role: data.role };
  } catch (error) {
    console.error('❌ API Error:', error.message);
    return { success: false, error: error.message };
  }
}
