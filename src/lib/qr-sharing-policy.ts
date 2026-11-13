export type QrPurpose = 'sharing' | 'business';
export const QR_REFERRAL_SHARE = 0.5;
export const QR_RECIPIENT_PASS_DAYS = 7;

export function showQrEarnings(purpose: QrPurpose) {
  return purpose === 'sharing';
}

// Presentation never establishes QR ownership, Stripe onboarding or a reward.
export function canPayQrReferral(input: { ownerVerified: boolean; stripePayoutsEnabled: boolean; purchasePaid: boolean }) {
  return input.ownerVerified && input.stripePayoutsEnabled && input.purchasePaid;
}