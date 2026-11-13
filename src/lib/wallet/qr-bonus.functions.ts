import {createServerFn} from '@tanstack/react-start';
export const claimQrShareBonusFn=createServerFn({method:'POST'}).handler(async()=>{
 const {requireWallet}=await import('./access.server');
 const handle=await requireWallet();
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data,error}=await supabaseAdmin.rpc('claim_qr_daily_bonus',{p_handle:handle});
 if(error||!data)throw new Error('Sharing bonus unavailable');
 return {bonusMinutes:30,expiresAt:data};
});