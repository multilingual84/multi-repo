import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { travelUtilityCopy } from '@/lib/travel-utility-copy';

const LOCALES = ['en', 'es', 'tl', 'zh', 'de', 'ja'] as const;
const src = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');

describe('Instant share copy button', () => {
  it('offers a copy control in every native locale', () => {
    for (const locale of LOCALES) {
      const c = travelUtilityCopy[locale];
      expect(c.copyLink.trim().length).toBeGreaterThan(0);
      expect(c.linkCopied.trim().length).toBeGreaterThan(0);
      expect(c.copyLink).not.toBe(c.shareHint);
      expect(c.linkCopied).not.toBe(c.shareHint);
    }
  });

  it('renders one link block with a copy button under the share hint', () => {
    expect(src.match(/data-share-link/g)?.length).toBe(1);
    const idxShare = src.indexOf('data-share-hint');
    const idxLink = src.indexOf('data-share-link');
    expect(idxShare).toBeGreaterThan(-1);
    expect(idxLink).toBeGreaterThan(idxShare);
    expect(src.includes('copyPassLink')).toBe(true);
    for (const locale of LOCALES) {
      expect(src.includes(`travelUtilityCopy[locale].copyLink`)).toBe(true);
    }
  });

  it('copies the exact address the printed code encodes', () => {
    // One shared constant feeds both the code image and the clipboard write.
    expect(src.includes('const passLink=`${window.location.origin}/#travel-pass`;')).toBe(true);
    expect(src.includes('m.toDataURL(passLink')).toBe(true);
    expect(src.includes('navigator.clipboard.writeText(passLink)')).toBe(true);
    expect(src.includes('/#travel-pass`,{width:224')).toBe(false);
  });
});
