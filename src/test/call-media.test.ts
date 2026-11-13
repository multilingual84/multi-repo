import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { callMediaCopy, canAnswerSharedCall, sharedCallConstraints } from '@/lib/call-media';
describe('free recipient participation', () => {
  it('allows a shared-link recipient to answer without a paid entitlement', () => {
    expect(canAnswerSharedCall(true)).toBe(true);
    expect(canAnswerSharedCall(false)).toBe(false);
  });
  it('requests camera only when the recipient opts into video', () => {
    expect(sharedCallConstraints({}, false).video).toBe(false);
    expect(sharedCallConstraints({}, true).video).toEqual({ facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } });
  });
});
import { detectSignalTier, videoConstraintsForSignal } from '@/lib/call-media';
describe('signal-based video', () => {
  it('weak signal gets small video, strong gets 720p', () => {
    expect(detectSignalTier({ effectiveType: '2g' })).toBe('low');
    expect(videoConstraintsForSignal('low').width).toEqual({ ideal: 320 });
    expect(detectSignalTier({ effectiveType: '4g', downlink: 10 })).toBe('high');
    expect(videoConstraintsForSignal('high').width).toEqual({ ideal: 1280 });
  });
});
describe('free-answer line removal', () => {
  it('no longer carries the "answering is free" wording in any locale', () => {
    for (const copy of Object.values(callMediaCopy) as Record<string, string>[]) {
      expect(Object.keys(copy)).not.toContain('free');
    }
    const screen = readFileSync('src/components/AnswerCallScreen.tsx', 'utf8');
    expect(screen).not.toContain('mediaCopy.free');
  });
});
