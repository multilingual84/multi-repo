import {createFileRoute} from '@tanstack/react-router';
import {authenticateCronRequest} from '@/integrations/supabase/cron-auth';
export const Route=createFileRoute('/api/public/jobs/partner-payments')({staticData:{sitemap:false},server:{handlers:{POST:async({request})=>{
 const failure=await authenticateCronRequest(request);if(failure)return failure;
 const {runPartnerPayments}=await import('@/lib/referrals/commissions.server');
 return Response.json(await runPartnerPayments(true));
}}}});