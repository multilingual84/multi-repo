import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { claraSpeak } from '@/lib/clara-voice';
import { setVoiceChangerProfile } from '@/lib/audio/voice-changer';
import { setSpeechRate, SPEECH_RATE } from '@/lib/speech-playback';

// Never download the neural model in tests; exercise the device-voice path.
vi.mock('@/lib/audio/hd-voice', () => ({
  hdVoiceSupported: () => false,
  speakHd: () => Promise.resolve(false),
  isHdSpeaking: () => false,
  stopHdVoice: () => {},primeHdVoice:()=>{},
}));

// The free Voice changer must shape the voice heard during live calls and video
// meetings (claraSpeak), not just the 1-phone translator.

class FakeUtterance {
  static last: FakeUtterance | null = null;
  text: string; lang = ''; rate = 1; pitch = 1; voice: unknown = null;
  onend: (() => void) | null = null; onerror: (() => void) | null = null;
  constructor(text: string) { this.text = text; FakeUtterance.last = this; }
}

const synth = {
  getVoices: () => [] as SpeechSynthesisVoice[],
  cancel: () => {},
  speak: (u: FakeUtterance) => { queueMicrotask(() => u.onend?.()); },
};

beforeEach(() => {
  (globalThis as Record<string, unknown>)['SpeechSynthesisUtterance'] = FakeUtterance;
  (globalThis as Record<string, unknown>)['window'] = globalThis;
  (globalThis as Record<string, unknown>)['speechSynthesis'] = synth;
  (window as unknown as Record<string, unknown>)['speechSynthesis'] = synth;
});

afterEach(() => {
  setVoiceChangerProfile('natural');
  delete (globalThis as Record<string, unknown>)['SpeechSynthesisUtterance'];
  delete (globalThis as Record<string, unknown>)['speechSynthesis'];
  delete (window as unknown as Record<string, unknown>)['speechSynthesis'];
});

describe('claraSpeak voice changer', () => {
  it('speaks call translations at the natural pitch by default', async () => {
    setVoiceChangerProfile('natural');
    await claraSpeak('hola', 'es-ES');
    expect(FakeUtterance.last?.pitch).toBe(1);
  });

  it('applies the deeper profile to call translations', async () => {
    setVoiceChangerProfile('deeper');
    await claraSpeak('hola', 'es-ES');
    expect(FakeUtterance.last?.pitch).toBe(0.75);
  });

  it('applies the higher profile to call translations', async () => {
    setVoiceChangerProfile('higher');
    await claraSpeak('hola', 'es-ES');
    expect(FakeUtterance.last?.pitch).toBe(1.3);
  });

  it('speaks call translations at the selected speech pace', async () => {
    setSpeechRate(0.6);
    await claraSpeak('hola', 'es-ES');
    expect(FakeUtterance.last?.rate).toBe(0.6);
    setSpeechRate(1.1);
    await claraSpeak('hola', 'es-ES');
    expect(FakeUtterance.last?.rate).toBe(1.1);
    setSpeechRate(SPEECH_RATE);
  });
});
