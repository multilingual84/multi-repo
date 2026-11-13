import { expect, it } from 'vitest';
import { affiliatePreviewLink, AFFILIATE_PASS_DURATION_MS } from '@/lib/affiliate-preview';

it('offers a one-week pass duration', () => {
  expect(AFFILIATE_PASS_DURATION_MS).toBe(7 * 24 * 60 * 60 * 1000);
});

it('preserves the unique affiliate identity in a same-origin free-pass link', () => {
  expect(affiliatePreviewLink('https://example.com', 'affiliate-123')).toBe('https://example.com/#trial-affiliate-affiliate-123');
  expect(affiliatePreviewLink('https://example.com', 'affiliate-456')).not.toBe(affiliatePreviewLink('https://example.com', 'affiliate-123'));
});import { makePartnerCode, isPartnerCode, affiliatePreviewLink as apl } from '@/lib/affiliate-preview';
import { normalizeReferral } from '@/lib/translation-state';
describe('partner codes', () => {
  it('formats ML-XXXX-XXXX', () => expect(isPartnerCode(makePartnerCode(new Uint8Array([1,2,3,4,5,6,7,8])))).toBe(true));
  it('puts the code in the shared link so purchases credit the sharer', () => expect(apl('https://x', 'id', 'ML-ABCD-EFGH')).toBe('https://x/?ref=ML-ABCD-EFGH#trial-affiliate-id'));
  it('code survives referral normalization', () => expect(normalizeReferral('ML-ABCD-EFGH')).toBe('ML-ABCD-EFGH'));
});
