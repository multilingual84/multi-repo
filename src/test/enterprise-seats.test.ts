import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { paidPackages } from '@/lib/pricing';
import { formatSeats, seatCopy } from '@/lib/seat-copy';
import { uiCopy } from '@/lib/ui-copy';

const LOCALES = ['en', 'es', 'tl', 'zh', 'de', 'ja'] as const;

describe('Enterprise Global Tier — 1500 seats everywhere', () => {
  it('the shared pricing module fixes the Enterprise Global Tier at 1500 seats', () => {
    const enterprise = paidPackages.find((p) => p.id === 'enterprise');
    expect(enterprise).toBeDefined();
    expect(enterprise!.price).toBe(199);
    expect(enterprise!.seats).toBe(1500);
  });

  it.each(LOCALES)('formatSeats renders the 1500-seat limit in %s', (locale) => {
    const rendered = formatSeats(locale, 1500);
    expect(rendered).toContain('1500');
    expect(rendered).toContain(seatCopy[locale].many.replace('{count}', '').trim());
    expect(rendered).not.toMatch(/unlimited|ilimitados|walang limitasyon|无限|unbegrenzt|無制限/i);
  });

  it('the pricing card and the checkout summary both render seats from the same source', () => {
    const source = readFileSync(resolve(__dirname, '../components/MultiLingualOKCSystem.tsx'), 'utf8');
    // Pricing card seat line.
    expect(source).toContain('formatSeats(globalLocale, p.seats)');
    // Checkout summary (aside) seat line shown before purchase.
    expect(source).toContain('formatSeats(globalLocale, selectedPackage.seats)');
  });

  it('every locale has a seat unit so the 1500-seat line is translatable', () => {
    for (const locale of LOCALES) {
      expect(seatCopy[locale].many.length).toBeGreaterThan(0);
      expect(uiCopy[locale].packs[4]).toBeTruthy(); // Enterprise Global Tier name exists in every locale
    }
  });
});
