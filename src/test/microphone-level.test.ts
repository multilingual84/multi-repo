import { describe, expect, it } from 'vitest';
import { microphoneLevel } from '@/lib/microphone-level';

describe('live microphone input meter', () => {
  it('shows zero for silence or empty input', () => {
    expect(microphoneLevel(new Float32Array(1024))).toBe(0);
    expect(microphoneLevel(new Float32Array())).toBe(0);
  });
  it('responds to captured amplitude and caps loud audio', () => {
    expect(microphoneLevel(new Float32Array([0.1, -0.1]))).toBeCloseTo(0.5);
    expect(microphoneLevel(new Float32Array([0.2, -0.2]))).toBe(1);
    expect(microphoneLevel(new Float32Array([1, -1]))).toBe(1);
  });
});