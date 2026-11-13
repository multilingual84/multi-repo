import {useCallback,useEffect,useRef,useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import {ExternalLink,RefreshCw} from 'lucide-react';
import {Button} from './ui/button';
import AccessNotice from './AccessNotice';
import {partnerStateFn,partnerOnboardFn} from '@/lib/referrals/partners.functions';
import {partnerCopy} from '@/lib/referrals/copy';
import {partnerStatusCopy} from '@/lib/referrals/status-copy';
import {netTransferredMinor} from '@/lib/referrals/status';
import type {UILocale} from '@/lib/ui-copy';
export default function PartnerPayments({locale}:{locale:UILocale}){
 const c=partnerCopy[locale],s=partnerStatusCopy[locale],getState=useServerFn(partnerStateFn),onboard=useServerFn(partnerOnboardFn);
 const [state,setState]=useState<Awaited<ReturnType<typeof partnerStateFn>>|null>(null),[email,setEmail]=useState(''),[country,setCountry]=useState('US'),[busy,setBusy]=useState(false),[error,setError]=useState(false),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState(false);
 const request=useRef(0),edited=useRef(false);
 const load=useCallback(async()=>{const n=++request.current;setLoading(true);setLoadError(false);try{const value=await getState();if(n!==request.current)return;setState(value);if(!edited.current){setEmail(value.email);setCountry(value.country);}}catch{if(n===request.current)setLoadError(true);}finally{if(n===request.current)setLoading(false);}},[getState]);
 useEffect(()=>{void load();const reload=()=>void load();window.addEventListener('ml-wallet-change',reload);window.addEventListener('focus',reload);return()=>{request.current++;window.removeEventListener('ml-wallet-change',reload);window.removeEventListener('focus',reload);};},[load]);
 async function setup(){setBusy(true);setError(false);try{const result=await onboard({data:{email,country}});window.location.assign(result.url);}catch{setError(true);}finally{setBusy(false);}}
 return <section data-partner-payments aria-busy={loading||busy} className="space-y-3 border-t border-border pt-4 text-left"><h3 className="font-bold">{c.title}</h3><p className="text-xs text-muted-foreground">{c.terms}</p>{loading&&<p role="status" className="text-sm">{s.loading}</p>}{loadError&&<AccessNotice><p role="alert">{s.loadError}</p></AccessNotice>}{state&&<>
 {state.test&&<p role="status" className="text-sm font-bold">{c.test}</p>}{!state.enabled&&<AccessNotice><p>{c.waiting}</p></AccessNotice>}
 <div data-partner-account-status className="space-y-1"><p className="text-xs text-muted-foreground">{s.account}</p><p role="status" className="text-sm font-bold">{s[state.accountStatus]}</p></div>
 {state.code&&<div className="space-y-1"><p className="text-xs">{c.code}</p><code translate="no" className="notranslate block break-all font-bold">{state.code}</code><a className="block break-all text-xs text-accent underline" href={`/?ref=${encodeURIComponent(state.code)}`}>{`https://multi-lingual.tech/?ref=${state.code}`}</a></div>}
 <label className="block text-sm">{c.email}<input type="email" autoComplete="email" value={email} disabled={busy||state.connected} onChange={e=>{edited.current=true;setEmail(e.target.value);}} className="mt-1 w-full rounded-md border border-border bg-background p-2"/></label>
 <label className="block text-sm">{c.country}<input value={country} maxLength={2} disabled={busy||state.connected} onChange={e=>{edited.current=true;setCountry(e.target.value.toUpperCase());}} className="mt-1 w-full rounded-md border border-border bg-background p-2"/></label>
 <Button disabled={busy||loading||!email||country.length!==2} onClick={()=>void setup()} className="h-auto whitespace-normal"><ExternalLink size={16}/>{busy?'…':state.connected?s.resume:s.connect}</Button>
 {state.history.length===0?<p className="text-xs">{c.empty}</p>:<ul className="divide-y divide-border">{state.history.map(row=>{const money=(minor:number)=>new Intl.NumberFormat(locale,{style:'currency',currency:row.currency.toUpperCase()}).format(minor/(['jpy'].includes(row.currency)?1:100));const fee=Number(row.fee_minor)||0;return <li key={row.invoice_id} className="space-y-1 py-2 text-sm"><p className="font-semibold">{c[row.status as keyof typeof c]??c.review}</p><p>{s.original}: {money(Number(row.share_minor)+fee)}</p>{fee>0&&<p>{s.fee}: −{money(fee)}</p>}<p>{s.net}: {money(netTransferredMinor(row))}</p>{['pending','setup_required','failed'].includes(row.status)&&<p className="text-xs text-muted-foreground">{s.eligible}: {new Date(row.eligible_at).toLocaleDateString(locale)}</p>}{row.status==='failed'&&row.next_attempt&&<p className="text-xs text-muted-foreground">{s.retry}: {new Date(row.next_attempt).toLocaleString(locale)}</p>}</li>;})}</ul>}
 <p className="text-xs text-muted-foreground">{s.bank}</p>
 </>}<Button variant="outline" disabled={loading||busy} onClick={()=>void load()}><RefreshCw size={16}/>{c.refresh}</Button>{error&&<AccessNotice><p role="alert">{c.error}</p></AccessNotice>}</section>;
}