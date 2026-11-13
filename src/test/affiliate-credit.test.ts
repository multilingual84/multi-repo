import { describe, expect, it } from 'vitest';
import { affiliateCredit, affiliateCreditUsd, AFFILIATE_SHARE } from '@/routes/api/public/stripe-webhook';

describe('affiliate 50% split', () => {
  it('pays the sharer half of a paid purchase', () => {
    expect(AFFILIATE_SHARE).toBe(0.5);
    expect(affiliateCredit(399)).toBe(2);
    expect(affiliateCredit(1999)).toBe(10);
  });
  it('pays nothing when nothing was paid', () => {
    expect(affiliateCredit(0)).toBe(0);
  });
  it('converts yuan and zero-decimal yen at their billing units', () => {
    expect(affiliateCreditUsd(662, 'cny')).toBe(.49);
    expect(affiliateCreditUsd(150, 'jpy')).toBe(.5);
  });
});
