import { describe, expect, it } from 'vitest';
import { SentencePitch, speechPitch } from '@/lib/voice-pitch';

function tone(frequency: number) {
  return Float32Array.from({ length: 2048 }, (_, i) => 0.2 * Math.sin(2 * Math.PI * frequency * i / 48000));
}
describe('local sentence pitch', () => {
  it('detects low and high voices and maps them to bounded output pitch', () => {
    for (const frequency of [110, 210]) {
      const pitch = new SentencePitch(2048);
      for (let i = 0; i < 4; i++) pitch.sample(tone(frequency), 48000);
      expect(pitch.finish()).toBeCloseTo(frequency / 180, 1);
    }
    expect(speechPitch(70)).toBe(0.6);
    expect(speechPitch(500)).toBe(1.8);
  });
  it('uses neutral speech for silence, invalid samples or insufficient confidence', () => {
    const pitch = new SentencePitch(2048);
    for (let i = 0; i < 4; i++) pitch.sample(new Float32Array(2048), 48000);
    expect(pitch.finish()).toBe(1);
    pitch.sample(tone(210), 48000);
    expect(pitch.finish()).toBe(1);
    expect(speechPitch(NaN)).toBe(1);
  });
  it('forgets each sentence and clears estimates at shutdown', () => {
    const pitch = new SentencePitch(2048);
    for (let i = 0; i < 4; i++) pitch.sample(tone(210), 48000);
    expect(pitch.finish()).toBeGreaterThan(1);
    expect(pitch.finish()).toBe(1);
    for (let i = 0; i < 4; i++) pitch.sample(tone(110), 48000);
    pitch.reset();
    expect(pitch.finish()).toBe(1);
  });
});