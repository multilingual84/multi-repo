import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { FREE_DAILY_MINUTES, addUsage, allowanceCopy, currentUsage, hitsPaywall, minutesLeft, paywallCopy, resetsAt } from '@/lib/free-allowance-policy';

const SOURCE = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');

describe('One-phone translation 40-minute daily allowance', () => {
  it('meters one-phone mic time with the shared rolling allowance', () => {
    expect(SOURCE).toContain("from '@/lib/free-allowance-policy'");
    expect(SOURCE).toContain('addUsage(1000)');
    expect(SOURCE).toContain('hitsPaywall(paidRef.current');
  });

  it('stops the one-phone session when the allowance is exhausted', () => {
    expect(SOURCE).toContain('setPaywallAt(resetsAt(u));setHolding(false);');
  });

  it('shows the localized paywall copy with the reset time', () => {
    expect(SOURCE).toContain('paywallCopy[locale]');
    expect(SOURCE).toContain('pw.title');
    expect(SOURCE).toContain('pw.resets');
  });

  it('cross-checks server-side usage like the call screen', () => {
    expect(SOURCE).toContain('walletUsageFn');
    expect(SOURCE).toContain('r.usedSeconds>=r.limitSeconds');
  });

  it('enforces exactly 40 minutes per rolling 24 hours for free users', () => {
    expect(FREE_DAILY_MINUTES).toBe(40);
    const now = Date.now();
    const full = addUsage(FREE_DAILY_MINUTES * 60000, now);
    expect(minutesLeft(full.usedMs)).toBe(0);
    expect(hitsPaywall(false, full.usedMs)).toBe(true);
    expect(hitsPaywall(true, full.usedMs)).toBe(false);
    // A fresh rolling window starts clean.
    expect(currentUsage(null, now).usedMs).toBe(0);
  });

  it('has paywall wording in all six native locales', () => {
    for (const locale of ['en', 'es', 'zh', 'de', 'tl', 'ja']) {
      const pw = paywallCopy[locale];
      expect(pw).toBeDefined();
      if (!pw) return;
      expect(pw.title.length).toBeGreaterThan(4);
      expect(pw.body).toContain('40');
      expect(pw.resets.length).toBeGreaterThan(4);
    }
  });
});

describe('One-phone remaining-minutes indicator', () => {
  it('renders a localized remaining-minutes indicator with the reset time', () => {
    expect(SOURCE).toContain('data-allowance-indicator');
    expect(SOURCE).toContain('allowanceCopy[locale]');
    expect(SOURCE).toContain('minutesLeft(allowance.usedMs,bonus)');
    expect(SOURCE).toContain('resetsAt(allowance)');
  });

  it('hides the indicator for paid users', () => {
    expect(SOURCE).toContain('!paid&&allowance&&');
  });

  it('counts down from the full 40 minutes and resets after 24 hours', () => {
    localStorage.removeItem('ml-free-allowance');
    const now = Date.now();
    const fresh = currentUsage(null, now);
    expect(Math.ceil(minutesLeft(fresh.usedMs))).toBe(40);
    const used = addUsage(10 * 60000, now);
    expect(Math.ceil(minutesLeft(used.usedMs))).toBe(30);
    expect(resetsAt(used)).toBe(used.windowStart + 24 * 3600000);
  });

  it('has indicator wording in all six native locales', () => {
    for (const locale of ['en', 'es', 'zh', 'de', 'tl', 'ja']) {
      const copy = allowanceCopy[locale];
      expect(copy).toBeDefined();
      if (!copy) return;
      expect(copy.left.length).toBeGreaterThan(4);
    }
  });
});
