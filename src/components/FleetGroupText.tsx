import {useEffect,useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import {Button} from './ui/button';
import {fleetGroupReadFn,fleetGroupSendFn} from '@/lib/fleet.functions';
import {translateOpenedMessageFn} from '@/lib/message-translation.functions';
import {fleetGroupCopy} from '@/lib/fleet-group-copy';
import type {UILocale} from '@/lib/ui-copy';
export default function FleetGroupText({locale}:{locale:UILocale}){
 const c=fleetGroupCopy[locale]??fleetGroupCopy.en,read=useServerFn(fleetGroupReadFn),send=useServerFn(fleetGroupSendFn),translate=useServerFn(translateOpenedMessageFn);
 const [state,setState]=useState<Awaited<ReturnType<typeof fleetGroupReadFn>>|null>(null),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(false),[tr,setTr]=useState<Record<string,string>>({});
 const load=()=>void read().then(setState).catch(()=>setState({allowed:false,messages:[]}));
 useEffect(()=>{load();const t=window.setInterval(()=>{if(document.visibilityState==='visible')load();},20000);window.addEventListener('ml-wallet-change',load);return()=>{window.clearInterval(t);window.removeEventListener('ml-wallet-change',load);};},[]);
 if(!state)return null;
 return <section data-fleet-group-text className="space-y-3 border-t border-border pt-3"><h3 className="font-bold">{c.title}</h3><p className="text-sm text-muted-foreground">{c.body}</p>
 {!state.allowed?<><p className="text-sm">{c.locked}</p><Button variant="outline" onClick={()=>window.dispatchEvent(new CustomEvent('ml-open-pricing',{detail:{packageId:'team'}}))}>{c.plans}</Button></>:<>
 <textarea aria-label={c.placeholder} placeholder={c.placeholder} value={draft} maxLength={2000} onChange={e=>setDraft(e.target.value)} className="min-h-20 w-full rounded-md border border-input bg-background p-3 text-foreground"/>
 <Button data-fleet-group-send disabled={busy||!draft.trim()} onClick={()=>{setBusy(true);setError(false);void send({data:{body:draft}}).then(()=>{setDraft('');load();}).catch(()=>setError(true)).finally(()=>setBusy(false));}}>{c.send}</Button>
 {state.messages.length===0?<p className="text-sm text-muted-foreground">{c.empty}</p>:state.messages.map(m=><div key={m.id} className="space-y-1 border-b border-border py-2"><p className="text-xs font-bold">{m.sender_name} · <time>{new Date(m.created_at).toLocaleTimeString(locale)}</time></p><p className="whitespace-pre-wrap break-words">{tr[m.id]??m.body}</p>{!m.mine&&!tr[m.id]&&<Button size="sm" variant="ghost" onClick={()=>void translate({data:{text:m.body,target:document.documentElement.lang||locale,consent:true}}).then(r=>{if(r.ok)setTr(x=>({...x,[m.id]:r.text}));})}>{c.translate}</Button>}</div>)}
 <p className="text-xs text-muted-foreground">{c.expires}</p></>}
 {error&&<p role="alert" className="text-sm text-destructive">{c.error}</p>}</section>;
}
