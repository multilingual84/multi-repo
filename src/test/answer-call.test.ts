import { expect, it } from 'vitest';
import { callAudioConstraints, isSharedCallLink } from '@/lib/answer-call';

it('opens the answer screen for shared links only', () => {
  expect(isSharedCallLink('#meeting-abc')).toBe(true);
  expect(isSharedCallLink('#trial-123')).toBe(true);
  expect(isSharedCallLink('#pricing')).toBe(false);
  expect(isSharedCallLink('')).toBe(false);
});

it('Audio Enhancements turns noise suppression on and off', () => {
  expect(callAudioConstraints(true).noiseSuppression).toBe(true);
  expect(callAudioConstraints(false).noiseSuppression).toBe(false);
});

import { paidPackages } from '@/lib/pricing';
it('after-call offer uses the $0.99 Solo Pack', () => {
  expect(paidPackages.find(p => p.id === 'single')?.price).toBe(0.99);
});
