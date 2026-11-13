import { describe, expect, it } from 'vitest';
import { uiCopy } from '@/lib/ui-copy';
import type { UILocale } from '@/lib/ui-copy';

const LOCALES: UILocale[] = ['en', 'es', 'tl', 'zh', 'de', 'ja'];

// Each locale must keep naming both claims: signing up and paying by card.
const REQUIRED_TERMS: Record<UILocale, string[]> = {
  en: ['sign-up', 'credit card'],
  es: ['registro', 'tarjeta'],
  tl: ['sign up', 'credit card'],
  zh: ['注册', '信用卡'],
  de: ['Anmeldung', 'Kreditkarte'],
  ja: ['登録', 'クレジットカード'],
};

describe('7-Day Free Pass no sign-up / no credit card line', () => {
  it('carries the owner wording in English', () => {
    expect(uiCopy.en.trialNoSignup).toBe('No sign-ups or credit card needed');
  });

  it('names both sign-ups and cards in every hand-written locale', () => {
    for (const locale of LOCALES) {
      const value = uiCopy[locale].trialNoSignup.trim().toLowerCase();
      expect(value.length).toBeGreaterThan(0);
      for (const term of REQUIRED_TERMS[locale]) {
        expect(value).toContain(term.toLowerCase());
      }
    }
  });

  it('does not reuse the older trial body sentence', () => {
    for (const locale of LOCALES) {
      expect(uiCopy[locale].trialNoSignup).not.toBe(uiCopy[locale].trialBody);
    }
  });
});
