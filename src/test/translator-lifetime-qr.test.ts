import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { translatorCopy } from '@/lib/translator-copy';
import type { UILocale } from '@/lib/ui-copy';

const SOURCE = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');
const locales: UILocale[] = ['en', 'es', 'zh', 'de', 'tl', 'ja'];

describe('Lifetime Free QR wording', () => {
  it('uses the owner wording in English', () => {
    expect(translatorCopy.en.lifetimeQr).toBe(
      'This is your lifetime Free QR code that allows you to speak to someone instantly',
    );
  });

  it.each(locales)('%s states the lifetime free QR line in its own language', (locale) => {
    expect(translatorCopy[locale].lifetimeQr.length).toBeGreaterThanOrEqual(8);
    if (locale !== 'en') expect(translatorCopy[locale].lifetimeQr).not.toBe(translatorCopy.en.lifetimeQr);
  });

  it('renders the line outside and directly above the QR box', () => {
    const section = SOURCE.indexOf('data-qr-primary');
    const line = SOURCE.indexOf('data-lifetime-qr');
    const box = SOURCE.indexOf('<div', line);
    expect(section).toBeGreaterThan(-1);
    expect(line).toBeGreaterThan(section);
    expect(box).toBeGreaterThan(-1);
    expect(SOURCE).toContain('{c.lifetimeQr}');
    // The wording must sit outside the box markup, not inside it.
    expect(SOURCE.indexOf('</p>', line)).toBeLessThan(box);
    expect(SOURCE.indexOf('border-dashed', box)).toBeGreaterThan(box);
  });
});
