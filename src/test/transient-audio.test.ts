import { describe, expect, it } from 'vitest';
import { encodeActiveAudio } from '@/lib/audio/transient-audio';
import { vi } from 'vitest';
vi.mock('@/lib/interpret.functions', () => ({ interpretSpeechFn: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: {} }));
import { interpretSpeechFn } from '@/lib/interpret.functions';
import { SoloInterpreter } from '@/lib/solo-interpreter';
import { LiveCall } from '@/lib/live-call';

describe('temporary audio ownership', () => {
  it('encodes active audio then zeros the owned byte buffer', async () => {
    const bytes = new Uint8Array([65, 66, 67]);
    const blob = { arrayBuffer: async () => bytes.buffer } as Blob;
    expect(await encodeActiveAudio(blob, () => true)).toBe('QUJD');
    expect([...bytes]).toEqual([0, 0, 0]);
  });

  it('discards audio when the session exits while reading bytes', async () => {
    let active = true;
    const bytes = new Uint8Array([65, 66, 67]);
    const blob = { arrayBuffer: async () => { active = false; return bytes.buffer; } } as Blob;
    expect(await encodeActiveAudio(blob, () => active)).toBeNull();
    expect([...bytes]).toEqual([0, 0, 0]);
  });

  it.each(['solo', 'call'])('does not submit %s audio after closing during byte reading', async mode => {
    const owned = new Uint8Array([65, 66, 67]);
    const closeable = mode === 'solo'
      ? new SoloInterpreter('en', 'es', vi.fn(), vi.fn())
      : Object.create(LiveCall.prototype);
    // Exercise the actual pipeline without requesting browser media.
    const pipeline = closeable as unknown as { closed: boolean; interpret: (blob: Blob, pitch: number) => Promise<void> };
    pipeline.closed = false;
    const blob = { type: 'audio/webm', arrayBuffer: async () => { pipeline.closed = true; return owned.buffer; } } as Blob;
    vi.mocked(interpretSpeechFn).mockClear();
    await pipeline.interpret(blob, 1);
    expect(interpretSpeechFn).not.toHaveBeenCalled();
    expect([...owned]).toEqual([0, 0, 0]);
  });
});