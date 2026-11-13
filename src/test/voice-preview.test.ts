import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRO_VOICE_PROFILES } from '@/lib/audio/voice-changer';
import { playVoicePreview, stopVoicePreview, voicePreviewUrl } from '@/lib/audio/voice-preview';

const players: Player[] = [];
class Player {
  playbackRate = 1; preservesPitch = false;
  onplaying: (() => void) | null = null;
  onended: (() => void) | null = null;
  onerror: (() => void) | null = null;
  play = vi.fn(() => Promise.resolve());
  pause = vi.fn(); removeAttribute = vi.fn();
  constructor(public src: string) { players.push(this); }
}
beforeEach(() => { vi.useFakeTimers(); players.length = 0; vi.stubGlobal('Audio', Player); });
afterEach(() => { stopVoicePreview(); vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('fixed professional previews', () => {
  it('has a separate real-speaker clip for all 30 female and 30 male styles', () => {
    expect(PRO_VOICE_PROFILES.filter(v => v.gender === 'f')).toHaveLength(30);
    expect(PRO_VOICE_PROFILES.filter(v => v.gender === 'm')).toHaveLength(30);
    const urls = PRO_VOICE_PROFILES.map(v => voicePreviewUrl(v.id));
    expect(urls.every(url => url?.endsWith('.mp3'))).toBe(true);
    expect(new Set(urls).size).toBe(60);
  });
  it('starts playback during the tap without awaiting synthesis, at the selected pace', async () => {
    const result = playVoicePreview('f-ava', 0.6);
    expect(players[0]?.play).toHaveBeenCalledOnce();
    expect(players[0]?.playbackRate).toBe(0.6);
    expect(players[0]?.preservesPitch).toBe(true);
    players[0]?.onplaying?.(); players[0]?.onended?.();
    expect(await result).toBe(true);
  });
  it('cancels the previous sample and releases stalled playback for retry', async () => {
    const first = playVoicePreview('f-ava', 0.8);
    const second = playVoicePreview('m-james', 0.8);
    expect(await first).toBe(false);
    expect(players[0]?.pause).toHaveBeenCalledOnce();
    vi.advanceTimersByTime(8000);
    expect(await second).toBe(false);
    const retry = playVoicePreview('m-james', 0.8);
    players[2]?.onplaying?.(); players[2]?.onended?.();
    expect(await retry).toBe(true);
  });
});