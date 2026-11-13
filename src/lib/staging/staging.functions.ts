import { createServerFn } from '@tanstack/react-start';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { findStagingPackage, normalizeReferralCode, PROCESSING_FEE_PRICE_ID, PROCESSING_FEE_CENTS } from './pricing';
import { currencyForCountry, localStripeAmount } from './local-pricing';

const ROOM_TYPES = ['residential', 'commercial', 'rental'] as const;
const STYLES = ['modern', 'farmhouse', 'luxury', 'scandinavian', 'coastal', 'industrial', 'minimalist', 'traditional'] as const;

function newReferralCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return `BT-${Array.from(bytes, b => alphabet[b % alphabet.length]).join('')}`;
}

async function ensureAccount(userId: string, referredBy: string | null) {
  const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
  const { data: existing } = await supabaseAdmin.from('stager_accounts').select('*').eq('user_id', userId).maybeSingle();
  if (existing) return existing;
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabaseAdmin.from('stager_accounts')
      .insert({ user_id: userId, credits: 0, referral_code: newReferralCode(), referred_by_code: referredBy })
      .select('*').single();
    if (!error && data) return data;
    const { data: raced } = await supabaseAdmin.from('stager_accounts').select('*').eq('user_id', userId).maybeSingle();
    if (raced) return raced;
  }
  throw new Error('Could not open your staging account');
}

export const getStagingAccount = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { referral?: string | null }) => ({ referral: normalizeReferralCode(input?.referral) }))
  .handler(async ({ data, context }) => {
    const account = await ensureAccount(context.userId, data.referral);
    const { data: earnings } = await context.supabase.from('stager_commissions')
      .select('commission_cents,status,payable_after,created_at').order('created_at', { ascending: false }).limit(100);
    const rows = earnings ?? [];
    const now = Date.now();
    const sum = (f: (r: (typeof rows)[number]) => boolean) => rows.filter(f).reduce((t, r) => t + r.commission_cents, 0);
    return {
      credits: account.credits,
      freeTrialAvailable: account.free_downloads_left > 0,
      freeDownloadsLeft: account.free_downloads_left,
      referralCode: account.referral_code,
      earnings: {
        heldCents: sum(r => r.status === 'held' && Date.parse(r.payable_after) > now),
        payableCents: sum(r => r.status === 'payable' || (r.status === 'held' && Date.parse(r.payable_after) <= now)),
        paidCents: sum(r => r.status === 'paid'),
        referrals: rows.length,
      },
    };
  });

export const stageRoom = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { image: string; roomType: string; style: string; notes?: string; products?: string[] }) => {
    if (typeof input?.image !== 'string' || !/^data:image\/(jpeg|png|webp);base64,/.test(input.image)) throw new Error('Please upload a JPG, PNG or WEBP photo');
    if (input.image.length > 6_000_000) throw new Error('Photo is too large — try a smaller one');
    const roomType = (ROOM_TYPES as readonly string[]).includes(input.roomType) ? input.roomType : 'residential';
    const style = (STYLES as readonly string[]).includes(input.style) ? input.style : 'modern';
    const notes = typeof input.notes === 'string' ? input.notes.slice(0, 600) : '';
    const products = Array.isArray(input.products)
      ? input.products.filter(p => typeof p === 'string' && /^data:image\/(jpeg|png|webp);base64,/.test(p) && p.length <= 3_000_000).slice(0, 3)
      : [];
    return { image: input.image, roomType, style, notes, products };
  })
  .handler(async ({ data, context }) => {
    // Unlimited free regenerations — credits are only spent on download (claimDownload).
    await ensureAccount(context.userId, null);
    const key = process.env['LOVABLE_API_KEY'];
    if (!key) throw new Error('Staging is not configured');
    const prompt = `Professional photorealistic property visualization. Context: ${data.roomType === 'rental' ? 'short-term rental' : data.roomType} space, ${data.style} style. Keep the exact walls, windows, doors, floors, roof lines, structure, lighting direction and camera angle unchanged — do not alter the architecture. No text, no watermark.${data.notes ? ` Instructions: ${data.notes}` : ' Tasteful realistic furniture and decor sized correctly for the room. MLS-ready listing photo.'}`;
    const toFile = (dataUrl: string, name: string) => {
      const [header, b64] = dataUrl.split(',', 2);
      const mime = header?.match(/^data:(image\/[a-z]+);/)?.[1] ?? 'image/jpeg';
      const bytes = Uint8Array.from(atob(b64 ?? ''), c => c.charCodeAt(0));
      return new File([bytes], `${name}.${mime.split('/')[1]}`, { type: mime });
    };
    let res: Response;
    try {
      const form = new FormData();
      form.set('model', 'openai/gpt-image-2.5-sunburst');
      if (data.products.length) {
        // Optional trade products: first image is the property, the rest are the customer's own products.
        form.set('prompt', `${prompt} The first image is the property photo to edit. The following ${data.products.length} image(s) are the customer's own product(s) — install or place those exact products realistically in the property photo, matching their color, material and design.`);
        form.append('image[]', toFile(data.image, 'room'));
        data.products.forEach((p, i) => form.append('image[]', toFile(p, `product-${i + 1}`)));
      } else {
        form.set('prompt', prompt);
        form.set('image', toFile(data.image, 'room'));
      }
      res = await fetch('https://ai.gateway.lovable.dev/v1/images/edits', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form,
      });
    } catch {
      throw new Error('Staging service is unreachable — please try again');
    }
    if (!res.ok) {
      if (res.status === 429) throw new Error('Too many requests right now — please try again in a minute');
      if (res.status === 402) throw new Error('Staging is temporarily unavailable — please try later');
      throw new Error('Staging failed — please try again');
    }
    const json = await res.json() as { data?: Array<{ b64_json?: string; url?: string }> };
    const first = json.data?.[0];
    const url = first?.b64_json ? `data:image/png;base64,${first.b64_json}` : first?.url;
    if (!url) throw new Error('No staged photo came back — please try again');
    // Always preview-watermarked on the client. Clean download requires claimDownload (1 credit).
    return { ok: true as const, image: url, watermark: true as const };
  });

/** Spend 1 free download (10 per account) or 1 credit per clean photo, for a whole batch at once. */
export const claimDownloads = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { count: number }) => {
    const count = Math.floor(Number(input?.count));
    if (!Number.isFinite(count) || count < 1 || count > 10) throw new Error('Pick between 1 and 10 photos');
    return { count };
  })
  .handler(async ({ data, context }) => {
    await ensureAccount(context.userId, null);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    let granted = 0;
    for (let i = 0; i < data.count; i++) {
      const { data: kind, error } = await supabaseAdmin.rpc('stager_spend', { p_user: context.userId });
      if (error) { if (granted === 0) throw new Error('Could not check your picture balance'); break; }
      if (kind === 'none') break;
      granted++;
    }
    return { granted, requested: data.count };
  });

/** Spend 1 credit (or free trial) to unlock a clean download of a staged photo. */
export const claimDownload = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await ensureAccount(context.userId, null);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: kind, error: spendError } = await supabaseAdmin.rpc('stager_spend', { p_user: context.userId });
    if (spendError) throw new Error('Could not check your picture balance');
    if (kind === 'none') return { ok: false as const, reason: 'no_credits' as const };
    return { ok: true as const, kind: String(kind) };
  });

export const createStagingCheckout = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { packageId: string; autoPay: boolean; origin: string; referral?: string | null; country?: string | null }) => {
    const pkg = findStagingPackage(input?.packageId);
    if (!pkg) throw new Error('Unknown package');
    if (typeof input.origin !== 'string' || !/^https?:\/\/[^/]+$/.test(input.origin)) throw new Error('Invalid origin');
    return { pkg, autoPay: input.autoPay === true, origin: input.origin, referral: normalizeReferralCode(input.referral), currency: currencyForCountry(input.country) };
  })
  .handler(async ({ data, context }) => {
    const account = await ensureAccount(context.userId, data.referral);
    const { stripeApi } = await import('./fulfillment.server');
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    // A referral counts only when it belongs to someone else; a stored first referral wins.
    const candidate = account.referred_by_code ?? data.referral;
    let referral = '';
    if (candidate && candidate !== account.referral_code) {
      const { data: partner } = await supabaseAdmin.from('stager_accounts').select('user_id').eq('referral_code', candidate).maybeSingle();
      if (partner && partner.user_id !== context.userId) referral = candidate;
    }
    const meta: Record<string, string> = { app: 'stager', user_id: context.userId, package: data.pkg.id, auto_pay: String(data.autoPay), ...(referral ? { referral } : {}) };
    const params: Record<string, string> = {
      mode: data.autoPay ? 'subscription' : 'payment',
      'line_items[0][quantity]': '1',
      'line_items[1][quantity]': '1',
      client_reference_id: context.userId,
      success_url: `${data.origin}/?staging_checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${data.origin}/?staging_checkout=cancelled`,
      ...(account.stripe_customer_id ? { customer: account.stripe_customer_id } : context.claims?.email ? { customer_email: String(context.claims.email) } : {}),
    };
    const cur = data.currency;
    if (cur.code === 'USD') {
      params['line_items[0][price]'] = data.autoPay ? data.pkg.monthlyPriceId : data.pkg.oneTimePriceId;
      params['line_items[1][price]'] = PROCESSING_FEE_PRICE_ID;
    } else {
      // Local currency: same rounded amounts the visitor saw on the page.
      params['currency'] = cur.code.toLowerCase();
      params['adaptive_pricing[enabled]'] = 'false';
      params['line_items[0][price_data][currency]'] = cur.code.toLowerCase();
      params['line_items[0][price_data][unit_amount]'] = String(localStripeAmount(data.pkg.amountCents, cur));
      params['line_items[0][price_data][product_data][name]'] = `Bricktown Staging Lab — ${data.pkg.name} (${data.pkg.pics} pictures)`;
      if (data.autoPay) params['line_items[0][price_data][recurring][interval]'] = 'month';
      params['line_items[1][price_data][currency]'] = cur.code.toLowerCase();
      params['line_items[1][price_data][unit_amount]'] = String(localStripeAmount(PROCESSING_FEE_CENTS, cur));
      params['line_items[1][price_data][product_data][name]'] = 'Processing fee';
    }
    meta['currency'] = cur.code;
    for (const [k, v] of Object.entries(meta)) {
      params[`metadata[${k}]`] = v;
      if (data.autoPay) params[`subscription_data[metadata][${k}]`] = v;
    }
    const session = await stripeApi('/checkout/sessions', 'POST', params);
    if (typeof session?.url !== 'string') throw new Error('Stripe did not return a checkout page');
    return { url: session.url as string };
  });

export const confirmStagingCheckout = createServerFn({ method: 'POST' })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { sessionId: string }) => {
    if (typeof input?.sessionId !== 'string' || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(input.sessionId)) throw new Error('Invalid checkout session');
    return input;
  })
  .handler(async ({ data, context }) => {
    const { stripeApi, fulfillStagingSession, isPaidSession } = await import('./fulfillment.server');
    const session = await stripeApi(`/checkout/sessions/${encodeURIComponent(data.sessionId)}`);
    if (session?.client_reference_id !== context.userId) throw new Error('This checkout belongs to another account');
    if (!isPaidSession(session)) return { ok: false as const };
    const result = await fulfillStagingSession(session);
    if (typeof session.customer === 'string') {
      const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
      await supabaseAdmin.from('stager_accounts').update({ stripe_customer_id: session.customer }).eq('user_id', context.userId);
    }
    return { ok: true as const, pics: result.pics };
  });
