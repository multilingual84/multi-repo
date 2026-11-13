import { describe, expect, it } from 'vitest';
import { SessionVoiceSignature } from '@/lib/voice-signature';
describe('temporary local voice signature', () => {
  it('learns a steady pitch without mixing conversation directions', () => {
    const profile = new SessionVoiceSignature();
    profile.observe(0.7, 'en'); profile.observe(0.7, 'en');
    expect(profile.observe(1.3, 'en')).toBeCloseTo(0.88);
    expect(profile.observe(1.4, 'es')).toBeCloseTo(1.4);
  });
  it('clears the pitch signature at session reset', () => {
    const profile = new SessionVoiceSignature();
    profile.observe(0.7, 'en'); profile.observe(0.7, 'en');
    profile.reset();
    expect(profile.observe(1.3, 'en')).toBeCloseTo(1.3);
  });
  it('rejects invalid estimates rather than learning them', () => {
    const profile = new SessionVoiceSignature();
    expect(profile.observe(NaN, 'en')).toBe(1);
    expect(profile.observe(5, 'en')).toBe(1);
    expect(profile.observe(0.8, 'en')).toBeCloseTo(0.8);
  });
});