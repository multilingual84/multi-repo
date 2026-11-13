import { describe, expect, it } from 'vitest';
import { translatorCopy } from '@/lib/translator-copy';

describe('talk banner', () => {
  it('reads "Talk to me in any language" in English', () => {
    expect(translatorCopy.en.talk).toBe('🗣️ Talk to me in any language');
  });
  it('is translated in every native locale', () => {
    for (const [locale, copy] of Object.entries(translatorCopy)) {
      if (locale === 'en') continue;
      expect(copy.talk).not.toBe(translatorCopy.en.talk);
    }
  });
});
