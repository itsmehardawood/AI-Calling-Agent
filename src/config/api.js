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
    HTTPS: 'https://nklzswxp-9000.asse.devtunnels.ms',
    WS: 'wss://nklzswxp-9000.asse.devtunnels.ms',
  },
  
  // Auto-detect based on hostname
  getConfig() {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      
      // If running on localhost, use local config
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return this.LOCAL;
      }
      
      // Otherwise use production config
      return this.PRODUCTION;
    }
    
    // Default to local for SSR
    return this.LOCAL;
  }
};

export const getBackendConfig = () => API_CONFIG.getConfig();

export const getApiUrl = (endpoint) => {
  const config = getBackendConfig();
  return `${config.HTTPS}${endpoint}`;
};

export const getWebSocketUrl = (endpoint) => {
  const config = getBackendConfig();
  return `${config.WS}${endpoint}`;
};

// Usage examples:
// const apiUrl = getApiUrl('/api/calls/outbound');
// const wsUrl = getWebSocketUrl('/api/calls/frontend-stream/call-123');