import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PRO_VOICE_PROFILES, setVoiceChangerProfile } from '@/lib/audio/voice-changer';
import { hdVoiceChoice, prepareHdVoice, shapeVoiceTone, speakHd, stopHdVoice } from '@/lib/audio/hd-voice';

const generate = vi.hoisted(() => vi.fn(async () => ({ audio: new Float32Array([0.2, -0.2, 0.3]), sampling_rate: 24000 })));
vi.mock('@/lib/audio/kokoro-browser', () => ({ loadKokoroBrowser: async () => ({ generate }) }));

beforeEach(() => { localStorage.clear(); generate.mockClear(); });

describe('real free professional voice choices', () => {
  it('retains 30 female and 30 male choices backed by separate speaker families', () => {
    const female = PRO_VOICE_PROFILES.filter(p => p.gender === 'f');
    const male = PRO_VOICE_PROFILES.filter(p => p.gender === 'm');
    expect(female).toHaveLength(30);
    expect(male).toHaveLength(30);
    expect(new Set(female.map(p => p.voice)).size).toBe(15);
    expect(new Set(male.map(p => p.voice)).size).toBe(13);
    expect(female.every(p => p.voice[1] === 'f')).toBe(true);
    expect(male.every(p => p.voice[1] === 'm')).toBe(true);
  });

  it('selecting a male or female changes the actual neural speaker, not just pitch', () => {
    setVoiceChangerProfile('f-ava');
    expect(hdVoiceChoice('en-US')?.voice).toBe('af_heart');
    setVoiceChangerProfile('m-james');
    expect(hdVoiceChoice('en-US')?.voice).toBe('am_adam');
    expect(hdVoiceChoice('de')).toBeUndefined();
  });

  it('styles change the waveform without changing its duration', () => {
    const input = new Float32Array([0.4, -0.3, 0.2, -0.4]);
    const warm = shapeVoiceTone(input, 'warm');
    const bright = shapeVoiceTone(input, 'bright');
    expect(warm.length).toBe(input.length);
    expect(bright.length).toBe(input.length);
    expect([...warm]).not.toEqual([...input]);
    expect([...warm]).not.toEqual([...bright]);
  });

  it('passes distinct selected speakers and the saved pace to real synthesis', async () => {
    class Player {
      src = ''; onplaying: (() => void) | null = null; onended: (() => void) | null = null; onerror: (() => void) | null = null;
      play() { queueMicrotask(() => { this.onplaying?.(); this.onended?.(); }); return Promise.resolve(); }
      pause() {}
    }
    vi.stubGlobal('Audio', Player);
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} });
    try {
      setVoiceChangerProfile('f-ava');
      expect(await speakHd('Hello', 'en', 0.6)).toBe(true);
      expect(generate).toHaveBeenLastCalledWith('Hello', { voice: 'af_heart', speed: 0.6 });
      setVoiceChangerProfile('m-james');
      expect(await speakHd('Hello', 'en', 0.6)).toBe(true);
      expect(generate).toHaveBeenLastCalledWith('Hello', { voice: 'am_adam', speed: 0.6 });
    } finally { stopHdVoice(); vi.unstubAllGlobals(); }
  });

  it('prepares without synthesis and reuses a fixed sample without caching conversations', async () => {
    class Player {
      src = ''; onplaying: (() => void) | null = null; onended: (() => void) | null = null; onerror: (() => void) | null = null;
      play() { queueMicrotask(() => { this.onplaying?.(); this.onended?.(); }); return Promise.resolve(); }
      pause() {}
    }
    vi.stubGlobal('Audio', Player);
    vi.stubGlobal('URL', { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} });
    try {
      expect(await prepareHdVoice('en')).toBe(true);
      expect(generate).not.toHaveBeenCalled();
      setVoiceChangerProfile('f-ava');
      await speakHd('Fixed chooser sample', 'en', 0.8, { cacheSample: true });
      await speakHd('Fixed chooser sample', 'en', 0.8, { cacheSample: true });
      expect(generate).toHaveBeenCalledTimes(1);
      await speakHd('Private conversation', 'en', 0.8);
      await speakHd('Private conversation', 'en', 0.8);
      expect(generate).toHaveBeenCalledTimes(3);
    } finally { stopHdVoice(); vi.unstubAllGlobals(); }
  });
});