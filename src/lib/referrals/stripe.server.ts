export function partnerTestMode() {
  return import.meta.env.DEV;
}
export function livePartnerPaymentsEnabled() {
  return process.env['REFERRAL_PAYOUTS_ENABLED'] === 'true';
}
export async function partnerStripe(path: string, live: boolean, body?: Record<string, unknown>, idempotency?: string) {
  const key = process.env[live ? 'STRIPE_SECRET_KEY' : 'STRIPE_TEST_API_KEY'];
  if (!key || !(live ? /^(sk|rk)_live_/ : /^(sk|rk)_test_/).test(key)) throw new Error('Partner payment mode unavailable');
  const v2 = path.startsWith('/v2/');
  const response = await fetch(`https://api.stripe.com${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${key}`, ...(v2 ? {'Stripe-Version':'2026-09-30.endive'} : {}),
      ...(body ? {'Content-Type':v2?'application/json':'application/x-www-form-urlencoded'} : {}),
      ...(idempotency ? {'Idempotency-Key':idempotency} : {}) },
    ...(body ? {body:v2?JSON.stringify(body):new URLSearchParams(Object.entries(body).map(([k,v])=>[k,String(v)]))} : {}),
  });
  const text=await response.text();
  if(!response.ok){ console.error(`Partner Stripe error [${response.status}]`); throw new Error(`Partner payment service unavailable [${response.status}]`); }
  return JSON.parse(text) as Record<string, any>;
}
export async function partnerAccountReady(id:string,live:boolean) {
  const a=await partnerStripe(`/v2/core/accounts/${encodeURIComponent(id)}?include[0]=configuration.recipient&include[1]=requirements&include[2]=defaults`,live);
  const b=a['configuration']?.recipient?.capabilities?.stripe_balance;
  return a['livemode']===live && b?.stripe_transfers?.status==='active' && b?.payouts?.status==='active';
}