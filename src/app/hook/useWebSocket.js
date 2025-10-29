// hooks/useWebSocket.js
import { useState, useEffect, useRef, useCallback } from 'react';

export const useWebSocket = (url, options = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionState, setConnectionState] = useState('connecting');
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const messageQueueRef = useRef([]);
  
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
    heartbeatInterval = 30000
  } = options;

  const connect = useCallback(() => {
    try {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        return;
      }

      setConnectionState('connecting');
      setError(null);

      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = (event) => {
        console.log('WebSocket connected to:', url);
        setIsConnected(true);
        setConnectionState('connected');
        setError(null);
        
        // Send queued messages
        while (messageQueueRef.current.length > 0) {
          const message = messageQueueRef.current.shift();
          wsRef.current.send(message);
        }
        
        onConnect?.(event);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (parseError) {
          console.error('Failed to parse WebSocket message:', parseError);
          setLastMessage({ raw: event.data });
          onMessage?.({ raw: event.data });
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        setConnectionState('disconnected');
        onDisconnect?.(event);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts > 0) {
          setConnectionState('reconnecting');
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current.onerror = (event) => {
        console.error('WebSocket error:', event);
        const errorMsg = 'WebSocket connection failed';
        setError(errorMsg);
        setConnectionState('error');
        onError?.(errorMsg);
      };

    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
      setError(err.message);
      setConnectionState('error');
    }
  }, [url, onMessage, onConnect, onDisconnect, onError, reconnectAttempts, reconnectInterval]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
    }
  }, []);

  const sendMessage = useCallback((message) => {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(messageStr);
    } else {
      // Queue message if not connected
      messageQueueRef.current.push(messageStr);
    }
  }, []);

  const sendHeartbeat = useCallback(() => {
    sendMessage({ type: 'ping', timestamp: Date.now() });
  }, [sendMessage]);

  // Setup heartbeat
  useEffect(() => {
    if (!isConnected || !heartbeatInterval) return;

    const interval = setInterval(sendHeartbeat, heartbeatInterval);
    return () => clearInterval(interval);
  }, [isConnected, heartbeatInterval, sendHeartbeat]);

  // Initial connection
  useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    isConnected,
    connectionState,
    lastMessage,
    error,
    sendMessage,
    connect,
    disconnect,
    sendHeartbeat
  };
};