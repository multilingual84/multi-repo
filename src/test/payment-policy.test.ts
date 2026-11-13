import { describe, expect, it } from 'vitest';
import { isPaidCheckout, entitlementPolicy } from '@/lib/stripe/payment-policy';

describe('confirmed payment access', () => {
  it('does not activate a complete checkout that is still unpaid', () => {
    expect(isPaidCheckout({ status: 'complete', payment_status: 'unpaid' })).toBe(false);
    expect(isPaidCheckout({ status: 'complete', payment_status: 'paid' })).toBe(true);
  });
  it('keeps Solo at one seat for 30 days rather than a standalone yearly translator', () => {
    expect(entitlementPolicy('solo')).toEqual({ tier: 'solo', seats: 1, days: 30 });
  });
});