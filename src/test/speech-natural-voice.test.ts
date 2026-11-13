import { afterEach, describe, expect, it, vi } from 'vitest';
import { pickNaturalVoice, whenVoicesReady, speakTranslation, SPEECH_RATE } from '@/lib/speech-playback';

// Never download the neural model in tests; exercise the device-voice path.
vi.mock('@/lib/audio/hd-voice', () => ({
  hdVoiceSupported: () => false,
  speakHd: () => Promise.resolve(false),
  isHdSpeaking: () => false,
  stopHdVoice: () => {},primeHdVoice:()=>{},
}));

afterEach(() => { vi.unstubAllGlobals(); });

const voice = (name: string, lang: string, def = false) =>
  ({ name, lang, default: def, localService: true, voiceURI: name }) as SpeechSynthesisVoice;

describe('natural voice selection', () => {
  it('prefers Google/Natural voices over legacy eSpeak for the language', () => {
    const picked = pickNaturalVoice([voice('eSpeak English', 'en-US'), voice('Google US English', 'en-US')], 'en-US');
    expect(picked?.name).toBe('Google US English');
  });

  it('prefers enhanced/premium device voices over the plain variant', () => {
    const picked = pickNaturalVoice([voice('Samantha', 'en-US'), voice('Samantha (Enhanced)', 'en-US')], 'en-US');
    expect(picked?.name).toBe('Samantha (Enhanced)');
  });

  it('matches the base language when no exact locale exists', () => {
    const picked = pickNaturalVoice([voice('Google español', 'es-ES')], 'es-MX');
    expect(picked?.name).toBe('Google español');
  });

  it('keeps the slowed speaking rate the owner asked for', () => expect(SPEECH_RATE).toBe(0.8));
});

describe('waiting for the voice list', () => {
  it('resolves immediately when voices are already loaded', async () => {
    vi.stubGlobal('speechSynthesis', { getVoices: () => [voice('Google US English', 'en-US')] });
    const voices = await whenVoicesReady();
    expect(voices[0]?.name).toBe('Google US English');
  });

  it('waits for voiceschanged before speaking when the list starts empty', async () => {
    let listeners: Array<() => void> = [];
    const good = voice('Google US English', 'en-US');
    let loaded = false;
    const synth = {
      resume: vi.fn(), cancel: vi.fn(), speak: vi.fn(),
      getVoices: () => (loaded ? [good] : []),
      addEventListener: (_: string, fn: () => void) => { listeners.push(fn); },
      removeEventListener: (_: string, fn: () => void) => { listeners = listeners.filter(l => l !== fn); },
    };
    vi.stubGlobal('speechSynthesis', synth);
    vi.stubGlobal('SpeechSynthesisUtterance', class {
      constructor(public text: string) {}
      lang = ''; volume = 1; rate = 1; pitch = 1; voice: unknown;
      onstart?: () => void; onend?: () => void; onerror?: (e: { error: string }) => void;
    });
    const result = speakTranslation('Hello', 'en');
    expect(synth.speak).not.toHaveBeenCalled();
    loaded = true; listeners.forEach(fn => fn());
    await new Promise(r => setTimeout(r, 0));
    expect(synth.speak).toHaveBeenCalledTimes(1);
    const utterance = synth.speak.mock.calls[0]?.[0];
    expect(utterance.voice).toBe(good);
    utterance.onstart(); utterance.onend();
    await result;
  });
});
