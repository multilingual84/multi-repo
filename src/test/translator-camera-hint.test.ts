import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { translatorCopy } from '@/lib/translator-copy';

const LOCALES = ['en', 'es', 'zh', 'de', 'tl', 'ja'] as const;
const componentSource = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');

describe('camera hint line', () => {
  it('carries the requested wording in English', () => {
    expect(translatorCopy.en.cameraHint).toBe(
      'Open Camera to scan QR codes or to translate surroundings, documents, upload photos of files you want to translate. FREE FOR LIFE!',
    );
  });

  // The owner's line closes with the free-for-life promise; each locale carries
  // it in its own words, matching the site's existing free-for-life labels.
  const freeForLife: Record<(typeof LOCALES)[number], string> = {
    en: 'FREE FOR LIFE!',
    es: '¡GRATIS DE POR VIDA!',
    tl: 'LIBRE HABAMBUHAY!',
    zh: '终身免费！',
    de: 'LEBENSLANG KOSTENLOS!',
    ja: '生涯無料！',
  };

  it('closes with the free-for-life promise in every native locale', () => {
    for (const locale of LOCALES) {
      expect(translatorCopy[locale].cameraHint.trim().endsWith(freeForLife[locale])).toBe(true);
    }
  });

  it('is present in every native locale', () => {
    for (const locale of LOCALES) {
      expect(translatorCopy[locale].cameraHint.trim().length).toBeGreaterThan(10);
    }
  });

  it('renders inside the QR box, before the camera buttons', () => {
    const box = componentSource.indexOf('border-dashed border-primary');
    const hint = componentSource.indexOf('data-camera-hint');
    const openButton = componentSource.indexOf('{c.camera}');
    const boxClose = componentSource.indexOf('data-share-hint');
    expect(box).toBeGreaterThan(-1);
    expect(hint).toBeGreaterThan(box);
    expect(openButton).toBeGreaterThan(hint);
    expect(boxClose).toBeGreaterThan(openButton);
  });

  it('renders exactly once', () => {
    expect(componentSource.match(/data-camera-hint/g)).toHaveLength(1);
  });
});
