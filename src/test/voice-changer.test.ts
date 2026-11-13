import { describe, expect, it, beforeEach } from 'vitest';
import { VOICE_CHANGER_PROFILES, setVoiceChangerProfile, voiceChangerCopy, voiceChangerProfile, voiceChangerScale } from '@/lib/audio/voice-changer';

describe('free voice changer', () => {
  beforeEach(() => { localStorage.clear(); });

  it('defaults to Natural (active, scale 1) with no saved choice', () => {
    expect(voiceChangerProfile()).toBe('natural');
    expect(voiceChangerScale()).toBe(1);
  });

  it('saves the chosen shape on this device and scales pitch within the 0.6–1.8 band', () => {
    setVoiceChangerProfile('deeper');
    expect(voiceChangerProfile()).toBe('deeper');
    expect(voiceChangerScale()).toBe(0.75);
    setVoiceChangerProfile('higher');
    expect(voiceChangerScale()).toBe(1.3);
    for (const p of VOICE_CHANGER_PROFILES) {
      expect(p.scale).toBeGreaterThanOrEqual(0.6);
      expect(p.scale).toBeLessThanOrEqual(1.8);
    }
  });

  it('ignores a corrupted saved value and falls back to Natural', () => {
    localStorage.setItem('ml_voice_changer', 'robot-from-1982');
    expect(voiceChangerProfile()).toBe('natural');
  });

  it('has truthful free copy in every native locale', () => {
    for (const locale of ['en', 'es', 'tl', 'zh', 'de', 'ja'] as const) {
      const c = voiceChangerCopy[locale];
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.note.length).toBeGreaterThan(0);
      expect(c.deeper).not.toBe(c.higher);
      expect(c.sampleText.length).toBeGreaterThan(0);
    }
  });
});
