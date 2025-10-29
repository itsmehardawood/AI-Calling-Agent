// Utility helpers for trimming and gating
const clamp = (x, min, max) => Math.min(max, Math.max(min, x));

const createAudioBufferFromFloat32 = (samples, sampleRate) => {
  const length = samples.length;
  const buffer = new AudioBuffer({ length, numberOfChannels: 1, sampleRate });
  buffer.copyToChannel(samples, 0, 0);
  return buffer;
};

const trimSilence = (buffer, threshold = 0.004, paddingMs = 25) => {
  const sr = buffer.sampleRate;
  const pad = Math.floor((paddingMs / 1000) * sr);
  const data = buffer.getChannelData(0);
  const n = data.length;
  let start = 0;
  let end = n - 1;

  while (start < n && Math.abs(data[start]) < threshold) start++;
  while (end > start && Math.abs(data[end]) < threshold) end--;

  start = clamp(start - pad, 0, n - 1);
  end = clamp(end + pad, 0, n - 1);

  const newLen = Math.max(0, end - start + 1);
  if (newLen < 128) {
    // Too small, return original to avoid artifacts
    return buffer;
  }
  const out = new Float32Array(newLen);
  out.set(data.subarray(start, end + 1));
  return createAudioBufferFromFloat32(out, sr);
};

const noiseGate = (buffer, threshold = 0.004) => {
  const sr = buffer.sampleRate;
  const data = buffer.getChannelData(0);
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    const v = data[i];
    out[i] = Math.abs(v) < threshold ? 0 : v;
  }
  return createAudioBufferFromFloat32(out, sr);
};

// Utility: Process user audio buffer for clarity and loudness
export const processUserAudioBuffer = async (
  audioBuffer,
  options = {
    upsampleRate: 16000,
    silenceThreshold: 0.004,
    silencePaddingMs: 20,
    highpassFrequency: 110,
    presenceFrequency: 2500,
    presenceGain: 4.0,
    compressorSettings: {
      threshold: -24,
      knee: 18,
      ratio: 2.5,
      attack: 0.006,
      release: 0.22,
    },
    outputGain: 1.8,
    minDurationSec: 0.05,
  }
) => {
  let workBuffer = audioBuffer;

  // 1) Upsample if needed
  if (workBuffer.sampleRate < options.upsampleRate) {
    const upsampledLength = Math.round(
      (workBuffer.length * options.upsampleRate) / workBuffer.sampleRate
    );
    const upsampleCtx = new OfflineAudioContext(1, upsampledLength, options.upsampleRate);
    const upsampleSource = upsampleCtx.createBufferSource();
    upsampleSource.buffer = workBuffer;
    upsampleSource.connect(upsampleCtx.destination);
    upsampleSource.start();
    workBuffer = await upsampleCtx.startRendering();
  }

  // 2) Trim silence and apply noise gate
  workBuffer = trimSilence(workBuffer, options.silenceThreshold, options.silencePaddingMs);
  workBuffer = noiseGate(workBuffer, options.silenceThreshold);

  // 3) Audio processing chain
  const offlineCtx = new OfflineAudioContext(1, workBuffer.length, workBuffer.sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = workBuffer;

  const highpass = offlineCtx.createBiquadFilter();
  highpass.type = "highpass";
  highpass.frequency.value = options.highpassFrequency;

  const presence = offlineCtx.createBiquadFilter();
  presence.type = "peaking";
  presence.frequency.value = options.presenceFrequency;
  presence.Q.value = 1.0;
  presence.gain.value = options.presenceGain;

  const compressor = offlineCtx.createDynamicsCompressor();
  compressor.threshold.value = options.compressorSettings.threshold;
  compressor.knee.value = options.compressorSettings.knee;
  compressor.ratio.value = options.compressorSettings.ratio;
  compressor.attack.value = options.compressorSettings.attack;
  compressor.release.value = options.compressorSettings.release;

  const gainNode = offlineCtx.createGain();
  gainNode.gain.value = options.outputGain;

  source.connect(highpass);
  highpass.connect(presence);
  presence.connect(compressor);
  compressor.connect(gainNode);
  gainNode.connect(offlineCtx.destination);

  source.start();
  const processed = await offlineCtx.startRendering();

  // 4) Final trim
  const finalBuffer = trimSilence(processed, options.silenceThreshold, options.silencePaddingMs);
  if (finalBuffer.duration < options.minDurationSec) {
    return processed;
  }
  return finalBuffer;
};