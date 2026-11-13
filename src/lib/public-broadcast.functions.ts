import { createServerFn } from '@tanstack/react-start';
import { broadcastAccessEnd, broadcastLanguages } from './public-broadcast-policy';
import { z } from 'zod';
const id=z.string().uuid();
const request=z.object({broadcast:id,listener:id.optional(),token:z.string().min(32).max(128).optional()});
async function hash(value:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join('');}
async function authorize(data:z.infer<typeof request>){
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {data:b,error}=await db.from('public_audio_broadcasts').select('*').eq('id',data.broadcast).single();
 if(error||!b||b.ended_at||Date.parse(b.expires_at)<=Date.now())throw new Error('Broadcast ended');
 if(data.listener){if(!data.token||Date.parse(b.last_seen)<Date.now()-20000)throw new Error('Listener unavailable');const {data:l}=await db.from('public_audio_listeners').select('*').eq('id',data.listener).eq('broadcast_id',b.id).eq('token_hash',await hash(data.token)).single();if(!l||Date.parse(l.last_seen)<Date.now()-20000)throw new Error('Listener unavailable');return {db,b,host:false,l};}
 const {requireWallet,walletAccount}=await import('./wallet/access.server');await requireWallet(b.wallet);const account=await walletAccount();
 const {data:w}=await db.from('device_wallet_access').select('created_at').eq('credential_handle',b.wallet).single();
 if(!w||!broadcastAccessEnd(w.created_at,account.paid,account.renewsAt,Date.now()))throw new Error('Solo access required');
 return {db,b,host:true,l:null};
}
export const startPublicBroadcast=createServerFn({method:'POST'}).handler(async()=>{
 const {activateWalletTrial}=await import('./wallet/access.server');await activateWalletTrial();
 const {requireWallet,walletAccount}=await import('./wallet/access.server');const wallet=await requireWallet();const account=await walletAccount();
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {data:w}=await db.from('device_wallet_access').select('created_at').eq('credential_handle',wallet).single();
 const end=w?broadcastAccessEnd(w.created_at,account.paid,account.renewsAt,Date.now()):null;if(!end)throw new Error('Solo access required');
 const {data:existing}=await db.from('public_audio_broadcasts').select('id').eq('wallet',wallet).is('ended_at',null).gt('expires_at',new Date().toISOString()).limit(1).maybeSingle();if(existing)throw new Error('Stop your existing broadcast first');
 const {data,error}=await db.from('public_audio_broadcasts').insert({wallet,expires_at:new Date(end).toISOString()}).select('id,expires_at').single();if(error||!data)throw new Error('Broadcast unavailable');return data;
});
export const joinPublicBroadcast=createServerFn({method:'POST'}).inputValidator(z.object({broadcast:id,language:z.string().max(12)})).handler(async({data})=>{
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const token=crypto.randomUUID()+crypto.randomUUID();const language=broadcastLanguages([data.language])[0]??'en';const {data:listener,error}=await db.rpc('join_public_audio',{p_broadcast:data.broadcast,p_hash:await hash(token),p_language:language});if(error||!listener)throw new Error('Broadcast unavailable or full');return {listener,token};
});
export const pollPublicBroadcast=createServerFn({method:'POST'}).inputValidator(request.extend({after:z.number().int().nonnegative(),connected:z.array(id).max(5).optional()})).handler(async({data})=>{
 const {db,b,host,l}=await authorize(data);
 if(l)await db.from('public_audio_listeners').update({last_seen:new Date().toISOString()}).eq('id',l.id);
 const {data:listeners}=await db.from('public_audio_listeners').select('id,language').eq('broadcast_id',b.id).gt('last_seen',new Date(Date.now()-20000).toISOString());
 const connected=(host?(data.connected??[]):b.connected_ids).filter(x=>listeners?.some(l=>l.id===x));
 if(host)await db.from('public_audio_broadcasts').update({connected_ids:connected,last_seen:new Date().toISOString()}).eq('id',b.id);
 let query=db.from('public_audio_signals').select('id,listener_id,payload').eq('broadcast_id',b.id).eq('to_host',host).gt('id',data.after).order('id').limit(100);if(l)query=query.eq('listener_id',l.id);
 const {data:signals,error}=await query;if(error)throw new Error('Connection unavailable');
 return {listeners:host?listeners??[]:[],signals:signals??[],count:connected.length};
});
export const signalPublicBroadcast=createServerFn({method:'POST'}).inputValidator(request.extend({target:id.optional(),payload:z.record(z.string(),z.unknown())})).handler(async({data})=>{
 const {db,b,host,l}=await authorize(data);if(JSON.stringify(data.payload).length>24000)throw new Error('Signal too large');
 const target=host?data.target:l?.id;if(!target)throw new Error('Target required');const {data:peer}=await db.from('public_audio_listeners').select('id').eq('broadcast_id',b.id).eq('id',target).single();if(!peer)throw new Error('Target unavailable');
 const {count}=await db.from('public_audio_signals').select('id',{count:'exact',head:true}).eq('listener_id',target);if((count??0)>1500)throw new Error('Reconnect limit reached');
 const {error}=await db.from('public_audio_signals').insert({broadcast_id:b.id,listener_id:target,to_host:!host,payload:data.payload as never});if(error)throw new Error('Connection unavailable');return true;
});
export const leavePublicBroadcast=createServerFn({method:'POST'}).inputValidator(request).handler(async({data})=>{const {db,b,host,l}=await authorize(data);if(host)await db.from('public_audio_broadcasts').update({ended_at:new Date().toISOString(),connected_ids:[]}).eq('id',b.id);else if(l)await db.from('public_audio_listeners').update({last_seen:'2000-01-01T00:00:00Z'}).eq('id',l.id);return true;});
export const translatePublicBroadcast=createServerFn({method:'POST'}).inputValidator(request.extend({audio:z.string().min(200).max(500000),mime:z.string().regex(/^audio\/[\w.+;-]+$/).max(80),localLanguage:z.string().max(12).optional()})).handler(async({data})=>{
 const {db,b,host}=await authorize(data);if(!host)throw new Error('Publisher required');
 const {data:ok}=await db.rpc('reserve_public_audio_phrase',{p_broadcast:b.id,p_wallet:b.wallet});if(!ok)throw new Error('Speech limit reached');
 const {data:rows}=await db.from('public_audio_listeners').select('language').eq('broadcast_id',b.id).gt('last_seen',new Date(Date.now()-20000).toISOString());
 const languages=broadcastLanguages([...(rows??[]).map(x=>x.language),...(data.localLanguage?[data.localLanguage]:[])]);
 const {interpretBroadcast}=await import('./ai/broadcast.server');return interpretBroadcast(data.audio,data.mime,languages);
});
