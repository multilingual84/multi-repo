import { describe, expect, it } from 'vitest';
import { nextVideoStep } from '@/lib/adaptive-video';
describe('live video adaptation', () => {
  it('drops quality on bad signal or struggling phone', () => {
    expect(nextVideoStep(2, 0.15, 100, false)).toBe(1);
    expect(nextVideoStep(2, 0, 900, false)).toBe(1);
    expect(nextVideoStep(2, 0, 100, true)).toBe(1);
    expect(nextVideoStep(0, 0.5, 900, true)).toBe(0);
  });
  it('raises quality when the link is healthy', () => {
    expect(nextVideoStep(1, 0.01, 100, false)).toBe(2);
    expect(nextVideoStep(3, 0, 50, false)).toBe(3);
  });
});
