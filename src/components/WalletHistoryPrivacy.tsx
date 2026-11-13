import {useEffect,useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import {walletVoiceHistoryFn} from '@/lib/wallet/history.functions';
import {walletUiCopy,walletExportCopy} from '@/lib/wallet/ui-copy';
import {downloadWalletHistoryCsv} from '@/lib/wallet/history-csv';
import {Button} from '@/components/ui/button';
import {Download} from 'lucide-react';
import {defaultWalletPrivacy,readWalletPrivacy,WALLET_SETTINGS_EVENT,voiceCreditAlert} from '@/lib/wallet/privacy';
import {characterCostUsd} from '@/lib/premium/policy';
import type {UILocale} from '@/lib/ui-copy';
import {walletClarityCopy} from '@/lib/wallet/clarity';
import WalletPlanPayments from './WalletPlanPayments';
import WalletTopupStatus from './WalletTopupStatus';
export default function WalletHistoryPrivacy({locale,available,refresh,onHide}:{locale:UILocale;available:number;refresh:number;onHide:(hide:boolean)=>void}){
 const c=walletUiCopy[locale],read=useServerFn(walletVoiceHistoryFn),[history,setHistory]=useState<Awaited<ReturnType<typeof walletVoiceHistoryFn>>|null>(null),[failed,setFailed]=useState(false),[privacy,setPrivacy]=useState(defaultWalletPrivacy);
 useEffect(()=>{const sync=()=>{const saved=readWalletPrivacy();setPrivacy(saved);onHide(saved.hide);};sync();window.addEventListener(WALLET_SETTINGS_EVENT,sync);return()=>window.removeEventListener(WALLET_SETTINGS_EVENT,sync);},[]);
 useEffect(()=>{let alive=true;void read().then(v=>{if(alive){setHistory(v);setFailed(false);}}).catch(()=>{if(alive)setFailed(true);});return()=>{alive=false;};},[refresh]);
 const alert=voiceCreditAlert(available,privacy.threshold);
 const rows=[...(history?.credits??[]).map(r=>({date:r.created_at,label:c.purchase,amount:r.cents/100,count:r.cents/16,status:c.success})),...(history?.usage??[]).map(r=>({date:r.created_at,label:c.usage,amount:r.state==='failed'?0:-characterCostUsd(r.characters),count:'minutes' in r?Number(r.minutes):r.characters,status:r.state==='failed'?c.failed:r.state==='succeeded'?c.success:c.pending}))].sort((a,b)=>b.date.localeCompare(a.date));
 return <div className="space-y-4 text-xs" data-wallet-history>
 {privacy.alerts&&alert==='low'&&<p role="alert" className="font-bold text-destructive">{c.low}</p>}
 <div className="group relative w-fit"><Button variant="outline" size="sm" aria-describedby="wallet-csv-help" disabled={!history||failed} onClick={()=>{if(history)downloadWalletHistoryCsv(history,privacy.hide);}}><Download size={14}/>{walletExportCopy[locale]}</Button><p id="wallet-csv-help" role="tooltip" className="absolute bottom-full left-0 z-50 mb-2 hidden w-64 max-w-[70vw] rounded-md border border-border bg-popover p-3 text-xs text-popover-foreground shadow-md group-hover:block group-focus-within:block">{walletClarityCopy[locale].csv}</p></div>
 <WalletPlanPayments locale={locale} hide={privacy.hide} refresh={refresh}/>
 <WalletTopupStatus locale={locale} hide={privacy.hide} refresh={refresh}/>
 <details open><summary className="cursor-pointer font-bold">{c.history}</summary>{failed?<p role="alert">{c.unavailable}</p>:history&&rows.length===0?<p className="py-2 text-muted-foreground">{c.empty}</p>:<ul className="max-h-60 overflow-y-auto divide-y divide-border">{rows.map((r,i)=><li key={`${r.date}-${i}`} className="space-y-1 py-2"><div className="flex flex-wrap justify-between gap-2"><span>{r.label}</span><span translate="no">{privacy.hide?'••••':`${r.amount.toFixed(4)} USD`}</span></div><div className="flex flex-wrap justify-between gap-2 text-muted-foreground"><time dateTime={r.date}>{new Date(r.date).toLocaleString(locale)}</time><span>{r.status}</span></div><span translate="no">{privacy.hide?'••••':r.count}</span></li>)}</ul>}</details>
 <p className="text-muted-foreground">{c.notice}</p>
 </div>;
}