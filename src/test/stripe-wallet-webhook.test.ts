// @vitest-environment node
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import { createHmac } from 'node:crypto';
import { afterAll, afterEach, beforeAll, beforeEach, expect, it, vi } from 'vitest';
import { VOICE_PRICES } from '@/lib/premium/policy';

const mocks = vi.hoisted(() => ({ rpc: vi.fn(), from: vi.fn(), wallet: vi.fn() }));
vi.mock('@tanstack/react-router', () => ({ createFileRoute: () => (options: unknown) => options }));
vi.mock('@tanstack/react-start/server', () => ({ getRequestUrl: () => new URL('https://multi-lingual.tech') }));
vi.mock('@/lib/wallet/access.server', () => ({ requireWallet: mocks.wallet }));
vi.mock('@/integrations/supabase/client.server', () => ({ supabaseAdmin: { rpc: mocks.rpc, from: mocks.from } }));
import { handle } from '@/routes/api/public/stripe-webhook';
import { premiumSalesEnabled, voiceCheckout, voiceConfirm } from '@/lib/premium/billing.server';

// Invented test fixtures only. Never use saved credentials or contact Stripe.
const fixtureSigningKey = 'unit-test-signing-key-not-a-provider-credential';
const wallet = '10000000-0000-4000-8000-000000000001';
const session = { id: 'cs_live_fixture', livemode: true, status: 'complete', payment_status: 'paid', mode: 'payment', currency: 'usd', client_reference_id: wallet, metadata: { purpose: 'premium_voice_credit', wallet, cents: '100' }, amount_subtotal: 100 };
let db: PGlite;
let event: { id: string; type: string; livemode: boolean; data: { object: typeof session } };
let provider: ReturnType<typeof vi.fn>;

beforeAll(async () => {
  db = new PGlite();
  await db.exec('CREATE ROLE service_role; CREATE ROLE anon; CREATE ROLE authenticated;');
  await db.exec(readFileSync('drizzle/migrations/0014_premium_voice_prepaid_ledger.sql', 'utf8'));
}, 30000);
afterAll(async () => { await db.close(); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
beforeEach(async () => {
  vi.resetAllMocks();
  await db.exec('TRUNCATE premium_voice_accounts CASCADE;');
  vi.stubEnv('STRIPE_SIGNING_SECRET', fixtureSigningKey);
  vi.stubEnv('STRIPE_SECRET_KEY', 'sk_live_fixture_not_a_real_key');
  vi.stubEnv('PREMIUM_VOICE_SALES_ENABLED', 'false');
  event = { id: 'evt_fixture', type: 'checkout.session.completed', livemode: true, data: { object: { ...session } } };
  provider = vi.fn(async (url: string) => {
    if (url.endsWith('/events/evt_fixture')) return Response.json(event);
    if (url.includes('/line_items')) return Response.json({ data: [{ price: { id: VOICE_PRICES[100] }, quantity: 1 }] });
    if (url.endsWith('/checkout/sessions/cs_live_fixture')) return Response.json(event.data.object);
    throw new Error('Unexpected provider request');
  });
  vi.stubGlobal('fetch', provider);
  mocks.wallet.mockResolvedValue(wallet);
  mocks.rpc.mockImplementation(async (name, args) => {
    if (name !== 'credit_premium_voice') throw new Error('Unexpected RPC');
    const result = await db.query('SELECT credit_premium_voice($1,$2,$3)', [args.p_wallet, args.p_checkout, args.p_cents]);
    return { data: result.rows, error: null };
  });
  mocks.from.mockImplementation((table: string) => {
    if (table !== 'premium_voice_credits') throw new Error('Unexpected ledger read');
    const filters: Record<string, string> = {};
    const query = { select: () => query, eq: (key: string, value: string) => { filters[key] = value; return query; }, maybeSingle: async () => {
      const result = await db.query('SELECT checkout_id FROM premium_voice_credits WHERE wallet=$1 AND checkout_id=$2', [filters['wallet'], filters['checkout_id']]);
      return { data: result.rows[0] ?? null, error: null };
    } };
    return query;
  });
});
function signedRequest(timestamp = String(Math.floor(Date.now() / 1000)), body = JSON.stringify(event), rotation = false) {
  const signature = createHmac('sha256', fixtureSigningKey).update(`${timestamp}.${body}`).digest('hex');
  return new Request('https://multi-lingual.tech/api/public/stripe-webhook', { method: 'POST', body, headers: { 'stripe-signature': `t=${timestamp},v1=${signature}${rotation ? ',v1=invalid-rotated-signature' : ''}` } });
}
async function creditCount() {
  const result = await db.query<{ count: number }>('SELECT count(*)::integer AS count FROM premium_voice_credits');
  return result.rows[0]?.count;
}
it('signed paid $1 event applies 10,000 characters exactly once and PIN confirmation only reads them', async () => {
  await expect(voiceConfirm(session.id)).rejects.toThrow('awaiting verification');
  expect(mocks.rpc).not.toHaveBeenCalled();
  expect((await handle(signedRequest())).status).toBe(200);
  expect((await handle(signedRequest())).status).toBe(200);
  expect(await creditCount()).toBe(1);
  const result = await db.query<{ available_characters: number }>('SELECT available_characters FROM premium_voice_accounts WHERE wallet=$1', [wallet]);
  expect(Number(result.rows[0]?.available_characters)).toBe(10000);
  const before = mocks.rpc.mock.calls.length;
  expect(await voiceConfirm(session.id)).toEqual({ ok: true });
  expect(mocks.rpc).toHaveBeenCalledTimes(before);
  expect(premiumSalesEnabled()).toBe(false);
});
it.each(['missing', 'invalid', 'expired', 'malformed', 'tampered'])('%s signature cannot access Stripe or credit the wallet, and top-ups stay locked', async kind => {
  let request = signedRequest();
  if (kind === 'missing') request.headers.delete('stripe-signature');
  if (kind === 'invalid') request.headers.set('stripe-signature', 't=1,v1=invalid');
  if (kind === 'expired') request = signedRequest(String(Math.floor(Date.now() / 1000) - 301));
  if (kind === 'malformed') request = signedRequest('NaN');
  if (kind === 'tampered') request = new Request(request.url, { method: 'POST', headers: request.headers, body: JSON.stringify({ ...event, id: 'evt_tampered' }) });
  expect((await handle(request)).status).toBe(400);
  expect(provider).not.toHaveBeenCalled();
  expect(await creditCount()).toBe(0);
  expect(premiumSalesEnabled()).toBe(false);
  await expect(voiceCheckout(100)).rejects.toThrow('awaiting payment verification');
});
it('a valid signature accepts any current v1 signature during endpoint rotation', async () => {
  expect((await handle(signedRequest(undefined, undefined, true))).status).toBe(200);
  expect(await creditCount()).toBe(1);
});
it.each(['unpaid', 'no_payment_required'])('signed but %s checkout never credits', async payment_status => {
  event.data.object = { ...session, payment_status };
  expect((await handle(signedRequest())).status).toBe(200);
  expect(await creditCount()).toBe(0);
  expect(mocks.rpc).not.toHaveBeenCalled();
});
it('test payment cannot enter the live ledger even with a valid signature', async () => {
  event.livemode = false;
  expect((await handle(signedRequest())).status).toBe(400);
  expect(await creditCount()).toBe(0);
});
it('provider verification failure leaves credits empty and purchases locked', async () => {
  provider.mockResolvedValue(new Response('unavailable', { status: 503 }));
  expect((await handle(signedRequest())).status).toBe(400);
  expect(await creditCount()).toBe(0);
  expect(premiumSalesEnabled()).toBe(false);
});
it('ledger failure is retryable, does not credit and does not enable top-ups', async () => {
  mocks.rpc.mockResolvedValueOnce({ error: { message: 'unavailable' } });
  expect((await handle(signedRequest())).status).toBe(500);
  expect(await creditCount()).toBe(0);
  expect(premiumSalesEnabled()).toBe(false);
  expect((await handle(signedRequest())).status).toBe(200);
  expect(await creditCount()).toBe(1);
});