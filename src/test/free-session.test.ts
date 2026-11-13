import { describe, expect, it } from 'vitest';
import { isLiveChannelOpen, type FreeSessionState } from '@/lib/free-session';
import { paidPackages, stripeFixedProcessingFee } from '@/lib/pricing';
import { translatorCopy } from '@/lib/translator-copy';
import type { UILocale } from '@/lib/ui-copy';

const locales: UILocale[] = ['en', 'es', 'zh', 'de', 'tl', 'ja'];
const state = (over: Partial<FreeSessionState>): FreeSessionState => ({
  userId: 'u', trialExpiresAt: null, isSubscriptionActive: false, freeLifetimeActivated: false, ...over,
});

describe('Free lifetime tier filters', () => {
  it('keeps live channels open during the 7-day trial', () => {
    const now = new Date('2026-10-20T00:00:00Z');
    expect(isLiveChannelOpen(state({ trialExpiresAt: '2026-10-25T00:00:00Z' }), now)).toBe(true);
  });
  it('blocks live channels once the trial expires with no package', () => {
    const now = new Date('2026-10-20T00:00:00Z');
    expect(isLiveChannelOpen(state({ trialExpiresAt: '2026-10-10T00:00:00Z' }), now)).toBe(false);
  });
  it('keeps live channels open for active packages and free-lifetime members', () => {
    const now = new Date('2026-10-20T00:00:00Z');
    expect(isLiveChannelOpen(state({ trialExpiresAt: '2026-10-10T00:00:00Z', isSubscriptionActive: true }), now)).toBe(true);
    expect(isLiveChannelOpen(state({ trialExpiresAt: '2026-10-10T00:00:00Z', freeLifetimeActivated: true }), now)).toBe(true);
  });
  it('treats a first visit with no row as inside the trial', () => {
    expect(isLiveChannelOpen(null)).toBe(true);
  });
});

describe('Pay-as-you-go checkout', () => {
  it('hardcodes the six 1-time tiers from $0.99 to $199.00', () => {
    expect(paidPackages.map((p) => p.price)).toEqual([0.99, 3.99, 7.99, 9.99, 19.99, 199]);
  });
  it('passes through a static $0.35 processing fee', () => {
    expect(stripeFixedProcessingFee).toBe(0.35);
    expect(Math.round((paidPackages[0].price + stripeFixedProcessingFee) * 100)).toBe(134);
  });
});

describe('Talk banner and OCR copy', () => {
  it.each(locales)('%s has talk, gating, and on-device recognition lines', (locale) => {
    const c = translatorCopy[locale];
    expect(c.talk).toContain('🗣️');
    expect(c.trialEnded.length).toBeGreaterThan(20);
    expect(c.recognized.length).toBeGreaterThan(5);
    expect(c.talkLive.length).toBeGreaterThan(10);
    expect(c.talkEnd.length).toBeGreaterThan(10);
  });
});
