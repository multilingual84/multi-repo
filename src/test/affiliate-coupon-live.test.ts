import { beforeEach, describe, expect, it } from 'vitest';
import { applyCouponPassBonus, COUPON_EXTRA_DAYS, FREE_PASS_DAYS, normalizeCoupon, validCoupon } from '@/lib/affiliate-coupon';
import { createPassPreview, PASS_DURATION_MS, PASS_PREVIEW_KEY } from '@/lib/pass-preview';

const DAY_MS = 24 * 60 * 60 * 1000;

describe('coupon code rules', () => {
  it('normalizes case and surrounding whitespace', () => {
    expect(normalizeCoupon('  maria-2026 ')).toBe('MARIA-2026');
  });

  it('accepts 3-24 letters, numbers and hyphens starting with a letter or number', () => {
    expect(validCoupon('ABC')).toBe(true);
    expect(validCoupon('MARIA-2026')).toBe(true);
    expect(validCoupon('ab')).toBe(false);
    expect(validCoupon('-ABC')).toBe(false);
    expect(validCoupon('A'.repeat(25))).toBe(false);
    expect(validCoupon('HAS SPACE')).toBe(false);
  });
});

describe('coupon pass bonus', () => {
  beforeEach(() => window.localStorage.clear());

  it('starts a fresh pass with the free week plus 30 extra days', () => {
    const now = Date.now();
    const endsAt = applyCouponPassBonus(now);
    expect(endsAt).toBe(now + (FREE_PASS_DAYS + COUPON_EXTRA_DAYS) * DAY_MS);
    expect(FREE_PASS_DAYS).toBe(7);
    expect(COUPON_EXTRA_DAYS).toBe(30);
  });

  it('adds 30 days to a pass that is still running', () => {
    const now = Date.now();
    const pass = createPassPreview('device-pass', now);
    window.localStorage.setItem(PASS_PREVIEW_KEY, JSON.stringify(pass));
    expect(applyCouponPassBonus(now + 1000)).toBe(pass.expiresAt + COUPON_EXTRA_DAYS * DAY_MS);
  });

  it('restarts an expired pass with the free week plus 30 days, keeping its id', () => {
    const now = Date.now();
    const expired = { id: 'old-pass', expiresAt: now - 1000 };
    window.localStorage.setItem(PASS_PREVIEW_KEY, JSON.stringify(expired));
    const endsAt = applyCouponPassBonus(now);
    expect(endsAt).toBe(now + (FREE_PASS_DAYS + COUPON_EXTRA_DAYS) * DAY_MS);
    const saved = JSON.parse(window.localStorage.getItem(PASS_PREVIEW_KEY) ?? '{}');
    expect(saved.id).toBe('old-pass');
  });

  it('a fresh bonus pass outlasts the plain 7-day pass', () => {
    const now = Date.now();
    const endsAt = applyCouponPassBonus(now);
    expect(endsAt).toBe(now + PASS_DURATION_MS + COUPON_EXTRA_DAYS * DAY_MS);
  });
});
