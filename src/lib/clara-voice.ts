// Clara AI voice reply — browser-only (SpeechSynthesis + Web Audio). No external accounts.
import { pickNaturalVoice, whenVoicesReady, getSpeechRate, getVoicePreference } from '@/lib/speech-playback';
import { selectedProfessionalVoice, voiceChangerRateScale, voiceChangerScale } from '@/lib/audio/voice-changer';
import { hdVoiceSupported, speakHd } from '@/lib/audio/hd-voice';

/** Condense text into at most 3 short summary lines. */
export function summarizeToThreeLines(text: string, maxLen = 140): string[] {
  const sentences = text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?。！？])\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.slice(0, 3).map((s) => (s.length > maxLen ? s.slice(0, maxLen - 1).trimEnd() + "…" : s));
}

export function isVoiceSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

/** Short two-tone chime via Web Audio before Clara speaks. */
export async function playClaraChime(): Promise<void> {
  if (typeof window === "undefined") return;
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx();
  const now = ctx.currentTime;
  [660, 880].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now + i * 0.15);
    gain.gain.exponentialRampToValueAtTime(0.2, now + i * 0.15 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.15 + 0.14);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + i * 0.15);
    osc.stop(now + i * 0.15 + 0.15);
  });
  await new Promise((r) => setTimeout(r, 350));
  await ctx.close();
}

/** Speak text in the given BCP-47 language (e.g. "en-US", "es-ES", "fil-PH"). */
export function claraSpeak(text: string, lang = "en-US"): Promise<void> {
  if (!isVoiceSupported()) return Promise.reject(new Error('Speech playback unavailable'));
  const synth = window.speechSynthesis;
  const speak = (voices: SpeechSynthesisVoice[]) => new Promise<void>((resolve, reject) => {
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = Math.min(2, Math.max(0.1, getSpeechRate(lang) * voiceChangerRateScale()));
    // Free voice changer applies here too, so live call and video-meeting
    // translations are shaped the same way as the 1-phone translator.
    u.pitch = Math.min(1.8, Math.max(0.6, voiceChangerScale()));
    const preferred = getVoicePreference(lang);
    const voice = (preferred ? voices.find(v => v.voiceURI === preferred) : undefined) ?? pickNaturalVoice(voices, lang);
    if (voice) u.voice = voice;
    u.onend = () => resolve();
    u.onerror = () => reject(new Error('Speech playback interrupted'));
    synth.speak(u);
  });
  const device = () => {
    const immediate = synth.getVoices();
    if (immediate.length || typeof synth.addEventListener !== 'function') return speak(immediate);
    return whenVoicesReady(250).then(speak);
  };
  // Match the translator: everyday shapes avoid model generation, while a
  // chosen professional speaker retains its actual neural identity.
  if (!selectedProfessionalVoice() || !hdVoiceSupported(lang)) return device();
  return speakHd(text, lang, getSpeechRate(lang)).then(played => (played ? undefined : device()));
}

/** Chime, then read the 3-line summary aloud. Returns the lines spoken. */
export async function claraVoiceReply(text: string, lang = "en-US"): Promise<string[]> {
  const lines = summarizeToThreeLines(text);
  await playClaraChime();
  await claraSpeak(lines.join(" "), lang);
  return lines;
}
