import { createFileRoute } from '@tanstack/react-router';
import { isPaidCheckout } from '@/lib/stripe/payment-policy';
import { currencyPlans } from '@/lib/country-currency';

// Stripe payment events. The posted body is never trusted: we re-fetch the
// event by id from Stripe with the secret key, so only genuine events act.
// Each event is processed once (stripe_events). Keeps subscription access in
// sync with renewals/cancellations and credits affiliates 50% of paid invoices
// (held in escrow; payouts are made by the owner).

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Obj = any;

async function stripeGet(path: string): Promise<Obj | null> {
  const key = process.env['STRIPE_SECRET_KEY'];
  if (!key) return null;
  const res = await fetch(`https://api.stripe.com/v1${path}`, { headers: { Authorization: `Bearer ${key}` } });
  if (!res.ok) { console.error(`Stripe GET ${path} failed [${res.status}]: ${await res.text()}`); return null; }
  return res.json();
}

export const AFFILIATE_SHARE = 0.5;
export function affiliateCredit(amountPaidCents: number): number {
  return Math.round(Math.max(0, amountPaidCents) * AFFILIATE_SHARE) / 100;
}

// The affiliate ledger is denominated in USD, so a credit from a regional
// invoice is converted at the same parity factors the site uses to display
// local prices (MX$20 ≈ $1, ₱50 ≈ $1, ¥150 ≈ $1). Payouts stay manual.
export function affiliateCreditUsd(amountPaidMinor: number, currency: string): number {
  const plan = currencyPlans[(currency ?? '').toUpperCase()];
  if (!plan?.supported) throw new Error('Unknown invoice currency');
  return Math.round(Math.max(0, amountPaidMinor) / plan.minorFactor / plan.factor * AFFILIATE_SHARE * 100) / 100;
}

// Every post requires a valid signature before any provider or ledger access.
// Verify the exact raw body with a five-minute tolerance and support rotation.
async function hasValidSignature(rawBody: string, header: string | null): Promise<boolean> {
  const secret = process.env['STRIPE_SIGNING_SECRET'];
  if (!secret) return false;
  if (!header) return false;
  const parts = header.split(',').map(p => p.trim().split('='));
  const timestamps = parts.filter(([name]) => name === 't');
  const timestamp = timestamps[0]?.[1];
  const signatures = parts.filter(([name]) => name === 'v1').map(([, value]) => value);
  if (timestamps.length !== 1 || !timestamp || !/^\d+$/.test(timestamp) || !signatures.length) return false;
  if (Math.abs(Math.floor(Date.now() / 1000) - Number(timestamp)) > 300) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = Buffer.from(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${timestamp}.${rawBody}`))).toString('hex');
  return signatures.some(signature => {
    if (!signature || expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    return diff === 0;
  });
}

export async function handle(request: Request) {
  const rawBody = await request.text();
  if (!(await hasValidSignature(rawBody, request.headers.get('stripe-signature')))) {
    return new Response('bad signature', { status: 400 });
  }
  let id = '';
  try { id = String((JSON.parse(rawBody) as Obj)?.id ?? ''); } catch { /* ignore */ }
  if (!/^evt_[A-Za-z0-9]+$/.test(id)) return new Response('bad event', { status: 400 });
  const event = await stripeGet(`/events/${id}`);
  if (!event) return new Response('unverified', { status: 400 });

  // Staging picture packages: idempotent by session/invoice id, so retries are safe.
  const stagingObject = event.data?.object as Obj;
  if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type) && stagingObject?.metadata?.app === 'stager') {
    try { const { fulfillStagingSession } = await import('@/lib/staging/fulfillment.server'); await fulfillStagingSession(stagingObject); return new Response('staging fulfilled'); }
    catch { return new Response('retry staging', { status: 500 }); }
  }
  if (event.type === 'invoice.paid' && stagingObject?.billing_reason === 'subscription_cycle') {
    try { const { fulfillStagingInvoice } = await import('@/lib/staging/fulfillment.server'); const r = await fulfillStagingInvoice(stagingObject); if (r.pics) return new Response('staging renewal fulfilled'); }
    catch { return new Response('retry staging renewal', { status: 500 }); }
  }

  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  // Tier-only partner records precede legacy deduplication so failures retry.
  // Prepaid voice checkout takes its separate branch below and never earns a split.
  if (event.type === 'invoice.paid') {
    try {
      const { recordPartnerInvoice } = await import('@/lib/referrals/commissions.server');
      await recordPartnerInvoice(event.data?.object ?? {}, event.livemode === true);
    } catch { return new Response('retry partner invoice', {status:500}); }
  }
  // Voice credit is atomic/idempotent by checkout ID; process before the
  // legacy event marker so a temporary fulfillment error can be retried.
  const voice = event.data?.object as Obj;
  if(event.type==='payment_intent.succeeded'&&voice?.metadata?.purpose==='premium_voice_refill'){
    if(event.livemode!==true)return new Response('sandbox event rejected',{status:400});
    try{const {fulfillVoiceRefill}=await import('@/lib/premium/funding.server');await fulfillVoiceRefill(String(voice.id));return new Response('voice refill fulfilled');}catch{return new Response('retry voice refill',{status:500});}
  }
  if(event.type==='payment_intent.payment_failed'&&voice?.metadata?.purpose==='premium_voice_refill'){
    if(event.livemode!==true)return new Response('sandbox event rejected',{status:400});
    const {error}=await supabaseAdmin.from('premium_voice_funding_attempts').update({state:'failed',payment_intent:String(voice.id)}).eq('id',voice.metadata.attempt).eq('wallet',voice.metadata.wallet).eq('livemode',true).eq('state','pending');
    return new Response(error?'retry funding status':'funding failed',{status:error?500:200});
  }
  if (['checkout.session.completed', 'checkout.session.async_payment_succeeded'].includes(event.type) && voice?.metadata?.purpose === 'premium_voice_credit') {
    if (!isPaidCheckout(voice)) return new Response('awaiting paid voice checkout');
    if (event.livemode !== true) return new Response('sandbox event rejected', {status:400});
    try {
      const { fulfillVoiceCredit } = await import('@/lib/premium/billing.server');
      await fulfillVoiceCredit(String(voice.id), String(voice.client_reference_id), false);
      return new Response('voice credit fulfilled');
    } catch {
      return new Response('retry voice credit', {status:500});
    }
  }
  const { error: dupErr } = await supabaseAdmin.from('stripe_events').insert({ id, type: String(event.type) });
  if (dupErr) return new Response('already processed', { status: 200 });

  const o = event.data?.object as Obj;
  try {
    if (event.type === 'checkout.session.completed' && o?.client_reference_id && isPaidCheckout(o)) {
      // Separate prepaid voice purchases never modify package entitlements.
      if (o.metadata?.purpose === 'premium_voice_credit') return new Response('voice credit verified by wallet checkout confirmation');
      const sub = typeof o.subscription === 'string' ? await stripeGet(`/subscriptions/${o.subscription}`) : null;
      const end = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end;
      await supabaseAdmin.from('users').update({
        is_subscription_active: true,
        subscription_tier: o.metadata?.tier ?? null,
        stripe_customer_id: typeof o.customer === 'string' ? o.customer : null,
        stripe_subscription_id: typeof o.subscription === 'string' ? o.subscription : null,
        ...(end ? { subscription_renews_at: new Date(end * 1000).toISOString() } : {}),
      }).eq('credential_handle', o.client_reference_id);
    }
    if (event.type === 'invoice.paid' && typeof o?.subscription === 'string') {
      const sub = await stripeGet(`/subscriptions/${o.subscription}`);
      const end = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end;
      await supabaseAdmin.from('users').update({
        is_subscription_active: true,
        subscription_renews_at: end ? new Date(end * 1000).toISOString() : null,
      }).eq('stripe_subscription_id', o.subscription);
      // Automated commissions use verified package lines in the new ledger.
      // Never accrue an additional unowned legacy balance or split voice credits.
    }
    if (event.type === 'customer.subscription.deleted' || (event.type === 'customer.subscription.updated' && ['canceled', 'unpaid', 'incomplete_expired'].includes(o?.status))) {
      await supabaseAdmin.from('users').update({ is_subscription_active: false }).eq('stripe_subscription_id', o.id);
    }
  } catch (e) {
    console.error('stripe webhook processing failed', e);
    await supabaseAdmin.from('stripe_events').delete().eq('id', id);
    return new Response('retry', { status: 500 });
  }
  return new Response('ok');
}

export const Route = createFileRoute('/api/public/stripe-webhook')({
  staticData: { sitemap: false },
  server: { handlers: { POST: async ({ request }) => handle(request) } },
});
