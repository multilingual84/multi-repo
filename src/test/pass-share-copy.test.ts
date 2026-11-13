import { describe, it, expect } from 'vitest';
import { passShareCopy } from '@/lib/pass-share-copy';
import { uiCopy } from '@/lib/ui-copy';

const locales = ['en', 'es', 'zh', 'de', 'tl', 'ja'] as const;

describe('pass share copy', () => {
  it('pins the exact English share wording', () => {
    expect(passShareCopy.en.share).toBe('Share pass');
    expect(passShareCopy.en.shareText).toContain('free 7-day all-access Multi-Lingual™ pass');
    expect(passShareCopy.en.shareText).toContain('no sign-ups, no credit card');
  });

  it('has a distinct native string in every hand-written locale', () => {
    for (const locale of locales.filter((l) => l !== 'en')) {
      const copy = passShareCopy[locale];
      expect(copy.share.length).toBeGreaterThan(0);
      expect(copy.shareText.length).toBeGreaterThan(0);
      expect(copy.share).not.toBe(passShareCopy.en.share);
      expect(copy.shareText).not.toBe(passShareCopy.en.shareText);
    }
  });

  it('references the pass title used by the share payload in every locale', () => {
    for (const locale of locales) {
      expect(uiCopy[locale].trialTitle.length).toBeGreaterThan(0);
    }
  });
});
