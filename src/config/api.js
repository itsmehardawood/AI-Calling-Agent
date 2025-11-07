// src/config/api.js
// Create this file to manage backend URLs

const API_CONFIG = {
  // Local development
  LOCAL: {
    HTTP: 'http://localhost:9001',
    WS: 'ws://localhost:9001',
  },
  
  // Production (replace with your ngrok URL)
  PRODUCTION: {
    HTTPS: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://callapi.neurovisesolutions.com',
    WS: 'wss://b7ce9d8bacdb.ngrok-free.app',
  },
  
  // Auto-detect based on hostname
  getConfig() {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // TEMPORARY: Force production config for development
      // Comment out the lines below to use local backend
      return this.PRODUCTION;
      
      // If running on localhost, use local config
      // if (hostname === 'localhost' || hostname === '127.0.0.1') {
      //   return this.LOCAL;
      // }
      
      // Otherwise use production config
      // return this.PRODUCTION;
    }
    
    // Default to production for SSR
    return this.PRODUCTION;
  }
};

export const getBackendConfig = () => API_CONFIG.getConfig();

export const getApiUrl = (endpoint) => {
  const config = getBackendConfig();
  const baseUrl = config.HTTPS || config.HTTP;
  return `${baseUrl}${endpoint}`;
};

export const getWebSocketUrl = (endpoint) => {
  const config = getBackendConfig();
  return `${config.WS}${endpoint}`;
};

// Usage examples:
// const apiUrl = getApiUrl('/api/calls/outbound');
// const wsUrl = getWebSocketUrl('/api/calls/frontend-stream/call-123');