import {createServerFn} from '@tanstack/react-start';
import {z} from 'zod';
import {setResponseHeader} from '@tanstack/react-start/server';
const uuid=z.string().uuid();
export const mailboxStateFn=createServerFn({method:'POST'}).handler(async()=>{
 setResponseHeader('Cache-Control','no-store');const {qrMailboxUser}=await import('./qr-mailbox.server');const userId=await qrMailboxUser();const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {data:mailbox,error}=await db.from('private_mailboxes').select('*').eq('user_id',userId).maybeSingle();if(error)throw new Error('Mailbox unavailable');
 const {data:sandbox}=await db.from('communication_sandbox_accounts').select('tier,expires_at').eq('user_id',userId).gt('expires_at',new Date().toISOString()).maybeSingle();
 const {data:messages,error:inboxError}=await db.from('private_message_envelopes').select('id,kind,created_at').eq('recipient_id',userId).gt('expires_at',new Date().toISOString()).order('created_at',{ascending:false}).limit(100);if(inboxError)throw new Error('Inbox unavailable');
 const {data:deliveries}=await db.from('private_message_delivery_status').select('message_id,delivered_at,received_at,replied_at').eq('sender_id',userId).gt('expires_at',new Date().toISOString()).order('delivered_at',{ascending:false}).limit(50);
 const {walletAccount}=await import('./wallet/access.server');const account=await walletAccount();
 return {mailbox,messages:messages??[],deliveries:deliveries??[],replyContacts:[] as {mailbox_id:string;nickname:string}[],paidUntil:account.paid?account.renewsAt:null,sandboxTier:sandbox?.tier??null,userId};
});
export const enrollMailboxFn=createServerFn({method:'POST'}).inputValidator((v:unknown)=>z.object({nickname:z.string().trim().min(1).max(40),publicKey:z.string().regex(/^[A-Za-z0-9+/]{43}=$/)}).parse(v)).handler(async({data})=>{
 const {qrMailboxUser}=await import('./qr-mailbox.server');const userId=await qrMailboxUser();const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {data:existing}=await db.from('private_mailboxes').select('public_key').eq('user_id',userId).maybeSingle();if(existing){if(existing.public_key!==data.publicKey)throw new Error('Encryption key mismatch');return {ok:true};}const {error}=await db.from('private_mailboxes').insert({user_id:userId,nickname:data.nickname,public_key:data.publicKey});if(error)throw new Error('Mailbox unavailable');return {ok:true};
});
export const recipientMailboxFn=createServerFn({method:'POST'}).inputValidator((v:unknown)=>z.object({mailboxId:uuid}).parse(v)).handler(async({data})=>{
 const {qrMailboxUser}=await import('./qr-mailbox.server');await qrMailboxUser();const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {data:recipient,error}=await db.from('private_mailboxes').select('mailbox_id,nickname,public_key').eq('mailbox_id',data.mailboxId).maybeSingle();if(error||!recipient)throw new Error('Recipient unavailable');return recipient;
});
export const sendPrivateMessageFn=createServerFn({method:'POST'}).inputValidator((v:unknown)=>z.object({mailboxId:uuid,ciphertext:z.string().min(24).max(2000000).regex(/^[A-Za-z0-9+/]+=*$/),nonce:z.string().regex(/^[A-Za-z0-9+/]{32}$/),sender_key:z.string().regex(/^[A-Za-z0-9+/]{43}=$/),kind:z.enum(['text','audio'])}).parse(v)).handler(async({data})=>{
 const {activateWalletTrial}=await import('./wallet/access.server');await activateWalletTrial();
 const {qrMailboxUser}=await import('./qr-mailbox.server');const userId=await qrMailboxUser();const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {data:id,error}=await db.rpc('send_qr_message',{p_user:userId,recipient_mailbox:data.mailboxId,encrypted_text:data.ciphertext,message_nonce:data.nonce,ephemeral_key:data.sender_key,message_kind:data.kind});if(error||!id)throw new Error('Sending unavailable');return {ok:true,alertSent:false,id};
});
export const openPrivateMessageFn=createServerFn({method:'POST'}).inputValidator((v:unknown)=>z.object({id:uuid}).parse(v)).handler(async({data})=>{
 setResponseHeader('Cache-Control','no-store');const {qrMailboxUser}=await import('./qr-mailbox.server');const userId=await qrMailboxUser();const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {data:rows,error}=await db.rpc('consume_qr_message',{p_user:userId,p_message:data.id});if(error||!rows?.[0])throw new Error('Message unavailable');return rows[0];
});
export const renameMailboxFn=createServerFn({method:'POST'}).inputValidator((v:unknown)=>z.object({nickname:z.string().trim().min(1).max(40)}).parse(v)).handler(async({data})=>{const {qrMailboxUser}=await import('./qr-mailbox.server');const userId=await qrMailboxUser();const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');const {error}=await db.from('private_mailboxes').update({nickname:data.nickname}).eq('user_id',userId);if(error)throw new Error('Nickname unavailable');return {ok:true};});
