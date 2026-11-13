import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { getSpeechRate, setSpeechRate, getVoicePreference, setVoicePreference, speakTranslation, SPEECH_RATE, getResponsePause, setResponsePause, getResponsePauseMs, RESPONSE_PAUSES } from '@/lib/speech-playback';
import { voiceTuningCopy } from '@/lib/voice-tuning-copy';

// Never download the neural model in tests; exercise the device-voice path.
vi.mock('@/lib/audio/hd-voice', () => ({
  hdVoiceSupported: () => false,
  speakHd: () => Promise.resolve(false),
  isHdSpeaking: () => false,
  stopHdVoice: () => {},primeHdVoice:()=>{},
}));

afterEach(() => {
  for (const key of Object.keys(window.localStorage)) {
    if (key.startsWith('ml-speech-')) window.localStorage.removeItem(key);
  }
  vi.unstubAllGlobals();
});

const voice = (name: string, lang: string) =>
  ({ name, lang, default: false, localService: true, voiceURI: name }) as SpeechSynthesisVoice;

describe('voice speed tuning', () => {
  it('defaults to the slowed owner rate when nothing is stored', () => {
    expect(getSpeechRate()).toBe(SPEECH_RATE);
    expect(SPEECH_RATE).toBe(0.8);
  });

  it('persists the chosen speed and clamps it between 0.15 and 1.0', () => {
    setSpeechRate(0.8);
    expect(getSpeechRate()).toBe(0.8);
    setSpeechRate(2);
    expect(getSpeechRate()).toBe(2);
    setSpeechRate(0.1);
    expect(getSpeechRate()).toBe(0.15);
  });

  it('persists the response pause choice with a balanced default', () => {
    expect(getResponsePause()).toBe('balanced');
    expect(getResponsePauseMs()).toBe(RESPONSE_PAUSES.balanced);
    setResponsePause('quickest');
    expect(getResponsePause()).toBe('quickest');
    expect(getResponsePauseMs()).toBe(RESPONSE_PAUSES.quickest);
    expect(RESPONSE_PAUSES.quickest).toBeLessThan(RESPONSE_PAUSES.balanced);
    expect(RESPONSE_PAUSES.natural).toBeGreaterThan(RESPONSE_PAUSES.balanced);
    setResponsePause('natural');
    expect(getResponsePauseMs()).toBe(RESPONSE_PAUSES.natural);
    window.localStorage.removeItem('ml-response-pause');
  });

  it('saves speed separately for each language with a shared fallback', () => {
    setSpeechRate(0.8, 'es');
    expect(getSpeechRate('es')).toBe(0.8);
    expect(getSpeechRate('en')).toBe(SPEECH_RATE);
    setSpeechRate(0.9);
    expect(getSpeechRate('en')).toBe(0.9);
    expect(getSpeechRate('es')).toBe(0.8);
  });

  it('applies the tuned speed to spoken translations', async () => {
    const synth = { resume: vi.fn(), cancel: vi.fn(), speak: vi.fn(), getVoices: () => [voice('Google US English', 'en-US')] };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', class {
      constructor(public text: string) {}
      lang = ''; volume = 1; rate = 1; pitch = 1; voice: unknown;
      onstart?: () => void; onend?: () => void; onerror?: (e: { error: string }) => void;
    });
    setSpeechRate(0.7);
    const result = speakTranslation('Hello', 'en');
    const utterance = synth.speak.mock.calls[0]?.[0];
    expect(utterance.rate).toBe(0.7);
    utterance.onstart(); utterance.onend();
    await result;
  });
});

describe('voice selection tuning', () => {
  it('persists and clears the chosen voice', () => {
    expect(getVoicePreference()).toBeNull();
    setVoicePreference('Google US English');
    expect(getVoicePreference()).toBe('Google US English');
    setVoicePreference(null);
    expect(getVoicePreference()).toBeNull();
  });

  it('saves the voice separately for each language with a shared fallback', () => {
    setVoicePreference('Google español', 'es');
    expect(getVoicePreference('es')).toBe('Google español');
    expect(getVoicePreference('en')).toBeNull();
    setVoicePreference('Samantha');
    expect(getVoicePreference('en')).toBe('Samantha');
    expect(getVoicePreference('es')).toBe('Google español');
  });

  it('speaks with the chosen voice instead of the automatic pick', async () => {
    const legacy = voice('eSpeak English', 'en-US');
    const chosen = voice('Samantha (Enhanced)', 'en-US');
    const synth = { resume: vi.fn(), cancel: vi.fn(), speak: vi.fn(), getVoices: () => [legacy, chosen] };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', class {
      constructor(public text: string) {}
      lang = ''; volume = 1; rate = 1; pitch = 1; voice: unknown;
      onstart?: () => void; onend?: () => void; onerror?: (e: { error: string }) => void;
    });
    setVoicePreference('Samantha (Enhanced)');
    const result = speakTranslation('Hello', 'en');
    const utterance = synth.speak.mock.calls[0]?.[0];
    expect(utterance.voice).toBe(chosen);
    utterance.onstart(); utterance.onend();
    await result;
  });
});

describe('tuning controls on the Personal Translator', () => {
  const source = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');
  const panel = readFileSync('src/components/VoiceTuningControls.tsx', 'utf8');

  it('renders the tuning panel above the mic circle with speed and latency controls', () => {
    const tuning = source.indexOf('<VoiceTuningControls locale={locale} language={localLanguage || spokenLocale} />');
    const mic = source.indexOf('<Button ref={micBtn}');
    expect(tuning).toBeGreaterThan(-1);
    expect(mic).toBeGreaterThan(-1);
    expect(tuning).toBeLessThan(mic);
    expect(panel).toContain('data-voice-tuning');
    // The local phone voice list is gone; the Voice changer owns voice choices.
    expect(panel).not.toContain('data-voice-list-toggle');
    expect(panel).not.toContain('data-voice-option');
    expect(panel).not.toContain('data-voice-list-close');
    // Latency control: quickest / balanced / natural pause before translation.
    expect(panel).toContain('data-pause-option={option}');
    expect(panel).toContain("'quickest', 'balanced', 'natural'");
    expect(panel).toContain('setResponsePause(option)');
  });

  it('labels the controls in every native locale', () => {
    for (const locale of ['en', 'es', 'zh', 'de', 'tl', 'ja'] as const) {
      const c = voiceTuningCopy[locale];
      expect(c.speed.length).toBeGreaterThan(2);
      expect(c.voice.length).toBeGreaterThan(0);
      expect(c.auto.length).toBeGreaterThan(5);
      expect(c.slower.length).toBeGreaterThan(1);
      expect(c.faster.length).toBeGreaterThan(1);
      expect(c.close.length).toBeGreaterThan(1);
      expect(c.tapToHear.length).toBeGreaterThan(3);
      expect(c.response.length).toBeGreaterThan(3);
      expect(c.quickest.length).toBeGreaterThan(1);
      expect(c.balanced.length).toBeGreaterThan(1);
      expect(c.natural.length).toBeGreaterThan(1);
    }
  });
});
