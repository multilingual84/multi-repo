import {useEffect,useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import {Button} from './ui/button';
import {Switch} from './ui/switch';
import AccessNotice from './AccessNotice';
import {compactCopy} from '@/lib/wallet/compact-copy';
import {fundingStateFn,fundingSetupFn,fundingConfirmFn,fundingSaveFn} from '@/lib/premium/funding.functions';
import {minuteCopy} from '@/lib/premium/minute-copy';
import type {UILocale} from '@/lib/ui-copy';
export default function WalletCardFunding({locale}:{locale:UILocale}){
 const c=minuteCopy[locale],read=useServerFn(fundingStateFn),setup=useServerFn(fundingSetupFn),confirm=useServerFn(fundingConfirmFn),save=useServerFn(fundingSaveFn);
 const [state,setState]=useState<Awaited<ReturnType<typeof fundingStateFn>>|null>(null),[enabled,setEnabled]=useState(false),[amount,setAmount]=useState<100|500|1000>(100),[limit,setLimit]=useState('10'),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(false),[saved,setSaved]=useState(false),[session,setSession]=useState('');
 const load=async()=>{const s=await read();setState(s);setEnabled(s.enabled);setAmount(s.amount===100?100:s.amount===1000?1000:500);setLimit(String(s.limit/100));};
 useEffect(()=>{void load().catch(()=>setError(true));setSession(new URLSearchParams(window.location.search).get('voice_card_session')??'');},[]);
 async function action(fn:()=>Promise<void>){setBusy(true);setError(false);setSaved(false);try{await fn();}catch{setError(true);}finally{setBusy(false);}}
 return <section data-wallet-card-funding className="space-y-3 border-t border-border pt-3"><h4 className="font-bold">{compactCopy[locale].auto}</h4>{state&&!state.verified&&<AccessNotice><p>{c.locked}</p></AccessNotice>}
 <label className="flex items-center justify-between gap-2"><span>{compactCopy[locale].auto}</span><Switch checked={enabled} disabled={busy||!state?.ready||!state.verified} onCheckedChange={setEnabled}/></label>
 <label className="block">{c.amount}<select value={amount} disabled={busy} onChange={e=>setAmount(Number(e.target.value)===100?100:Number(e.target.value)===1000?1000:500)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2"><option value={100}>$1 USD</option><option value={500}>$5 USD</option><option value={1000}>$10 USD</option></select></label>
 <details open={enabled||Boolean(session)}><summary className="cursor-pointer">{compactCopy[locale].manage}</summary><div className="space-y-3 pt-3"> <Button variant="outline" disabled={busy} className="h-auto w-full whitespace-normal" onClick={()=>void action(async()=>{const s=await setup();window.location.assign(s.url);})}>{c.attach}</Button>
 {session&&<Button variant="outline" disabled={busy} onClick={()=>void action(async()=>{await confirm({data:{id:session}});setSession('');const url=new URL(window.location.href);url.searchParams.delete('voice_card_session');window.history.replaceState(null,'',url.toString());await load();})}>{c.verify}</Button>}
 <label className="block">{c.limit}<input type="number" min={amount/100} max={1000} step="1" value={limit} disabled={busy} onChange={e=>setLimit(e.target.value)} className="mt-1 min-h-11 w-full rounded-md border border-border bg-background px-2"/></label>
 <p>{c.spent}: ${((state?.spent??0)/100).toFixed(2)}</p>
 <label className="flex items-start gap-2"><input type="checkbox" checked={consent} disabled={busy} onChange={e=>setConsent(e.target.checked)}/><span>{c.consent}</span></label>
 <Button disabled={busy||!state?.ready||(enabled&&!consent)||!Number.isFinite(Number(limit))||Number(limit)<amount/100} className="h-auto w-full whitespace-normal" onClick={()=>void action(async()=>{await save({data:{enabled,amount,limit:Math.round(Number(limit)*100),consent}});await load();setSaved(true);})}>{c.save}</Button>
 </div></details>{saved&&<p role="status">{c.saved}</p>}{error&&<AccessNotice><p role="alert">{c.error}</p></AccessNotice>}</section>;
}