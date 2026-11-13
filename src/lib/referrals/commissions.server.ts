import {remainingCommission,tierCommissionMinor,commissionEligibleAt} from './policy';
import {partnerStripe,partnerAccountReady,livePartnerPaymentsEnabled} from './stripe.server';
import {supabaseAdmin as db} from '@/integrations/supabase/client.server';
export async function recordPartnerInvoice(invoice:Record<string,any>,live:boolean){
 const subId=typeof invoice['subscription']==='string'?invoice['subscription']:invoice['parent']?.subscription_details?.subscription;
 if(typeof subId!=='string'||invoice['paid']!==true||invoice['amount_paid']<=0)return;
 const sub=await partnerStripe(`/v1/subscriptions/${encodeURIComponent(subId)}`,live);
 const meta=sub['metadata']??{};
 if(!meta.partner_referral||!tierCommissionMinor(meta.tier,meta.purpose,1))return;
 if(invoice['livemode']!==live||sub['livemode']!==live)throw new Error('Commission mode mismatch');
 const {data:partner,error}=await db.from('referral_partners').select('*').eq('code',meta.partner_referral).eq('livemode',live).maybeSingle();
 if(error)throw new Error('Partner attribution unavailable');
 if(!partner||partner.wallet===meta.credential_handle)return;
 // Only the package lines earn a split, never the separate processing fee.
 const lines=await partnerStripe(`/v1/invoices/${encodeURIComponent(invoice['id'])}/lines?limit=100`,live);
 if(lines['has_more'])throw new Error('Invoice requires review');
 const {packageCheckoutPrices}=await import('../stripe.functions');
 const tierPrices=new Set<string>(Object.values(packageCheckoutPrices).filter(p=>p.tier===meta.tier).flatMap(p=>Object.entries(p.prices).filter(([currency])=>currency.toLowerCase()===invoice['currency']).map(([,id])=>id)));
 // Complex credits, discounts and tax allocations need explicit review, not estimates.
 if((lines['data']??[]).some((l:any)=>l.amount<0||(l.discount_amounts??[]).some((d:any)=>d.amount>0)) || (invoice['total_discount_amounts']??[]).some((d:any)=>d.amount>0) || (invoice['total_taxes']??invoice['total_tax_amounts']??[]).some((t:any)=>t.amount>0))throw new Error('Invoice allocation requires review');
 const tierMinor=(lines['data']??[]).filter((l:any)=>tierPrices.has(l.price?.id??l.pricing?.price_details?.price)).reduce((n:number,l:any)=>n+Math.max(0,Number(l.amount)||0),0);
 // Discounts/partial payments cannot produce more commissions than paid funds.
 const allMinor=(lines['data']??[]).reduce((n:number,l:any)=>n+Math.max(0,Number(l.amount)||0),0);
 const paidTier=Math.min(tierMinor,Math.floor(invoice['amount_paid']*tierMinor/Math.max(1,allMinor)));
 const shareBase=tierCommissionMinor(meta.tier,meta.purpose,paidTier);if(!shareBase)return;
 let chargeId=typeof invoice['charge']==='string'?invoice['charge']:null;
 if(!chargeId){
  const payments=await partnerStripe(`/v1/invoice_payments?invoice=${encodeURIComponent(invoice['id'])}&limit=10`,live);
  const paid=(payments['data']??[]).filter((p:any)=>p.status==='paid');
  if(paid.length!==1)throw new Error('Invoice payment requires review');
  const payment=paid[0]?.payment;
  if(payment?.type==='charge')chargeId=payment.charge;
  else if(payment?.payment_intent){const pi=await partnerStripe(`/v1/payment_intents/${encodeURIComponent(payment.payment_intent)}`,live);chargeId=pi['latest_charge'];}
 }
 if(typeof chargeId!=='string')throw new Error('Invoice charge unavailable');
 const charge=await partnerStripe(`/v1/charges/${encodeURIComponent(chargeId)}`,live);
 if(charge['livemode']!==live||charge['paid']!==true||charge['currency']!==invoice['currency'])throw new Error('Commission payment mismatch');
 // The customer surcharge is separate: the partner earns the full rounded
 // 50% package share. fee_minor records affiliate deductions, not merchant fees.
 // Existing invoices retain their recorded amounts through idempotent inserts.
 const {error:save}=await db.from('referral_commissions').upsert({partner_id:partner.id,invoice_id:invoice['id'],charge_id:chargeId,currency:invoice['currency'],tier_minor:paidTier,share_minor:shareBase,fee_minor:0,livemode:live,eligible_at:commissionEligibleAt(invoice['status_transitions']?.paid_at)}, {onConflict:'invoice_id,livemode',ignoreDuplicates:true});
 if(save)throw new Error('Commission not saved');
}
export async function settlePartnerCommission(row:Record<string,any>){
 const live=Boolean(row['livemode']);
 if(live&&!livePartnerPaymentsEnabled())return;
 const {data:partner,error}=await db.from('referral_partners').select('stripe_account').eq('id',row['partner_id']).eq('livemode',live).single();
 if(error)throw new Error('Partner account unavailable');
 let status='pending',transfer=row['transfer_id'],transferred=Number(row['transferred_minor']),reversed=Number(row['reversed_minor']);
 try{
  if(!transfer){
   // Recover accepted transfers even after the response or ledger write was lost.
   // Stripe idempotency keys expire, so the persistent transfer group is checked too.
   const prior=await partnerStripe(`/v1/transfers?transfer_group=${encodeURIComponent(`ML_${row['invoice_id']}`)}&limit=10`,live);
   if(prior['has_more']||(prior['data']??[]).length>1)throw new Error('Transfer reconciliation requires review');
   const existing=prior['data']?.[0];
   if(existing){if(existing.destination!==partner?.stripe_account||existing.currency!==row['currency']||existing.livemode!==live)throw new Error('Transfer ownership mismatch');transfer=existing.id;}
  }
  const charge=await partnerStripe(`/v1/charges/${encodeURIComponent(row['charge_id'])}`,live);
  if(charge['livemode']!==live||charge['paid']!==true||charge['currency']!==row['currency'])throw new Error('Payment mismatch');
  const target=remainingCommission(Number(row['share_minor']),Number(charge['amount']),Number(charge['amount_refunded']),Boolean(charge['disputed']));
  if(transfer){
   // Stripe is authoritative if the process died after sending the transfer.
   const current=await partnerStripe(`/v1/transfers/${encodeURIComponent(transfer)}`,live);
   transferred=Number(current['amount']);reversed=Number(current['amount_reversed']);
   const reversal=Math.max(0,transferred-reversed-target);
   if(reversal){await partnerStripe(`/v1/transfers/${encodeURIComponent(transfer)}/reversals`,live,{amount:reversal},`ml-reversal-${row['id']}-${reversed+reversal}`);reversed+=reversal;}
   status=reversed===transferred?'reversed':'transferred';
  }else if(!target){status='reversed';}
  else if(!partner?.stripe_account||!await partnerAccountReady(partner.stripe_account,live)){status='setup_required';}
  else{
   const balance=await partnerStripe(`/v1/balance_transactions/${encodeURIComponent(charge['balance_transaction'])}`,live);
   if(balance['status']!=='available'){status='pending';}
   else{
    const t=await partnerStripe('/v1/transfers',live,{amount:target,currency:row['currency'],destination:partner.stripe_account,source_transaction:row['charge_id'],transfer_group:`ML_${row['invoice_id']}`},`ml-commission-${row['id']}`);
    if(typeof t['id']!=='string'||t['livemode']!==live)throw new Error('Transfer mismatch');transfer=t['id'];transferred=target;status='transferred';
   }
  }
 }catch{status='failed';}
 const {error:saved}=await db.from('referral_commissions').update({status,transfer_id:transfer,transferred_minor:transferred,reversed_minor:reversed,lease_until:null,next_attempt:new Date(Date.now()+3600000).toISOString(),updated_at:new Date().toISOString()}).eq('id',row['id']);
 if(saved)throw new Error('Commission state not saved');
}
export async function runPartnerPayments(live:boolean){
 if(live&&!livePartnerPaymentsEnabled())return {enabled:false,processed:0};
 const {data:rows,error}=await db.rpc('claim_referral_commissions',{p_live:live});if(error)throw new Error('Payment queue unavailable');
 for(const row of rows??[])await settlePartnerCommission(row);
 return {enabled:true,processed:rows?.length??0};
}