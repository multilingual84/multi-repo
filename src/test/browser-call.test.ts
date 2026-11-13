import { afterEach, expect, it, vi } from 'vitest';
import { openBrowserCall, startRingtone } from '@/lib/browser-call';
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); sessionStorage.clear(); window.history.replaceState(null, '', '/'); });
it('opens the same shared room with a tab-scoped caller marker without capturing media', () => {
  const open = vi.fn();
  window.addEventListener('ml-open-call', open);
  openBrowserCall('abc123', true);
  expect(window.location.hash).toBe('#meeting-abc123');
  expect(sessionStorage.getItem('ml-call-caller')).toBe('meeting-abc123');
  expect(open.mock.calls[0]?.[0].detail).toEqual({ video: true });
  window.removeEventListener('ml-open-call', open);
});
it('rejects an invalid room before opening a call', () => {
  expect(() => openBrowserCall('../invalid', false)).toThrow('Invalid room');
  expect(window.location.hash).toBe('');
});
it('one-tap callback opens consent without an additional call-start button',()=>{const open=vi.fn();window.addEventListener('ml-open-call',open);openBrowserCall('abc123',false,true);expect(open.mock.calls[0]?.[0].detail).toEqual({video:false,immediate:true});window.removeEventListener('ml-open-call',open);});
it('stops ringing and closes audio exactly once', async () => {
  vi.useFakeTimers();
  const start = vi.fn(), close = vi.fn().mockResolvedValue(undefined);
  vi.stubGlobal('AudioContext', class {
    state = 'running'; currentTime = 0; destination = {};
    resume = vi.fn().mockResolvedValue(undefined); close = close;
    createGain() { return { gain: { setValueAtTime() {}, linearRampToValueAtTime() {} }, connect() {} }; }
    createOscillator() { return { frequency: { value: 0 }, connect() {}, start, stop() {}, disconnect() {} }; }
  });
  const stop = await startRingtone();
  expect(start).toHaveBeenCalledTimes(2);
  stop(); stop(); vi.advanceTimersByTime(5000);
  expect(start).toHaveBeenCalledTimes(2);
  expect(close).toHaveBeenCalledOnce();
});