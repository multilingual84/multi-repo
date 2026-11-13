import {getRequestUrl} from '@tanstack/react-start/server';
import {premiumDb,premiumSandbox,premiumStripe,premiumSalesEnabled} from './billing.server';
import {voiceFundingSchema} from './funding-policy';

export function cardFundingEnabled(){return false;}
export async function fundingState(){
 const {wallet,db}=await premiumDb();const live=!premiumSandbox();
 const {data,error}=await db.from('premium_voice_funding').select('customer_id,setup_id,enabled,amount_cents,monthly_limit_cents').eq('wallet',wallet).eq('livemode',live).maybeSingle();
 if(error)throw new Error('Funding settings unavailable');
 let ready=false;
 if(data?.setup_id){try{const setup=await premiumStripe(`/setup_intents/${encodeURIComponent(data.setup_id)}`);ready=setup['status']==='succeeded'&&setup['customer']===data.customer_id&&setup['livemode']===live;}catch{/* No guessed readiness. */}}
 const month=new Date();month.setUTCDate(1);month.setUTCHours(0,0,0,0);
 const rows=await db.from('premium_voice_funding_attempts').select('cents,state').eq('wallet',wallet).eq('livemode',live).gte('created_at',month.toISOString());
 if(rows.error)throw new Error('Funding usage unavailable');
 return {ready,verified:cardFundingEnabled(),enabled:data?.enabled??false,amount:data?.amount_cents??500,limit:data?.monthly_limit_cents??1000,spent:(rows.data??[]).filter(r=>r.state==='pending'||r.state==='succeeded').reduce((n,r)=>n+r.cents,0),failed:(rows.data??[]).some(r=>r.state==='failed')};
}
export async function fundingSetup(){
 if(!premiumSalesEnabled())throw new Error('Enhanced voice is no longer offered.');
 const {wallet,db}=await premiumDb();const live=!premiumSandbox();
 const read=await db.from('premium_voice_funding').select('customer_id').eq('wallet',wallet).eq('livemode',live).maybeSingle();
 if(read.error)throw new Error('Funding unavailable');
 let customer=read.data?.customer_id;
 if(!customer){const result=await premiumStripe('/customers',{'metadata[wallet]':wallet},!live,`ml-voice-customer-${wallet}-${live}`);if(typeof result['id']!=='string')throw new Error('Funding unavailable');customer=result['id'];const saved=await db.from('premium_voice_funding').upsert({wallet,livemode:live,customer_id:customer},{onConflict:'wallet,livemode'});if(saved.error)throw new Error('Funding unavailable');}
 const origin=getRequestUrl().origin;
 const checkout=await premiumStripe('/checkout/sessions',{mode:'setup',customer,'payment_method_types[0]':'card',client_reference_id:wallet,'metadata[purpose]':'voice_card_setup','metadata[wallet]':wallet,success_url:`${origin}/?voice_card_session={CHECKOUT_SESSION_ID}&partner_setup=wallet`,cancel_url:`${origin}/?partner_setup=wallet`});
 if(typeof checkout['url']!=='string'||new URL(checkout['url']).hostname!=='checkout.stripe.com')throw new Error('Funding unavailable');return {url:checkout['url']};
}
export async function fundingConfirm(id:string){
 if(!cardFundingEnabled())throw new Error('Enhanced voice is no longer offered.');
 const {wallet,db}=await premiumDb();const live=!premiumSandbox();
 const session=await premiumStripe(`/checkout/sessions/${encodeURIComponent(id)}`);
 const read=await db.from('premium_voice_funding').select('customer_id').eq('wallet',wallet).eq('livemode',live).single();
 const metadata=session['metadata'] as Record<string,string>|undefined;
 if(read.error||session['livemode']!==live||session['mode']!=='setup'||session['status']!=='complete'||session['client_reference_id']!==wallet||metadata?.['purpose']!=='voice_card_setup'||metadata?.['wallet']!==wallet||session['customer']!==read.data?.customer_id||typeof session['setup_intent']!=='string')throw new Error('Card setup not verified');
 const setup=await premiumStripe(`/setup_intents/${encodeURIComponent(session['setup_intent'])}`);
 if(setup['status']!=='succeeded'||setup['customer']!==read.data.customer_id||setup['livemode']!==live)throw new Error('Card setup not verified');
 const saved=await db.from('premium_voice_funding').update({setup_id:session['setup_intent']}).eq('wallet',wallet).eq('livemode',live);if(saved.error)throw new Error('Card setup unavailable');return {ok:true};
}
export async function saveFunding(data:{enabled:boolean;amount:number;limit:number;consent:boolean}){
 voiceFundingSchema.parse(data);
 const {wallet,db}=await premiumDb();const live=!premiumSandbox();
 if(data.enabled&&(!cardFundingEnabled()||!data.consent||!premiumSalesEnabled()||!(await fundingState()).ready))throw new Error('Card and consent required');
 if(data.limit<data.amount)throw new Error('Limit below refill amount');
 const saved=await db.from('premium_voice_funding').update({enabled:data.enabled,amount_cents:data.amount,monthly_limit_cents:data.limit,consent_at:data.enabled?new Date().toISOString():null}).eq('wallet',wallet).eq('livemode',live);if(saved.error)throw new Error('Funding settings unavailable');return {ok:true};
}
// Run only from a PIN-authorized wallet action, never from a background timer.
export async function maybeRefillVoice(){
 if(!cardFundingEnabled()||!premiumSalesEnabled()||premiumSandbox())return;
 const {wallet,db}=await premiumDb();
 const account=await db.from('premium_voice_accounts').select('available_characters,blocked_reason').eq('wallet',wallet).maybeSingle();
 if(account.error||account.data?.blocked_reason||Number(account.data?.available_characters??0)>=5000)return;
 const claim=await db.rpc('claim_voice_funding',{p_wallet:wallet,p_live:true});if(claim.error)throw new Error('Funding unavailable');const attempt=claim.data?.[0];if(!attempt)return;
 try{
 const f=await db.from('premium_voice_funding').select('customer_id,setup_id').eq('wallet',wallet).eq('livemode',true).single();if(f.error||!f.data?.setup_id)throw new Error('Funding unavailable');
 const setup=await premiumStripe(`/setup_intents/${encodeURIComponent(f.data.setup_id)}`);
 if(setup['status']!=='succeeded'||setup['customer']!==f.data.customer_id||setup['livemode']!==true||typeof setup['payment_method']!=='string')throw new Error('Card unavailable');
 const pi=await premiumStripe('/payment_intents',{amount:String(attempt.cents),currency:'usd',customer:f.data.customer_id,payment_method:setup['payment_method'],off_session:'true',confirm:'true','metadata[purpose]':'premium_voice_refill','metadata[wallet]':wallet,'metadata[attempt]':attempt.id},false,`ml-voice-refill-${attempt.id}`);
 if(typeof pi['id']!=='string')throw new Error('Funding unavailable');
 await db.from('premium_voice_funding_attempts').update({payment_intent:pi['id']}).eq('id',attempt.id);
 }catch{/* Keep an ambiguous payment pending: no second charge until reconciled. */}
}
export async function fulfillVoiceRefill(id:string){
 const pi=await premiumStripe(`/payment_intents/${encodeURIComponent(id)}`,undefined,false);
 const m=pi['metadata'] as Record<string,string>|undefined;
 if(pi['status']!=='succeeded'||pi['livemode']!==true||pi['currency']!=='usd'||m?.['purpose']!=='premium_voice_refill'||!m['attempt']||!m['wallet'])throw new Error('Funding not verified');
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const a=await db.from('premium_voice_funding_attempts').select('id,wallet,cents').eq('id',m['attempt']).eq('wallet',m['wallet']).eq('livemode',true).single();
 const f=await db.from('premium_voice_funding').select('customer_id').eq('wallet',m['wallet']).eq('livemode',true).single();
 if(a.error||f.error||!a.data||pi['customer']!==f.data?.customer_id||pi['amount_received']!==a.data.cents||pi['amount']!==a.data.cents)throw new Error('Funding ownership mismatch');
 const credit=await db.rpc('credit_voice_funding',{p_attempt:a.data.id,p_wallet:a.data.wallet,p_payment:id,p_cents:a.data.cents,p_customer:String(pi['customer'])});if(credit.error)throw new Error('Funding credit unavailable');
}
