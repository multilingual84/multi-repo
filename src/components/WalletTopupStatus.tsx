import {useEffect,useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import {topupStatusFn} from '@/lib/premium/voice.functions';
import {walletUiCopy} from '@/lib/wallet/ui-copy';
import type {UILocale} from '@/lib/ui-copy';
export default function WalletTopupStatus({locale,hide,refresh}:{locale:UILocale;hide:boolean;refresh:number}){
 const c=walletUiCopy[locale],read=useServerFn(topupStatusFn);
 const [rows,setRows]=useState<Awaited<ReturnType<typeof topupStatusFn>>['rows']|null>(null),[failed,setFailed]=useState(false);
 useEffect(()=>{let alive=true;void read().then(v=>{if(alive){setRows(v.rows);setFailed(false);}}).catch(()=>{if(alive)setFailed(true);});return()=>{alive=false;};},[refresh]);
 return <details open data-wallet-topup-status><summary className="cursor-pointer font-bold">{c.topupStatus}</summary>
 {failed?<p role="alert" className="py-2">{c.unavailable}</p>:rows===null?null:rows.length===0?<p className="py-2 text-muted-foreground">{c.empty}</p>:<ul className="max-h-60 divide-y divide-border overflow-y-auto">{rows.map(r=><li key={r.id} className="space-y-1 py-2">
  <div className="flex flex-wrap justify-between gap-2"><span translate="no">{c.purchase}</span><span translate="no">{hide?'••••':`$${(r.cents/100).toFixed(2)} USD`}</span></div>
  <div className="flex flex-wrap justify-between gap-2 text-muted-foreground"><time dateTime={r.created}>{new Date(r.created).toLocaleString(locale)}</time><span className={r.state==='failed'?'font-bold text-destructive':'font-bold'}>{r.state==='verified'?c.topupVerified:r.state==='pending'?c.topupPending:c.topupFailed}</span></div>
 </li>)}</ul>}
 </details>;
}
