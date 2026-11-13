import { afterEach, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ channel: vi.fn(), removeChannel: vi.fn(), pc: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: mocks }));
vi.mock('@/lib/webrtc', () => ({ createPeerConnection: mocks.pc }));
vi.mock('@/lib/interpret.functions', () => ({ interpretSpeechFn: vi.fn() }));
vi.mock('@/lib/clara-voice', () => ({ claraSpeak: vi.fn() }));
import { LiveCall } from '@/lib/live-call';
import { CALL_CONNECT_MS, CALL_RECOVERY_MS, captureFailure } from '@/lib/call-reliability';
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });
async function fixture(offerer = false, playbackFails = false) {
  vi.useFakeTimers();
  vi.stubGlobal('crypto', { randomUUID: () => 'a-self' });
  const play = vi.fn().mockImplementation(() => playbackFails ? Promise.reject(new Error('Blocked')) : Promise.resolve());
  vi.stubGlobal('Audio', class { play = play; pause() {} });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  const handlers = new Map<string, (event: any) => void>();
  const channel = { on: vi.fn((type, filter, handler) => { handlers.set(`${type}:${filter.event}`, handler); return channel; }), subscribe: vi.fn(), send: vi.fn().mockResolvedValue('ok'), presenceState: () => ({ 'a-self': [], 'z-peer': [] }) };
  mocks.channel.mockReturnValue(channel);
  const pc = { addTrack: vi.fn(), createDataChannel: vi.fn(() => ({ close: vi.fn() })), createOffer: vi.fn().mockResolvedValue({ type: 'offer' }), setRemoteDescription: vi.fn().mockResolvedValue(undefined), createAnswer: vi.fn().mockResolvedValue({ type: 'answer' }), setLocalDescription: vi.fn().mockResolvedValue(undefined), addIceCandidate: vi.fn().mockResolvedValue(undefined), close: vi.fn(), connectionState: 'connecting', onconnectionstatechange: undefined as undefined | (() => void), ontrack: undefined as undefined | ((event: any) => void) };
  mocks.pc.mockReturnValue(pc);
  const stop = vi.fn(), track = { stop, onended: null as null | (() => void) };
  const events = { onStatus: vi.fn(), onCaption: vi.fn(), onAudioBlocked: vi.fn(), onMediaEnded: vi.fn() };
  const call = new LiveCall('room', { getTracks: () => [track] } as unknown as MediaStream, 'en', events);
  call.start();
  const signal = async (payload: unknown) => { handlers.get('broadcast:signal')?.({ payload }); await vi.advanceTimersByTimeAsync(0); };
  if (offerer) { handlers.get('presence:sync')?.({}); await vi.advanceTimersByTimeAsync(0); await signal({ from: 'z-peer', kind: 'answer', sdp: { type: 'answer' } }); }
  else await signal({ from: 'z-peer', kind: 'offer', sdp: { type: 'offer' } });
  return { call, pc, stop, events, signal, track, play };
}
it('recovers a brief disconnect without losing capture and requests ICE restart only as offerer', async () => {
  const f = await fixture(true);
  f.pc.connectionState = 'connected'; f.pc.onconnectionstatechange?.();
  f.pc.connectionState = 'disconnected'; f.pc.onconnectionstatechange?.();
  await vi.advanceTimersByTimeAsync(1000);
  expect(f.events.onStatus).toHaveBeenLastCalledWith('reconnecting');
  expect(f.pc.createOffer).toHaveBeenLastCalledWith({ iceRestart: true });
  expect(f.stop).not.toHaveBeenCalled();
  f.pc.connectionState = 'connected'; f.pc.onconnectionstatechange?.();
  await vi.advanceTimersByTimeAsync(CALL_RECOVERY_MS);
  expect(f.events.onStatus).toHaveBeenLastCalledWith('connected');
  expect(f.stop).not.toHaveBeenCalled(); f.call.hangUp();
});
it('cleans up a failed initial connection and reports failure instead of connected or ended', async () => {
  const f = await fixture();
  await vi.advanceTimersByTimeAsync(CALL_CONNECT_MS);
  expect(f.events.onStatus).toHaveBeenLastCalledWith('failed');
  expect(f.pc.close).toHaveBeenCalledOnce(); expect(f.stop).toHaveBeenCalledOnce();
  expect(mocks.removeChannel).toHaveBeenCalledOnce();
});
it('buffers early ICE until the peer description is set', async () => {
  const f = await fixture(); f.call.hangUp();
  const pc = f.pc; pc.addIceCandidate.mockClear();
  const call = new LiveCall('room2', { getTracks: () => [] } as unknown as MediaStream, 'en', f.events);
  call.start();
  await f.signal({ from: 'z-peer', kind: 'ice', candidate: { candidate: 'early' } });
  expect(pc.addIceCandidate).not.toHaveBeenCalled();
  await f.signal({ from: 'z-peer', kind: 'offer', sdp: { type: 'offer' } });
  expect(pc.addIceCandidate).toHaveBeenCalledWith({ candidate: 'early' }); call.hangUp();
});
it('exposes blocked remote audio and allows a direct retry', async () => {
  const f = await fixture(false, true);
  f.pc.ontrack?.({ streams: [{}] }); await vi.advanceTimersByTimeAsync(0);
  expect(f.events.onAudioBlocked).toHaveBeenLastCalledWith(true);
  f.play.mockResolvedValue(undefined); await f.call.resumeAudio();
  expect(f.events.onAudioBlocked).toHaveBeenLastCalledWith(false); f.call.hangUp();
});
it('releases all resources when a device track ends', async () => {
  const f = await fixture(); f.track.onended?.();
  expect(f.events.onMediaEnded).toHaveBeenCalledOnce();
  expect(f.events.onStatus).toHaveBeenLastCalledWith('failed'); expect(f.stop).toHaveBeenCalledOnce();
});
it.each([['NotAllowedError', 'denied'], ['NotFoundError', 'unavailable'], ['NotReadableError', 'busy']])('classifies %s permission/device failures', (name, result) => {
  expect(captureFailure(new DOMException('', name))).toBe(result);
});