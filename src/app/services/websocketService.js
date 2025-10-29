// import { apiFetch } from "../lib/api.js";

import { apiFetch } from "../lib/api.js";

// src/services/websocketService.js
class WebSocketService {
  constructor() {
    this.connections = new Map();
    this.messageHandlers = new Map();
    this.reconnectAttempts = new Map();
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
  }

  connect(id, url, options = {}) {
    if (this.connections.has(id)) {
      this.disconnect(id);
    }

    const config = {
      onOpen: null,
      onMessage: null,
      onClose: null,
      onError: null,
      autoReconnect: true,
      heartbeatInterval: 30000,
      ...options
    };

    const connectionInfo = {
      id,
      url,
      config,
      ws: null,
      status: 'connecting',
      heartbeatTimer: null,
      reconnectTimer: null
    };

    this.connections.set(id, connectionInfo);
    this.reconnectAttempts.set(id, 0);
    
    this._createConnection(connectionInfo);
    return connectionInfo;
  }

  _createConnection(connectionInfo) {
    const { id, url, config } = connectionInfo;

    try {
      const ws = new WebSocket(url);
      connectionInfo.ws = ws;
      connectionInfo.status = 'connecting';

      ws.onopen = (event) => {
        console.log(`WebSocket ${id} connected`);
        connectionInfo.status = 'connected';
        this.reconnectAttempts.set(id, 0);
        
        if (config.heartbeatInterval > 0) {
          this._startHeartbeat(connectionInfo);
        }
        
        config.onOpen?.(event);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'pong') {
            console.log(`Heartbeat response from ${id}`);
            return;
          }
          
          config.onMessage?.(data, event);
        } catch (error) {
          console.error(`Error parsing message from ${id}:`, error);
          config.onMessage?.(event.data, event);
        }
      };

      ws.onclose = (event) => {
        console.log(`WebSocket ${id} closed:`, event.code, event.reason);
        connectionInfo.status = 'disconnected';
        this._stopHeartbeat(connectionInfo);
        
        config.onClose?.(event);
        
        if (config.autoReconnect && event.code !== 1000) {
          this._scheduleReconnect(connectionInfo);
        }
      };

      ws.onerror = (event) => {
        console.error(`WebSocket ${id} error:`, event);
        connectionInfo.status = 'error';
        config.onError?.(event);
      };

    } catch (error) {
      console.error(`Failed to create WebSocket ${id}:`, error);
      connectionInfo.status = 'error';
      config.onError?.(error);
    }
  }

  _startHeartbeat(connectionInfo) {
    const { id, config } = connectionInfo;
    
    connectionInfo.heartbeatTimer = setInterval(() => {
      if (this.isConnected(id)) {
        this.send(id, { type: 'ping', timestamp: Date.now() });
      }
    }, config.heartbeatInterval);
  }

  _stopHeartbeat(connectionInfo) {
    if (connectionInfo.heartbeatTimer) {
      clearInterval(connectionInfo.heartbeatTimer);
      connectionInfo.heartbeatTimer = null;
    }
  }

  _scheduleReconnect(connectionInfo) {
    const { id } = connectionInfo;
    const attempts = this.reconnectAttempts.get(id) || 0;
    
    if (attempts >= this.maxReconnectAttempts) {
      console.log(`Max reconnect attempts reached for ${id}`);
      return;
    }

    this.reconnectAttempts.set(id, attempts + 1);
    const delay = this.reconnectDelay * Math.pow(2, attempts);
    
    console.log(`Scheduling reconnect for ${id} in ${delay}ms (attempt ${attempts + 1})`);
    
    connectionInfo.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect ${id}...`);
      this._createConnection(connectionInfo);
    }, delay);
  }

  send(id, message) {
    const connection = this.connections.get(id);
    
    if (!connection) {
      console.error(`Connection ${id} not found`);
      return false;
    }

    if (!this.isConnected(id)) {
      console.error(`Connection ${id} is not open`);
      return false;
    }

    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      connection.ws.send(messageStr);
      return true;
    } catch (error) {
      console.error(`Error sending message to ${id}:`, error);
      return false;
    }
  }

  disconnect(id) {
    const connection = this.connections.get(id);
    
    if (!connection) {
      return;
    }

    this._stopHeartbeat(connection);
    if (connection.reconnectTimer) {
      clearTimeout(connection.reconnectTimer);
    }

    if (connection.ws) {
      connection.ws.close(1000, 'Manual disconnect');
    }

    this.connections.delete(id);
    this.reconnectAttempts.delete(id);
  }

  isConnected(id) {
    const connection = this.connections.get(id);
    return connection?.ws?.readyState === WebSocket.OPEN;
  }

  getStatus(id) {
    const connection = this.connections.get(id);
    return connection?.status || 'not_found';
  }

  cleanup() {
    for (const id of this.connections.keys()) {
      this.disconnect(id);
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    websocketService.cleanup();
  });
}

export default websocketService;

// API Integration helpers
export const callAPI = {
  // Start a new call
  async initiateCall(callData) {
    try {
      // IMPORTANT: Update this URL to match your backend
      // const backendUrl = 'https://13.60.233.194:9000'; // Change to your backend URL
      
      const response = await apiFetch(`/api/calls/outbound`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(callData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to initiate call:', error);
      throw error;
    }
  },

  // End a call
  async endCall(callId) {
    try {
      
      const response = await apiFetch(`/api/calls/end/${callId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to end call:', error);
      throw error;
    }
  },

  // Update call status
  async updateCallStatus(callId, status, duration = null) {
    try {
      
      const response = await apiFetch(`/api/calls/status`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          call_id: callId,
          status,
          duration
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to update call status:', error);
      throw error;
    }
  },

  // Get call details
  async getCallDetails(callId) {
    try {
      
      const response = await apiFetch('/api/calls/${callId}', {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to get call details:', error);
      throw error;
    }
  }
};