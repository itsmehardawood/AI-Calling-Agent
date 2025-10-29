// src/components/WorkingAudioProcessor.js
'use client';

import { useRef, useCallback, useEffect } from 'react';

export const useWorkingAudioProcessor = ({ 
    volumeLevel = 0.8, 
    isMuted = false,
    onError = null 
}) => {
    const audioContextRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    const chunksReceivedRef = useRef(0);

    // Initialize audio context
    const initializeAudioContext = useCallback(async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
        
        return audioContextRef.current;
    }, []);

    // Create WAV file from PCM data (from your working code)
    const createWavFile = useCallback((pcmData, sampleRate = 24000) => {
        const numChannels = 1; // Mono audio
        const bitsPerSample = 16; // 16-bit PCM
        const bytesPerSample = bitsPerSample / 8;
        const blockAlign = numChannels * bytesPerSample;
        const byteRate = sampleRate * blockAlign;

        const wavHeader = new ArrayBuffer(44);
        const view = new DataView(wavHeader);

        // RIFF chunk descriptor
        writeString(view, 0, "RIFF");
        view.setUint32(4, 36 + pcmData.byteLength, true); // File size - 8 bytes
        writeString(view, 8, "WAVE");

        // fmt subchunk
        writeString(view, 12, "fmt ");
        view.setUint32(16, 16, true); // Subchunk size (16 for PCM)
        view.setUint16(20, 1, true); // Audio format (1 for PCM)
        view.setUint16(22, numChannels, true); // Number of channels
        view.setUint32(24, sampleRate, true); // Sample rate
        view.setUint32(28, byteRate, true); // Byte rate
        view.setUint16(32, blockAlign, true); // Block align
        view.setUint16(34, bitsPerSample, true); // Bits per sample

        // data subchunk
        writeString(view, 36, "data");
        view.setUint32(40, pcmData.byteLength, true); // Data size

        // Combine header and PCM data
        const wavBuffer = new Uint8Array(wavHeader.byteLength + pcmData.byteLength);
        wavBuffer.set(new Uint8Array(wavHeader), 0);
        wavBuffer.set(new Uint8Array(pcmData), wavHeader.byteLength);

        return wavBuffer.buffer;
    }, [writeString]);

    // Utility function to write strings to DataView
    const writeString = useCallback((view, offset, string) => {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }, []);

    // Handle audio chunk (matches your working HTML code)
    // WebSocket connection setup
    const ws = new WebSocket(`wss://nklzswxp-9000.asse.devtunnels.ms/api/calls/frontend-stream/${callId}`);

    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
    };

    // Send periodic pings to keep connection alive
    setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
        }
    }, 30000);
    // Play next audio chunk in queue (from your working code)
    const playNextInQueue = useCallback(async () => {
        if (audioQueueRef.current.length > 0 && !isPlayingRef.current && !isMuted) {
            isPlayingRef.current = true;
            
            try {
                const audioContext = await initializeAudioContext();
                const buffer = audioQueueRef.current.shift();
                const source = audioContext.createBufferSource();
                const gainNode = audioContext.createGain();

                source.buffer = buffer;
                gainNode.gain.value = volumeLevel;

                source.connect(gainNode);
                gainNode.connect(audioContext.destination);

                source.onended = () => {
                    console.log(`🎵 Audio chunk finished`);
                    isPlayingRef.current = false;
                    playNextInQueue(); // Play the next chunk
                };

                source.start(0);
                console.log(`🎵 Playing audio chunk, queue remaining: ${audioQueueRef.current.length}`);

            } catch (error) {
                console.error('Error playing audio chunk:', error);
                isPlayingRef.current = false;
                onError?.(`Playback error: ${error.message}`);
            }
        }
    }, [isMuted, volumeLevel, initializeAudioContext, onError]);

    // Clear audio queue
    const clearAudioQueue = useCallback(() => {
        console.log('🎵 Clearing audio queue');
        audioQueueRef.current = [];
        isPlayingRef.current = false;
    }, []);

    // Get audio statistics
    const getAudioStats = useCallback(() => {
        return {
            queueLength: audioQueueRef.current.length,
            isPlaying: isPlayingRef.current,
            chunksReceived: chunksReceivedRef.current,
            contextState: audioContextRef.current?.state || 'not-initialized',
            sampleRate: audioContextRef.current?.sampleRate || 24000
        };
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            clearAudioQueue();
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, [clearAudioQueue]);

    return {
        handleAudioChunk,
        clearAudioQueue,
        getAudioStats,
        initializeAudioContext,
        isPlaying: isPlayingRef.current
    };
};