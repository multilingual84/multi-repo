import QrPhotoFooter from './QrPhotoFooter';
import {useEffect,useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import {Button} from './ui/button';
import {Switch} from './ui/switch';
import {fleetStateFn,fleetJoinFn,fleetMemberFn} from '@/lib/fleet.functions';
import {fleetCopy} from '@/lib/fleet-copy';
import {fleetGroupCopy} from '@/lib/fleet-group-copy';
import {fleetSeatsFull} from '@/lib/fleet-policy';
import {messageCopy} from '@/lib/private-message-copy';
import type {UILocale} from '@/lib/ui-copy';
export default function FleetAccess({locale}:{locale:UILocale}){
 const c=fleetCopy[locale],messages=messageCopy(locale),read=useServerFn(fleetStateFn),join=useServerFn(fleetJoinFn),update=useServerFn(fleetMemberFn);
 const [state,setState]=useState<Awaited<ReturnType<typeof fleetStateFn>>|null>(null),[qr,setQr]=useState(''),[target,setTarget]=useState(''),[name,setName]=useState(''),[sent,setSent]=useState(false),[error,setError]=useState(false);
 const load=()=>void read().then(setState).catch(()=>setState(null));
 useEffect(()=>{load();const hash=()=>{const m=window.location.hash.match(/^#fleet=([a-f0-9-]{36})$/);setTarget(m?.[1]??'');};hash();window.addEventListener('hashchange',hash);window.addEventListener('ml-wallet-change',load);return()=>{window.removeEventListener('hashchange',hash);window.removeEventListener('ml-wallet-change',load);};},[]);
 const link=state?.id?`${window.location.origin}/#fleet=${state.id}`:'';
 useEffect(()=>{let alive=true;if(link)void import('qrcode').then(m=>m.toDataURL(link,{width:360,margin:4})).then(u=>{if(alive)setQr(u);});return()=>{alive=false;};},[link]);
 async function change(wallet:string,approved:boolean,minutes:number){setError(false);try{await update({data:{wallet,approved,minutes}});load();}catch{setError(true);}}
 return <details data-fleet-access data-premium-voice className="w-full border-t border-border pt-3 text-left text-xs"><summary className="cursor-pointer font-bold">{c.title}</summary><div className="space-y-3 pt-3">{target&&<div className="space-y-2"><label>{c.nickname}<input className="min-h-11 w-full rounded-md border border-border bg-background p-2" value={name} onChange={e=>setName(e.target.value)} maxLength={40}/></label><Button disabled={!name.trim()||sent} onClick={()=>{setError(false);void join({data:{id:target,nickname:name}}).then(()=>setSent(true)).catch(()=>setError(true));}}>{sent?c.sent:c.request}</Button></div>}{state?.owner?<>{qr&&<img src={qr} alt={c.title} width={360} height={360} className="mx-auto w-full max-w-64"/>}<QrPhotoFooter locale={locale}/><Button variant="outline" onClick={()=>void navigator.clipboard.writeText(link)}>{c.copy}</Button>{(()=>{const g=fleetGroupCopy[locale]??fleetGroupCopy.en,used=state.members.filter(m=>m.approved).length;return <><p data-fleet-seats className="font-bold">{g.seats}: {used} / {state.seats}</p>{fleetSeatsFull(used,state.seats)&&<p role="status">{g.full}</p>}</>;})()}{state.members.map(m=><div key={m.wallet} className="space-y-2 border-t border-border pt-2"><p className="font-bold">{m.nickname}</p>{m.mailboxId&&<Button variant="outline" onClick={()=>window.location.assign(`/?messages=1&mailbox=${m.mailboxId}`)}>{messages.compose}</Button>}<label className="flex items-center justify-between gap-2">{c.approve}<Switch checked={m.approved} onCheckedChange={v=>void change(m.wallet,v,m.daily_minutes)}/></label><label className="flex items-center justify-between gap-2">{c.minutes}<input aria-label={`${c.minutes} ${m.nickname}`} type="number" min={0} max={1440} defaultValue={m.daily_minutes} className="w-20 rounded-md border border-border bg-background p-2" onBlur={e=>{const n=Number(e.target.value);if(Number.isInteger(n)&&n>=0&&n<=1440)void change(m.wallet,m.approved,n);}}/></label><p>{c.usage}: {(m.used_seconds/60).toFixed(1)}</p></div>)}</>:!target&&<p>{c.limit}</p>}{error&&<p role="alert" className="text-destructive">{c.error}</p>}</div></details>;
}