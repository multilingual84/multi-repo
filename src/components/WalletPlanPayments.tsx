import {useEffect,useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import {walletPlanPaymentsFn} from '@/lib/wallet/payments.functions';
import {walletClarityCopy} from '@/lib/wallet/clarity';
import type {UILocale} from '@/lib/ui-copy';
export default function WalletPlanPayments({locale,hide,refresh}:{locale:UILocale;hide:boolean;refresh:number}){
 const c=walletClarityCopy[locale],read=useServerFn(walletPlanPaymentsFn);
 const [rows,setRows]=useState<Awaited<ReturnType<typeof walletPlanPaymentsFn>>|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{let alive=true;void read().then(v=>{if(alive){setRows(v);setFailed(false);}}).catch(()=>{if(alive)setFailed(true);});return()=>{alive=false;};},[refresh]);
 return <details open data-wallet-plan-payments><summary className="font-bold cursor-pointer">{c.payments}</summary>{failed?<p role="alert" className="py-2">{c.unavailable}</p>:rows?.length===0?<p className="py-2 text-muted-foreground">{c.empty}</p>:<ul className="max-h-60 divide-y divide-border overflow-y-auto">{rows?.map(r=><li key={r.id} className="space-y-1 py-2"><div className="flex flex-wrap justify-between gap-2"><span>{c.payment}</span><span translate="no">{hide?'••••':new Intl.NumberFormat(locale,{style:'currency',currency:r.currency}).format(r.amount/(new Intl.NumberFormat('en',{style:'currency',currency:r.currency}).resolvedOptions().maximumFractionDigits===0?1:100))}</span></div><time className="text-muted-foreground" dateTime={r.date}>{new Date(r.date).toLocaleString(locale)}</time></li>)}</ul>}</details>;
}