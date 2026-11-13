export const PARTNER_HOLD_DAYS = 30;
export const TIER_NAMES = new Set(['solo', 'yearly', 'team', 'hub', 'community', 'enterprise_global']);
export function commissionEligibleAt(paidAt: number) {
  if (!Number.isSafeInteger(paidAt) || paidAt <= 0) throw new Error('Missing verified payment date');
  return new Date((paidAt + PARTNER_HOLD_DAYS * 86400) * 1000).toISOString();
}
export function tierCommissionMinor(tier: string, purpose: string | undefined, paidMinor: number) {
  if (!TIER_NAMES.has(tier) || purpose === 'premium_voice_credit') return 0;
  if (!Number.isSafeInteger(paidMinor) || paidMinor <= 0) return 0;
  return Math.round(paidMinor * 0.5);
}
export function remainingCommission(share: number, chargeAmount: number, refunded: number, disputed: boolean) {
  if (disputed || chargeAmount <= 0) return 0;
  return Math.max(0, Math.round(share * (1 - Math.min(chargeAmount, Math.max(0, refunded)) / chargeAmount)));
}