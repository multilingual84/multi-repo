// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest';
import { VOICE_PRICES } from '@/lib/premium/policy';
const mocks = vi.hoisted(() => ({ rpc: vi.fn(), wallet: vi.fn(), origin: vi.fn() }));
vi.mock('@tanstack/react-start/server', () => ({ getRequestUrl: mocks.origin }));
vi.mock('@/lib/wallet/access.server', () => ({ requireWallet: mocks.wallet }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { rpc: mocks.rpc } }));
import { fulfillVoiceCredit, voiceCheckout, premiumSalesEnabled } from '@/lib/premium/billing.server';
const session = { id: 'cs_live_fixture', livemode: true, status: 'complete', payment_status: 'paid', mode: 'payment', currency: 'usd', client_reference_id: 'owner', metadata: { purpose: 'premium_voice_credit', wallet: 'owner', cents: '100' }, amount_subtotal: 100 };
beforeEach(() => {
  vi.resetAllMocks();
  mocks.origin.mockReturnValue(new URL('https://multi-lingual.tech'));
  mocks.wallet.mockResolvedValue('owner');
  mocks.rpc.mockResolvedValue({ error: null });
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_fixture_not_a_real_key');
  vi.stubEnv('PREMIUM_VOICE_SALES_ENABLED', 'false');
});
function stripeResponses(value = session, items = [{ price: { id: VOICE_PRICES[100] }, quantity: 1 }]) {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json(value)).mockResolvedValueOnce(Response.json({ data: items }));
  vi.stubGlobal('fetch', fetcher);
  return fetcher;
}
it('keeps real purchases locked until verification enables sales', async () => {
  expect(premiumSalesEnabled()).toBe(false);
  await expect(voiceCheckout(100)).rejects.toThrow('awaiting payment verification');
  expect(mocks.wallet).not.toHaveBeenCalled();
});
it('a production-looking request host never selects the sandbox ledger', async () => {
  mocks.origin.mockReturnValue(new URL('https://multi-lingual.tech'));
  const { premiumSandbox } = await import('@/lib/premium/billing.server');
  expect(premiumSandbox()).toBe(false);
});
it('credits exactly the paid owner product amount through the atomic RPC', async () => {
  stripeResponses();
  expect(await fulfillVoiceCredit('cs_live_fixture', 'owner', false)).toEqual({ ok: true });
  expect(mocks.rpc).toHaveBeenCalledWith('credit_premium_voice', { p_wallet: 'owner', p_checkout: 'cs_live_fixture', p_cents: 100 });
});
it.each(['unpaid', 'no_payment_required'])('does not credit a completed %s session', async payment_status => {
  stripeResponses({ ...session, payment_status });
  await expect(fulfillVoiceCredit('cs_live_fixture', 'owner', false)).rejects.toThrow('not verified');
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it('rejects another wallet and mismatched currency, purpose or price amount', async () => {
  for (const change of [{ client_reference_id: 'thief' }, { currency: 'eur' }, { metadata: { ...session.metadata, purpose: 'solo' } }, { amount_subtotal: 99 }]) {
    stripeResponses({ ...session, ...change });
    await expect(fulfillVoiceCredit('cs_live_fixture', 'owner', false)).rejects.toThrow('not verified');
  }
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it('rejects wrong products, quantities and extra line items', async () => {
  for (const items of [[{ price: { id: 'wrong' }, quantity: 1 }], [{ price: { id: VOICE_PRICES[100] }, quantity: 2 }], [{ price: { id: VOICE_PRICES[100] }, quantity: 1 }, { price: { id: VOICE_PRICES[100] }, quantity: 1 }]]) {
    stripeResponses(session, items);
    await expect(fulfillVoiceCredit('cs_live_fixture', 'owner', false)).rejects.toThrow('product mismatch');
  }
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it('test payments cannot be fulfilled as real voice credit', async () => {
  await expect(fulfillVoiceCredit('cs_test_fixture', 'owner', false)).rejects.toThrow('mode mismatch');
  stripeResponses({ ...session, livemode: false });
  await expect(fulfillVoiceCredit('cs_live_fixture', 'owner', false)).rejects.toThrow('not verified');
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it('provider and ledger failures do not report successful crediting', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('unavailable', { status: 503 })));
  await expect(fulfillVoiceCredit('cs_live_fixture', 'owner', false)).rejects.toThrow('503');
  expect(mocks.rpc).not.toHaveBeenCalled();
  stripeResponses();mocks.rpc.mockResolvedValue({ error: { message: 'failure' } });
  await expect(fulfillVoiceCredit('cs_live_fixture', 'owner', false)).rejects.toThrow('credit unavailable');
});