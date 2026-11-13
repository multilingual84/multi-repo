// Browser-safe staging packages: the single source for prices, picture counts,
// auto-pay default and the referral split. Stripe price IDs live here too
// (publishable identifiers, not secrets).

export type StagingPackageId = 'starter' | 'agent' | 'broker' | 'volume';

export type StagingPackage = {
  id: StagingPackageId;
  name: string;
  pics: number;
  amountCents: number;
  oneTimePriceId: string;
  monthlyPriceId: string;
  audience?: string;
};

export const stagingPackages: readonly StagingPackage[] = [
  { id: 'starter', name: 'Starter', pics: 5, amountCents: 99, oneTimePriceId: 'price_1Ua7A7Rt7sdUtv32G0TE8Z5u', monthlyPriceId: 'price_1Ua7A8Rt7sdUtv32nljmZBS8' },
  { id: 'agent', name: 'Agent', pics: 50, amountCents: 500, oneTimePriceId: 'price_1Ua7A8Rt7sdUtv32XchbisSC', monthlyPriceId: 'price_1Ua7A8Rt7sdUtv32yWruGBE1' },
  { id: 'broker', name: 'Broker', pics: 150, amountCents: 1000, oneTimePriceId: 'price_1Ua7A9Rt7sdUtv323TzEVGP0', monthlyPriceId: 'price_1Ua7A9Rt7sdUtv32VFRLklhe' },
  { id: 'volume', name: 'Volume / Commercial', pics: 500, amountCents: 2000, oneTimePriceId: 'price_1Ua7AARt7sdUtv32HBa7v8P8', monthlyPriceId: 'price_1Ua7AARt7sdUtv32UorSxlIw', audience: 'For commercial real estate, brokerages and independent marketing companies who resell staging to their clients.' },
] as const;

// Auto-pay starts checked, same as the original pricing matrix.
export const AUTO_PAY_DEFAULT = true;

// Buyer-paid Stripe processing fee added to every checkout ($0.35).
export const PROCESSING_FEE_CENTS = 35;
export const PROCESSING_FEE_PRICE_ID = 'price_1UVMCPRt7sdUtv327AYd6lxB';

// Referrers earn half the package price (processing fee excluded), held 30 days, paid weekly.
export const REFERRAL_SHARE = 0.5;
export const REFERRAL_HOLD_DAYS = 30;
export function referralCommissionCents(packageCents: number): number {
  return Math.round(Math.max(0, packageCents) * REFERRAL_SHARE);
}

export function findStagingPackage(id: string): StagingPackage | undefined {
  return stagingPackages.find(p => p.id === id);
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export const REFERRAL_CODE_PATTERN = /^BT-[A-Z0-9]{8}$/;
export function normalizeReferralCode(value: string | null | undefined): string | null {
  const code = (value ?? '').trim().toUpperCase();
  return REFERRAL_CODE_PATTERN.test(code) ? code : null;
}
