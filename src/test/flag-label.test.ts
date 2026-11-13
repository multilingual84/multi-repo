import { describe, expect, it } from 'vitest';
import { ALL_FLAGS } from '@/lib/flag-catalog';
import { localizedFlagLabel } from '@/lib/flag-label';

describe('Localized flag selection identity', () => {
  for (const locale of ['en', 'es', 'zh', 'de', 'tl', 'ja']) {
    it(`${locale} names preserve all original country and language choices`, () => {
      const entries = ALL_FLAGS.map(flag => ({ ...flag, label: localizedFlagLabel(flag, locale) }));
      expect(entries.map(flag => [flag.country, flag.lang])).toEqual(ALL_FLAGS.map(flag => [flag.country, flag.lang]));
      expect(entries.every(flag => flag.label.length > 0)).toBe(true);
    });
  }
});