import { expect, it } from 'vitest';
import { includesPersonalTranslator, packageDurationDays } from '@/lib/package-duration';

it('identifies the five non-yearly packages as 30-day access', () => {
  for (const id of ['single', 'team', 'hub', 'community', 'enterprise']) expect(packageDurationDays(id)).toBe(30);
});
it('preserves the Yearly Duo duration', () => { expect(packageDurationDays('duo-yearly')).toBe(365); });
it('includes Personal Translator in the existing Solo pack, not a separate yearly pack', () => {
  expect(includesPersonalTranslator('single')).toBe(true);
  expect(includesPersonalTranslator('personal-translator-annual')).toBe(false);
});