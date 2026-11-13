import { describe, expect, it } from 'vitest';
import { canPayQrReferral, QR_RECIPIENT_PASS_DAYS, QR_REFERRAL_SHARE, showQrEarnings } from '@/lib/qr-sharing-policy';

describe('QR referral rules', () => {
  it('uses a fifty percent share', () => expect(QR_REFERRAL_SHARE).toBe(0.5));
  it('offers recipients seven days', () => expect(QR_RECIPIENT_PASS_DAYS).toBe(7));
  it('excludes public business QRs from earning presentation', () => {
    expect(showQrEarnings('business')).toBe(false);
    expect(showQrEarnings('sharing')).toBe(true);
  });
  it('cannot pay unverified QR owners', () => expect(canPayQrReferral({ ownerVerified: false, stripePayoutsEnabled: true, purchasePaid: true })).toBe(false));
  it('cannot pay until Stripe payouts are enabled', () => expect(canPayQrReferral({ ownerVerified: true, stripePayoutsEnabled: false, purchasePaid: true })).toBe(false));
  it('cannot earn from unpaid passes', () => expect(canPayQrReferral({ ownerVerified: true, stripePayoutsEnabled: true, purchasePaid: false })).toBe(false));
  it('requires all three verified conditions', () => expect(canPayQrReferral({ ownerVerified: true, stripePayoutsEnabled: true, purchasePaid: true })).toBe(true));
});