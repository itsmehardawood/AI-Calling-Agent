// src/components/CallSidebar.js
'use client';

import React from 'react';

const CallSidebar = ({
  // Audio stats
  audioStats,
  isMuted,
  volumeLevel,
  
  // Connection info
  connectionState,
  isConnected,
  reconnectAttempts,
  
  // Call stats
  transcripts,
  callDuration,
  callId,
  
  // Actions
  onSendPing,
  onClearAudioQueue,
  onReconnect,
  onAddSystemMessage
}) => {
  
  const getStatusColor = () => {
    switch (connectionState) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'reconnecting': return 'text-orange-500';
      case 'disconnected':
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const handleClearAudioQueue = () => {
    onClearAudioQueue();
    onAddSystemMessage('Audio queue cleared', new Date().toLocaleTimeString());
  };

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      <div className="px-6 py-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">Call Details</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Audio Status */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Audio System</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`text-sm font-medium ${
                isMuted 
                  ? 'text-red-600' 
                  : audioStats.isPlaying 
                    ? 'text-green-600' 
                    : 'text-gray-600'
              }`}>
                {isMuted ? 'Muted' : audioStats.isPlaying ? 'Playing' : 'Ready'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Volume:</span>
              <span className="text-sm font-medium">{Math.round(volumeLevel * 100)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Queue:</span>
              <span className="text-sm font-medium">{audioStats.queueLength} chunks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Processed:</span>
              <span className="text-sm font-medium">{audioStats.chunksReceived} chunks</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Sample Rate:</span>
              <span className="text-sm font-medium">{audioStats.sampleRate}Hz</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Context:</span>
              <span className={`text-sm font-medium ${
                audioStats.contextState === 'running' ? 'text-green-600' : 'text-orange-600'
              }`}>
                {audioStats.contextState}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Connection</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status:</span>
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {connectionState}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Connected:</span>
              <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                {isConnected ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Reconnects:</span>
              <span className="text-sm font-medium">{reconnectAttempts}</span>
            </div>
          </div>
        </div>

        {/* Call Statistics */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Call Statistics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Duration:</span>
              <span className="text-sm font-medium">{callDuration}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Messages:</span>
              <span className="text-sm font-medium">{transcripts.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">User Messages:</span>
              <span className="text-sm font-medium">
                {transcripts.filter(t => t.speaker === 'user' && t.type === 'transcript').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Agent Messages:</span>
              <span className="text-sm font-medium">
                {transcripts.filter(t => t.speaker === 'assistant' && t.type === 'transcript').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Tool Calls:</span>
              <span className="text-sm font-medium">
                {transcripts.filter(t => t.type === 'tool').length}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Actions</h4>
          <div className="space-y-2">
            <button
              onClick={onSendPing}
              disabled={!isConnected}
              className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 disabled:bg-gray-200 disabled:text-gray-400 rounded transition-colors"
            >
              Send Ping
            </button>
            <button
              onClick={handleClearAudioQueue}
              className="w-full text-left px-3 py-2 text-sm bg-orange-50 hover:bg-orange-100 text-orange-700 rounded transition-colors"
            >
              Clear Audio Queue
            </button>
            <button
              onClick={onReconnect}
              disabled={isConnected}
              className="w-full text-left px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 disabled:bg-gray-200 disabled:text-gray-400 text-blue-700 rounded transition-colors"
            >
              Reconnect
            </button>
          </div>
        </div>

        {/* Technical Info */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Technical</h4>
          <div className="space-y-1 text-xs text-gray-600">
            <div>Call ID: {callId?.substring(0, 12)}...</div>
            <div>Audio Format: µ-law → PCM</div>
            <div>Encoding: 8kHz → 16kHz</div>
            <div>Channels: Mono</div>
            <div>Processing: Real-time</div>
          </div>
        </div>

        {/* User Audio Detection */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Audio Detection</h4>
          <div className="space-y-2">
            <div className="text-xs text-gray-600">
              <strong>Note:</strong> The system receives and processes audio from the agent (AI assistant). 
              User audio is processed server-side through Twilio and OpenAI real-time API.
            </div>
            <div className="text-xs text-orange-600">
              <strong>User Audio:</strong> Handled by backend (Twilio → OpenAI)
            </div>
            <div className="text-xs text-green-600">
              <strong>Agent Audio:</strong> Streamed to frontend for playback
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallSidebar;