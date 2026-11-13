import { describe, expect, it, vi, afterEach } from 'vitest';
vi.mock('@/lib/interpret.functions', () => ({ interpretSpeechFn: vi.fn() }));
vi.mock('@/lib/clara-voice', () => ({ claraSpeak: vi.fn() }));
import { SoloInterpreter } from '@/lib/solo-interpreter';

afterEach(() => vi.unstubAllGlobals());
describe('microphone shutdown', () => {
  it('releases permission-delayed capture when tapped off before permission resolves', async () => {
    let resolveCapture: ((stream: MediaStream) => void) | undefined;
    const capture = new Promise<MediaStream>(resolve => { resolveCapture = resolve; });
    const stop = vi.fn();
    const getUserMedia = vi.fn(() => capture);
    vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
    const interpreter = new SoloInterpreter('en', 'es', vi.fn(), vi.fn());
    const starting = interpreter.start();
    await interpreter.start();
    expect(getUserMedia).toHaveBeenCalledTimes(1);
    interpreter.stop();
    if (!resolveCapture) throw new Error('Capture was not started');
    resolveCapture({ getTracks: () => [{ stop }] } as unknown as MediaStream);
    await starting;
    expect(stop).toHaveBeenCalledTimes(1);
  });
});