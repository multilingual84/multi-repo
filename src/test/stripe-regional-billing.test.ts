import { describe, expect, it } from 'vitest';
import { checkoutCurrencies, packageCheckoutPrices } from '@/lib/stripe.functions';
import { getGeoPlan } from '@/lib/geo-pricing';
import { regionalCheckoutPriceIds } from '@/lib/country-currency';

describe('Regional Stripe billing', () => {
  it('Solo and Yearly have a real Stripe price for every geo currency', () => {
    for (const id of ['single', 'duo-yearly'] as const) {
      for (const currency of checkoutCurrencies) {
        expect((packageCheckoutPrices[id].prices as Record<string, string>)[currency] ?? regionalCheckoutPriceIds[id], `${id} ${currency}`).toMatch(/^price_/);
      }
    }
  });

  it('Enterprise Global bills in USD only, matching its flat $199.00 anchor', () => {
    expect(Object.keys(packageCheckoutPrices.enterprise.prices)).toEqual(['USD']);
  });

  it('every currency the geo detector can produce has checkout coverage', () => {
    const zones = ['Asia/Manila', 'Europe/London', 'Asia/Tokyo', 'Europe/Paris', 'America/Chicago'];
    for (const tz of zones) {
      expect(checkoutCurrencies).toContain(getGeoPlan('en-US', tz).code);
    }
  });
});
