import {ENHANCED_VOICE_AVAILABLE} from './retirement';
import { getRequestUrl } from '@tanstack/react-start/server';
import { requireWallet } from '@/lib/wallet/access.server';
import { VOICE_PRICES, verifiedVoiceCredit } from './policy';
import { SANDBOX_VOICE_PRICES } from './sandbox-prices';
import { STRIPE_VOICE_SUCCESS_URL, STRIPE_VOICE_CANCEL_URL } from '@/lib/config/stripePublic';

export function premiumSandbox() {
  // Built previews and published Workers never use the developer test ledger.
  // Hostname is an additional constraint, not an authorization boundary.
  return import.meta.env.DEV && getRequestUrl().hostname === 'localhost';
}
export async function premiumDb() {
  const wallet = await requireWallet();
  const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
  return { wallet, db };
}
export async function premiumStripe(path: string, params?: Record<string, string>, sandbox = premiumSandbox(),idempotency?:string) {
  const key = process.env[sandbox ? 'STRIPE_TEST_API_KEY' : 'STRIPE_SECRET_KEY'];
  // Accept both secret (sk_) and restricted (rk_) keys; the Stripe
  // connector issues restricted live keys, which are the intended kind.
  const prefixes = sandbox ? ['sk_test_', 'rk_test_'] : ['sk_live_', 'rk_live_'];
  if (!key || !prefixes.some((p) => key.startsWith(p))) throw new Error('Stripe mode unavailable');
  const r = await fetch(`https://api.stripe.com/v1${path}`, {
    method: params ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${key}`, ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),...(idempotency?{'Idempotency-Key':idempotency}:{}) },
    ...(params ? { body: new URLSearchParams(params) } : {}),
  });
  if (!r.ok) throw new Error(`Payment service error [${r.status}]`);
  return r.json() as Promise<Record<string, unknown>>;
}
// Local test checkout cannot grant live credit. Live sales remain fail-closed.
export function premiumSalesEnabled() {
  return ENHANCED_VOICE_AVAILABLE;
}
export async function voiceState() {
  const { wallet, db } = await premiumDb();
  if (premiumSandbox()) {
    const { data, error } = await db.from('premium_voice_sandbox_credits').select('characters').eq('wallet', wallet);
    if (error) throw new Error('Test balance unavailable');
    const purchased = (data ?? []).reduce((n, r) => n + Number(r.characters), 0);
    return { available: purchased, purchased, used: 0, blocked: null, salesEnabled: false, sandbox: true };
  }
  const { data, error } = await db.from('premium_voice_accounts').select('available_characters,purchased_characters,used_characters,blocked_reason').eq('wallet', wallet).maybeSingle();
  if (error) throw new Error('Voice balance unavailable');
  return { available: Number(data?.available_characters ?? 0), purchased: Number(data?.purchased_characters ?? 0), used: Number(data?.used_characters ?? 0), blocked: data?.blocked_reason ?? null, salesEnabled: premiumSalesEnabled(), sandbox: false };
}
export async function voiceCheckout(cents: number) {
  if (!premiumSalesEnabled()) throw new Error('Premium checkout is awaiting payment verification');
  const { wallet } = await premiumDb();
  const price = (premiumSandbox() ? SANDBOX_VOICE_PRICES : VOICE_PRICES)[cents];
  if (!price) throw new Error('Invalid voice budget');
  const origin = getRequestUrl().origin;
  const s = await premiumStripe('/checkout/sessions', {
    mode: 'payment', currency: 'usd', 'adaptive_pricing[enabled]': 'false', locale: 'auto',
    'line_items[0][price]': price, 'line_items[0][quantity]': '1', client_reference_id: wallet,
    'metadata[purpose]': 'premium_voice_credit', 'metadata[wallet]': wallet, 'metadata[cents]': String(cents),
    success_url: STRIPE_VOICE_SUCCESS_URL,
    cancel_url: STRIPE_VOICE_CANCEL_URL,
  });
  if (typeof s['url'] !== 'string') throw new Error('Checkout unavailable');
  return { url: s['url'] };
}
// Live fulfillment is invoked only by the signed Stripe event handler.
export async function fulfillVoiceCredit(id: string, wallet: string, sandbox = premiumSandbox()) {
  if (!id.startsWith(sandbox ? 'cs_test_' : 'cs_live_')) throw new Error('Voice payment mode mismatch');
  const s = await premiumStripe(`/checkout/sessions/${encodeURIComponent(id)}`, undefined, sandbox);
  const m = s['metadata'] as Record<string, string> | undefined;
  const cents = Number(m?.['cents']);
  if (s['livemode'] !== !sandbox || !verifiedVoiceCredit(s, wallet, cents)) throw new Error('Voice payment not verified');
  const items = await premiumStripe(`/checkout/sessions/${encodeURIComponent(id)}/line_items?limit=2`, undefined, sandbox);
  const rows = items['data'] as { price?: { id?: string }; quantity?: number }[] | undefined;
  if (rows?.length !== 1 || rows[0]?.price?.id !== (sandbox ? SANDBOX_VOICE_PRICES : VOICE_PRICES)[cents] || rows[0]?.quantity !== 1) throw new Error('Voice product mismatch');
  const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
  const { error } = await db.rpc(sandbox ? 'credit_sandbox_voice' : 'credit_premium_voice', { p_wallet: wallet, p_checkout: id, p_cents: cents });
  if (error) throw new Error('Voice credit unavailable');
  return { ok: true };
}
export async function voiceConfirm(id: string) {
  const { wallet } = await premiumDb();
  // Development test credits remain isolated; returning from live Checkout
  // cannot mint credit before signed payment notification arrives.
  if (premiumSandbox()) return fulfillVoiceCredit(id, wallet, true);
  const { supabaseAdmin: db } = await import('@/integrations/supabase/client.server');
  const { data, error } = await db.from('premium_voice_credits').select('checkout_id').eq('wallet', wallet).eq('checkout_id', id).maybeSingle();
  if (error || !data) throw new Error('Payment notification awaiting verification');
  return { ok: true };
}
