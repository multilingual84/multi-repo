// Browser-safe native client-side currency filter. Detection uses only
// navigator.language and the device time zone — no network calls, no tracking,
// no stored data. Display-only: Stripe still charges the flat USD prices at
// checkout, and the Enterprise Global Tier stays hard-anchored to flat
// $199.00 USD across all regions to protect the corporate hard-currency
// ledger from local market inflation.

export type GeoPlan = { symbol: string; factor: number; decimals: number; code: string; m: number; y: number };

export const getGeoPlan = (locale: string, timeZone: string): GeoPlan => {
  if (locale.includes('PH') || timeZone.includes('Manila')) return { symbol: '₱', factor: 50, decimals: 2, code: 'PHP', m: 50, y: 500 };
  if (locale.includes('GB') || timeZone.includes('London')) return { symbol: '£', factor: 1, decimals: 2, code: 'GBP', m: 0.99, y: 9.99 };
  if (locale.includes('JP') || timeZone.includes('Tokyo')) return { symbol: '¥', factor: 150, decimals: 0, code: 'JPY', m: 150, y: 1500 };
  const euroZones = ['AT', 'BE', 'CY', 'EE', 'FI', 'FR', 'DE', 'GR', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES'];
  if (euroZones.some((code) => locale.includes(code)) || timeZone.includes('Europe')) return { symbol: '€', factor: 1, decimals: 2, code: 'EUR', m: 0.99, y: 9.99 };
  return { symbol: '$', factor: 1, decimals: 2, code: 'USD', m: 0.99, y: 9.99 };
};

// Client-only detection; returns null during SSR so the language-based
// currency renders first and the geo price swaps in after hydration.
export const detectGeoPlan = (): GeoPlan | null => {
  if (typeof navigator === 'undefined') return null;
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
    return getGeoPlan(navigator.language ?? '', timeZone);
  } catch {
    return null;
  }
};

// Solo Trader Pack anchors at plan.m and the Yearly Duo Pack at plan.y so the
// headline tiers hit exact parity (₱50.00 / ₱500.00 in Manila); the mid tiers
// convert at the plan's factor. Enterprise Global returns null and always
// displays flat $199.00 USD.
export const geoAmountFor = (packageId: string, usdPrice: number, plan: GeoPlan): number | null => {
  if (packageId === 'enterprise') return null;
  if (packageId === 'single') return plan.m;
  if (packageId === 'duo-yearly') return plan.y;
  return usdPrice * plan.factor;
};

// Native formatter: '₱' + (value * 50).toFixed(2) in Manila, '¥' + (value * 150)
// .toFixed(0) in Tokyo, and so on. Also used for the processing-fee line.
export const formatGeoPrice = (usdAmount: number, plan: GeoPlan): string =>
  plan.symbol + (usdAmount * plan.factor).toFixed(plan.decimals);
