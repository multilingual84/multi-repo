import { describe, expect, it } from 'vitest';
import { affiliateCopy } from '@/lib/affiliate-copy';
import { couponCopy } from '@/lib/affiliate-coupon-copy';
import type { UILocale } from '@/lib/ui-copy';

// The owner-worded offer: the one-week pass is free for everyone with no code,
// a code user gets that week plus 30 extra days, and the sharer earns 50%.
const LOCALES: UILocale[] = ['en', 'es', 'zh', 'de', 'tl', 'ja'];

// Each locale must spell out that no code is needed for the free week.
const NO_CODE_TERMS: Record<UILocale, string> = {
  en: 'no code',
  es: 'sin código',
  zh: '无需代码',
  de: 'kein Code',
  tl: 'walang code',
  ja: 'コードは不要',
};

describe('affiliate QR offer wording', () => {
  it('uses the owner wording in English', () => {
    expect(affiliateCopy.en.offer).toBe(
      'Share this unique QR code or link: the one-week (7-day) free pass is free for everyone — no code needed. Whoever uses your code gets 1 week free plus an additional 30 days, and you earn 50% when they purchase.'
    );
  });

  it('mentions the free week, the extra 30 days and the 50% split in every locale', () => {
    for (const locale of LOCALES) {
      const offer = affiliateCopy[locale].offer;
      expect(offer).toContain('7');
      expect(offer).toContain('30');
      expect(offer).toContain('50%');
    }
  });

  it('says the free week needs no code in every locale', () => {
    for (const locale of LOCALES) {
      expect(affiliateCopy[locale].offer).toContain(NO_CODE_TERMS[locale]);
    }
  });
});

describe('affiliate coupon offer wording', () => {
  it('uses the owner wording in English', () => {
    expect(couponCopy.en.offer).toBe(
      'The 1-week free pass is free for everyone — no code needed. Share your code: whoever uses it gets 1 week free no matter what, plus an additional 30 days for using your code. Free month on us, and you earn 50% when they purchase!'
    );
  });

  it('promises the code user the free week plus 30 extra days in every locale', () => {
    for (const locale of LOCALES) {
      const copy = couponCopy[locale];
      expect(copy.offer).toContain('1');
      expect(copy.offer).toContain('30');
      expect(copy.offer).toContain('50%');
      expect(copy.offer).toContain(NO_CODE_TERMS[locale]);
      expect(copy.recipientOffer).toContain('30');
    }
  });
});
