import { describe, it, expect } from 'vitest';
import { currencyForCountry, localStripeAmount, formatLocal, referralLink, countryFromLanguage } from '@/lib/staging/local-pricing';
import { currencyPlans } from '@/lib/country-currency';

describe('staging country-aware prices', () => {
  it('US stays $0.99 for the starter pack', () => {
    expect(formatLocal(99, currencyForCountry('us'))).toBe('$0.99');
    expect(localStripeAmount(99, currencyForCountry('us'))).toBe(99);
  });
  it('Japan bills yen in whole units matching the display', () => {
    const jpy = currencyForCountry('jp');
    expect(jpy.code).toBe('JPY');
    const expected = Math.round(0.99 * currencyPlans['JPY']!.factor);
    expect(localStripeAmount(99, jpy)).toBe(expected * currencyPlans['JPY']!.minorFactor);
  });
  it('Germany bills euros', () => expect(currencyForCountry('de').code).toBe('EUR'));
  it('unknown country falls back to USD', () => expect(currencyForCountry('zz').code).toBe('USD'));
  it('reads the region from the device language', () => expect(countryFromLanguage('en-GB')).toBe('gb'));
  it('referral QR opens the live site', () => expect(referralLink('BT-ABCDEFGH')).toBe('https://multi-lingual.tech/?ref=BT-ABCDEFGH'));
});
