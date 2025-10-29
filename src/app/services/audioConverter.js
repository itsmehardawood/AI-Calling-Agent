// src/services/audioConverter.js
/**
 * Audio Converter Service for OpenAI Real-time Audio
 * Converts base64 audio chunks to playable WAV format
 */

class AudioConverter {
  constructor() {
    this.sampleRate = 24000; // OpenAI real-time audio sample rate
    this.channels = 1; // Mono
    this.bitDepth = 16; // 16-bit PCM
  }

  /**
   * Convert base64 audio chunk to WAV ArrayBuffer
   * @param {string} base64Audio - Base64 encoded audio chunk
   * @returns {ArrayBuffer} - WAV format audio buffer
   */
  base64ToWav(base64Audio) {
    try {
      // Decode base64 to binary data
      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert raw audio data to PCM 16-bit
      const pcmData = this.convertToPCM16(bytes);
      
      // Create WAV file with proper headers
      const wavBuffer = this.createWavFile(pcmData);
      
      return wavBuffer;
    } catch (error) {
      console.error('Error converting base64 to WAV:', error);
      throw new Error(`Audio conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert raw audio bytes to PCM 16-bit format
   * @param {Uint8Array} rawData - Raw audio data
   * @returns {Int16Array} - PCM 16-bit data
   */
  convertToPCM16(rawData) {
    // If data is already in the right format, convert to Int16Array
    if (rawData.length % 2 === 0) {
      // Assume it's already 16-bit PCM
      const pcmData = new Int16Array(rawData.length / 2);
      const dataView = new DataView(rawData.buffer);
      
      for (let i = 0; i < pcmData.length; i++) {
        pcmData[i] = dataView.getInt16(i * 2, true); // little-endian
      }
      
      return pcmData;
    } else {
      // Convert 8-bit to 16-bit
      const pcmData = new Int16Array(rawData.length);
      for (let i = 0; i < rawData.length; i++) {
        // Convert unsigned 8-bit to signed 16-bit
        pcmData[i] = (rawData[i] - 128) * 256;
      }
      return pcmData;
    }
  }

  /**
   * Create WAV file with proper headers
   * @param {Int16Array} pcmData - PCM audio data
   * @returns {ArrayBuffer} - Complete WAV file buffer
   */
  createWavFile(pcmData) {
    const dataLength = pcmData.length * 2; // 2 bytes per sample
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);

    // WAV file header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true); // File size - 8
    writeString(8, 'WAVE');

    // Format chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // Format chunk size
    view.setUint16(20, 1, true); // Audio format (PCM)
    view.setUint16(22, this.channels, true); // Number of channels
    view.setUint32(24, this.sampleRate, true); // Sample rate
    view.setUint32(28, this.sampleRate * this.channels * 2, true); // Byte rate
    view.setUint16(32, this.channels * 2, true); // Block align
    view.setUint16(34, this.bitDepth, true); // Bits per sample

    // Data chunk
    writeString(36, 'data');
    view.setUint32(40, dataLength, true); // Data size

    // Write PCM data
    const pcmView = new Int16Array(buffer, 44);
    pcmView.set(pcmData);

    return buffer;
  }

  /**
   * Convert WAV ArrayBuffer to AudioBuffer for Web Audio API
   * @param {AudioContext} audioContext - Web Audio API context
   * @param {ArrayBuffer} wavBuffer - WAV format audio buffer
   * @returns {Promise<AudioBuffer>} - Web Audio API AudioBuffer
   */
  async wavToAudioBuffer(audioContext, wavBuffer) {
    try {
      return await audioContext.decodeAudioData(wavBuffer);
    } catch (error) {
      console.error('Error decoding WAV to AudioBuffer:', error);
      throw new Error(`WAV decoding failed: ${error.message}`);
    }
  }

  /**
   * Main conversion function: base64 -> WAV -> AudioBuffer
   * @param {AudioContext} audioContext - Web Audio API context
   * @param {string} base64Audio - Base64 encoded audio chunk
   * @returns {Promise<AudioBuffer>} - Ready-to-play AudioBuffer
   */
  async convertToAudioBuffer(audioContext, base64Audio) {
    try {
      // Step 1: Convert base64 to WAV
      const wavBuffer = this.base64ToWav(base64Audio);
      
      // Step 2: Convert WAV to AudioBuffer
      const audioBuffer = await this.wavToAudioBuffer(audioContext, wavBuffer);
      
      return audioBuffer;
    } catch (error) {
      console.error('Complete audio conversion failed:', error);
      throw error;
    }
  }

  /**
   * Alternative method: Convert to Blob URL for HTML5 audio
   * @param {string} base64Audio - Base64 encoded audio chunk
   * @returns {string} - Blob URL for audio playback
   */
  base64ToBlobUrl(base64Audio) {
    try {
      const wavBuffer = this.base64ToWav(base64Audio);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Error creating blob URL:', error);
      throw error;
    }
  }

  /**
   * Cleanup blob URLs to prevent memory leaks
   * @param {string} blobUrl - Blob URL to revoke
   */
  cleanupBlobUrl(blobUrl) {
    if (blobUrl && blobUrl.startsWith('blob:')) {
      URL.revokeObjectURL(blobUrl);
    }
  }
}

// Export singleton instance
export const audioConverter = new AudioConverter();

// Alternative simple converter for quick testing
export class SimpleAudioConverter {
  /**
   * Simple conversion using HTML5 Audio element
   * @param {string} base64Audio - Base64 encoded audio
   * @returns {Promise<void>} - Plays audio directly
   */
  async playBase64Audio(base64Audio, volume = 1.0) {
    try {
      // Create WAV blob
      const wavBuffer = audioConverter.base64ToWav(base64Audio);
      const blob = new Blob([wavBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);

      // Create and play audio element
      const audio = new Audio(audioUrl);
      audio.volume = volume;
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        
        audio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          reject(error);
        };
        
        audio.play().catch(reject);
      });
    } catch (error) {
      console.error('Simple audio playback failed:', error);
      throw error;
    }
  }
}

export const simpleAudioConverter = new SimpleAudioConverter();