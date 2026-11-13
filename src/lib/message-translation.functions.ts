import {createServerFn} from '@tanstack/react-start';
import {requireSupabaseAuth} from '@/integrations/supabase/auth-middleware';
import {z} from 'zod';
export const translateOpenedMessageFn=createServerFn({method:'POST'}).inputValidator((input:unknown)=>z.object({text:z.string().min(1).max(4000),target:z.string().regex(/^[a-zA-Z-]{2,12}$/),consent:z.literal(true)}).parse(input)).handler(async({data})=>{
 const {activateWalletTrial}=await import('./wallet/access.server');await activateWalletTrial();
 const {translateOpenedText}=await import('@/lib/ai/message-translation.server');return translateOpenedText(data.text,data.target);
});
