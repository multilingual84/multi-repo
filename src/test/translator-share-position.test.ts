import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { travelUtilityCopy } from '@/lib/travel-utility-copy';

const LOCALES = ['en', 'es', 'tl', 'zh', 'de', 'ja'] as const;

const src = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');

describe('Share-link hint placement', () => {
  it('renders the share hint once, under the Open camera button', () => {
    expect(src.match(/data-share-hint/g)?.length).toBe(1);
    const idxCamera = src.indexOf('{c.camera}');
    const idxShare = src.indexOf('data-share-hint');
    expect(idxCamera).toBeGreaterThan(-1);
    expect(idxShare).toBeGreaterThan(idxCamera);
  });

  it('sits above the recipient phone number field', () => {
    const idxShare = src.indexOf('data-share-hint');
    const idxPhone = src.indexOf('c.phone}');
    expect(idxPhone).toBeGreaterThan(idxShare);
  });

  it('is no longer part of the free/connect block above the mic', () => {
    const idxFree = src.indexOf('travelUtilityCopy[locale].free}');
    const idxShare = src.indexOf('data-share-hint');
    expect(idxFree).toBeLessThan(idxShare);
    expect(idxFree).toBeGreaterThan(-1);
  });

  it('mentions email as an option in every native locale', () => {
    for (const locale of LOCALES) {
      const value = travelUtilityCopy[locale].shareHint.toLowerCase();
      expect(value.includes('email') || value.includes('e-mail') || value.includes('correo') || value.includes('i-email') || value.includes('メール') || value.includes('电子邮件')).toBe(true);
    }
  });
});
