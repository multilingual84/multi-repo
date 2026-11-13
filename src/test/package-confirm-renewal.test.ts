import { afterEach, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({ inputValidator: () => ({ handler: (handler: unknown) => handler }) }),
}));
vi.mock('@/lib/wallet/access.server', () => ({ requireWallet: vi.fn(async (h: string) => h) }));
const update = vi.fn();
vi.mock('@/integrations/supabase/client.server', () => ({
  supabaseAdmin: { from: () => ({ update: (row: unknown) => { update(row); return { eq: async () => ({ error: null }) }; } }) },
}));

import { confirmPackageCheckout } from '@/lib/stripe.functions';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); update.mockReset(); });

it('records the paid-through date so the wallet shows a paid Solo pack right after checkout', async () => {
  vi.stubEnv('STRIPE_SECRET_KEY', 'test-placeholder');
  const handle = '12345678-1234-1234-1234-123456789012';
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ client_reference_id: handle, status: 'complete', payment_status: 'paid', mode: 'subscription', metadata: { tier: 'solo' }, customer: 'cus_1', subscription: 'sub_1' }) })
    .mockResolvedValueOnce({ ok: true, text: async () => JSON.stringify({ items: { data: [{ current_period_end: 1795664433 }] } }) });
  vi.stubGlobal('fetch', fetchMock);
  const result = await confirmPackageCheckout({ data: { credentialHandle: handle, sessionId: 'cs_live_abc' } });
  expect(result).toEqual({ ok: true, tier: 'solo' });
  expect(update).toHaveBeenCalledWith(expect.objectContaining({ is_subscription_active: true, subscription_renews_at: new Date(1795664433 * 1000).toISOString() }));
});
