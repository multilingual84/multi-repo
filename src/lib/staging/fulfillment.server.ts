// Server-only: turns a verified, paid Stripe checkout session or renewal invoice
// into picture credits plus a 50% referral commission, exactly once per ref.
import { findStagingPackage } from './pricing';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Obj = any;

export async function stripeApi(path: string, method: 'GET' | 'POST' = 'GET', params?: Record<string, string>): Promise<Obj> {
  const key = process.env['STRIPE_SECRET_KEY'];
  if (!key) throw new Error('Stripe is not configured');
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: { Authorization: `Bearer ${key}`, ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}) },
    ...(params ? { body: new URLSearchParams(params).toString() } : {}),
  });
  const text = await res.text();
  if (!res.ok) { console.error(`Stripe ${path} failed [${res.status}]: ${text}`); throw new Error(`Stripe request failed [${res.status}]`); }
  return JSON.parse(text);
}

async function grant(ref: string, meta: Obj, livemode: boolean) {
  const pkg = findStagingPackage(String(meta?.package ?? ''));
  const userId = String(meta?.user_id ?? '');
  if (!pkg || !/^[0-9a-f-]{36}$/.test(userId)) throw new Error('Not a staging purchase');
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const referral = typeof meta?.referral === 'string' && meta.referral ? meta.referral : null;
  const { data, error } = await supabaseAdmin.rpc('stager_grant_purchase', {
    p_ref: ref, p_user: userId, p_package: pkg.id, p_pics: pkg.pics, p_amount: pkg.amountCents,
    p_auto_pay: meta?.auto_pay === 'true', p_referral: referral as string, p_livemode: livemode,
  });
  if (error) throw new Error(error.message);
  return { granted: data === true, pics: pkg.pics };
}

export function isPaidSession(session: Obj): boolean {
  return session?.status === 'complete' && (session?.payment_status === 'paid' || session?.payment_status === 'no_payment_required');
}

export async function fulfillStagingSession(session: Obj) {
  if (session?.metadata?.app !== 'stager' || !isPaidSession(session)) return { granted: false, pics: 0 };
  return grant(String(session.id), session.metadata, session.livemode === true);
}

// Monthly auto-pay renewals refill the same package (first invoice is covered by the session).
export async function fulfillStagingInvoice(invoice: Obj) {
  if (invoice?.billing_reason !== 'subscription_cycle') return { granted: false, pics: 0 };
  const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice?.parent?.subscription_details?.subscription;
  const meta = invoice?.subscription_details?.metadata ?? invoice?.parent?.subscription_details?.metadata
    ?? (typeof subId === 'string' ? (await stripeApi(`/subscriptions/${subId}`))?.metadata : null);
  if (meta?.app !== 'stager') return { granted: false, pics: 0 };
  return grant(String(invoice.id), meta, invoice.livemode === true);
}
