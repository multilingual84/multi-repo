// Free HD neural voice (Kokoro-82M) running fully inside the browser via WASM/ONNX.
// The open-source model weights download once from the model CDN on first use and
// stay cached in the browser; synthesis then runs on the user's own device chip.
// No server cost, no metering, no account. Audio is generated in device RAM, played,
// and released; nothing is sent or saved. Languages without a neural voice fall
// back to the device voice, so the all-languages promise is untouched.

import { selectedProfessionalVoice, type VoiceTone } from './voice-changer';
import { applyPreferredSink } from './audio-output';

import { noteBufferingStart, noteBufferingEnd } from '../buffering-veil';

// Installed kokoro-js validates English speaker IDs only.
const HD_VOICES: Record<string, string> = {
  en: 'af_heart',
};

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';

export function hdVoiceSupported(lang: string): boolean {
  const base = lang.toLowerCase().replace('_', '-').split('-')[0] ?? '';
  return base in HD_VOICES;
}

type KokoroTts = { generate: (text: string, options: { voice: string; speed: number }) => Promise<{ audio: Float32Array; sampling_rate: number }> };

let enginePromise: Promise<KokoroTts> | null = null;
let player: HTMLAudioElement | null = null;
// One audio element unlocked by a direct tap, reused for every clip so phones
// allow playback that starts after the voice finishes generating.
let unlocked: HTMLAudioElement | null = null;
const SILENT = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=';

/** Call from a direct user gesture so later HD clips are allowed to play. */
export function primeHdVoice() {
  if (typeof window === 'undefined' || typeof Audio === 'undefined') return;
  try {
    if (!unlocked) { unlocked = new Audio(); applyPreferredSink(unlocked); }
    unlocked.src = SILENT;
    void unlocked.play().catch(() => {});
  } catch { /* ignore */ }
}
let playerUrl = '';
let speaking = false;
let generation = 0;
let settlePlayback: (() => void) | null = null;

// Gentle timbre filtering changes the sound without changing the chosen pace.
export function shapeVoiceTone(samples: Float32Array, tone: VoiceTone): Float32Array {
  if (tone === 'natural') return samples;
  const output = new Float32Array(samples.length);
  let low = 0;
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i] ?? 0;
    low += 0.18 * (sample - low);
    output[i] = Math.max(-1, Math.min(1, tone === 'warm' ? 0.55 * sample + 0.55 * low : sample + 0.5 * (sample - low)));
  }
  return output;
}

export function hdVoiceChoice(lang: string) {
  if (!hdVoiceSupported(lang)) return undefined;
  const selected = selectedProfessionalVoice();
  return { voice: selected?.voice ?? (lang.toLowerCase().startsWith('en-gb') ? 'bf_emma' : 'af_heart'), tone: selected?.tone ?? 'natural' };
}

/** True while HD speech is playing, so call microphones do not record it. */
export function isHdSpeaking(): boolean {
  return speaking;
}

function loadEngine(): Promise<KokoroTts> {
  if (!enginePromise) {
    enginePromise = import('./kokoro-browser').then(mod =>
      mod.loadKokoroBrowser(MODEL_ID),
    );
    enginePromise.catch(() => { enginePromise = null; });
  }
  return enginePromise;
}

/** Prepare on opening the chooser, not on page load or before user interaction. */
export async function prepareHdVoice(lang: string): Promise<boolean> {
  if (typeof window === 'undefined' || !hdVoiceSupported(lang)) return false;
  noteBufferingStart(true);
  try { await loadEngine(); return true; }
  catch { return false; }
  finally { noteBufferingEnd(); }
}

// Only fixed chooser samples are cached, never users' translated conversations.
const sampleCache = new Map<string, { audio: Float32Array; sampling_rate: number }>();

/** Encode PCM samples as a WAV blob so playback needs no external decoder. */
function wavBlob(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeText = (offset: number, text: string) => { for (let i = 0; i < text.length; i++) view.setUint8(offset + i, text.charCodeAt(i)); };
  writeText(0, 'RIFF');
  view.setUint32(4, 36 + samples.length * 2, true);
  writeText(8, 'WAVE');
  writeText(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeText(36, 'data');
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i] ?? 0));
    view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

/** Stop any HD speech in flight and release its buffer. */
export function stopHdVoice() {
  generation += 1;
  settlePlayback?.();
  settlePlayback = null;
  speaking = false;
  if (player) {
    try { player.pause(); } catch { /* ignore */ }
    if (player !== unlocked) player.src = '';
    player = null;
  }
  if (playerUrl) { URL.revokeObjectURL(playerUrl); playerUrl = ''; }
}

/**
 * Speak text with the HD neural voice. Resolves true when it played (or finished
 * after a stop), false when the language is unsupported or generation failed —
 * callers then fall back to the device voice. The selected speech pace is honored.
 */
export async function speakHd(text: string, lang: string, rate: number, options?: { cacheSample?: boolean }): Promise<boolean> {
  if (typeof window === 'undefined' || !hdVoiceSupported(lang)) return false;
  const choice = hdVoiceChoice(lang);
  if (!choice) return false;
  stopHdVoice();
  const request = generation;
  noteBufferingStart(true);
  let loading = true;
  const finishLoading = () => {
    if (!loading) return;
    loading = false;
    noteBufferingEnd();
  };
  try {
    const tts = await loadEngine();
    if (request !== generation) return true;
    const speed = Math.min(2, Math.max(0.5, Number.isFinite(rate) ? rate : 1));
    const key = JSON.stringify([text, choice.voice, speed]);
    let result = options?.cacheSample ? sampleCache.get(key) : undefined;
    if (!result) {
      result = await tts.generate(text, { voice: choice.voice, speed });
      if (options?.cacheSample && request === generation) {
        sampleCache.set(key, result);
        if (sampleCache.size > 8) {
          const oldest = sampleCache.keys().next().value;
          if (oldest !== undefined) sampleCache.delete(oldest);
        }
      }
    }
    if (request !== generation) return true;
    const url = URL.createObjectURL(wavBlob(shapeVoiceTone(result.audio, choice.tone), result.sampling_rate));
    finishLoading();
    playerUrl = url;
    const audio = unlocked ?? new Audio();
    applyPreferredSink(audio);

    audio.src = url;
    player = audio;
    speaking = true;
    // If the phone blocks or fails playback, report false so the device voice speaks instead.
    const played = await new Promise<boolean>(resolve => {
      settlePlayback = () => resolve(true);
      let started = false;
      audio.onplaying = () => { started = true; };
      audio.onended = () => resolve(true);
      audio.onerror = () => resolve(started);
      audio.play().catch(() => resolve(false));
    });
    audio.onplaying = audio.onended = audio.onerror = null;
    settlePlayback = null;
    if (player === audio) stopHdVoice();
    return played;
  } catch (error) {
    if (request !== generation) return true;
    console.warn('Local neural voice unavailable', error instanceof Error ? error.message : 'Synthesis failed');
    stopHdVoice();
    return false;
  } finally { finishLoading(); }
}

// Leaving or hiding the tab stops playback and releases the audio buffer.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', stopHdVoice);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') stopHdVoice(); });
}
