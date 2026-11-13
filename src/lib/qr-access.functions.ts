import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { qrCredentialSchema } from './qr-access-policy';
const proofSchema=qrCredentialSchema.extend({device:z.string().regex(/^[a-f0-9]{64}$/)});
export const activateQrTrialFn=createServerFn({method:'POST'}).handler(async()=>{const {activateWalletTrial,walletAccount}=await import('./wallet/access.server');await activateWalletTrial();return walletAccount();});
export const establishQrAccessFn=createServerFn({method:'POST'}).inputValidator((v:unknown)=>proofSchema.parse(v)).handler(async({data})=>{
 const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const {walletSession,credentialHash}=await import('./wallet/access.server');
 const recovery=await credentialHash(data.seed),deviceHash=await credentialHash(data.device);
 const session=await walletSession();
 const {freshLegacyOwnership}=await import('./qr-access-policy');
 const {data:rows,error}=await db.rpc('enroll_qr_device',{p_wallet:data.id,p_recovery:recovery,p_device:deviceHash,p_legacy_owned:freshLegacyOwnership(session.data,data.id,Date.now())});
 const row=rows?.[0];if(error||!row){if(error)console.error('QR enrollment unavailable',error.code,error.message);throw new Error('Private access unavailable or account moved to another device');}
 await session.update({handle:data.id,deviceHash,generation:row.generation});return {id:data.id,mailboxUser:row.mailbox_user};
});
export const importQrAccessFn=createServerFn({method:'POST'}).inputValidator((v:unknown)=>proofSchema.parse(v)).handler(async({data})=>{
 const {credentialHash,walletSession}=await import('./wallet/access.server');const {supabaseAdmin:db}=await import('@/integrations/supabase/client.server');
 const deviceHash=await credentialHash(data.device);const {data:generation,error}=await db.rpc('move_qr_device',{p_wallet:data.id,p_recovery:await credentialHash(data.seed),p_device:deviceHash});if(error||generation===null)throw new Error('Private access QR not recognized');
 const session=await walletSession();await session.update({handle:data.id,deviceHash,generation});const {data:row}=await db.from('device_qr_credentials').select('mailbox_user').eq('wallet',data.id).single();if(!row)throw new Error('Access unavailable');return {id:data.id,mailboxUser:row.mailbox_user};
});