import { describe, expect, it, beforeEach } from 'vitest';
import { activePassPreview, createPassPreview, PASS_PREVIEW_KEY, PASS_DURATION_MS } from '@/lib/pass-preview';
import { hitsPaywall, FREE_DAILY_MINUTES } from '@/lib/free-allowance-policy';
import { validReminderRequest, reminderDue } from '@/lib/pass-reminder-policy';

const EXHAUSTED_MS = (FREE_DAILY_MINUTES + 5) * 60000;

describe('live device pass', () => {
  beforeEach(() => window.localStorage.clear());

  it('returns the pass while it is running and null after it ends', () => {
    const now = Date.now();
    const pass = createPassPreview('test-pass-1', now);
    window.localStorage.setItem(PASS_PREVIEW_KEY, JSON.stringify(pass));
    expect(activePassPreview(now + 1000)?.id).toBe('test-pass-1');
    expect(activePassPreview(now + PASS_DURATION_MS + 1000)).toBeNull();
  });

  it('returns null when no pass was saved or the saved value is invalid', () => {
    expect(activePassPreview()).toBeNull();
    window.localStorage.setItem(PASS_PREVIEW_KEY, '{not json');
    expect(activePassPreview()).toBeNull();
  });

  it('lifts the paywall while the pass is live and restores it after expiry', () => {
    expect(hitsPaywall(false, EXHAUSTED_MS)).toBe(true);
    expect(hitsPaywall(false, EXHAUSTED_MS, 0, true)).toBe(false);
    expect(hitsPaywall(false, EXHAUSTED_MS, 0, false)).toBe(true);
    expect(hitsPaywall(true, EXHAUSTED_MS)).toBe(false);
  });
});

describe('pass reminder requests', () => {
  const now = Date.now();
  const valid = { passId: 'abc-123', email: 'Visitor@Example.com', expiresAt: now + PASS_DURATION_MS };

  it('accepts a valid request and lowercases the email', () => {
    const r = validReminderRequest(valid, now);
    expect(r).toEqual({ passId: 'abc-123', email: 'visitor@example.com', expiresAt: valid.expiresAt });
  });

  it('rejects bad emails, bad pass ids and out-of-range expiry times', () => {
    expect(validReminderRequest({ ...valid, email: 'nope' }, now)).toBeNull();
    expect(validReminderRequest({ ...valid, passId: 'bad id!' }, now)).toBeNull();
    expect(validReminderRequest({ ...valid, expiresAt: now - 1000 }, now)).toBeNull();
    expect(validReminderRequest({ ...valid, expiresAt: now + PASS_DURATION_MS + 48 * 3600000 }, now)).toBeNull();
    expect(validReminderRequest(null, now)).toBeNull();
    expect(validReminderRequest('x', now)).toBeNull();
  });

  it('is due only inside the last 24 hours before the pass ends', () => {
    const end = now + PASS_DURATION_MS;
    expect(reminderDue(end, now)).toBe(false);
    expect(reminderDue(end, end - 23 * 3600000)).toBe(true);
    expect(reminderDue(end, end + 1000)).toBe(false);
  });
});
