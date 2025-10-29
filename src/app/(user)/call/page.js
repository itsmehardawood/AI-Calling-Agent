// src/app/call/page.js
'use client';

import { useState, useEffect, useRef } from "react";
import { Phone, PhoneOff, Volume2 } from "lucide-react";
import { apiFetch } from "../../lib/api.js";

export default function CallPage() {
  const [callActive, setCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState('idle');
  const [callId, setCallId] = useState(null);
  const [error, setError] = useState(null);
  const [callData, setCallData] = useState(null);
  
  // Polling refs for status checking (no WebSocket conflicts!)
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);
  const pollingAttemptsRef = useRef(0);
  const redirectTimeoutRef = useRef(null);
  // WebSocket ref for server push status updates
  const statusWsRef = useRef(null);

  // Navigation function without useRouter to avoid SSR issues
  const navigateToHome = () => {
    window.location.href = '/start-call';
  };

  const navigateToConversation = (callId) => {
    // cleanup timers and websocket before navigating (full reload)
    try {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      pollingAttemptsRef.current = 0;
      if (statusWsRef.current) {
        try { statusWsRef.current.close(); } catch (e) {}
        statusWsRef.current = null;
      }
    } catch (e) {
      console.warn('[DEBUG] Error during cleanup before navigate:', e);
    }
    window.location.href = `/conversation?call_id=${callId}`;
  };

  useEffect(() => {
    const storedCallData = localStorage.getItem('call_data');
    if (storedCallData) {
      try {
        const data = JSON.parse(storedCallData);
        setCallData(data);
        console.log('[DEBUG] Loaded call data from localStorage:', data);
      } catch (e) {
        console.error('[DEBUG] Error parsing stored call data:', e);
      }
    }
  }, []);

  // Load call data from localStorage or URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const storedCallData = localStorage.getItem('call_data');
    const urlCallId = urlParams.get('call_id');

    if (urlCallId) {
      console.log('[DEBUG] Found call_id in URL:', urlCallId);
      setCallId(urlCallId);
      setCallActive(true);
      setCallStatus('connecting');
    } else if (storedCallData) {
      try {
        const data = JSON.parse(storedCallData);
        setCallData(data);
        console.log('[DEBUG] Loaded call data:', data);
      } catch (e) {
        console.error('[DEBUG] Error parsing stored call data:', e);
      }
    }
  }, []);

  // ⭐ WebSocket-based status listener (replaces HTTP polling)
  useEffect(() => {
    // Only connect if we have a callId and the call is active
    if (!callId || !callActive) {
      console.log('[DEBUG] Skipping WS connect - callId:', callId, 'callActive:', callActive);
      return;
    }

    // If already connected, do nothing
    if (statusWsRef.current) {
      console.log('[DEBUG] Status WS already connected');
      return;
    }

    console.log('[DEBUG] Connecting to status WebSocket for call:', callId);
    pollingAttemptsRef.current = 0;

    // Build WS URL robustly (uses NEXT_PUBLIC_BASE_WS_URL if set)
    const encodedCallId = encodeURIComponent(callId);
    const baseEnv = process.env.NEXT_PUBLIC_BASE_WS_URL || '';
    let wsUrl;
    if (baseEnv && /^wss?:\/\//i.test(baseEnv)) {
      wsUrl = `${baseEnv.replace(/\/+$|^\/+/, '')}/api/calls/${encodedCallId}/status`;
    } else {
      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const host = baseEnv ? baseEnv.replace(/^\/+|\/+$/g, '') : window.location.host;
      wsUrl = `${proto}//${host}/api/calls/${encodedCallId}/status`;
    }

    try {
      const ws = new WebSocket(wsUrl);
      statusWsRef.current = ws;

      // Timeout to fallback if no status comes through
      pollingTimeoutRef.current = setTimeout(() => {
        console.warn('[DEBUG] Status WS timeout after 60s, closing connection');
        if (statusWsRef.current) {
          try { statusWsRef.current.close(); } catch (e) {}
          statusWsRef.current = null;
        }
        setCallStatus('error');
        setError('Call connection timeout. Please try again.');
        setCallActive(false);
      }, 60000);

      ws.onopen = () => {
        console.log('[DEBUG] Status WS connected:', wsUrl);
      };

      ws.onmessage = (evt) => {
        pollingAttemptsRef.current += 1;
        let msg = null;
        try {
          msg = JSON.parse(evt.data);
        } catch (e) {
          console.warn('[DEBUG] Non-JSON WS message', evt.data);
          return;
        }

        console.log('[DEBUG] WS message received:', msg);
        if (msg.type === 'call_status' && msg.call_id === callId) {
          const statusRaw = (msg.status || 'not_found').toString();
          const normalizedStatus = statusRaw.toLowerCase().replace(/_/g, '-');
          console.log('[DEBUG] Normalized status from WS:', normalizedStatus);

          // Clear timeout as we received status
          if (pollingTimeoutRef.current) {
            clearTimeout(pollingTimeoutRef.current);
            pollingTimeoutRef.current = null;
          }

            if (normalizedStatus === 'in-progress' || normalizedStatus === 'answered') {
              console.log('[DEBUG] ✅ Call answered via WS. Scheduling navigation...');
              setCallStatus('answered');
              setCallActive(true);
              // cleanup websocket but delay navigation briefly to allow UI update
              try {
                if (statusWsRef.current) { statusWsRef.current.close(); statusWsRef.current = null; }
              } catch (e) {}
              if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
              navigateToConversation(callId);
              
              return;
            }

          if (normalizedStatus === 'ringing' || normalizedStatus === 'initiating' || normalizedStatus === 'initiated') {
            setCallStatus('connecting');
            setCallActive(true);
            return;
          }

          if (['no-answer', 'busy', 'failed', 'canceled', 'not_found'].includes(normalizedStatus)) {
            console.log('[DEBUG] Call ended/failed with status:', normalizedStatus);
            try { if (statusWsRef.current) { statusWsRef.current.close(); statusWsRef.current = null; } } catch (e) {}
            setCallStatus('error');
            setError(normalizedStatus === 'no-answer' ? 'Call was not answered.' : `Call status: ${normalizedStatus}`);
            setCallActive(false);
            return;
          }

          if (normalizedStatus === 'completed' || normalizedStatus === 'ended') {
            try { if (statusWsRef.current) { statusWsRef.current.close(); statusWsRef.current = null; } } catch (e) {}
            setCallStatus('ended');
            setCallActive(false);
            return;
          }
        }
  };

      ws.onclose = (ev) => {
        console.log('[DEBUG] Status WS closed', ev);
        if (statusWsRef.current) statusWsRef.current = null;
      };

      ws.onerror = (err) => {
        console.error('[DEBUG] Status WS error', err);
      };
    } catch (err) {
      console.error('[DEBUG] Failed to connect status WS:', err);
      setError('Failed to connect to status stream');
    }

    // Cleanup on unmount or dependencies change
    return () => {
      console.log('[DEBUG] Cleaning up status WebSocket and timers...');
      if (statusWsRef.current) {
        try { statusWsRef.current.close(); } catch (e) {}
        statusWsRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
      pollingAttemptsRef.current = 0;
    };
  }, [callId, callActive]); // note: callStatus excluded to avoid reconnect churn

  // API call function (inline to avoid import issues)
  const initiateCallAPI = async (callData) => {
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
      
      const result = await response.json();


      console.log('API Response:', result);

      navigateToConversation(result.callId);
      return result;
    } catch (error) {
      console.error('Failed to initiate call:', error);
      throw error;
    }
  };

  const endCallAPI = async (callId) => {
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
  };

  const initiateCall = async () => {
    console.log('[DEBUG] initiateCall triggered');
    try {
      setCallActive(true);
      setCallStatus('initiating');
      setError(null);

      // Use stored call data or fallback to demo data
      const payload = callData || {
        customer_phone: "+923067145010",
        customer_info: [
          "Interested in luxury properties",
          "Budget range: 2M-5M AED",
          "Looking for family residence"
        ],
        agent_id: "agent-1",
        product_info: {
          "burj vista": {
            property_type: "residential",
            location: "Dubai",
            bedrooms: 3,
            bathrooms: 2,
            price: "3M AED",
            property_features: [
              "Ocean view",
              "Private garden",
              "Smart home system",
              "24/7 security",
              "Swimming pool"
            ]
          }
        },
        sales_goals: [
          "Convert leads to buyers",
          "Promote luxury real estate",
          "Achieve monthly sales targets"
        ]
      };

      console.log('[DEBUG] Initiating call with payload:', payload);

      // Call the API
      const result = await initiateCallAPI(payload);
      
      console.log('[DEBUG] Call initiated successfully:', result);
      
      if (result.call_id) {
        setCallId(result.call_id);
        setCallStatus('connecting');
        // Store call ID and data for conversation page
        localStorage.setItem('current_call_id', result.call_id);
        localStorage.setItem('call_data', JSON.stringify(payload));
        
        // WebSocket will auto-connect via useEffect when callId is set and callActive is true
        console.log('[DEBUG] Call ID set, WebSocket will connect automatically');
      } else {
        throw new Error('No call ID returned from API');
      }

    } catch (error) {
      console.error('[DEBUG] Error initiating call:', error);
      setError(error.message || 'Failed to initiate call');
      setCallActive(false);
      setCallStatus('error');
    }
  };

  const endCall = async () => {
    console.log('[DEBUG] Ending call...');
    try {
      setCallStatus('ending');
      
      // Stop polling first
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      
      if (callId) {
        await endCallAPI(callId);
        localStorage.removeItem('current_call_id');
        localStorage.removeItem('call_data');
      }
      
      setCallActive(false);
      setCallStatus('ended');
      
      setTimeout(() => {
        navigateToHome();
      }, 1500);
    } catch (error) {
      console.error('[DEBUG] Error ending call:', error);
      setError('Failed to end call properly');
      setCallActive(false);
    }
  };

  const getStatusMessage = () => {
    switch (callStatus) {
      case 'idle': return 'Ready to call';
      case 'initiating': return 'Starting call...';
      case 'connecting': return 'Connecting to customer...';
      case 'connected': return 'Call in progress';
      case 'ending': return 'Ending call...';
      case 'ended': return 'Call ended';
      case 'error': return error || 'Call failed';
      default: return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (callStatus) {
      case 'connected': return 'text-green-600';
      case 'connecting':
      case 'initiating': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'ended': return 'text-gray-600';
      default: return 'text-black';
    }
  };

  return (
    <div className="h-screen flex text-white bg-gradient-to-br from-yellow-100 to-white font-sans w-full">
      {/* Left Section: Calling Interface */}
      <div className="w-[60%] flex flex-col justify-between items-center py-8 px-4 relative">
        <div className="flex flex-col items-center flex-1 justify-center">
          {/* No active call banner when there's no callId or call not active (unless we're initiating) */}
          {(!callId || !callActive) && callStatus !== 'initiating' && (
            <div className="absolute top-6 left-6 right-6 bg-gray-50 border border-gray-200 text-gray-800 p-4 rounded shadow">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">No active call</div>
                  <div className="text-sm text-gray-600">There is no active call for the current session or ID.</div>
                </div>
                <div>
                  <button onClick={navigateToHome} className="bg-gray-600 text-white px-3 py-1 rounded">Back</button>
                </div>
              </div>
            </div>
          )}
          {/* Customer Avatar */}
          <div className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center mb-6 shadow-lg">
            <div className="text-gray-500 text-4xl">👤</div>
          </div>
          
          {/* Customer Info */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-black mb-2">
              {callData?.customer_info?.[0] || 'Demo Customer'}
            </h2>
            <p className="text-lg text-gray-600">
              {callData?.customer_phone}
            </p>
          </div>

          {/* Call Status */}
          <div className="text-center mb-8">
            <p className={`text-xl font-semibold ${getStatusColor()}`}>
              {getStatusMessage()}
            </p>
            {callId && (
              <p className="text-sm text-gray-500 mt-2">
                Call ID: {callId.substring(0, 8)}...
              </p>
            )}
            {/* Dynamic banner: show Join Now when answered, Retry when error, or small connecting hint */}
            <div className="mt-4">
              {callStatus === 'answered' && (
                <div className="inline-flex items-center space-x-3 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded">
                  <span>Call answered — joining conversation</span>
                  <button onClick={() => navigateToConversation(callId)} className="ml-2 bg-green-600 text-white px-3 py-1 rounded">Join Now</button>
                </div>
              )}

              {callStatus === 'connecting' && (
                <div className="inline-flex items-center space-x-3 bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded">
                  <span>Connecting to customer...</span>
                </div>
              )}

              {callStatus === 'error' && (
                <div className="inline-flex items-center space-x-3 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded">
                  <span>{error || 'Call failed'}</span>
                  <button onClick={() => { if (callData) initiateCall(); }} className="ml-2 bg-red-600 text-white px-3 py-1 rounded">Retry</button>
                </div>
              )}
            </div>
          </div>

          {/* Call Duration Timer */}
          {callActive && callStatus === 'connected' && (
            <div className="text-center mb-4">
              <p className="text-lg text-gray-700">
                Call Duration: <CallTimer />
              </p>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-6">
          {!callActive ? (
            <button
              onClick={initiateCall}
              disabled={callStatus === 'initiating'}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-full p-6 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
            >
              <Phone className="w-8 h-8" />
            </button>
          ) : (
            <>
              <button
                className="bg-gray-300 text-gray-600 rounded-full p-4 cursor-not-allowed"
                disabled
              >
                <Volume2 className="w-6 h-6" />
              </button>
              
              <button
                onClick={endCall}
                disabled={callStatus === 'ending'}
                className="bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full p-6 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
              >
                <PhoneOff className="w-8 h-8" />
              </button>
            </>
          )}
        </div>

        {/* Loading Animation */}
        {(callStatus === 'initiating' || callStatus === 'connecting') && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-lg font-medium text-gray-700">{getStatusMessage()}</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Section: Call Information */}
      <div className="w-[40%] bg-white text-black p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Call Details</h2>
        
        {/* Customer Information */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Customer Information</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">{callData?.customer_info?.[0] || 'Demo Customer'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-medium">{callData?.customer_phone || '+923067145010'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium">{callData?.customer_info?.[1] || 'Interested prospect'}</span>
            </div>
          </div>
        </div>

        {/* Product Information */}
        {callData?.product_info && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Property Details</h3>
            {Object.entries(callData.product_info).map(([key, product]) => (
              <div key={key} className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-2">{key.replace('_', ' ').toUpperCase()}</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="text-gray-600">Type:</span> {product.property_type}</div>
                  <div><span className="text-gray-600">Location:</span> {product.location}</div>
                  <div><span className="text-gray-600">Bedrooms:</span> {product.bedrooms}</div>
                  <div><span className="text-gray-600">Bathrooms:</span> {product.bathrooms}</div>
                  <div><span className="text-gray-600">Price:</span> {product.price}</div>
                  {product.property_features && (
                    <div className="mt-2">
                      <span className="text-gray-600">Features:</span>
                      <ul className="list-disc list-inside ml-2 mt-1">
                        {product.property_features.map((feature, idx) => (
                          <li key={idx} className="text-xs">{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sales Goals */}
        {callData?.sales_goals && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Sales Objectives</h3>
            <ul className="space-y-2">
              {callData.sales_goals.map((goal, idx) => (
                <li key={idx} className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                  <span className="text-sm">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Call Actions */}
        <div className="mt-auto space-y-3">
          {callActive && callStatus === 'connected' && (
            <button
              onClick={() => navigateToConversation(callId)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors"
            >
              View Live Conversation
            </button>
          )}
          
          {!callActive && callStatus !== 'initiating' && (
            <button
              onClick={navigateToHome}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-lg transition-colors"
            >
              Back to Home
            </button>
          )}

          {/* Debug Info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Debug Info</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Status: {callStatus}</div>
              <div>Call Active: {callActive ? 'Yes' : 'No'}</div>
              <div>Call ID: {callId || 'None'}</div>
              <div>Polling: {pollingIntervalRef.current ? '✅ Active' : '❌ Inactive'}</div>
              <div>Poll Attempts: {pollingAttemptsRef.current}</div>
              <div>Backend: https://nklzswxp-9000.asse.devtunnels.ms</div>
              <div>Has Call Data: {callData ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Timer component for call duration
function CallTimer() {
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return <span>{formatTime(duration)}</span>;
}