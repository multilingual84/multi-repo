import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { speakTranslation } from '@/lib/speech-playback';
import { claraSpeak } from '@/lib/clara-voice';
import { setVoiceChangerProfile } from '@/lib/audio/voice-changer';

const hd = vi.hoisted(() => vi.fn(async () => true));
vi.mock('@/lib/audio/hd-voice', () => ({
  hdVoiceSupported: () => true, speakHd: hd, primeHdVoice: () => {},
}));
const spoken: Array<{ text: string; onend?: () => void }> = [];
beforeEach(() => {
  localStorage.clear(); hd.mockClear(); spoken.length = 0;
  vi.stubGlobal('SpeechSynthesisUtterance', class {
    lang = ''; rate = 1; pitch = 1; onend?: () => void;
    constructor(public text: string) {}
  });
  vi.stubGlobal('speechSynthesis', {
    getVoices: () => [], cancel: () => {}, resume: () => {},
    speak: (u: { text: string; onend?: () => void }) => { spoken.push(u); queueMicrotask(() => u.onend?.()); },
  });
});
afterEach(() => { localStorage.clear(); vi.unstubAllGlobals(); });

describe('lightweight translated-text read-aloud', () => {
  it.each(['natural', 'deeper', 'higher'] as const)('reads with %s immediately without loading neural synthesis', async profile => {
    setVoiceChangerProfile(profile);
    const translator = speakTranslation('The full translated sentence.', 'en');
    expect(spoken[0]?.text).toBe('The full translated sentence.');
    await translator;
    await claraSpeak('The full call translation.', 'en');
    expect(spoken[1]?.text).toBe('The full call translation.');
    expect(hd).not.toHaveBeenCalled();
  });
  it('preserves the actual selected professional voice in translator and call read-aloud', async () => {
    setVoiceChangerProfile('m-james');
    await speakTranslation('Hello', 'en');
    await claraSpeak('Hello', 'en');
    expect(hd).toHaveBeenCalledTimes(2);
    expect(hd).toHaveBeenCalledWith('Hello', 'en', 0.8);
    expect(spoken).toHaveLength(0);
  });
});