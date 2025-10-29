"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { PhoneOff, Volume2, Mic, MicOff } from "lucide-react";
import { apiFetch } from "@/app/lib/api.js";
// import { apiFetch } from "../../lib/api.js";

/* 
 * AUDIO FLOW ARCHITECTURE DOCUMENTATION00000000000
 * ====================================
 * 
 * This component handles two distinct types of audio streams:
 * 
 * 1. USER VOICE (Twilio Raw μ-law):
 *    - Source: Twilio phone call audio stream
 *    - Format: 8kHz, 8-bit μ-law encoded, base64 transmitted
 *    - Processing: Decoded using μ-law to PCM conversion
 *    - Message Type: "user_audio_delta"
 *    - Handler: handleUserAudioChunk() -> createAudioBuffer()
 * 
 * 2. AGENT VOICE (OpenAI Processed):
 *    - Source: OpenAI TTS (Text-to-Speech) output
 *    - Format: Already processed/converted by backend
 *    - Processing: Attempts standard audio decode, falls back to μ-law if needed
 *    - Message Type: "response.audio.chunk"
 *    - Handler: handleAgentAudioChunk() -> createAgentAudioBuffer()
 * 
 * Both audio types are queued in turn-based conversation flow and played sequentially.
 */


export default function ConversationPage() {
  const [callActive, setCallActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [callId, setCallId] = useState(null);
  const [messages, setMessages] = useState([
    { type: "bot", text: "Welcome to Chat!", timestamp: new Date() },
  ]);
  const [businessName, setBusinessName] = useState("Customer");
  const [userAudioEnabled, setUserAudioEnabled] = useState(true);
  const [agentAudioEnabled, setAgentAudioEnabled] = useState(true);
  const [currentAssistantTranscript, setCurrentAssistantTranscript] = useState("");
  const [isAssistantTranscribing, setIsAssistantTranscribing] = useState(false);

  const BASE_WS_URL = process.env.NEXT_PUBLIC_BASE_WS_URL || "null";

  // Audio handling refs
  const audioContextRef = useRef(null);
  const wsRef = useRef(null);
  const wsConnectedRef = useRef(false);

  // Turn-based conversation management
  const [conversationState, setConversationState] = useState('idle'); // 'idle', 'user_speaking', 'user_audio_playing', 'agent_audio_playing'
  const [audioTurnQueue, setAudioTurnQueue] = useState([]); // Queue of conversation turns
  const currentTurnRef = useRef(null);
  const isProcessingTurnRef = useRef(false);

  // Audio buffers for current turn00
  const currentUserAudioRef = useRef([]);
  const currentAgentAudioRef = useRef([]);
  const currentlyPlayingSourceRef = useRef(null);
  const messagesEndRef = useRef(null);
  // Audio permission helpers
  const [audioPermissionNeeded, setAudioPermissionNeeded] = useState(false);
  const [audioReady, setAudioReady] = useState(false);
  // Streaming assistant transcript tracking
  const assistantStreamingIdRef = useRef(null);
  // Buffer for assistant transcript chunks (do not render until final)
  const assistantTranscriptBufferRef = useRef("");
  // If assistant final arrives while user speech is still being finalized,
  // hold it here and insert once the user final has been flushed.
  const assistantFinalPendingRef = useRef(null);
  // Track user speech session to avoid duplicate user turns
  const userSpeechActiveRef = useRef(false);
  const userTurnQueuedRef = useRef(false);
  // Track agent audio streaming turn
  const agentTurnActiveRef = useRef(false);
  const agentTurnIdRef = useRef(null);
  // Stable refs for handlers to avoid ws effect dependency churn
  const messageHandlerRef = useRef(null);
  const initAudioContextRef = useRef(null);
  // Prevent rapid duplicate WS creations under fast re-renders/StrictMode
  const wsCreatingRef = useRef(false);

  // Get call_id from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlCallId = urlParams.get("call_id");
    if (urlCallId) {
      setCallId(urlCallId);
      setCallActive(true);
    }
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentAssistantTranscript]);

  // Initialize/resume AudioContext (may require a user gesture on some browsers)
  const initAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume();
      } catch (e) {
        // Some browsers block resume without user gesture
        console.warn("AudioContext resume blocked until user interaction", e);
        setAudioPermissionNeeded(true);
        throw e;
      }
    }
    setAudioReady(audioContextRef.current.state === 'running');
  }, []);

  // Attempt to auto-enable audio context on first user interaction
  useEffect(() => {
    const onFirstInteraction = async () => {
      try {
        await initAudioContext();
        if (audioContextRef.current?.state === 'running') {
          setAudioPermissionNeeded(false);
          setAudioReady(true);
          window.removeEventListener('pointerdown', onFirstInteraction);
          window.removeEventListener('keydown', onFirstInteraction);
        }
      } catch (_) {
        // keep prompt visible
      }
    };

    window.addEventListener('pointerdown', onFirstInteraction, { once: false });
    window.addEventListener('keydown', onFirstInteraction, { once: false });
    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction);
      window.removeEventListener('keydown', onFirstInteraction);
    };
  }, [initAudioContext]);

  // Convert μ-law to PCM
  const convertUlawToPcm = (ulawData) => {
    const pcmData = new Int16Array(ulawData.length);
    const ulawToLinear = [
      -32124, -31100, -30076, -29052, -28028, -27004, -25980, -24956, -23932,
      -22908, -21884, -20860, -19836, -18812, -17788, -16764, -15996, -15484,
      -14972, -14460, -13948, -13436, -12924, -12412, -11900, -11388, -10876,
      -10364, -9852, -9340, -8828, -8316, -7932, -7676, -7420, -7164, -6908,
      -6652, -6396, -6140, -5884, -5628, -5372, -5116, -4860, -4604, -4348,
      -4092, -3900, -3772, -3644, -3516, -3388, -3260, -3132, -3004, -2876,
      -2748, -2620, -2492, -2364, -2236, -2108, -1980, -1884, -1820, -1756,
      -1692, -1628, -1564, -1500, -1436, -1372, -1308, -1244, -1180, -1116,
      -1052, -988, -924, -876, -844, -812, -780, -748, -716, -684, -652, -620,
      -588, -556, -524, -492, -460, -428, -396, -372, -356, -340, -324, -308,
      -292, -276, -260, -244, -228, -212, -196, -180, -164, -148, -132, -120,
      -112, -104, -96, -88, -80, -72, -64, -56, -48, -40, -32, -24, -16, -8, 0,
      32124, 31100, 30076, 29052, 28028, 27004, 25980, 24956, 23932, 22908,
      21884, 20860, 19836, 18812, 17788, 16764, 15996, 15484, 14972, 14460,
      13948, 13436, 12924, 12412, 11900, 11388, 10876, 10364, 9852, 9340, 8828,
      8316, 7932, 7676, 7420, 7164, 6908, 6652, 6396, 6140, 5884, 5628, 5372,
      5116, 4860, 4604, 4348, 4092, 3900, 3772, 3644, 3516, 3388, 3260, 3132,
      3004, 2876, 2748, 2620, 2492, 2364, 2236, 2108, 1980, 1884, 1820, 1756,
      1692, 1628, 1564, 1500, 1436, 1372, 1308, 1244, 1180, 1116, 1052, 988,
      924, 876, 844, 812, 780, 748, 716, 684, 652, 620, 588, 556, 524, 492, 460,
      428, 396, 372, 356, 340, 324, 308, 292, 276, 260, 244, 228, 212, 196, 180,
      164, 148, 132, 120, 112, 104, 96, 88, 80, 72, 64, 56, 48, 40, 32, 24, 16,
      8, 0,
    ];

    for (let i = 0; i < ulawData.length; i++) {
      pcmData[i] = ulawToLinear[ulawData[i]];
    }

    return pcmData;
  };

  // Enhanced user voice processing: Apply smoothing and noise reduction
  const enhanceUserVoice = (pcmData) => {
    const enhanced = new Int16Array(pcmData.length);
    const sampleRate = 8000;
    
    // 1. Apply simple low-pass filter to remove high-frequency noise
    const cutoffFreq = 3000; // Slightly lower to tame hiss
    const rc = 1.0 / (cutoffFreq * 2 * Math.PI);
    const dt = 1.0 / sampleRate;
    const alpha = dt / (rc + dt);
    
    enhanced[0] = pcmData[0];
    for (let i = 1; i < pcmData.length; i++) {
      enhanced[i] = Math.round(enhanced[i - 1] + alpha * (pcmData[i] - enhanced[i - 1]));
    }
    
    // 2. Apply gentle noise gate to reduce background noise (even softer to avoid choppiness)
    const noiseThreshold = 120; // keep more quiet speech
    for (let i = 0; i < enhanced.length; i++) {
      if (Math.abs(enhanced[i]) < noiseThreshold) {
        enhanced[i] = Math.round(enhanced[i] * 0.85); // minimal attenuation, reduces gating artifacts
      }
    }
    
    // 3. Apply gentle compression to even out volume levels
    const compressionRatio = 0.7;
    const compressionThreshold = 16000;
    for (let i = 0; i < enhanced.length; i++) {
      const sample = enhanced[i];
      if (Math.abs(sample) > compressionThreshold) {
        const sign = sample >= 0 ? 1 : -1;
        const excess = Math.abs(sample) - compressionThreshold;
        enhanced[i] = Math.round(sign * (compressionThreshold + excess * compressionRatio));
      }
    }
    
    // 4. Apply subtle smoothing to reduce harsh edges
    const smoothed = new Int16Array(enhanced.length);
    smoothed[0] = enhanced[0];
    for (let i = 1; i < enhanced.length - 1; i++) {
      // Simple 3-point moving average with weighting (slightly wider center)
      smoothed[i] = Math.round(
        enhanced[i - 1] * 0.25 + 
        enhanced[i] * 0.5 + 
        enhanced[i + 1] * 0.25
      );
    }
    smoothed[smoothed.length - 1] = enhanced[enhanced.length - 1];

    // 5. RMS-based AGC with soft-knee limiter (reduces pumping/distortion)
    let sumSq = 0;
    for (let i = 0; i < smoothed.length; i++) {
      const s = smoothed[i];
      sumSq += s * s;
    }
    const rms = smoothed.length > 0 ? Math.sqrt(sumSq / smoothed.length) : 0;
    const targetRms = 7000; // comfortable loudness
    const maxGain = 1.8; // reduce risk of distortion
    const gain = rms > 0 ? Math.min(maxGain, targetRms / rms) : 1.0;
    const kneeStart = 26000; // start compressing
    const limit = 32000; // absolute ceiling
    const softRatio = 0.25; // strong compression above knee
    const gained = new Int16Array(smoothed.length);
    for (let i = 0; i < smoothed.length; i++) {
      let v = Math.round(smoothed[i] * gain);
      const sign = v >= 0 ? 1 : -1;
      let av = Math.abs(v);
      if (av > kneeStart) {
        av = Math.round(kneeStart + (av - kneeStart) * softRatio);
      }
      if (av > limit) av = limit;
      gained[i] = sign * av;
    }

    // 6. Short fade-in/out to reduce clicks at chunk boundaries (~2ms at 8kHz ≈ 16 samples)
    const fadeSamples = Math.min(16, Math.floor(gained.length / 2));
    if (fadeSamples > 0) {
      for (let i = 0; i < fadeSamples; i++) {
        const inRamp = i / fadeSamples;
        const outRamp = (fadeSamples - i) / fadeSamples;
        gained[i] = Math.round(gained[i] * inRamp);
        const tailIndex = gained.length - 1 - i;
        gained[tailIndex] = Math.round(gained[tailIndex] * outRamp);
      }
    }

    console.log('🎚️ Enhanced user voice: LPF, very soft gate, compression, RMS-AGC with soft limiter, short fades');
    return gained;
  };

  // Create audio buffer from Twilio's μ-law encoded base64 audio with voice enhancement
  const createAudioBuffer = useCallback(async (base64Audio) => {
    await initAudioContext();
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Convert μ-law to PCM
    const rawPcmData = convertUlawToPcm(bytes);
    
    // Apply voice enhancement for smoother, cleaner user audio
    const enhancedPcmData = enhanceUserVoice(rawPcmData);
    
    // Create audio buffer with enhanced data
    const audioBuffer = audioContextRef.current.createBuffer(1, enhancedPcmData.length, 8000);
    const channelData = audioBuffer.getChannelData(0);
    for (let i = 0; i < enhancedPcmData.length; i++) {
      channelData[i] = enhancedPcmData[i] / 32768.0;
    }
    
    console.log(`🎤✨ Enhanced user audio chunk: ${enhancedPcmData.length} samples processed`);
    return audioBuffer;
  }, [initAudioContext]);

  // Create audio buffer from OpenAI's processed audio (may be different format than μ-law)
  const createAgentAudioBuffer = useCallback(async (base64Audio) => {
    await initAudioContext();
    
    try {
      // Try to decode as standard audio first (OpenAI may send PCM or other formats)
      const binaryString = atob(base64Audio);
      const arrayBuffer = new ArrayBuffer(binaryString.length);
      const uint8Array = new Uint8Array(arrayBuffer);
      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i);
      }
      
      // Try to decode as standard audio format first
      try {
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer.slice());
        console.log(`🔊 Decoded OpenAI audio as standard format: ${audioBuffer.duration}s`);
        return audioBuffer;
      } catch (decodeError) {
        console.log("⚠️ Standard audio decode failed, trying μ-law decode for agent audio");
        
        // Fallback to μ-law decoding if standard decode fails
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const pcmData = convertUlawToPcm(bytes);
        const audioBuffer = audioContextRef.current.createBuffer(1, pcmData.length, 8000);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < pcmData.length; i++) {
          channelData[i] = pcmData[i] / 32768.0;
        }
        console.log(`🔊 Decoded OpenAI audio as μ-law format: ${audioBuffer.duration}s`);
        return audioBuffer;
      }
    } catch (error) {
      console.error("❌ Failed to decode OpenAI agent audio:", error);
      throw error;
    }
  }, [initAudioContext]);

  // Play audio buffers in sequence
  const playAudioSequence = useCallback((audioBuffers, onComplete) => {
    // Ensure AudioContext can play; if not, try to resume and retry
    if (!audioContextRef.current || audioContextRef.current.state === 'suspended') {
      initAudioContext()
        .then(() => {
          // Retry after resume
          setTimeout(() => playAudioSequence(audioBuffers, onComplete), 0);
        })
        .catch(() => {
          console.warn('Audio playback deferred until user enables audio');
        });
      return;
    }

    if (!audioBuffers || audioBuffers.length === 0) {
      onComplete && onComplete();
      return;
    }

    let currentIndex = 0;
    
    const playNext = () => {
      if (currentIndex >= audioBuffers.length) {
        onComplete && onComplete();
        return;
      }

      const audioBuffer = audioBuffers[currentIndex];
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      currentlyPlayingSourceRef.current = source;

      source.onended = () => {
        currentIndex++;
        playNext();
      };

      source.start();
    };

    playNext();
  }, [initAudioContext]);

  // Finish the current turn and move to next
  const finishCurrentTurn = useCallback(() => {
    // Capture and remove the completed turn
    setAudioTurnQueue(prev => prev.slice(1));
    const finished = currentTurnRef.current;
    currentTurnRef.current = null;
    isProcessingTurnRef.current = false;
    setConversationState('idle');
    // If we just finished a streaming agent turn, reset agent buffer/flags
    if (finished && finished.type === 'agent_turn') {
      currentAgentAudioRef.current = [];
      agentTurnActiveRef.current = false;
      agentTurnIdRef.current = null;
    }
  }, []);

  // Process the next turn in the conversation queue
  const processNextConversationTurn = useCallback(() => {
    if (isProcessingTurnRef.current || audioTurnQueue.length === 0) {
      return;
    }

    isProcessingTurnRef.current = true;
    const nextTurn = audioTurnQueue[0];
    currentTurnRef.current = nextTurn;

    console.log(`🎭 Processing turn: ${nextTurn.type}`, nextTurn);

    if (nextTurn.type === 'user_turn') {
      setConversationState('user_audio_playing');
      
      if (userAudioEnabled && nextTurn.audioBuffers.length > 0) {
        console.log(`🎤 Playing ${nextTurn.audioBuffers.length} user audio chunks`);
        playAudioSequence(nextTurn.audioBuffers, () => {
          console.log('✅ User audio playback complete');
          finishCurrentTurn();
        });
      } else {
        console.log('⏭️ Skipping user audio (disabled or no audio)');
        finishCurrentTurn();
      }
    } else if (nextTurn.type === 'agent_turn') {
      setConversationState('agent_audio_playing');
      
      if (agentAudioEnabled && nextTurn.audioBuffers.length > 0) {
        console.log(`🤖 Playing ${nextTurn.audioBuffers.length} agent audio chunks`);
        playAudioSequence(nextTurn.audioBuffers, () => {
          console.log('✅ Agent audio playback complete');
          finishCurrentTurn();
        });
      } else {
        console.log('⏭️ Skipping agent audio (disabled or no audio)');
        finishCurrentTurn();
      }
    }
  }, [audioTurnQueue, userAudioEnabled, agentAudioEnabled, finishCurrentTurn, playAudioSequence]);

  // Add a conversation turn to the queue
  const addConversationTurn = useCallback((turnType, audioBuffers, transcript = '') => {
    const newTurn = {
      id: Date.now() + Math.random(),
      type: turnType,
      audioBuffers: audioBuffers || [],
      transcript,
      timestamp: new Date()
    };

    console.log(`➕ Adding ${turnType} turn with ${audioBuffers?.length || 0} audio chunks`);
    
    setAudioTurnQueue(prev => [...prev, newTurn]);
  }, []);

  // Ensure an agent streaming turn exists (audioBuffers by reference, no clone)
  const ensureAgentStreamingTurn = useCallback(() => {
    if (agentTurnActiveRef.current) return;
    // Initialize a fresh shared buffer array for streaming
    if (!Array.isArray(currentAgentAudioRef.current)) {
      currentAgentAudioRef.current = [];
    }
    const streamingTurn = {
      id: Date.now() + Math.random(),
      type: 'agent_turn',
      audioBuffers: currentAgentAudioRef.current, // keep reference to allow growth
      transcript: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    agentTurnActiveRef.current = true;
    agentTurnIdRef.current = streamingTurn.id;
    setAudioTurnQueue(prev => [...prev, streamingTurn]);
  }, []);

  // Handle user audio chunks - collect them until speech stops
  // This processes Twilio's raw μ-law audio format
  const handleUserAudioChunk = useCallback(async (base64Audio) => {
    if (!userAudioEnabled) return;
    
    try {
      // If we haven't marked a user speech session yet, start one on first chunk
      if (!userSpeechActiveRef.current) {
        userSpeechActiveRef.current = true;
        userTurnQueuedRef.current = false;
        setIsUserSpeaking(true);
        setIsListening(true);
        setConversationState('user_speaking');
        // Reset any previous buffered user audio for a clean turn
        currentUserAudioRef.current = [];
      }
      // Create audio buffer from Twilio's μ-law format
      const audioBuffer = await createAudioBuffer(base64Audio);
      currentUserAudioRef.current.push(audioBuffer);
      console.log(`📥 Collected Twilio μ-law user audio chunk (total: ${currentUserAudioRef.current.length})`);
    } catch (error) {
      console.error("❌ Error processing Twilio user audio chunk:", error);
    }
  }, [userAudioEnabled, createAudioBuffer]);

  // Handle agent audio chunks - collect them for the current response
  // This processes OpenAI's already processed/converted audio format
  const handleAgentAudioChunk = useCallback(async (base64Audio) => {
    if (!agentAudioEnabled) return;
    
    try {
      // Start a streaming agent turn on first chunk
      if (!agentTurnActiveRef.current) {
        // Reset any previous agent buffer and start streaming turn
        currentAgentAudioRef.current = [];
        ensureAgentStreamingTurn();
      }
      // Create audio buffer from OpenAI's processed audio
      const audioBuffer = await createAgentAudioBuffer(base64Audio);
      currentAgentAudioRef.current.push(audioBuffer);
      console.log(`📥 Collected OpenAI processed agent audio chunk (total: ${currentAgentAudioRef.current.length})`);
    } catch (error) {
      console.error("❌ Error processing OpenAI agent audio chunk:", error);
    }
  }, [agentAudioEnabled, createAgentAudioBuffer, ensureAgentStreamingTurn]);

  // Handle when user stops speaking - create user turn
  const handleUserSpeechStopped = useCallback(() => {
    if (currentUserAudioRef.current.length > 0) {
      console.log(`🎤 User stopped speaking, creating turn with ${currentUserAudioRef.current.length} audio chunks`);
      addConversationTurn('user_turn', [...currentUserAudioRef.current]);
      currentUserAudioRef.current = []; // Clear for next user turn
    }
    setIsUserSpeaking(false);
    setIsListening(false);
  }, [addConversationTurn]);

  // Ensure we only finalize a user speech session once
  const finalizeUserSpeechOnce = useCallback(() => {
    if (!userSpeechActiveRef.current) return;
    if (userTurnQueuedRef.current) return;
    userTurnQueuedRef.current = true;
    handleUserSpeechStopped();
    userSpeechActiveRef.current = false;
  }, [handleUserSpeechStopped]);

  // Handle when agent completes response - create agent turn
  const handleAgentResponseComplete = useCallback(() => {
    if (agentTurnActiveRef.current) {
      // We already started a streaming turn; just mark it non-streaming and let it finish playback
      console.log('🤖 Agent response complete (streaming turn already active).');
      agentTurnActiveRef.current = false; // next agent response will create a fresh turn
      return;
    }
    // Fallback: if for some reason we didn't stream, create a single turn now
    if (currentAgentAudioRef.current.length > 0) {
      console.log(`🤖 Agent response complete, creating turn with ${currentAgentAudioRef.current.length} audio chunks`);
      addConversationTurn('agent_turn', [...currentAgentAudioRef.current]);
      currentAgentAudioRef.current = [];
    }
  }, [addConversationTurn]);

  // Process turns when the queue changes and handle turn completion
  useEffect(() => {
    if (audioTurnQueue.length > 0 && !isProcessingTurnRef.current) {
      processNextConversationTurn();
    }
  }, [audioTurnQueue, processNextConversationTurn]);

  // Add effect to handle turn completion and continue processing
  useEffect(() => {
    const handleTurnCompletion = () => {
      if (audioTurnQueue.length > 0 && !isProcessingTurnRef.current) {
        setTimeout(() => {
          processNextConversationTurn();
        }, 100);
      }
    };

    // Only trigger if we're not currently processing and have turns in queue
    if (audioTurnQueue.length > 0 && !isProcessingTurnRef.current) {
      handleTurnCompletion();
    }
  }, [audioTurnQueue.length, processNextConversationTurn]);

  // Handle WebSocket messages from backend
  const handleWebSocketMessage = useCallback(async (data) => {
    console.log("📨 WebSocket message:", data);
    
    switch (data.type) {
      case "user_audio_delta":
        // Handle Twilio raw μ-law user audio (base64 encoded)
        console.log("🎤 Processing Twilio raw μ-law user audio");
        await handleUserAudioChunk(data.audio);
        break;

      case "response.audio.chunk":
        // Handle OpenAI processed agent audio (already converted to suitable format)
        console.log("🤖 Processing OpenAI processed agent audio");
        await handleAgentAudioChunk(data.audio_chunk_base64);
        break;

      case "audio_delta":
        // Handle legacy audio delta format (for backward compatibility)
        console.log("🔄 Processing legacy audio delta format");
        await handleAgentAudioChunk(data.audio);
        break;

      case "user_transcript_final":
        // Handle final user transcription from backend
        if (data.transcript) {
          const trimmedTranscript = data.transcript.trim();
          if (trimmedTranscript) {
            setMessages((prev) => [
              ...prev,
              {
                type: "user",
                text: trimmedTranscript,
                timestamp: new Date(),
                item_id: data.item_id
              },
            ]);
            console.log("📝 User transcript added:", trimmedTranscript);
            // Finalize and queue the user's audio turn if not already done
            finalizeUserSpeechOnce();
            // If an assistant final was held while user was finalizing, render it now
            if (assistantFinalPendingRef.current && assistantFinalPendingRef.current.finalText) {
              const pending = assistantFinalPendingRef.current.finalText;
              setMessages((prev) => [
                ...prev,
                { id: Date.now() + Math.random(), type: "bot", text: pending, timestamp: new Date(), isStreaming: false },
              ]);
              assistantFinalPendingRef.current = null;
              setCurrentAssistantTranscript("");
              setIsAssistantTranscribing(false);
              // Ensure agent audio/turn logic runs
              handleAgentResponseComplete();
            }
          }
        }
        break;

      case "assistant_transcript_chunk":
        // Buffer streaming assistant transcription chunks. Do NOT render
        // intermediate assistant chunks as messages so that assistant text
        // doesn't appear before the user's final transcript.
        if (data.chunk) {
          const trimmedChunk = data.chunk.trim();
          if (trimmedChunk) {
            assistantTranscriptBufferRef.current = (assistantTranscriptBufferRef.current ? assistantTranscriptBufferRef.current + ' ' : '') + trimmedChunk;
            setIsAssistantTranscribing(true);
            setCurrentAssistantTranscript(assistantTranscriptBufferRef.current);
            console.log("📝 Buffered assistant chunk:", trimmedChunk);
          }
        }
        break;

      case "assistant_transcript_final":
      case "assistant_transcript_done": {
        // Combine any buffered chunks with provided final text and render once
        // the user's final transcript (and audio turn queuing) has been applied.
        const providedFinal = (data.transcript ?? "").trim();
        const buffered = (assistantTranscriptBufferRef.current || "").trim();
        const finalText = (providedFinal || buffered).trim();

        const insertAssistantFinal = () => {
          if (!finalText) {
            assistantTranscriptBufferRef.current = "";
            setCurrentAssistantTranscript("");
            setIsAssistantTranscribing(false);
            assistantFinalPendingRef.current = null;
            return;
          }

          setMessages((prev) => [
            ...prev,
            { id: Date.now() + Math.random(), type: "bot", text: finalText, timestamp: new Date(), isStreaming: false },
          ]);
          console.log("📝 Assistant final transcript inserted:", finalText);

          assistantTranscriptBufferRef.current = "";
          setCurrentAssistantTranscript("");
          setIsAssistantTranscribing(false);
          assistantFinalPendingRef.current = null;

          // Let audio/turn logic know response is complete
          handleAgentResponseComplete();
        };

        // If the user is still in an active speech session and hasn't been
        // queued/finalized yet, defer assistant final until user is flushed.
        if (userSpeechActiveRef.current && !userTurnQueuedRef.current) {
          console.log("⏳ Assistant final received but waiting for user final before rendering");
          assistantFinalPendingRef.current = { finalText };

          let attempts = 0;
          const maxAttempts = 10;
          const retry = () => {
            attempts++;
            if (!userSpeechActiveRef.current || userTurnQueuedRef.current) {
              insertAssistantFinal();
              return;
            }
            if (attempts >= maxAttempts) {
              console.warn('Assistant final deferred too long, inserting anyway');
              insertAssistantFinal();
              return;
            }
            setTimeout(retry, 250);
          };
          setTimeout(retry, 250);
        } else {
          insertAssistantFinal();
        }

        break;
      }

      // Legacy support for old message types
      case "conversation.item.input_audio_transcription.final":
        if (data.transcript) {
          const trimmedTranscript = data.transcript.trim();
          if (trimmedTranscript) {
            setMessages((prev) => [
              ...prev,
              {
                type: "user",
                text: trimmedTranscript,
                timestamp: new Date(),
              },
            ]);
            console.log("📝 [Legacy] User transcript added:", trimmedTranscript);
          }
        }
        break;

      case "response.audio_transcript.final":
        if (data.transcript) {
          const trimmedTranscript = data.transcript.trim();
          if (trimmedTranscript) {
            setMessages((prev) => [
              ...prev,
              {
                type: "bot",
                text: trimmedTranscript,
                timestamp: new Date(),
              },
            ]);
            console.log("📝 [Legacy] Assistant transcript added:", trimmedTranscript);
          }
        }
        handleAgentResponseComplete();
        break;

      case "speech.started":
      case "speech_started":
        console.log("🎤 Speech started:", data.speaker);
        if (data.speaker === "user") {
          setIsUserSpeaking(true);
          setIsListening(true);
          setConversationState('user_speaking');
          // Clear any previous user audio for new speech
          currentUserAudioRef.current = [];
          userSpeechActiveRef.current = true;
          userTurnQueuedRef.current = false;
        }
        break;

      case "speech.stopped":
      case "speech_stopped":
        console.log("🛑 Speech stopped:", data.speaker);
        if (data.speaker === "user") {
          finalizeUserSpeechOnce();
        }
        break;

      case "user_audio_mark":
        console.log("📍 User audio mark:", data.seq);
        break;

      case "user_audio_done":
        console.log("✅ User audio stream ended, last seq:", data.last_seq);
        // Ensure user turn is created if not already done
        finalizeUserSpeechOnce();
        break;

      case "auth_success":
        console.log("✅ WebSocket authenticated");
        break;

      case "call_status":
        console.log("📞 Call status:", data.status);
        if (data.status === "ending" || data.status === "ended" || data.status === "completed") {
          setCallActive(false);
        }
        break;

      case "heartbeat":
        console.log("💓 Heartbeat received");
        break;

      case "tool.call.result":
        console.log("🔧 Tool called:", data.tool, data.result);
        // setMessages((prev) => [
        //   ...prev,
        //   {
        //     type: "system",
        //     text: `Tool executed: ${data.tool}`,
        //     timestamp: new Date(),
        //   },
        // ]);
        break;

      default:
        console.log("Unknown message type", data);
    }
  }, [handleUserAudioChunk, handleAgentAudioChunk, handleAgentResponseComplete, finalizeUserSpeechOnce]);

  // Keep latest handlers in refs (prevents ws effect re-runs)
  useEffect(() => {
    messageHandlerRef.current = handleWebSocketMessage;
  }, [handleWebSocketMessage]);

  useEffect(() => {
    initAudioContextRef.current = initAudioContext;
  }, [initAudioContext]);

  // WebSocket connection
  useEffect(() => {
    if (callId && callActive) {
      // Avoid duplicate connections (React StrictMode or rapid re-renders)
      if (
        wsCreatingRef.current ||
        (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) ||
        wsConnectedRef.current
      ) {
        console.log("🔁 WebSocket already connected/connecting, skipping new connection");
        return;
      }
      wsCreatingRef.current = true;
      const ws = new WebSocket(
        // `wss://nklzswxp-9000.asse.devtunnels.ms/api/calls/frontend-stream/${callId}`
        `${BASE_WS_URL}/api/calls/frontend-stream/${callId}`
      );
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
        wsConnectedRef.current = true;
        wsCreatingRef.current = false;
        // Try to wake audio immediately
        initAudioContextRef.current?.().catch(() => {
          // will prompt for user interaction
        });
      };

      ws.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        const handler = messageHandlerRef.current;
        if (handler) {
          await handler(data);
        }
      };

      ws.onclose = (event) => {
        console.log("🔌 WebSocket disconnected", { code: event?.code, reason: event?.reason, callId });
        wsConnectedRef.current = false;
        wsCreatingRef.current = false;
        // Allow future effects to create a new socket
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
      };

      ws.onerror = (error) => {
        console.error("❌ WebSocket error:", { error, callId });
        wsCreatingRef.current = false;
      };

      // Send periodic pings
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000);

      return () => {
        clearInterval(pingInterval);
        if (currentlyPlayingSourceRef.current) {
          try {
            currentlyPlayingSourceRef.current.stop();
          } catch (e) {
            // Source might already be stopped
          }
        }
        // In StrictMode, effects run twice; ensure we close CONNECTING/OPEN sockets to avoid stale guards
        if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
          try { ws.close(); } catch (_) {}
        }
        wsConnectedRef.current = false;
        wsCreatingRef.current = false;
        if (wsRef.current === ws) {
          wsRef.current = null;
        }
      };
    }
  }, [callId, callActive, BASE_WS_URL]);

  const saveMessagesToDatabase = async (messages, callId) => {
    try {
      const response = await apiFetch("/api/save-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages, callId }),
      });

      if (!response.ok) {
        throw new Error("Failed to save messages");
      }

      console.log("✅ Messages saved successfully");
    } catch (error) {
      console.error("❌ Error saving messages:", error);
    }
  };

  const endCall = () => {
    setCallActive(false);
    saveMessagesToDatabase(messages, callId);
    if (currentlyPlayingSourceRef.current) {
      try {
        currentlyPlayingSourceRef.current.stop();
      } catch (e) {
        // Source might already be stopped
      }
    }
    if (wsRef.current) {
      wsRef.current.close();
    }
    window.location.href = "/dashboard";
  };

  const toggleUserAudio = () => {
    const newState = !userAudioEnabled;
    setUserAudioEnabled(newState);
    
    if (!newState) {
      // If disabling, stop any currently playing audio
      if (currentlyPlayingSourceRef.current && conversationState === 'user_audio_playing') {
        try {
          currentlyPlayingSourceRef.current.stop();
        } catch (e) {
          // Source might already be stopped
        }
        finishCurrentTurn();
      }
    }
  };

  const toggleAgentAudio = () => {
    const newState = !agentAudioEnabled;
    setAgentAudioEnabled(newState);
    
    if (!newState) {
      // If disabling, stop any currently playing audio
      if (currentlyPlayingSourceRef.current && conversationState === 'agent_audio_playing') {
        try {
          currentlyPlayingSourceRef.current.stop();
        } catch (e) {
          // Source might already be stopped
        }
        finishCurrentTurn();
      }
    }
  };

  // Get conversation state display with audio format information
  const getConversationStateDisplay = () => {
    switch (conversationState) {
      case 'user_speaking':
        return { 
          text: "🎤 User Speaking... (Twilio μ-law)", 
          color: "text-green-600",
          subtitle: "Raw audio from phone call" 
        };
      case 'user_audio_playing':
        return { 
          text: "🔊 Playing User Audio (Twilio Raw)", 
          color: "text-blue-600",
          subtitle: "8kHz μ-law decoded audio"
        };
      case 'agent_audio_playing':
        return { 
          text: "🤖 Playing Agent Audio (OpenAI Processed)", 
          color: "text-purple-600",
          subtitle: "TTS processed audio"
        };
      default:
        return isListening ? 
          { text: "👂 Listening...", color: "text-blue-600", subtitle: "Waiting for Twilio audio" } : 
          { text: "Ready", color: "text-gray-600", subtitle: "" };
    }
  };

  const stateDisplay = getConversationStateDisplay();

  // Consistent 12-hour time with seconds and AM/PM
  const formatTime = (ts) => {
    const d = ts instanceof Date ? ts : new Date(ts);
    return d.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="h-screen flex text-white bg-gradient-to-br from-yellow-100 to-white font-sans w-full">
      {/* Left Section: Call Status */}
      <div className="w-[60%] flex flex-col justify-between items-center py-8 px-4 relative">
        <div className="flex flex-col items-center">
          <div className="w-40 h-40 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center relative">
            <div className="text-gray-500 text-4xl">👤</div>
            {/* Visual indicator for conversation state */}
            {(conversationState === 'user_speaking' || conversationState === 'user_audio_playing') && (
              <div className="absolute inset-0 rounded-full border-4 border-green-400 animate-pulse"></div>
            )}
            {conversationState === 'agent_audio_playing' && (
              <div className="absolute inset-0 rounded-full border-4 border-purple-400 animate-pulse"></div>
            )}
          </div>
          
          <div className="text-lg text-black mt-4">
            {callActive ? "Call Active" : "Call Ended"}
          </div>
          <div className="text-sm text-gray-600 mt-2">Cell No: {callId}</div>

          {/* Enhanced conversation state display with audio format info */}
          <div className="mt-6 text-center">
            <div className={`text-lg font-medium ${stateDisplay.color}`}>
              {stateDisplay.text}
            </div>
            {stateDisplay.subtitle && (
              <div className="text-xs text-gray-500 mt-1">
                {stateDisplay.subtitle}
              </div>
            )}
            {conversationState !== 'idle' && (
              <div className={`mt-3 ${stateDisplay.color} animate-pulse`}>
                • • • • • • • •
              </div>
            )}
          </div>

          {/* Audio Format Information Panel */}
          {/* <div className="mt-4 p-3 bg-gray-50 rounded-lg text-xs text-gray-700">
            <div className="font-semibold mb-2">Audio Processing Info:</div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span>🎤 User Voice:</span>
                <span className="text-green-600">Twilio Raw μ-law (8kHz)</span>
              </div>
              <div className="flex justify-between">
                <span>🤖 Agent Voice:</span>
                <span className="text-purple-600">OpenAI TTS Processed</span>
              </div>
            </div>
          </div> */}

          {/* Queue status */}
          {audioTurnQueue.length > 0 && (
            <div className="mt-4 text-center text-sm text-gray-600">
              Queue: {audioTurnQueue.length} turn{audioTurnQueue.length !== 1 ? 's' : ''}
            </div>
          )}

          {/* Audio status indicators with processing stats */}
          {/* <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <div
                className={`flex items-center gap-2 ${
                  userAudioEnabled ? "text-green-600" : "text-red-600"
                }`}
              >
                <span>User Audio:</span>
                <span>{userAudioEnabled ? "🔊" : "🔇"}</span>
              </div>
              <div className="text-xs text-gray-500">
                Chunks: {currentUserAudioRef.current.length}
              </div>
            </div>
            <div className="flex justify-between items-center">
              <div
                className={`flex items-center gap-2 ${
                  agentAudioEnabled ? "text-green-600" : "text-red-600"
                }`}
              >
                <span>Agent Audio:</span>
                <span>{agentAudioEnabled ? "🔊" : "🔇"}</span>
              </div>
              <div className="text-xs text-gray-500">
                Chunks: {currentAgentAudioRef.current.length}
              </div>
            </div>
          </div> */}
        </div>

        <div className="flex justify-center gap-6 w-full px-6 mt-auto mb-8">
          {/* Toggle user audio button */}
           <button
            className={`p-4 rounded-full shadow-lg ${
              userAudioEnabled
                ? "bg-green-500 hover:bg-green-600"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
            onClick={toggleUserAudio}
            title={`${
              userAudioEnabled ? "Disable" : "Enable"
            } user audio playback`}
          >
            {userAudioEnabled ? (
              <Mic size={24} color="#fff" />
            ) : (
              <MicOff size={24} color="#fff" />
            )}
          </button>
          {/* End call button */}
          <button
            className="bg-red-500 hover:bg-red-600 p-4 rounded-full shadow-lg"
            onClick={endCall}
          >
            <PhoneOff size={24} color="#fff" />
          </button>

          {/* Toggle agent audio button */}
          <button
            className={`p-4 rounded-full shadow-lg ${
              agentAudioEnabled
                ? "bg-blue-500 hover:bg-blue-600"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
            onClick={toggleAgentAudio}
            title={`${
              agentAudioEnabled ? "Disable" : "Enable"
            } agent audio playback`}
          >
            <Volume2 size={24} color="#fff" />
          </button>
        </div>
      </div>

      {/* Right Section: Live Conversation */}
      <div className="w-[40%] bg-white text-gray-800 p-8 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Live Conversation
        </h2>
        <h3 className="text-sm text-gray-500 mb-4 text-center">
          Welcome to {businessName || "Your Company"} <br /> AI Call Assistant
        </h3>
        <div className="space-y-4 max-h-[calc(100vh-120px)] overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-end space-x-2 ${
                msg.type === "bot"
                  ? "justify-start"
                  : msg.type === "user"
                  ? "justify-end"
                  : "justify-center"
              }`}
            >
              {msg.type === "bot" && (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                  <span className="text-blue-600 text-xs">AI</span>
                </div>
              )}
              <div
                className={`relative px-4 py-2 rounded-2xl max-w-xs text-sm shadow ${
                  msg.type === "bot"
                    ? "bg-gray-100 text-left rounded-bl-none"
                    : msg.type === "user"
                    ? "bg-blue-500 text-white text-right rounded-br-none"
                    : "bg-yellow-100 text-center rounded-lg"
                }`}
              >
                {msg.text}
                {/* Show animated cursor for streaming messages */}
                {msg.isStreaming && (
                  <span className="inline-block animate-pulse ml-1">▌</span>
                )}
                <div className="text-xs opacity-50 mt-1">
                  {msg.isStreaming ? "Transcribing..." : formatTime(msg.timestamp)}
                </div>
              </div>
              {msg.type === "user" && (
                <div className="w-8 h-8 rounded-full bg-green-100 flex-shrink-0 flex items-center justify-center">
                  <span className="text-green-600 text-xs">U</span>
                </div>
              )}
            </div>
          ))}
          {/* Scroll anchor for auto-scrolling to bottom */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
}