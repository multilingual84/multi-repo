import { describe, expect, it, vi } from 'vitest';
import { buildFavorCampaign } from '../lib/network/favorCampaign.server';

describe('campaign draft boundaries', () => {
  it('maps the supplied token to the root-domain ref query, not an activation path', async () => {
    const result = await buildFavorCampaign({ targetId: 'ML-ABCD-1234', locale: 'en' });
    expect(result.referralUrl).toBe('https://multi-lingual.tech/?ref=ML-ABCD-1234');
  });
  it.each(['bad\r\nBcc: other', 'https://other.example', '', 'x'.repeat(65)])('rejects invalid referral input %s', async (targetId) => {
    await expect(buildFavorCampaign({ targetId, locale: 'en' })).rejects.toThrow();
  });
  it('generates drafts without network dispatch', async () => {
    const network = vi.spyOn(globalThis, 'fetch');
    try {
      const result = await buildFavorCampaign({ targetId: 'ORG_123', locale: 'es' });
      expect(result.deliveryStatus).toBe('not_sent');
      expect(network).not.toHaveBeenCalled();
    } finally { network.mockRestore(); }
  });
  it('returns fresh department arrays so one draft cannot change another', async () => {
    const first = await buildFavorCampaign({ targetId: 'A', locale: 'en' });
    first.ccDepartments.length = 0;
    const second = await buildFavorCampaign({ targetId: 'B', locale: 'en' });
    expect(second.ccDepartments).toHaveLength(11);
  });
  it('requires an explicitly supported draft locale rather than silently using English', async () => {
    await expect(buildFavorCampaign({ targetId: 'A', locale: 'unknown' })).rejects.toThrow();
  });
  it.each(['retail', 'airport', 'taxi', 'corporate'] as const)('builds a %s sector draft that stays unsent and keeps the ref link', async (sector) => {
    const result = await buildFavorCampaign({ targetId: 'ML-SECT-1', locale: 'en', sector });
    expect(result.sector).toBe(sector);
    expect(result.referralUrl).toBe('https://multi-lingual.tech/?ref=ML-SECT-1');
    expect(result.deliveryStatus).toBe('not_sent');
    expect(result.draft).toContain(result.subject);
  });
  it('rejects unknown sectors instead of guessing one', async () => {
    await expect(buildFavorCampaign({ targetId: 'A', locale: 'en', sector: 'spacefleet' })).rejects.toThrow();
  });
  it('omitting a sector keeps the default corporate draft shape', async () => {
    const result = await buildFavorCampaign({ targetId: 'A', locale: 'en' });
    expect(result.sector).toBeNull();
    expect(result.ccDepartments).toHaveLength(11);
  });
});