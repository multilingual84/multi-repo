import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';
export const premiumSessionUsageFn=createServerFn({method:'POST'}).inputValidator((input:unknown)=>z.object({id:z.string().uuid()}).parse(input)).handler(async({data})=>{
 const {requireWallet}=await import('./access.server');const wallet=await requireWallet();
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const tick=await db.rpc('tick_premium_voice_minutes',{p_wallet:wallet,p_session:data.id});if(tick.error)throw new Error('Session usage unavailable');
 const {data:rows,error}=await db.from('premium_voice_minute_usage').select('units').eq('wallet',wallet).eq('session_id',data.id);
 if(error)throw new Error('Session usage unavailable');
 return {used:(rows??[]).reduce((n,r)=>n+Number(r.units),0),pending:0};
});
export const walletVoiceHistoryFn=createServerFn({method:'POST'}).handler(async()=>{
 const {requireWallet}=await import('./access.server');
 const wallet=await requireWallet();
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {premiumSandbox}=await import('../premium/billing.server');
 if(premiumSandbox()){
 const {data,error}=await db.from('premium_voice_sandbox_credits').select('created_at,cents,characters').eq('wallet',wallet).order('created_at',{ascending:false}).limit(50);
 if(error)throw new Error('Test history unavailable');
 return {credits:data??[],usage:[]};
 }
 const [credits,usage,minutes]=await Promise.all([
 db.from('premium_voice_credits').select('created_at,cents,characters').eq('wallet',wallet).order('created_at',{ascending:false}).limit(50),
 db.from('premium_voice_requests').select('created_at,characters,state').eq('wallet',wallet).eq('billing_basis','characters').order('created_at',{ascending:false}).limit(50),
 db.from('premium_voice_minute_usage').select('created_at,units,milliseconds').eq('wallet',wallet).order('created_at',{ascending:false}).limit(50),
 ]);
 if(credits.error||usage.error||minutes.error)throw new Error('Wallet history unavailable');
 return {credits:credits.data??[],usage:[...(usage.data??[]),...(minutes.data??[]).map(r=>({created_at:r.created_at,characters:Number(r.units),state:'succeeded',minutes:Number(r.milliseconds)/60000}))]};
});