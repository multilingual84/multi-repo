import { describe, expect, it } from 'vitest';
import { stagingPackages, AUTO_PAY_DEFAULT, referralCommissionCents, findStagingPackage, normalizeReferralCode } from '@/lib/staging/pricing';

describe('staging packages', () => {
  it('sells $0.99 for 5, $5 for 50, $10 for 150 and $20 for 500 pictures', () => {
    expect(stagingPackages.map(p => [p.amountCents, p.pics])).toEqual([[99, 5], [500, 50], [1000, 150], [2000, 500]]);
  });
  it('frames the $20 pack for volume and commercial resellers', () => {
    expect(findStagingPackage('volume')?.audience).toMatch(/commercial/i);
  });
  it('starts with auto-pay checked', () => {
    expect(AUTO_PAY_DEFAULT).toBe(true);
  });
  it('pays referrers half the package price, excluding the processing fee', () => {
    expect(referralCommissionCents(99)).toBe(50);
    expect(referralCommissionCents(2000)).toBe(1000);
  });
  it('only accepts well-formed referral codes', () => {
    expect(normalizeReferralCode('bt-ab12cd34')).toBe('BT-AB12CD34');
    expect(normalizeReferralCode('ML-123')).toBeNull();
  });
});
