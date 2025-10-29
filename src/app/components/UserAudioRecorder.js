// src/components/UserAudioRecorder.js
'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff } from 'lucide-react';

export const useUserAudioRecorder = ({ onAudioSend, onError }) => {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const streamRef = useRef(null);

    // Convert ArrayBuffer to base64 (from your working code)
    const arrayBufferToBase64 = useCallback((buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }, []);

    // Start recording
    const startRecording = useCallback(async () => {
        try {
            if (!('MediaRecorder' in window)) {
                throw new Error('MediaRecorder API not supported in this browser');
            }

            console.log('🎤 Starting audio recording...');
            
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    sampleRate: 16000,
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true
                }, 
                video: false 
            });

            streamRef.current = stream;
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm; codecs=opus' // Same as your working code
            });
            
            audioChunksRef.current = [];

            // Set up event handlers
            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                console.log('🎤 Recording stopped, processing audio...');
                
                const blob = new Blob(audioChunksRef.current, { 
                    type: 'audio/webm; codecs=opus' 
                });
                
                const reader = new FileReader();
                reader.onloadend = () => {
                    const arrayBuffer = reader.result;
                    const byteArray = new Uint8Array(arrayBuffer);
                    const base64Audio = arrayBufferToBase64(byteArray);
                    
                    console.log(`🎤 Sending audio data, size: ${base64Audio.length}`);
                    onAudioSend?.(base64Audio);
                };
                reader.readAsArrayBuffer(blob);

                // Cleanup stream
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }
            };

            mediaRecorderRef.current.onerror = (event) => {
                console.error('🎤 MediaRecorder error:', event.error);
                onError?.(`Recording error: ${event.error}`);
                setIsRecording(false);
            };

            // Start recording
            mediaRecorderRef.current.start();
            setIsRecording(true);
            console.log('🎤 Recording started successfully');

        } catch (error) {
            console.error('🎤 Error starting recording:', error);
            onError?.(`Failed to start recording: ${error.message}`);
            setIsRecording(false);
        }
    }, [arrayBufferToBase64, onAudioSend, onError]);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && isRecording) {
            console.log('🎤 Stopping recording...');
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    }, [isRecording]);

    // Toggle recording
    const toggleRecording = useCallback(() => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    return {
        isRecording,
        startRecording,
        stopRecording,
        toggleRecording
    };
};

// Recording Button Component
export const RecordingButton = ({ 
    isRecording, 
    onToggleRecording, 
    disabled = false 
}) => {
    return (
        <button
            onClick={onToggleRecording}
            disabled={disabled}
            className={`p-3 rounded-full transition-all duration-200 ${
                isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : 'shadow-lg hover:shadow-xl'}`}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
        >
            {isRecording ? (
                <MicOff className="w-6 h-6" />
            ) : (
                <Mic className="w-6 h-6" />
            )}
        </button>
    );
};