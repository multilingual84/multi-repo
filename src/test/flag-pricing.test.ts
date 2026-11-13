import { describe, expect, it } from 'vitest';
import { formatFlagPackagePrice, getFlagPricePlan } from '@/lib/flag-pricing';
import { getGeoPlan, formatGeoPrice } from '@/lib/geo-pricing';
import { paidPackages, stripeFixedProcessingFee } from '@/lib/pricing';
import { ALL_FLAGS } from '@/lib/flag-catalog';
import { countryCurrencies, canCheckoutCurrency, billingCurrencyFor, currencyPlans } from '@/lib/country-currency';

describe('Flag-selected prices', () => {
  const expectations = [
    ['tl', ['₱50.00', '₱200.00', '₱400.00', '₱500.00', '₱1,000.00', '$199.00'], '+₱17.50'],
    ['es', ['MX$19.00', 'MX$79.00', 'MX$159.00', 'MX$199.00', 'MX$399.00', '$199.00'], '+MX$7.00'],
    ['es-ES', ['€0.99', '€3.99', '€7.99', '€9.99', '€19.99', '$199.00'], '+€0.35'],
    ['en', ['$0.99', '$3.99', '$7.99', '$9.99', '$19.99', '$199.00'], '+$0.35'],
  ] as const;
  for (const [lang, amounts, fee] of expectations) {
    paidPackages.forEach((pkg, index) => {
      it(`${lang} ${pkg.id} uses the specified amount`, () => {
        expect(formatFlagPackagePrice(pkg.id, pkg.price, getFlagPricePlan(lang))).toBe(amounts[index]);
      });
    });
    it(`${lang} processing fee matches the flag`, () => {
      expect('+' + formatGeoPrice(stripeFixedProcessingFee, getFlagPricePlan(lang))).toBe(fee);
    });
  }
  for (const lang of ['de', 'fr', 'it', 'gt:fr', 'es-ES']) {
    it(`${lang} uses EUR even on a Philippine device`, () => {
      expect(getFlagPricePlan(lang, getGeoPlan('fil-PH', 'Asia/Manila')).code).toBe('EUR');
    });
  }
  for (const lang of ['fil', 'PHP', 'tl-PH']) {
    it(`${lang} uses PHP`, () => expect(getFlagPricePlan(lang).code).toBe('PHP'));
  }
  for (const country of ['mx', 'co', 'ar', 'cl', 'pe', 've', 'ec', 'gt', 'cu', 'bo', 'do', 'hn', 'py', 'sv', 'ni', 'cr', 'pa', 'uy', 'pr']) {
    it(`${country} Spanish uses Mexican peso parity instead of euros`, () => {
      const plan = getFlagPricePlan('es', getGeoPlan('de-DE', 'Europe/Berlin'), country);
      expect(plan.code).toBe(countryCurrencies[country]);
      expect(plan.code).not.toBe('EUR');
    });
  }
  it('Spain country wins over a shared Spanish language and device region', () => {
    expect(getFlagPricePlan('es', getGeoPlan('fil-PH', 'Asia/Manila'), 'es').code).toBe('EUR');
  });
  it('Canadian English uses local Canadian dollars instead of USD', () => {
    expect(getFlagPricePlan('en', null, 'ca').code).toBe('CAD');
  });
  it('China overrides a US device and uses converted yuan prices', () => {
    const plan = getFlagPricePlan('zh-CN', getGeoPlan('en-US', 'America/Chicago'), 'cn');
    expect(plan.code).toBe('CNY');
    expect(formatFlagPackagePrice('single', .99, plan)).toBe('¥6.62');
    expect(formatFlagPackagePrice('team', 3.99, plan)).toBe('¥26.69');
  });
  for (const flag of ALL_FLAGS) {
    it(`${flag.country} ${flag.lang} uses its actual country currency`, () => {
      const plan = getFlagPricePlan(flag.lang, null, flag.country);
      expect(plan.code).toBe(countryCurrencies[flag.country]);
      expect(plan.factor).toBeGreaterThan(0);
    });
  }
  it('unsupported billing is unavailable, never silently USD', () => {
    expect(canCheckoutCurrency('single', 'IRR')).toBe(false);
    expect(() => billingCurrencyFor('single', 'IRR')).toThrow();
    expect(() => billingCurrencyFor('single', 'UNKNOWN')).toThrow();
    expect(billingCurrencyFor('enterprise', 'CNY')).toBe('USD');
  });
  it('China local checkout is supported', () => expect(currencyPlans['CNY']?.supported).toBe(true));
});