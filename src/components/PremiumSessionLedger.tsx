import {useEffect,useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import {premiumSessionUsageFn} from '@/lib/wallet/history.functions';
import {premiumSessionCopy} from '@/lib/premium/session-copy';
import {localVoiceAmount,sessionUsage} from '@/lib/premium/session-ui';
import type {UILocale} from '@/lib/ui-copy';
export default function PremiumSessionLedger({locale,start,session,country}:{locale:UILocale;start:number;session:string;country:string}){
 const s=premiumSessionCopy[locale],[now,setNow]=useState(Date.now());
 const read=useServerFn(premiumSessionUsageFn),[usage,setUsage]=useState<{used:number;pending:number}|null>(null);
 useEffect(()=>{let alive=true;const load=()=>void read({data:{id:session}}).then(v=>{if(alive)setUsage(v);}).catch(()=>{});load();const id=window.setInterval(load,5000);return()=>{alive=false;clearInterval(id);};},[session]);
 useEffect(()=>{const id=window.setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id);},[]);
 const u=sessionUsage(usage?.used??0,now-start),local=localVoiceAmount(u.usd,country);
 return <div data-premium-ledger role="status" className="w-full space-y-1 rounded-lg border border-border bg-card p-3 text-left text-xs"><p className="font-bold">{s.ledger}</p><div className="flex justify-between gap-2"><span>{s.minutes}</span><span translate="no">{u.minutes.toFixed(1)}</span></div><div className="flex justify-between gap-2"><span>{s.characters}</span><span translate="no">{usage?(u.usd/.16).toFixed(3):'—'}</span></div><div className="flex flex-wrap justify-between gap-2"><span>{s.spent}</span><span translate="no">{usage?`$${u.usd.toFixed(4)} USD${local&&local.code!=='USD'?` ≈ ${local.amount.toFixed(4)} ${local.code}`:''}`:'—'}</span></div><div className="flex justify-between gap-2"><span>{s.pending}</span><span translate="no">{usage?usage.pending:'—'}</span></div><p className="text-muted-foreground">{s.noMinute} {local&&local.code!=='USD'?s.equivalent:''}</p></div>;
}