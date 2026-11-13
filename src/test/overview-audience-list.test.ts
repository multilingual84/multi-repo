import { describe, expect, it } from 'vitest';
import { travelUtilityCopy } from '@/lib/travel-utility-copy';

// The owner expanded the overview audience list from "public safety, transit,
// and trade infrastructure" to on-the-spot audiences. Each native locale must
// carry the expanded list and must not keep the old infrastructure-only phrase.

const oldFragments: Record<string, string[]> = {
  en: ['built exclusively for public safety, transit, and trade infrastructure'],
  es: ['infraestructuras de seguridad pública, transporte y comercio'],
  tl: ['imprastraktura ng kaligtasang pampubliko'],
  zh: ['公共安全、交通和贸易基础设施'],
  de: ['ausschließlich für öffentliche Sicherheit, Verkehr und Handelsinfrastruktur'],
  ja: ['公共安全、交通、貿易インフラ'],
};

describe('Overview audience list', () => {
  it('en names the on-the-spot audiences', () => {
    const overview = travelUtilityCopy.en.overview;
    expect(overview).toContain(
      'solo travelers, public safety, emergency call operators, cab and shuttle drivers',
    );
    expect(overview).toContain('airport lobby attendants');
    expect(overview).toContain('right on the spot');
  });

  it.each(Object.keys(oldFragments) as (keyof typeof travelUtilityCopy)[])(
    '%s drops the old infrastructure-only wording',
    (locale) => {
      for (const fragment of oldFragments[locale] ?? []) {
        expect(travelUtilityCopy[locale].overview).not.toContain(fragment);
      }
    },
  );

  it.each(['es', 'tl', 'zh', 'de', 'ja'] as const)('%s keeps the rollout caveat', (locale) => {
    expect(travelUtilityCopy[locale].overview).toContain('90%');
    expect(travelUtilityCopy[locale].overview).toContain('243');
  });
});
