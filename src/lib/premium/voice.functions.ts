import {requireEnhancedVoice} from './retirement';
import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';
export const premiumVoiceStateFn=createServerFn({method:'POST'}).handler(async()=>{const {voiceState}=await import('./billing.server');return voiceState();});
// Stripe top-up status view: merges the wallet's credit ledger with recent
// Stripe checkout sessions, so pending / verified / failed reflects what the
// wallet actually holds. Provider failure degrades to ledger-only rows.
export const topupStatusFn=createServerFn({method:'POST'}).handler(async()=>{
 const {premiumDb,premiumStripe,premiumSandbox}=await import('./billing.server');
 const {topupStatusRows}=await import('@/lib/wallet/topup-status');
 const {wallet,db}=await premiumDb();
 const sandbox=premiumSandbox();
 const {data:credits,error}=await db.from(sandbox?'premium_voice_sandbox_credits':'premium_voice_credits').select('created_at,cents,checkout_id').eq('wallet',wallet).order('created_at',{ascending:false}).limit(50);
 if(error)throw new Error('Top-up history unavailable');
 let sessions:{id:string;created_at:string;cents:number;paid:boolean;expired:boolean}[]=[];
 try{
  const res=await premiumStripe('/checkout/sessions?limit=25',undefined,sandbox) as {data?:Array<{id?:unknown;created?:unknown;metadata?:Record<string,string|undefined>;payment_status?:string;status?:string}>};
  sessions=(res.data??[]).filter(s=>s.metadata?.['wallet']===wallet&&s.metadata?.['purpose']==='premium_voice_credit').map(s=>({id:String(s.id),created_at:new Date(Number(s.created??0)*1000).toISOString(),cents:Number(s.metadata?.['cents']??0),paid:s.payment_status==='paid',expired:s.status==='expired'}));
 }catch{/* Stripe unavailable: ledger rows still render */}
 return {rows:topupStatusRows(sessions,credits??[]),sandbox};
});
export const premiumVoiceCheckoutFn=createServerFn({method:'POST'}).inputValidator((input:unknown)=>z.object({cents:z.union([z.literal(100),z.literal(500),z.literal(1000)])}).parse(input)).handler(async({data})=>{const {voiceCheckout}=await import('./billing.server');return voiceCheckout(data.cents);});
export const premiumVoiceConfirmFn=createServerFn({method:'POST'}).inputValidator((input:unknown)=>z.object({id:z.string().regex(/^cs_(test|live)_[A-Za-z0-9]+$/)}).parse(input)).handler(async({data})=>{const {voiceConfirm}=await import('./billing.server');return voiceConfirm(data.id);});
export const premiumVoiceStartFn=createServerFn({method:'POST'}).handler(async()=>{requireEnhancedVoice();return {id:''};});
export const premiumVoiceStopFn=createServerFn({method:'POST'}).inputValidator((input:unknown)=>z.object({id:z.string().uuid()}).parse(input)).handler(async({data})=>{const {premiumDb}=await import('./billing.server');const {wallet,db}=await premiumDb();const {error}=await db.from('premium_voice_sessions').update({ended_at:new Date().toISOString()}).eq('id',data.id).eq('wallet',wallet).is('ended_at',null);if(error)throw new Error('Session unavailable');return {ok:true};});
export const premiumVoiceActivityFn=createServerFn({method:'POST'}).inputValidator((input:unknown)=>z.object({id:z.string().uuid()}).parse(input)).handler(async()=>{requireEnhancedVoice();return {ok:false};});
