import { getGeoPlan, geoAmountFor, type GeoPlan } from '@/lib/geo-pricing';
import { countryCurrencies, currencyPlans } from '@/lib/country-currency';

// Selected flags override device-region detection; unknown languages keep the
// existing region fallback. Both prices and checkout use the resulting plan.
export function getFlagPricePlan(language: string, fallback: GeoPlan | null = null, country?: string): GeoPlan {
  const lang = language.replace(/^gt:/, '').toLowerCase().split(/[-_]/)[0] ?? 'en';
  const region = (country ?? language.replace(/^gt:/, '').split(/[-_]/)[1] ?? '').toLowerCase();
  const code = countryCurrencies[region];
  const regional = code ? currencyPlans[code] : undefined;
  if (regional) return regional;
  if (lang === 'zh') return currencyPlans['CNY'] ?? getGeoPlan('en-US', 'America/Chicago');
  if (lang === 'es' && !region) {
    return { symbol: 'MX$', factor: 20, decimals: 2, code: 'MXN', m: 19, y: 199 };
  }
  if (['tl', 'fil', 'php'].includes(lang)) return getGeoPlan('fil-PH', 'Asia/Manila');
  if (['es', 'de', 'fr', 'it'].includes(lang)) return getGeoPlan('de-DE', 'Europe/Berlin');
  if (lang === 'en') return getGeoPlan('en-US', 'America/Chicago');
  if (lang === 'ja') return getGeoPlan('ja-JP', 'Asia/Tokyo');
  return fallback ?? getGeoPlan('en-US', 'America/Chicago');
}

const pesoAmounts: Record<string, number> = {
  single: 50, team: 200, hub: 400, 'duo-yearly': 500, community: 1000,
};
const mexicanPesoAmounts: Record<string, number> = {
  single: 19, team: 79, hub: 159, 'duo-yearly': 199, community: 399,
};

export function flagPackageAmount(id: string, usdPrice: number, plan: GeoPlan): number {
  if (id === 'enterprise') return usdPrice;
  const localAmount = plan.code === 'PHP' ? pesoAmounts[id] : plan.code === 'MXN' ? mexicanPesoAmounts[id] : undefined;
  return localAmount ?? Number((geoAmountFor(id, usdPrice, plan) ?? usdPrice).toFixed(plan.decimals));
}

export function formatFlagTotal(id: string, usdPrice: number, fee: number, plan: GeoPlan): string {
  const billingPlan = id === 'enterprise' ? getGeoPlan('en-US', 'America/Chicago') : plan;
  const amount = flagPackageAmount(id, usdPrice, billingPlan) + Number((fee * billingPlan.factor).toFixed(billingPlan.decimals));
  return billingPlan.symbol + amount.toLocaleString('en-US', { minimumFractionDigits: billingPlan.decimals, maximumFractionDigits: billingPlan.decimals });
}

export function formatFlagPackagePrice(id: string, usdPrice: number, plan: GeoPlan): string {
  if (id === 'enterprise') return '$' + usdPrice.toFixed(2);
  const amount = flagPackageAmount(id, usdPrice, plan);
  return plan.symbol + (plan.code === 'PHP'
    ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
    : amount.toFixed(plan.decimals));
}