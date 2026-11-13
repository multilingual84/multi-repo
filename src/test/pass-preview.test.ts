import { describe, expect, it } from 'vitest';
import { createPassPreview, parsePassPreview, passTimeRemaining, passPreviewLink, PASS_DURATION_MS } from '@/lib/pass-preview';

describe('Free-pass interface timing', () => {
  it('counts down exactly seven days from first creation', () => {
    const pass = createPassPreview('my-meeting', 1000);
    expect(pass.expiresAt).toBe(1000 + 7 * 24 * 60 * 60 * 1000);
    expect(passTimeRemaining(pass.expiresAt, 1000).days).toBe(7);
  });
  it('shows the expiry notice at 24 hours, but not before', () => {
    expect(passTimeRemaining(86400000, 0).status).toBe('ending');
    expect(passTimeRemaining(86400001, 0).status).toBe('running');
  });
  it('stops at zero once expired', () => {
    expect(passTimeRemaining(1000, 2000)).toEqual({days:0,hours:0,minutes:0,seconds:0,status:'expired'});
  });
  it('restores the same QR identity and deadline without restarting', () => {
    const pass = createPassPreview('meeting-1', 0);
    expect(parsePassPreview(JSON.stringify(pass))).toEqual({id:'meeting-1',expiresAt:PASS_DURATION_MS});
    expect(passPreviewLink('https://example.com', pass)).toBe('https://example.com/#meeting-meeting-1');
  });
  it('rejects malformed stored state', () => {
    expect(parsePassPreview('{')).toBeNull();
    expect(parsePassPreview('{"id":"../../bad","expiresAt":3}')).toBeNull();
  });
});