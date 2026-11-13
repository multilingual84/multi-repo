// Browser-safe country-aware staging prices. Display and Stripe checkout use the
// same rounded local amounts from the shared exchange snapshot.
import { countryCurrencies, currencyPlans } from '@/lib/country-currency';

export type LocalCurrency = { code: string; symbol: string; factor: number; decimals: number; minorFactor: number };

export const USD_CURRENCY: LocalCurrency = { code: 'USD', symbol: '$', factor: 1, decimals: 2, minorFactor: 100 };

export function normalizeCountry(value: string | null | undefined): string | null {
  const c = (value ?? '').trim().toLowerCase();
  return /^[a-z]{2}(-[a-z]{2,4})?$/.test(c) ? c : null;
}

// Countries without a supported checkout currency are billed in USD.
export function currencyForCountry(country: string | null | undefined): LocalCurrency {
  const code = countryCurrencies[normalizeCountry(country) ?? ''];
  const plan = code ? currencyPlans[code] : undefined;
  if (!plan?.supported || plan.code === 'USD') return USD_CURRENCY;
  return { code: plan.code, symbol: plan.symbol, factor: plan.factor, decimals: plan.decimals, minorFactor: plan.minorFactor };
}

export function localAmount(usdCents: number, cur: LocalCurrency): number {
  return Number(((usdCents / 100) * cur.factor).toFixed(cur.decimals));
}

// Amount in Stripe's smallest unit for that currency.
export function localStripeAmount(usdCents: number, cur: LocalCurrency): number {
  return Math.round(localAmount(usdCents, cur) * cur.minorFactor);
}

export function formatLocal(usdCents: number, cur: LocalCurrency): string {
  const amount = localAmount(usdCents, cur).toLocaleString('en-US', { minimumFractionDigits: cur.decimals, maximumFractionDigits: cur.decimals });
  return cur.code === 'USD' ? `$${amount}` : `${cur.symbol}${amount} ${cur.code}`;
}

// Region from the device language (e.g. en-GB → gb); used before any flag is tapped.
export function countryFromLanguage(language: string | null | undefined): string | null {
  const region = (language ?? '').split(/[-_]/)[1];
  return normalizeCountry(region && region.length === 2 ? region : null);
}

// Public link the referral QR opens on any phone (always the live site).
export const PUBLIC_SITE_URL = 'https://multi-lingual.tech';
export function referralLink(code: string): string {
  return `${PUBLIC_SITE_URL}/?ref=${encodeURIComponent(code)}`;
}
