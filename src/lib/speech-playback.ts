import { selectedProfessionalVoice, voiceChangerRateScale, voiceChangerScale } from '@/lib/audio/voice-changer';
import { hdVoiceSupported, speakHd, primeHdVoice } from '@/lib/audio/hd-voice';

// The former fastest setting is now the default at the slider midpoint.
export const SPEECH_RATE = 0.8;
// Quick choices beside the slider: slow, normal (midpoint) and fast.
export const PACE_PRESETS = { slow: 0.6, normal: 0.8, fast: 1.1 } as const;
export const SLOW_SPEECH_PACES = [0.15,0.2,0.25,0.3,0.35,0.4,0.45,0.5,0.55,0.6] as const;
// Keep slower settings and add a faster range above the former maximum.
export function speechRateAtPosition(position:number){const p=Math.max(0,Math.min(100,position));return Number((p<=50?0.3+p*0.01:0.8+(p-50)*0.016).toFixed(3));}
export function speechPositionAtRate(rate:number){return Number(Math.max(0,Math.min(100,rate<=0.8?(rate-0.3)/0.01:50+(rate-0.8)/0.016)).toFixed(3));}

// Prefer the most natural-sounding installed voice (neural/online/premium) for a language.
// Phones ship two tiers of voices: compressed legacy ones and enhanced/neural ones.
// The browser often picks the legacy tier first, so we score and lock onto the good tier.
export function pickNaturalVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | undefined {
  const l = lang.toLowerCase(), base = l.split('-')[0];
  const match = voices.filter(v => v.lang.toLowerCase().replace('_','-') === l);
  const pool = match.length ? match : voices.filter(v => v.lang.toLowerCase().split(/[-_]/)[0] === base);
  const score = (v: SpeechSynthesisVoice) => {
    const n = v.name.toLowerCase(); let s = 0;
    if (/natural|neural|online|wavenet|\bhd\b/.test(n)) s += 6;
    if (/premium|enhanced|siri/.test(n)) s += 5;
    if (/google/.test(n)) s += 4;
    if (/samantha|ava|zoe|allison|aria|jenny|guy|susan|karen|daniel|tessa|moira|rishi/.test(n)) s += 2;
    if (v.default) s += 1;
    if (/compact|espeak|robot/.test(n)) s -= 5;
    return s;
  };
  return [...pool].sort((a, b) => score(b) - score(a))[0];
}

// Device-local voice tuning set from the Personal Translator controls.
// Settings are saved per language, with a shared fallback for languages not tuned yet.
const RATE_KEY = 'ml-speech-rate';
const VOICE_KEY = 'ml-speech-voice';
const baseLang = (lang: string) => lang.toLowerCase().split('-')[0];
const rateKey = (lang?: string) => (lang ? `${RATE_KEY}:${baseLang(lang)}` : RATE_KEY);
const voiceKey = (lang?: string) => (lang ? `${VOICE_KEY}:${baseLang(lang)}` : VOICE_KEY);

export function getSpeechRate(lang?: string): number {
  if (typeof window === 'undefined') return SPEECH_RATE;
  const raw = (lang ? window.localStorage.getItem(rateKey(lang)) : null) ?? window.localStorage.getItem(RATE_KEY);
  const value = raw === null ? NaN : Number(raw);
  return Number.isFinite(value) ? Math.min(2, Math.max(0.15, value)) : SPEECH_RATE;
}

export function setSpeechRate(rate: number, lang?: string) {
  if (typeof window === 'undefined') return;
  const clamped = Math.min(2, Math.max(0.15, rate));
  window.localStorage.setItem(rateKey(lang), String(clamped));
}

// How long the translator waits in silence before it decides a sentence is
// finished and translates it. Shorter = quickest response; longer = a more
// natural pause that lets speakers finish their thought. Saved on this device.
const PAUSE_KEY = 'ml-response-pause';
export const RESPONSE_PAUSES = { quickest: 150, balanced: 200, natural: 450 } as const;
export type ResponsePause = keyof typeof RESPONSE_PAUSES;

export function getResponsePause(): ResponsePause {
  if (typeof window === 'undefined') return 'balanced';
  const raw = window.localStorage.getItem(PAUSE_KEY);
  return raw === 'quickest' || raw === 'natural' ? raw : 'balanced';
}

export function getResponsePauseMs(): number {
  return RESPONSE_PAUSES[getResponsePause()];
}

export function setResponsePause(pause: ResponsePause) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PAUSE_KEY, pause);
}

// voiceURI of the chosen voice, or null for the automatic per-language pick.
export function getVoicePreference(lang?: string): string | null {
  if (typeof window === 'undefined') return null;
  return (lang ? window.localStorage.getItem(voiceKey(lang)) : null) ?? window.localStorage.getItem(VOICE_KEY);
}

export function setVoicePreference(voiceURI: string | null, lang?: string) {
  if (typeof window === 'undefined') return;
  if (voiceURI) window.localStorage.setItem(voiceKey(lang), voiceURI);
  else window.localStorage.removeItem(voiceKey(lang));
}

// Phones expose their good voices only after the voice list loads; prime it early
// so the first spoken sentence can already use the enhanced voice.
let voicesWarmed = false;
export function warmVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const synth = window.speechSynthesis;
  try { synth.getVoices(); } catch { /* ignore */ }
  if (!voicesWarmed && typeof synth.addEventListener === 'function') {
    voicesWarmed = true;
    synth.addEventListener('voiceschanged', () => { try { synth.getVoices(); } catch { /* ignore */ } });
  }
}

// Voice lists load asynchronously on many phones; wait briefly so the first
// sentence does not fall back to the legacy robotic voice.
export function whenVoicesReady(timeoutMs = 1500): Promise<SpeechSynthesisVoice[]> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return Promise.resolve([]);
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();
  if (voices.length || typeof synth.addEventListener !== 'function') return Promise.resolve(voices);
  return new Promise(resolve => {
    const onChanged = () => { if (synth.getVoices().length) finish(); };
    const finish = () => { synth.removeEventListener('voiceschanged', onChanged); resolve(synth.getVoices()); };
    synth.addEventListener('voiceschanged', onChanged);
    setTimeout(finish, timeoutMs);
  });
}

// Browser-safe speech output. Enable from a direct tap, not after a network await.
export function enableSpeechPlayback() {
  primeHdVoice();
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  warmVoices();
  const synth = window.speechSynthesis;
  synth.resume();
  const utterance = new SpeechSynthesisUtterance(' ');
  utterance.volume = 0;
  synth.speak(utterance);
}

// Split into sentences so the engine pauses and inflects naturally at each
// boundary instead of reading one flat run. Falls back to the whole text.
export function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?。！？；;]+[.!?。！？；;]*\s*/g)?.map(s => s.trim()).filter(Boolean);
  return parts && parts.length > 1 ? parts : [text];
}

function speakWith(synth: SpeechSynthesis, text: string, lang: string, pitch: number, voices: SpeechSynthesisVoice[]): Promise<void> {
  return new Promise((resolve, reject) => {
    synth.cancel();
    synth.resume();
    const rate = Math.min(2, Math.max(0.1, getSpeechRate(lang) * voiceChangerRateScale()));
    // The free voice changer scales the pitch of the device voice (0.6–1.8 band).
    const clampedPitch = Number.isFinite(pitch) ? Math.min(1.8, Math.max(0.6, pitch * voiceChangerScale())) : 1;
    const preferred = getVoicePreference(lang);
    const voice = (preferred ? voices.find(v => v.voiceURI === preferred) : undefined) ?? pickNaturalVoice(voices, lang);
    const sentences = splitSentences(text);
    let finished = false;
    let started = false;
    let remaining = sentences.length;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      if (error) { synth.cancel(); reject(error); } else resolve();
    };
    timer = setTimeout(() => finish(new Error('Speech did not start')), 5000);
    for (const sentence of sentences) {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.lang = lang;
      utterance.rate = rate;
      // Engines may ignore pitch; leave voice/language selection and error handling intact.
      utterance.pitch = clampedPitch;
      if (voice) utterance.voice = voice;
      utterance.onstart = () => {
        if (started) return;
        started = true;
        clearTimeout(timer);
        timer = setTimeout(() => finish(new Error('Speech timed out')), Math.max(15000, text.length * 220));
      };
      utterance.onend = () => { remaining -= 1; if (remaining <= 0) finish(); };
      utterance.onerror = event => finish(new Error(`Speech playback: ${event.error}`));
      try { synth.speak(utterance); } catch { finish(new Error('Speech playback failed')); return; }
    }
  });
}

export function speakTranslation(text: string, language: string, pitch = 1): Promise<void> {
  if (typeof window === 'undefined') return Promise.reject(new Error('Speech unavailable'));
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  const lang = language === 'tl' ? 'fil-PH' : language;
  const device = () => {
    if (!synth) return Promise.reject(new Error('Speech unavailable'));
    const immediate = synth.getVoices();
    const canWait = !immediate.length && typeof synth.addEventListener === 'function';
    if (!canWait) return speakWith(synth, text, lang, pitch, immediate);
    return whenVoicesReady(250).then(voices => speakWith(synth, text, lang, pitch, voices));
  };
  // Market path: text unit → Kokoro HD when supported → device/Google-scored voices.
  const rate = getSpeechRate(lang);
  if (hdVoiceSupported(lang)) {
    return speakHd(text, lang, rate).then(played => (played ? undefined : device()));
  }
  return device();
}

// Prime the voice list as early as possible so the first sentence can use it.
if (typeof window !== 'undefined') warmVoices();
