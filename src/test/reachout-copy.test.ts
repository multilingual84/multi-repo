import { describe, expect, it } from 'vitest';
import { reachoutCopy, reachoutLocaleNames, reachoutText } from '../lib/network/reachout-copy';

const REQUIRED_KEYS = [
  'title', 'intro', 'notice', 'sectorLabel', 'sectors', 'languageLabel', 'codeLabel', 'codeHint',
  'generate', 'generating', 'draftTitle', 'subject', 'to', 'cc', 'copyDraft', 'copied', 'error',
] as const;

// Per-locale fragment proving the draft-only, send-it-yourself notice is present.
const NOTICE_FRAGMENTS: Record<keyof typeof reachoutCopy, string> = {
  en: 'nothing is sent',
  es: 'no se envía',
  tl: 'walang ipinapadala',
  zh: '不发送',
  de: 'nichts gesendet',
  ja: '送信',
};

describe('reachout composer copy', () => {
  it('covers every locale with all fields and four sectors', () => {
    for (const locale of ['en', 'es', 'tl', 'zh', 'de', 'ja'] as const) {
      const copy = reachoutCopy[locale];
      for (const key of REQUIRED_KEYS) {
        const value = copy[key];
        expect(value, `${locale}.${key}`).toBeTruthy();
        if (key === 'sectors') {
          expect(Object.keys(value).sort(), `${locale}.sectors`).toEqual(['airport', 'general', 'retail', 'taxi']);
        }
      }
    }
    expect(Object.keys(reachoutLocaleNames)).toHaveLength(6);
  });

  it('falls back to English for unknown or translated locales', () => {
    expect(reachoutText('gt:fr').title).toBe(reachoutCopy.en.title);
    expect(reachoutText('de-AT').title).toBe(reachoutCopy.de.title);
  });

  it('keeps the draft-only notice explicit in every locale', () => {
    for (const [locale, fragment] of Object.entries(NOTICE_FRAGMENTS) as [keyof typeof reachoutCopy, string][]) {
      expect(reachoutCopy[locale].notice).toContain(fragment);
    }
  });
});
