// Pure, browser-safe helpers for the shared-link answer-call screen.
const SHARED_PREFIXES = ['#meeting-', '#talk-', '#my-code-', '#trial-', '#travel-pass', '#free-pass', '#demo-audio='];

/** True when the page was opened from a shared QR code, link or text. */
export function isSharedCallLink(hash: string): boolean {
  return SHARED_PREFIXES.some(prefix => hash.startsWith(prefix));
}

/** Microphone settings; Audio Enhancements turns on the browser's noise filters. */
export function callAudioConstraints(enhanced: boolean): MediaTrackConstraints {
  return { noiseSuppression: enhanced, echoCancellation: enhanced, autoGainControl: enhanced };
}

export type AudioRoute = 'speaker' | 'headset';
