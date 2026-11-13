/** Super-light speech packs → faster text registration. Backend interpret unchanged. */
export const LIGHT_AUDIO_BITS_PER_SECOND = 8_000;
export const LIGHT_AUDIO_MAX_MS = 5_500;
export const LIGHT_AUDIO_MIN_MS = 100;
export const LIGHT_AUDIO_MIME_CANDIDATES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/ogg;codecs=opus',
  'audio/mp4',
] as const;

export function pickLightAudioMime(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  for (const t of LIGHT_AUDIO_MIME_CANDIDATES) {
    try { if (MediaRecorder.isTypeSupported(t)) return t; } catch { /* */ }
  }
  return '';
}

export function lightRecorderOptions(): MediaRecorderOptions {
  const mimeType = pickLightAudioMime();
  const opts: MediaRecorderOptions = { audioBitsPerSecond: LIGHT_AUDIO_BITS_PER_SECOND };
  if (mimeType) opts.mimeType = mimeType;
  return opts;
}

export function lightMicConstraints(enhanced = true): MediaTrackConstraints {
  return {
    channelCount: 1,
    sampleRate: { ideal: 16000 },
    echoCancellation: enhanced,
    noiseSuppression: enhanced,
    autoGainControl: enhanced,
  };
}

export function isLightPackWorthSending(blob: Blob, durationMs: number): boolean {
  if (durationMs < LIGHT_AUDIO_MIN_MS) return false;
  if (blob.size > 80_000) return false;
  return blob.size > 48;
}
