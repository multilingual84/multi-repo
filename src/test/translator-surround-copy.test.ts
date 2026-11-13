import { describe, expect, it } from 'vitest';
import { translatorCopy } from '@/lib/translator-copy';
import { uiCopy, type UILocale } from '@/lib/ui-copy';

const locales: UILocale[] = ['en', 'es', 'zh', 'de', 'tl', 'ja'];

describe('Camera surroundings wording', () => {
  it('uses the owner wording in English', () => {
    expect(translatorCopy.en.surround).toBe(
      '📷 For Places of Worship, Retail Stores, Airport Lobbies, and Taxi Drivers — print and place it in front of your customer to speak with them instantly!',
    );
  });

  it.each(locales)('%s has a native surroundings line', (locale) => {
    expect(translatorCopy[locale].surround.startsWith('📷')).toBe(true);
    expect(translatorCopy[locale].surround.length).toBeGreaterThan(20);
  });
});

describe('Car Dealerships box removed', () => {
  it.each(locales)('%s audience cards have no car dealership entry', (locale) => {
    expect(uiCopy[locale].audiences.some((a) => a.title.includes('🚗'))).toBe(false);
  });
});
