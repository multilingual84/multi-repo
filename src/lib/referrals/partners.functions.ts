import {createServerFn} from '@tanstack/react-start';
import {getRequestUrl} from '@tanstack/react-start/server';
import {z} from 'zod';
import {normalizeCoupon,validCoupon} from '../affiliate-coupon';
export const partnerStateFn=createServerFn({method:'POST'}).handler(async()=>{
  const {requireWallet}=await import('../wallet/access.server'); const wallet=await requireWallet();
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  const {partnerTestMode,livePartnerPaymentsEnabled,partnerAccountReady}=await import('./stripe.server');
  const live=!partnerTestMode();
  const {data:partner,error}=await db.from('referral_partners').select('id,code,stripe_account,contact_email,country').eq('wallet',wallet).eq('livemode',live).maybeSingle();
  if(error)throw new Error('Partner account unavailable');
  const rows=partner?await db.from('referral_commissions').select('invoice_id,currency,share_minor,fee_minor,status,eligible_at,transferred_minor,reversed_minor,next_attempt').eq('partner_id',partner.id).eq('livemode',live).order('created_at',{ascending:false}).limit(50):null;
  if(rows?.error)throw new Error('Partner history unavailable');
  let accountStatus:import('./status').PartnerAccountStatus='not_connected';
  if(partner?.stripe_account){
    try{accountStatus=await partnerAccountReady(partner.stripe_account,live)?'ready':'setup_required';}
    catch{accountStatus='unavailable';}
  }
  return {code:partner?.code??null,connected:Boolean(partner?.stripe_account),accountStatus,email:partner?.contact_email??'',country:partner?.country??'US',history:rows?.data??[],test:!live,enabled:!live||livePartnerPaymentsEnabled()};
});
export const partnerOnboardFn=createServerFn({method:'POST'})
 .inputValidator((input:unknown)=>z.object({email:z.string().email().max(254),country:z.string().regex(/^[A-Z]{2}$/)}).parse(input))
 .handler(async({data})=>{
  const {requireWallet}=await import('../wallet/access.server'); const wallet=await requireWallet();
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  const {partnerStripe,partnerTestMode}=await import('./stripe.server'); const live=!partnerTestMode();
  let {data:partner,error}=await db.from('referral_partners').select('*').eq('wallet',wallet).eq('livemode',live).maybeSingle();
  if(error)throw new Error('Partner account unavailable');
  if(!partner){
   const code=`ML-${crypto.randomUUID().replace(/-/g,'').slice(0,16).toUpperCase()}`;
   const created=await db.from('referral_partners').insert({wallet,code,livemode:live,contact_email:data.email,country:data.country}).select('*').single();
   if(created.error){const retry=await db.from('referral_partners').select('*').eq('wallet',wallet).eq('livemode',live).single();if(retry.error)throw new Error('Partner enrollment unavailable');partner=retry.data;}else partner=created.data;
  }
  if(!partner)throw new Error('Partner account unavailable');
  let account=partner.stripe_account;
  if(!account){
   const a=await partnerStripe('/v2/core/accounts',live,{contact_email:partner.contact_email,display_name:'Multi-Lingual partner',identity:{country:partner.country.toLowerCase()},dashboard:'express',configuration:{recipient:{capabilities:{stripe_balance:{stripe_transfers:{requested:true}}}}},defaults:{responsibilities:{fees_collector:'application',losses_collector:'application'}},include:['configuration.recipient','requirements']},`ml-partner-${partner.id}`);
   if(typeof a['id']!=='string'||a['livemode']!==live)throw new Error('Partner mode mismatch');account=a['id'];
   const saved=await db.from('referral_partners').update({stripe_account:account}).eq('id',partner.id);if(saved.error)throw new Error('Partner setup not saved');
  }
  const origin=getRequestUrl().origin;
  const link=await partnerStripe('/v2/core/account_links',live,{account,use_case:{type:'account_onboarding',account_onboarding:{collection_options:{fields:'eventually_due'},return_url:`${origin}/?partner_setup=return`,refresh_url:`${origin}/?partner_setup=retry`}}});
  if(typeof link['url']!=='string'||new URL(link['url']).hostname!=='connect.stripe.com')throw new Error('Partner setup unavailable');
  return {url:link['url'],code:partner.code};
});

const codeValidator=(input:unknown)=>{
  const parsed=z.object({code:z.string().max(24)}).parse(input);
  const code=normalizeCoupon(parsed.code);
  if(!validCoupon(code))throw new Error('Invalid code');
  return {code};
};

// Public availability check for a share-and-earn code. Reveals only availability.
export const checkAffiliateCodeFn=createServerFn({method:'POST'})
 .inputValidator(codeValidator)
 .handler(async({data})=>{
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  const {partnerTestMode}=await import('./stripe.server');
  const {data:partner,error}=await db.from('referral_partners').select('id').eq('code',data.code).eq('livemode',!partnerTestMode()).maybeSingle();
  if(error)throw new Error('Code check unavailable');
  return partner?'taken' as const:'available' as const;
});

// Recipient redemption: confirms the code exists so the device can add its 30 days.
export const redeemAffiliateCodeFn=createServerFn({method:'POST'})
 .inputValidator(codeValidator)
 .handler(async({data})=>{
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  const {partnerTestMode}=await import('./stripe.server');
  const {data:partner,error}=await db.from('referral_partners').select('id').eq('code',data.code).eq('livemode',!partnerTestMode()).maybeSingle();
  if(error)throw new Error('Code check unavailable');
  const {COUPON_EXTRA_DAYS}=await import('../affiliate-coupon');
  return partner?{ok:true as const,extraDays:COUPON_EXTRA_DAYS}:{ok:false as const};
});

// Creator claim: reserves the chosen code globally for this wallet's partner account.
export const claimAffiliateCodeFn=createServerFn({method:'POST'})
 .inputValidator((input:unknown)=>{
  const {code}=codeValidator(input);
  const parsed=z.object({email:z.string().email().max(254),country:z.string().regex(/^[A-Z]{2}$/)}).parse(input);
  return {code,email:parsed.email,country:parsed.country};
 })
 .handler(async({data})=>{
  const {requireWallet}=await import('../wallet/access.server'); const wallet=await requireWallet();
  const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
  const {partnerTestMode}=await import('./stripe.server'); const live=!partnerTestMode();
  const {data:partner,error}=await db.from('referral_partners').select('id,code').eq('wallet',wallet).eq('livemode',live).maybeSingle();
  if(error)throw new Error('Partner account unavailable');
  if(partner){
   if(partner.code===data.code)return {code:partner.code};
   const updated=await db.from('referral_partners').update({code:data.code}).eq('id',partner.id);
   if(updated.error)return {taken:true as const};
   return {code:data.code};
  }
  const created=await db.from('referral_partners').insert({wallet,code:data.code,livemode:live,contact_email:data.email,country:data.country});
  if(created.error){
   // Unique violation on code means another partner claimed it first.
   const retry=await db.from('referral_partners').select('id,code').eq('wallet',wallet).eq('livemode',live).maybeSingle();
   if(retry.data)return {code:retry.data.code};
   return {taken:true as const};
  }
  return {code:data.code};
});