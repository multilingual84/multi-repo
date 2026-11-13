import {supabaseAdmin as db} from '@/integrations/supabase/client.server';
import {requireWallet} from './wallet/access.server';
export async function qrMailboxUser(){const wallet=await requireWallet();const {data,error}=await db.from('device_qr_credentials').select('mailbox_user').eq('wallet',wallet).single();if(error||!data)throw new Error('Private QR access required');return data.mailbox_user;}