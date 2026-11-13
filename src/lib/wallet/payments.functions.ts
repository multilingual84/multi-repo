import {createServerFn} from '@tanstack/react-start';
export const walletPlanPaymentsFn=createServerFn({method:'POST'}).handler(async()=>{
 const {requireWallet}=await import('./access.server');const handle=await requireWallet();
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {data:user,error}=await supabaseAdmin.from('users').select('stripe_customer_id').eq('credential_handle',handle).maybeSingle();
 if(error)throw new Error('Payment history unavailable');if(!user?.stripe_customer_id)return [];
 const key=process.env['STRIPE_SECRET_KEY'];if(!key)throw new Error('Payment history unavailable');
 const response=await fetch(`https://api.stripe.com/v1/invoices?customer=${encodeURIComponent(user.stripe_customer_id)}&limit=50`,{headers:{Authorization:`Bearer ${key}`}});
 if(!response.ok)throw new Error('Payment history unavailable');
 const body=await response.json() as {data?:Array<{id:string;created:number;amount_paid:number;currency:string;status:string}>};
 return (body.data??[]).filter(r=>r.status==='paid').map(r=>({id:r.id,date:new Date(r.created*1000).toISOString(),amount:r.amount_paid,currency:r.currency.toUpperCase()}));
});