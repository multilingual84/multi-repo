import { describe, it, expect } from 'vitest';
import { FREE_DAILY_MINUTES, ALLOWANCE_WINDOW_HOURS, PAYWALL_USD, hitsPaywall, isFreeForLife } from '@/lib/free-allowance-policy';
describe('free allowance', () => {
  it('gives 30 minutes', () => expect(FREE_DAILY_MINUTES).toBe(30));
  it('resets every 24 hours', () => expect(ALLOWANCE_WINDOW_HOURS).toBe(24));
  it('paywall is $0.99', () => expect(PAYWALL_USD).toBe(0.99));
  it('blocks free users at 30 minutes', () => { expect(hitsPaywall(false, 29 * 60000)).toBe(false); expect(hitsPaywall(false, 30 * 60000)).toBe(true); });
  it('never blocks paid users', () => expect(hitsPaywall(true, 999 * 60000)).toBe(false));
  it('keeps messaging and two-phone free for life', () => { expect(isFreeForLife('messaging')).toBe(true); expect(isFreeForLife('two-phone')).toBe(true); expect(isFreeForLife('video')).toBe(false); });
});
import { currentUsage } from '@/lib/free-allowance-policy';
describe('daily reset', () => {
  it('keeps usage inside 24 hours', () => expect(currentUsage({ windowStart: 0, usedMs: 5 }, 23 * 3600000).usedMs).toBe(5));
  it('resets after 24 hours', () => expect(currentUsage({ windowStart: 0, usedMs: 5 }, 24 * 3600000).usedMs).toBe(0));
});

import { FREE_DAILY_SECONDS } from '@/lib/free-allowance-policy';
describe('server daily allowance', () => {
  it('shares the 30 minute limit in seconds', () => expect(FREE_DAILY_SECONDS).toBe(1800));
});
