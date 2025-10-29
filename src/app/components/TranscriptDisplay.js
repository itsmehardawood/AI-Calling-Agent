// src/components/TranscriptDisplay.js
'use client';

import React, { useRef, useEffect } from 'react';
import { Phone, Calendar, ExternalLink } from 'lucide-react';

const TranscriptDisplay = ({ transcripts, callData, connectionState }) => {
  const transcriptEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcripts]);

  const getMessageStyle = (message) => {
    if (message.type === 'system') {
      switch (message.variant) {
        case 'error': return 'bg-red-100 text-red-800 border border-red-200';
        case 'success': return 'bg-green-100 text-green-800 border border-green-200';
        default: return 'bg-blue-50 text-blue-800 border border-blue-200';
      }
    }
    
    if (message.type === 'tool') {
      return 'bg-gradient-to-r from-yellow-50 to-orange-50 text-gray-800 border border-yellow-200';
    }
    
    return message.speaker === 'user'
      ? 'bg-blue-500 text-white'
      : 'bg-white text-gray-800 border border-gray-200';
  };

  const getDisplayName = (speaker) => {
    const names = {
      user: 'Customer',
      assistant: 'Agent',
      system: 'System'
    };
    return names[speaker] || speaker;
  };

  const formatToolResult = (toolData) => {
    if (toolData.tool_name === 'schedule_google_calendar' && toolData.result) {
      const result = typeof toolData.result === 'string' ? JSON.parse(toolData.result) : toolData.result;
      
      return (
        <div className="mt-2 p-3 bg-white bg-opacity-50 rounded-lg border">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold">Calendar Event Scheduled</span>
          </div>
          
          <div className="space-y-1 text-sm">
            <div><strong>Event:</strong> {result.summary || 'Property Viewing'}</div>
            <div><strong>Time:</strong> {new Date(result.start_time).toLocaleString()}</div>
            <div><strong>Status:</strong> <span className="text-green-600">✓ {result.status}</span></div>
          </div>
          
          {result.eventLink && (
            <a 
              href={result.eventLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Google Calendar
            </a>
          )}
        </div>
      );
    }
    
    return (
      <div className="mt-2 p-2 bg-white bg-opacity-50 rounded text-xs">
        <strong>Tool:</strong> {toolData.tool_name}<br/>
        <strong>Result:</strong> {JSON.stringify(toolData.result, null, 2)}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white px-6 py-3 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">Live Conversation</h2>
          <div className="text-sm text-gray-500">
            {transcripts.filter(t => t.type === 'transcript').length} messages
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {transcripts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Phone className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">Waiting for conversation...</p>
            <p className="text-sm">Connection: {connectionState}</p>
            {callData?.customer_phone && (
              <p className="text-sm mt-2">Customer: {callData.customer_phone}</p>
            )}
          </div>
        ) : (
          transcripts.map((message) => (
            <div key={message.id} className={`flex ${message.speaker === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg shadow-sm ${getMessageStyle(message)}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold opacity-75">
                    {getDisplayName(message.speaker)}
                  </span>
                  <span className="text-xs opacity-60">{message.timestamp}</span>
                </div>
                
                {message.type === 'tool' ? (
                  formatToolResult(message.toolData)
                ) : (
                  <p className="text-sm leading-relaxed">{message.text}</p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
};

export default TranscriptDisplay;