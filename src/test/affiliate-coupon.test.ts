import { expect, it } from 'vitest';
import { affiliatePurchaseRewardPreview, checkCoupon, couponReferralPreview, FREE_PASS_DAYS, FREE_PASS_DURATION_MS, parseCoupons, saveCouponPreview } from '@/lib/affiliate-coupon';

it('lets an affiliate choose a code and rejects another owner using that code', () => {
  const registry = saveCouponPreview('my-code', 'affiliate-a', {});
  expect(registry).toEqual({ 'MY-CODE': 'affiliate-a' });
  expect(checkCoupon(' My-Code ', 'affiliate-b', registry ?? {})).toBe('taken');
  expect(saveCouponPreview('MY-CODE', 'affiliate-b', registry ?? {})).toBeNull();
});
it('keeps the one-week pass free for everyone without a code', () => {
  expect(FREE_PASS_DURATION_MS).toBe(7 * 24 * 60 * 60 * 1000);
  expect(FREE_PASS_DAYS).toBe(7);
});
it('gives the person using the code the free week plus 30 additional days', () => {
  const now = Date.UTC(2026, 0, 15);
  const reward = couponReferralPreview('my-code', { 'MY-CODE': 'affiliate-a' }, now);
  expect(reward?.freeDays).toBe(7);
  expect(reward?.extraDays).toBe(30);
  expect(reward?.endsAt).toBe(now + 37 * 24 * 60 * 60 * 1000);
});
it('attributes the entered code to its owner for 50 percent earnings', () => {
  expect(couponReferralPreview('my-code', { 'MY-CODE': 'affiliate-a' })).toMatchObject({ owner: 'affiliate-a', earningsPercent: 50 });
});
it('pays the referrer 50 percent only after a referred purchase', () => {
  expect(affiliatePurchaseRewardPreview(true).earningsPercent).toBe(50);
  expect(affiliatePurchaseRewardPreview(false).earningsPercent).toBe(0);
});
it('does not claim to verify codes missing from device-local storage', () => {
  expect(couponReferralPreview('REMOTE-CODE', {})).toBeNull();
});
it('rejects malformed codes and storage', () => {
  expect(checkCoupon('<script>', 'owner', {})).toBe('invalid');
  expect(parseCoupons('{broken')).toEqual({});
  expect(parseCoupons('{"GOOD":"owner","bad code":"other"}')).toEqual({ GOOD: 'owner' });
});
