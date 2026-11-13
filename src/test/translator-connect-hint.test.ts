import { describe, expect, it } from 'vitest';
import { travelUtilityCopy } from '@/lib/travel-utility-copy';

const LOCALES = ['en', 'es', 'tl', 'zh', 'de', 'ja'] as const;

describe('Personal Translator connect hint', () => {
  it('carries the owner wording in English', () => {
    expect(travelUtilityCopy.en.connectHint).toBe(
      'Save this QR code or show this screen to connect with someone instantly!',
    );
  });

  it('is present as a distinct native string in every hand-written locale', () => {
    const seen = new Set<string>();
    for (const locale of LOCALES) {
      const value = travelUtilityCopy[locale].connectHint;
      expect(value.trim().length).toBeGreaterThan(0);
      seen.add(value);
    }
    expect(seen.size).toBe(LOCALES.length);
  });

  it('never duplicates the free-for-all-levels line', () => {
    for (const locale of LOCALES) {
      expect(travelUtilityCopy[locale].connectHint).not.toBe(travelUtilityCopy[locale].free);
    }
  });

  it('carries the owner share-link wording in English', () => {
    expect(travelUtilityCopy.en.shareHint).toBe(
      'or share or email this unique link to speak to someone instantly!',
    );
  });

  it('is present as a distinct native share string in every hand-written locale', () => {
    const seen = new Set<string>();
    for (const locale of LOCALES) {
      const value = travelUtilityCopy[locale].shareHint;
      expect(value.trim().length).toBeGreaterThan(0);
      seen.add(value);
    }
    expect(seen.size).toBe(LOCALES.length);
  });

  it('never duplicates the QR-screen hint line', () => {
    for (const locale of LOCALES) {
      expect(travelUtilityCopy[locale].shareHint).not.toBe(travelUtilityCopy[locale].connectHint);
    }
  });
});
