import { normalizeCoupon, validCoupon } from './affiliate-coupon';

export const REFERRAL_STORAGE_KEY = 'ml-referral-token';
export const TIER_SESSION_KEY = 'ml-tier-display';

export function normalizeReferral(value: string | null): string | null {
  return value && validCoupon(value) ? normalizeCoupon(value) : null;
}

export function resolveInitialLanguage(saved: string | null, cookie: string, browserLanguage: string): string {
  const explicit = saved?.replace(/^gt:/, '');
  if (explicit && /^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$/.test(explicit)) return explicit;
  const translated = cookie.match(/(?:^|;\s*)googtrans=\/[^/;]+\/([^;]+)/)?.[1];
  if (translated && /^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$/.test(translated)) return translated;
  const language = (browserLanguage.split('-')[0] ?? 'en').toLowerCase();
  return /^[a-z]{2,3}$/.test(language) ? language : 'en';
}