import { AFFILIATE_PASS_DURATION_MS } from '@/lib/affiliate-preview';
import { parsePassPreview, PASS_PREVIEW_KEY, type PassPreview } from '@/lib/pass-preview';

export const COUPON_PREVIEW_KEY = 'ml-affiliate-coupons-preview';
const DAY_MS = 24 * 60 * 60 * 1000;
/** The one-week pass is free for everyone, with or without a code. */
export const FREE_PASS_DURATION_MS = AFFILIATE_PASS_DURATION_MS;
export const FREE_PASS_DAYS = FREE_PASS_DURATION_MS / DAY_MS;
export const COUPON_EARNINGS_PERCENT = 50;
/** Using someone's code adds 30 days on top of the free week everyone already gets. */
export const COUPON_EXTRA_DAYS = 30;

export function affiliatePurchaseRewardPreview(hasReferredPurchase: boolean) {
  return { earningsPercent: hasReferredPurchase ? COUPON_EARNINGS_PERCENT : 0 };
}

export type CouponRegistry = Record<string, string>;
export function normalizeCoupon(value: string) { return value.trim().toUpperCase(); }
export function validCoupon(value: string) { return /^[A-Z0-9][A-Z0-9-]{2,23}$/.test(normalizeCoupon(value)); }
export function parseCoupons(raw: string | null): CouponRegistry {
  try {
    const parsed: unknown = JSON.parse(raw ?? '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([code, owner]) => validCoupon(code) && code === normalizeCoupon(code) && typeof owner === 'string' && owner.length > 0));
  } catch { return {}; }
}
export function checkCoupon(value: string, owner: string, registry: CouponRegistry) {
  if (!validCoupon(value)) return 'invalid' as const;
  const existing = registry[normalizeCoupon(value)];
  if (existing && existing !== owner) return 'taken' as const;
  return 'available' as const;
}
export function saveCouponPreview(value: string, owner: string, registry: CouponRegistry): CouponRegistry | null {
  if (!owner || checkCoupon(value, owner, registry) !== 'available') return null;
  return { ...Object.fromEntries(Object.entries(registry).filter(([, id]) => id !== owner)), [normalizeCoupon(value)]: owner };
}
/** The code user's reward: the free week plus 30 additional days, credited to the person who shared the code. */
export function couponReferralPreview(value: string, registry: CouponRegistry, now = Date.now()) {
  const code = normalizeCoupon(value);
  const owner = registry[code];
  return validCoupon(code) && owner
    ? { code, owner, freeDays: FREE_PASS_DAYS, extraDays: COUPON_EXTRA_DAYS, endsAt: now + (FREE_PASS_DAYS + COUPON_EXTRA_DAYS) * DAY_MS, earningsPercent: COUPON_EARNINGS_PERCENT }
    : null;
}

/** Redeems a valid code on this device: a running pass gains 30 days; otherwise a fresh pass starts with the free week plus 30 days. Returns the new expiry. */
export function applyCouponPassBonus(now = Date.now()): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const existing = parsePassPreview(window.localStorage.getItem(PASS_PREVIEW_KEY));
    const pass: PassPreview = existing && existing.expiresAt > now
      ? { ...existing, expiresAt: existing.expiresAt + COUPON_EXTRA_DAYS * DAY_MS }
      : { id: existing?.id ?? crypto.randomUUID(), expiresAt: now + (FREE_PASS_DAYS + COUPON_EXTRA_DAYS) * DAY_MS };
    window.localStorage.setItem(PASS_PREVIEW_KEY, JSON.stringify(pass));
    return pass.expiresAt;
  } catch { return null; }
}
