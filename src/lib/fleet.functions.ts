import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';
export const fleetStateFn=createServerFn({method:'POST'}).handler(async()=>{
 const {requireWallet,walletAccount}=await import('./wallet/access.server');const wallet=await requireWallet();const account=await walletAccount();const {fleetSeatLimit}=await import('./fleet-policy');const seats=fleetSeatLimit(account.paid,account.tier);
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 if(seats>1){const {data:f,error}=await db.from('fleet_accounts').upsert({owner_wallet:wallet},{onConflict:'owner_wallet'}).select('id').single();if(error||!f)throw new Error('Fleet unavailable');const {data:members,error:e}=await db.from('fleet_members').select('wallet,nickname,approved,daily_minutes,used_seconds').eq('fleet_id',f.id);if(e)throw new Error('Fleet unavailable');const rows=members??[];const ids=rows.filter(m=>m.approved).map(m=>m.wallet);const {data:credentials}=ids.length?await db.from('device_qr_credentials').select('wallet,mailbox_user').in('wallet',ids):{data:[]};const users=(credentials??[]).map(c=>c.mailbox_user);const {data:mailboxes}=users.length?await db.from('private_mailboxes').select('user_id,mailbox_id').in('user_id',users):{data:[]};return {owner:true,seats,id:f.id,members:rows.map(m=>({...m,mailboxId:m.approved?mailboxes?.find(b=>b.user_id===credentials?.find(c=>c.wallet===m.wallet)?.mailbox_user)?.mailbox_id??null:null}))};}
 return {owner:false,seats:0,id:null,members:[]};
});
export const fleetJoinFn=createServerFn({method:'POST'}).inputValidator((v:unknown)=>z.object({id:z.string().uuid(),nickname:z.string().trim().min(1).max(40)}).parse(v)).handler(async({data})=>{
 const {requireWallet}=await import('./wallet/access.server');const wallet=await requireWallet();const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {data:f}=await db.from('fleet_accounts').select('owner_wallet').eq('id',data.id).maybeSingle();if(!f||f.owner_wallet===wallet)throw new Error('Fleet unavailable');
 const {data:owner}=await db.from('users').select('is_subscription_active,subscription_renews_at,subscription_tier').eq('credential_handle',f.owner_wallet).maybeSingle();const {paidWalletAccess}=await import('./wallet/schema');const {fleetSeatLimit}=await import('./fleet-policy');if(fleetSeatLimit(paidWalletAccess(true,owner?.is_subscription_active??false,owner?.subscription_renews_at??null),owner?.subscription_tier??'none')<2)throw new Error('Fleet unavailable');
 const {error}=await db.from('fleet_members').insert({fleet_id:data.id,wallet,nickname:data.nickname});if(error)throw new Error('Request unavailable or already submitted');return {ok:true};
});
export const fleetMemberFn=createServerFn({method:'POST'}).inputValidator((v:unknown)=>z.object({wallet:z.string().uuid(),approved:z.boolean(),minutes:z.number().int().min(0).max(1440)}).parse(v)).handler(async({data})=>{
 const {requireWallet,walletAccount}=await import('./wallet/access.server');const wallet=await requireWallet();const account=await walletAccount();const {fleetSeatLimit}=await import('./fleet-policy');const seats=fleetSeatLimit(account.paid,account.tier);if(seats<2)throw new Error('Paid fleet required');const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {data:f}=await db.from('fleet_accounts').select('id').eq('owner_wallet',wallet).single();if(!f)throw new Error('Fleet unavailable');
 const {error}=await db.rpc('configure_fleet_member',{p_owner:wallet,p_member:data.wallet,p_approved:data.approved,p_minutes:data.minutes,p_seats:seats});if(error)throw new Error('Member update unavailable; check seat capacity');return {ok:true};
});
async function groupContext(){
 const {requireWallet}=await import('./wallet/access.server');const wallet=await requireWallet();const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {paidWalletAccess}=await import('./wallet/schema');const {fleetGroupAllowed}=await import('./fleet-policy');
 const ownerOk=async(owner:string)=>{const {data:u}=await db.from('users').select('is_subscription_active,subscription_renews_at,subscription_tier').eq('credential_handle',owner).maybeSingle();return fleetGroupAllowed(paidWalletAccess(true,u?.is_subscription_active??false,u?.subscription_renews_at??null),u?.subscription_tier??'none');};
 const {data:own}=await db.from('fleet_accounts').select('id,owner_wallet').eq('owner_wallet',wallet).maybeSingle();
 if(own&&await ownerOk(wallet))return {db,wallet,fleet:own.id as string,name:'Owner'};
 const {data:m}=await db.from('fleet_members').select('fleet_id,nickname').eq('wallet',wallet).eq('approved',true).limit(1).maybeSingle();
 if(!m)return null;const {data:f}=await db.from('fleet_accounts').select('owner_wallet').eq('id',m.fleet_id).maybeSingle();
 if(!f||!await ownerOk(f.owner_wallet))return null;return {db,wallet,fleet:m.fleet_id as string,name:m.nickname as string};
}
export const fleetGroupReadFn=createServerFn({method:'POST'}).handler(async()=>{
 const g=await groupContext();if(!g)return {allowed:false,messages:[] as {id:string;sender_name:string;body:string;created_at:string;mine:boolean}[]};
 const {data}=await g.db.from('fleet_group_messages').select('id,sender_wallet,sender_name,body,created_at').eq('fleet_id',g.fleet).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(50);
 return {allowed:true,messages:(data??[]).map(m=>({id:m.id,sender_name:m.sender_name,body:m.body,created_at:m.created_at,mine:m.sender_wallet===g.wallet}))};
});
export const fleetGroupSendFn=createServerFn({method:'POST'}).inputValidator((v:unknown)=>z.object({body:z.string().trim().min(1).max(2000)}).parse(v)).handler(async({data})=>{
 const g=await groupContext();if(!g)throw new Error('Paid fleet required');
 const {error}=await g.db.from('fleet_group_messages').insert({fleet_id:g.fleet,sender_wallet:g.wallet,sender_name:g.name,body:data.body});if(error)throw new Error('Send unavailable');return {ok:true};
});
