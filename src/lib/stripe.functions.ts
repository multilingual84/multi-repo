import { createServerFn } from '@tanstack/react-start';
import { invoiceMetadata, receiptStatementBlock } from '@/lib/config/platformCore';
import {
  STRIPE_CHECKOUT_SUCCESS_URL,
  STRIPE_CHECKOUT_CANCEL_URL,
} from '@/lib/config/stripePublic';
import { isPaidCheckout } from '@/lib/stripe/payment-policy';
import { billingCurrencyFor, currencyPlans, regionalCheckoutPriceIds, processingFeePriceId } from '@/lib/country-currency';

// Stripe checkout for the three subscription tiers, charged on the owner's own
// Stripe account (BYOK). Anonymous visitors are identified only by their random
// credential handle; Stripe collects the email at checkout. No webhooks: the
// returning browser confirms its own session, and only then does the server
// flip the subscription columns (which anon/authenticated roles cannot update).

const STRIPE_API = 'https://api.stripe.com/v1';

// Each checkoutable package carries one Stripe price per supported billing
// currency, so the visitor is charged exactly the regional price on screen.
// Enterprise Global is USD-only by design (hard-currency anchor).
export const packageCheckoutPrices = {
  single: {
    tier: 'solo',
    prices: {
      USD: 'price_1UTavnRt7sdUtv32bAWli904',
      MXN: 'price_1UUHPpRt7sdUtv32ODlPXMD0',
      PHP: 'price_1UTbwkRt7sdUtv327CfrXzPK',
      GBP: 'price_1UTbwqRt7sdUtv32rH5UYiug',
      JPY: 'price_1UTbwrRt7sdUtv32NEbMu1IS',
      EUR: 'price_1UTbwsRt7sdUtv32yyqz6OQH',
    },
  },
  'duo-yearly': {
    tier: 'yearly',
    prices: {
      USD: 'price_1UTavrRt7sdUtv32OglNE6t2',
      MXN: 'price_1UUHPrRt7sdUtv32bA8Hi0Hk',
      PHP: 'price_1UTbwtRt7sdUtv32Qa1NQjqF',
      GBP: 'price_1UTbwuRt7sdUtv32gvHp1x3t',
      JPY: 'price_1UTbwvRt7sdUtv32dTzEJP8r',
      EUR: 'price_1UTbwwRt7sdUtv3274XCtoHd',
    },
  },
  team: {
    tier: 'team',
    prices: {
      USD: 'price_1UUCzeRt7sdUtv32T3L3sCom',
      MXN: 'price_1UUHPrRt7sdUtv325PNwMohq',
      PHP: 'price_1UUFoHRt7sdUtv32cy9mrQV2',
      GBP: 'price_1UUFoIRt7sdUtv32pmwTj5Uo',
      JPY: 'price_1UUFoLRt7sdUtv32GzHanSv2',
      EUR: 'price_1UUFoMRt7sdUtv32Qb3k3uO6',
    },
  },
  hub: {
    tier: 'hub',
    prices: {
      USD: 'price_1UUCzfRt7sdUtv32UDiNEPUM',
      MXN: 'price_1UUHPuRt7sdUtv32k3FRJKBw',
      PHP: 'price_1UUFoQRt7sdUtv32bipiOvgQ',
      GBP: 'price_1UUFoRRt7sdUtv328ndqEaTz',
      JPY: 'price_1UUFoSRt7sdUtv32UY1oZkGs',
      EUR: 'price_1UUFoTRt7sdUtv32ACPHdc8X',
    },
  },
  community: {
    tier: 'community',
    prices: {
      USD: 'price_1UUCzfRt7sdUtv32qPEwmcRI',
      MXN: 'price_1UUHPvRt7sdUtv3264uIpgMo',
      PHP: 'price_1UUFoWRt7sdUtv32NC7e0qI9',
      GBP: 'price_1UUFoXRt7sdUtv327i8gyh9D',
      JPY: 'price_1UUFoYRt7sdUtv323AoLU1gi',
      EUR: 'price_1UUFoZRt7sdUtv32Rh6VO93t',
    },
  },
  enterprise: {
    tier: 'enterprise_global',
    prices: { USD: 'price_1UTbwwRt7sdUtv32ppU9jU30' },
  },
} as const;

export type CheckoutPackageId = keyof typeof packageCheckoutPrices;
export const checkoutCurrencies = Object.keys(currencyPlans).filter(code => currencyPlans[code]?.supported);
export type CheckoutCurrency = string;

const handleValidator = (input: { credentialHandle: string }) => {
  if (typeof input?.credentialHandle !== 'string' || !/^[a-f0-9-]{36}$/.test(input.credentialHandle)) {
    throw new Error('Invalid credential handle');
  }
  return input;
};

async function stripeRequest(path: string, method: 'GET' | 'POST', params?: Record<string, string>) {
  const key = process.env['STRIPE_SECRET_KEY'];
  if (!key) throw new Error('Stripe secret key is not configured');
  const response = await fetch(`${STRIPE_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${key}`,
      ...(params ? { 'Content-Type': 'application/x-www-form-urlencoded' } : {}),
    },
    ...(params ? { body: new URLSearchParams(params).toString() } : {}),
  });
  const body = await response.text();
  if (!response.ok) {
    console.error(`Stripe request failed [${response.status}]: ${body}`);
    throw new Error(`Stripe request failed [${response.status}]`);
  }
  return JSON.parse(body) as Record<string, unknown>;
}

export const createPackageCheckout = createServerFn({ method: 'POST' })
  .inputValidator((input: { credentialHandle: string; packageId: string; origin: string; currency?: string; referral?: string | undefined }) => {
    const { credentialHandle } = handleValidator(input);
    if (!Object.hasOwn(packageCheckoutPrices, input.packageId)) throw new Error('Unknown package');
    if (typeof input.origin !== 'string' || !/^https?:\/\//.test(input.origin)) throw new Error('Invalid origin');
    const currency = billingCurrencyFor(input.packageId, input.currency ?? 'USD');
    const referral = typeof input.referral === 'string' && /^[A-Za-z0-9_-]{4,64}$/.test(input.referral) ? input.referral : '';
    return { credentialHandle, packageId: input.packageId as CheckoutPackageId, origin: input.origin, currency, referral };
  })
  .handler(async ({ data }) => {
    const { requireWallet }=await import('@/lib/wallet/access.server');
    await requireWallet(data.credentialHandle);
    const {supabaseAdmin:partnerDb}=await import('@/integrations/supabase/client.server');
    const {data:partner,error:partnerError}=data.referral?await partnerDb.from('referral_partners').select('code,wallet').eq('code',data.referral).eq('livemode',true).maybeSingle():{data:null,error:null};
    if(partnerError)throw new Error('Referral verification unavailable');
    const verifiedReferral=partner&&partner.wallet!==data.credentialHandle?partner.code:'';
    const { prices, tier } = packageCheckoutPrices[data.packageId];
    const priceMap = prices as Record<string, string>;
    const priceId = priceMap[data.currency] ?? regionalCheckoutPriceIds[data.packageId];
    if (!priceId) throw new Error('Package price is not configured');
    const session = await stripeRequest('/checkout/sessions', 'POST', {
      mode: 'subscription',
      currency: data.currency.toLowerCase(),
      'adaptive_pricing[enabled]': 'false',
      locale: 'auto',
      'line_items[0][price]': priceId,
      'line_items[0][quantity]': '1',
      'line_items[1][price]': processingFeePriceId,
      'line_items[1][quantity]': '1',
      client_reference_id: data.credentialHandle,
      'metadata[credential_handle]': data.credentialHandle,
      'metadata[tier]': tier,
      'metadata[support_line]': invoiceMetadata.support_line,
      'metadata[support_line_display]': invoiceMetadata.support_line_display,
      'subscription_data[metadata][credential_handle]': data.credentialHandle,
      'subscription_data[metadata][tier]': tier,
      ...(data.referral ? { 'metadata[referral]': data.referral, 'subscription_data[metadata][referral]': data.referral } : {}),
      ...(verifiedReferral ? {'metadata[partner_referral]':verifiedReferral,'subscription_data[metadata][partner_referral]':verifiedReferral} : {}),
      'subscription_data[metadata][support_line]': receiptStatementBlock.support_phone,
      success_url: STRIPE_CHECKOUT_SUCCESS_URL,
      cancel_url: STRIPE_CHECKOUT_CANCEL_URL,
    });
    if (typeof session['url'] !== 'string') throw new Error('Stripe did not return a checkout URL');
    return { url: session['url'] };
  });

export const confirmPackageCheckout = createServerFn({ method: 'POST' })
  .inputValidator((input: { credentialHandle: string; sessionId: string }) => {
    const { credentialHandle } = handleValidator(input);
    if (typeof input.sessionId !== 'string' || !/^cs_(test|live)_/.test(input.sessionId)) {
      throw new Error('Invalid checkout session');
    }
    return { credentialHandle, sessionId: input.sessionId };
  })
  .handler(async ({ data }) => {
    const { requireWallet }=await import('@/lib/wallet/access.server');
    await requireWallet(data.credentialHandle);
    const session = await stripeRequest(`/checkout/sessions/${encodeURIComponent(data.sessionId)}`, 'GET');
    if (session['client_reference_id'] !== data.credentialHandle) throw new Error('Session does not belong to this visitor');
    const paid = isPaidCheckout(session);
    if (!paid) return { ok: false as const };
    const tier = (session['metadata'] as Record<string, string> | undefined)?.['tier'] ?? 'solo';
    const subscriptionId = typeof session['subscription'] === 'string' ? session['subscription'] : null;
    // The wallet only counts access as paid with a future renewal date, so record it here
    // instead of waiting for a later invoice webhook.
    let renewsAt: string | null = null;
    if (subscriptionId) {
      const sub = await stripeRequest(`/subscriptions/${encodeURIComponent(subscriptionId)}`, 'GET') as Record<string, unknown>;
      const items = sub['items'] as { data?: Array<{ current_period_end?: number }> } | undefined;
      const end = (typeof sub['current_period_end'] === 'number' ? sub['current_period_end'] : undefined) ?? items?.data?.[0]?.current_period_end;
      if (typeof end === 'number') renewsAt = new Date(end * 1000).toISOString();
    }
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin
      .from('users')
      .update({
        is_subscription_active: true,
        subscription_tier: tier,
        stripe_customer_id: typeof session['customer'] === 'string' ? session['customer'] : null,
        stripe_subscription_id: subscriptionId,
        ...(renewsAt ? { subscription_renews_at: renewsAt } : {}),
      })
      .eq('credential_handle', data.credentialHandle);
    if (error) throw new Error(error.message);
    return { ok: true as const, tier };
  });
