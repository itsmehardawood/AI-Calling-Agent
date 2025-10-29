// src/components/CallControls.js
'use client';

import React from 'react';
import { ArrowLeft, PhoneOff, Mic, MicOff, Volume2, VolumeX, Download, Copy } from 'lucide-react';

const CallControls = ({
  // Navigation
  onBackClick,
  
  // Call info
  callId,
  connectionState,
  isConnected,
  callDuration,
  
  // Audio controls
  isMuted,
  volumeLevel,
  onToggleMute,
  onVolumeChange,
  
  // Call actions
  isCallActive,
  onEndCall,
  
  // Transcript actions
  onCopyTranscript,
  onDownloadTranscript
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

  return (
    <div className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <button
            onClick={onBackClick}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Back to Home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className={`font-semibold ${getStatusColor()}`}>
              {connectionState.charAt(0).toUpperCase() + connectionState.slice(1)}
            </span>
          </div>
          
          {callId && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Call:</span> {callId.substring(0, 8)}...
            </div>
          )}
          
          <div className="text-sm text-gray-600">
            <span className="font-medium">Duration:</span> {callDuration}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-red-500" />
            ) : (
              <Volume2 className="w-5 h-5 text-gray-600" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volumeLevel}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-20 accent-blue-500"
              disabled={isMuted}
            />
            <span className="text-xs text-gray-500 w-8">
              {Math.round(volumeLevel * 100)}%
            </span>
          </div>

          {/* Control Buttons */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-lg transition-colors ${
              isMuted 
                ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={onCopyTranscript}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Copy Transcript"
          >
            <Copy className="w-5 h-5" />
          </button>

          <button
            onClick={onDownloadTranscript}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            title="Download Transcript"
          >
            <Download className="w-5 h-5" />
          </button>

          <button
            onClick={onEndCall}
            disabled={!isCallActive}
            className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
            <span>End Call</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallControls;