// src/components/AudioProcessor.js
'use client';

import { useRef, useCallback, useEffect } from 'react';

// µ-law decoding table
const uLawTable = new Float32Array(256);

// Initialize µ-law decoding table
(() => {
    for (let i = 0; i < 256; i++) {
        let uval = ~i;
        let t = ((uval & 0x0f) << 3) + 0x84;
        t <<= (uval & 0x70) >> 4;
        uLawTable[i] = (uval & 0x80) ? (0x84 - t) : (t - 0x84);
    }
    // Normalize to [-1, 1] range
    for (let i = 0; i < 256; i++) {
        uLawTable[i] /= 32768.0;
    }
})();

export const useAudioProcessor = ({ 
    volumeLevel = 0.8, 
    isMuted = false, 
    sampleRate = 16000, // Changed to 16kHz as you requested
    onError = null 
}) => {
    const audioContextRef = useRef(null);
    const audioQueueRef = useRef([]);
    const isPlayingRef = useRef(false);
    const chunksReceivedRef = useRef(0);

    // Initialize audio context
    const initializeAudioContext = useCallback(async () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: sampleRate
            });
        }
        
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
        
        return audioContextRef.current;
    }, [sampleRate]);

    // Convert base64 to Uint8Array
    const base64ToUint8Array = useCallback((base64) => {
        try {
            const binaryString = window.atob(base64);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            return bytes;
        } catch (error) {
            const errorMsg = `Base64 decode error: ${error.message}`;
            console.error(errorMsg);
            onError?.(errorMsg);
            throw error;
        }
    }, [onError]);

    // µ-law decoder
    const decodeULaw = useCallback((uLawData) => {
        const pcmData = new Float32Array(uLawData.length);
        for (let i = 0; i < uLawData.length; i++) {
            pcmData[i] = uLawTable[uLawData[i]];
        }
        return pcmData;
    }, []);

    // Resample from input rate to target sample rate
    const resampleAudio = useCallback((inputData, inputRate, outputRate) => {
        if (inputRate === outputRate) return inputData;

        const ratio = inputRate / outputRate;
        const outputLength = Math.round(inputData.length / ratio);
        const outputData = new Float32Array(outputLength);

        for (let i = 0; i < outputLength; i++) {
            const srcIndex = i * ratio;
            const index = Math.floor(srcIndex);
            const fraction = srcIndex - index;

            if (index + 1 < inputData.length) {
                // Linear interpolation
                outputData[i] = inputData[index] * (1 - fraction) + inputData[index + 1] * fraction;
            } else {
                outputData[i] = inputData[index] || 0;
            }
        }

        return outputData;
    }, []);

    // Play single audio chunk
    const playAudioChunk = useCallback(async (base64Audio) => {
        if (isMuted || !base64Audio) return;

        try {
            const audioContext = await initializeAudioContext();
            chunksReceivedRef.current++;

            console.log(`🎵 Processing audio chunk ${chunksReceivedRef.current}, length: ${base64Audio.length}`);

            // Convert base64 to raw audio data
            const uLawData = base64ToUint8Array(base64Audio);

            // Decode µ-law to PCM (assuming 8kHz from OpenAI)
            const pcm8k = decodeULaw(uLawData);

            // Resample to target sample rate (16kHz)
            const pcmResampled = resampleAudio(pcm8k, 8000, audioContext.sampleRate);

            // Create audio buffer
            const audioBuffer = audioContext.createBuffer(1, pcmResampled.length, audioContext.sampleRate);
            audioBuffer.copyToChannel(pcmResampled, 0);

            // Create source and apply volume
            const source = audioContext.createBufferSource();
            const gainNode = audioContext.createGain();

            source.buffer = audioBuffer;
            gainNode.gain.value = volumeLevel;

            source.connect(gainNode);
            gainNode.connect(audioContext.destination);

            // Play immediately
            source.start(0);

            console.log(`🎵 Playing audio chunk ${chunksReceivedRef.current}`);

            // Return promise that resolves when audio finishes
            return new Promise((resolve) => {
                source.onended = () => {
                    console.log(`🎵 Audio chunk ${chunksReceivedRef.current} finished`);
                    resolve();
                };
            });

        } catch (error) {
            const errorMsg = `Audio playback error: ${error.message}`;
            console.error(errorMsg, error);
            onError?.(errorMsg);
        }
    }, [isMuted, volumeLevel, initializeAudioContext, base64ToUint8Array, decodeULaw, resampleAudio, onError]);

    // Process audio queue sequentially
    const processAudioQueue = useCallback(async () => {
        if (isPlayingRef.current || audioQueueRef.current.length === 0 || isMuted) {
            return;
        }

        isPlayingRef.current = true;
        console.log(`🎵 Processing audio queue, ${audioQueueRef.current.length} chunks`);

        try {
            while (audioQueueRef.current.length > 0 && !isMuted) {
                const audioChunk = audioQueueRef.current.shift();
                await playAudioChunk(audioChunk);
                
                // Small delay between chunks for smooth playback
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        } catch (error) {
            console.error('Error processing audio queue:', error);
            onError?.(`Queue processing error: ${error.message}`);
        } finally {
            isPlayingRef.current = false;
            console.log('🎵 Audio queue processing finished');
        }
    }, [isMuted, playAudioChunk, onError]);

    // Add audio chunk to queue
    const addAudioChunk = useCallback((base64Audio) => {
        if (!base64Audio || isMuted) return;
        
        console.log(`🎵 Adding audio chunk to queue, queue length: ${audioQueueRef.current.length}`);
        audioQueueRef.current.push(base64Audio);
        processAudioQueue();
    }, [isMuted, processAudioQueue]);

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
            sampleRate: audioContextRef.current?.sampleRate || sampleRate
        };
    }, [sampleRate]);

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
        addAudioChunk,
        clearAudioQueue,
        getAudioStats,
        initializeAudioContext,
        isPlaying: isPlayingRef.current
    };
};