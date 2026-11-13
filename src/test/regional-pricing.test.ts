import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { bannerTaglineCopy } from '@/lib/banner-copy';
import type { UILocale } from '@/lib/ui-copy';

const LOCALES: UILocale[] = ['en', 'es', 'tl', 'zh', 'de', 'ja'];

describe('Banner tagline localization', () => {
  it('every native locale has a tagline naming Bricktown Software Systems', () => {
    for (const locale of LOCALES) {
      expect(bannerTaglineCopy[locale]).toContain('BRICKTOWN SOFTWARE SYSTEMS');
    }
  });

  it('the header renders the localized tagline text next to the wordmark', () => {
    const source = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');
    expect(source).toContain('data-banner-tagline');
    expect(source).toContain('bannerTaglineCopy[globalLocale]');
    expect(source).toContain('ml-banner-wordmark.png');
  });
});

describe('Country-sensitive pricing display', () => {
  it('the pricing cards and summary render the locale currency, not raw USD', () => {
    const source = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');
    // The total now has its own fee-inclusive formatter, tested with exact amounts.
    const uses = source.split('formatRegionalPrice(').length - 1;
    expect(uses).toBeGreaterThanOrEqual(3);
    expect(source).not.toContain('${p.price.toFixed(2)}');
    expect(source).not.toContain('${selectedPackage.price.toFixed(2)}');
    expect(source).not.toContain('${currency.symbol}${currency.single.toFixed(2)}');
  });

  it('Mexican pesos never render with a bare "$" that reads as US dollars', () => {
    const source = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');
    expect(source).toContain("currency.code === 'MXN' ? formatted.replace('$', 'MX$')");
    expect(source).toContain("style: 'currency', currency: currency.code");
  });

  it('every package id maps to a regional currency key', () => {
    const source = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');
    for (const mapping of ["single: 'single'", "team: 'team'", "hub: 'hub'", "'duo-yearly': 'duo'", "community: 'community'", "enterprise: 'annual'"]) {
      expect(source).toContain(mapping);
    }
  });
});
