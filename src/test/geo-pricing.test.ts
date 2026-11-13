import { describe, expect, it } from 'vitest';
import { formatGeoPrice, geoAmountFor, getGeoPlan } from '@/lib/geo-pricing';

describe('Native client-side currency filter', () => {
  it('a Manila visitor sees ₱50.00 solo, ₱500.00 duo, and a +₱10.00 fee', () => {
    const plan = getGeoPlan('en-US', 'Asia/Manila');
    expect(plan.code).toBe('PHP');
    expect(geoAmountFor('single', 0.99, plan)).toBe(50);
    expect(geoAmountFor('duo-yearly', 9.99, plan)).toBe(500);
    expect(formatGeoPrice(0.2, plan)).toBe('₱10.00');
  });

  it('detects regions from locale or time zone', () => {
    expect(getGeoPlan('en-GB', 'America/Chicago').code).toBe('GBP');
    expect(getGeoPlan('en-US', 'Europe/London').code).toBe('GBP');
    expect(getGeoPlan('en-US', 'Asia/Tokyo').code).toBe('JPY');
    expect(getGeoPlan('fr-FR', 'Europe/Paris').code).toBe('EUR');
    expect(getGeoPlan('en-US', 'America/Chicago').code).toBe('USD');
  });

  it('Tokyo renders whole yen with no decimals', () => {
    const plan = getGeoPlan('ja-JP', 'Asia/Tokyo');
    expect(formatGeoPrice(0.99, plan)).toBe('¥149');
    expect(formatGeoPrice(3.99, plan)).toBe('¥599');
  });

  it('headline tiers hit exact parity and mid tiers convert at the factor', () => {
    const plan = getGeoPlan('en-US', 'Asia/Manila');
    expect(geoAmountFor('single', 0.99, plan)).toBe(50);
    expect(geoAmountFor('duo-yearly', 9.99, plan)).toBe(500);
    for (const [id, usd] of [['team', 3.99], ['hub', 7.99], ['community', 19.99]] as const) {
      expect(geoAmountFor(id, usd, plan)).toBeCloseTo(usd * 50, 2);
    }
  });

  it('Enterprise Global never converts — it stays flat $199.00 USD worldwide', () => {
    for (const tz of ['Asia/Manila', 'Europe/London', 'Asia/Tokyo', 'Europe/Paris', 'America/Chicago']) {
      expect(geoAmountFor('enterprise', 199, getGeoPlan('en-US', tz))).toBeNull();
    }
  });
});
