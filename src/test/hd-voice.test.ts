import { describe, expect, it } from 'vitest';
import { hdVoiceSupported, isHdSpeaking, speakHd, stopHdVoice } from '@/lib/audio/hd-voice';

// The free HD neural voice covers only the languages its model ships; every other
// language must fall back to the device voice so the all-languages promise holds.

describe('HD neural voice', () => {
  it('supports the languages the model ships, with region tags normalized', () => {
    for (const lang of ['en', 'en-US', 'en-GB']) {
      expect(hdVoiceSupported(lang)).toBe(true);
    }
  });

  it('falls back to the device voice for languages the model does not ship', () => {
    for (const lang of ['tl', 'fil-PH', 'de', 'ko', 'ar', 'ru', 'es', 'fr', 'hi', 'it', 'pt', 'ja', 'zh', '']) {
      expect(hdVoiceSupported(lang)).toBe(false);
    }
  });

  it('reports not-speaking before any playback and after a stop', () => {
    expect(isHdSpeaking()).toBe(false);
    stopHdVoice();
    expect(isHdSpeaking()).toBe(false);
  });

  it('declines unsupported languages without touching the network', async () => {
    await expect(speakHd('Hallo', 'de', 1)).resolves.toBe(false);
    await expect(speakHd('Kumusta', 'fil-PH', 1)).resolves.toBe(false);
  });
});
