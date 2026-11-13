import { afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ channel: vi.fn(), removeChannel: vi.fn(), pc: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: mocks }));
vi.mock('@/lib/webrtc', () => ({ createPeerConnection: mocks.pc }));
vi.mock('@/lib/interpret.functions', () => ({ interpretSpeechFn: vi.fn() }));
vi.mock('@/lib/clara-voice', () => ({ claraSpeak: vi.fn() }));
import { LiveCall } from '@/lib/live-call';
import { CALL_RECOVERY_MS } from '@/lib/call-reliability';
afterEach(() => { vi.unstubAllGlobals(); vi.clearAllMocks(); vi.useRealTimers(); });

describe('call disconnect cleanup', () => {
 it.each(['bye', 'disconnected'])('releases microphone on remote %s, after recovery grace when disconnected', async reason => {
  const handlers = new Map<string, (event: any) => void>();
  const channel = { on: vi.fn((type, filter, handler) => { handlers.set(`${type}:${filter.event}`, handler); return channel; }), subscribe: vi.fn(), send: vi.fn(), presenceState: () => ({}) };
  mocks.channel.mockReturnValue(channel);
  const pc = { addTrack: vi.fn(), setRemoteDescription: vi.fn(), createAnswer: vi.fn(), setLocalDescription: vi.fn(), close: vi.fn(), connectionState: 'connected', onconnectionstatechange: undefined as undefined | (() => void) };
  mocks.pc.mockReturnValue(pc);
  vi.stubGlobal('Audio', class { pause() {} });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  const stop = vi.fn(), onStatus = vi.fn();
  const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
  const call = new LiveCall('room', stream, 'en', { onStatus, onCaption: vi.fn() });
  call.start();
  const signal = handlers.get('broadcast:signal');
  if (!signal) throw new Error('Signal handler missing');
  await signal({ payload: { from: 'remote', kind: 'offer', sdp: { type: 'offer', sdp: '' } } });
  await new Promise(resolve => setTimeout(resolve, 0));
  if (reason === 'bye') { signal({ payload: { from: 'remote', kind: 'bye' } }); await new Promise(resolve => setTimeout(resolve, 0)); }
  else {
    vi.useFakeTimers(); pc.connectionState = 'disconnected'; pc.onconnectionstatechange?.();
    expect(onStatus).toHaveBeenLastCalledWith('reconnecting');
    expect(stop).not.toHaveBeenCalled();
    vi.advanceTimersByTime(CALL_RECOVERY_MS);
  }
  expect(stop).toHaveBeenCalledOnce();
  expect(pc.close).toHaveBeenCalledOnce();
  expect(onStatus).toHaveBeenLastCalledWith(reason === 'bye' ? 'ended' : 'failed');
  call.hangUp();
  expect(stop).toHaveBeenCalledOnce();
 });
});