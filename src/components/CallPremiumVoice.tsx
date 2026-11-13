import {useEffect,useRef,useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import PremiumVoiceControls from './PremiumVoiceControls';
import PremiumSpendNotice from './PremiumSpendNotice';
import PremiumSessionLedger from './PremiumSessionLedger';
import {Button} from './ui/button';
import {PremiumVoicePlayer} from '@/lib/premium/player';
import {premiumVoiceStartFn,premiumVoiceStopFn,premiumVoiceActivityFn} from '@/lib/premium/voice.functions';
import {premiumExpired} from '@/lib/premium/policy';
import {DEFAULT_CALL_PREMIUM,everydayVoiceCopy} from '@/lib/voice-everyday-copy';
import {premiumCopy} from '@/lib/premium/copy';
import type {UILocale} from '@/lib/ui-copy';
export default function CallPremiumVoice({locale,live,bind}:{locale:UILocale;live:boolean;bind:(output:((text:string)=>Promise<void>)|null)=>void}){
 const [enabled,setEnabled]=useState(DEFAULT_CALL_PREMIUM),[notice,setNotice]=useState(false),[session,setSession]=useState(''),[error,setError]=useState(''),[started,setStarted]=useState(0);
 const player=useRef<PremiumVoicePlayer|null>(null),id=useRef(''),generation=useRef(0),timing=useRef({start:0,last:0}),queue=useRef<Promise<void>>(Promise.resolve()),terminal=useRef(false),consent=useRef(false);
 const start=useServerFn(premiumVoiceStartFn),stop=useServerFn(premiumVoiceStopFn),activity=useServerFn(premiumVoiceActivityFn);
 const stopVoice=()=>{generation.current++;terminal.current=true;player.current?.stop();player.current=null;const current=id.current;id.current='';setSession('');if(current)void stop({data:{id:current}}).catch(()=>{});bind(null);};
 const getPlayer=()=>{const p=player.current??new PremiumVoicePlayer();player.current=p;return p;};
 useEffect(()=>{if(live&&enabled&&!id.current&&consent.current)setNotice(true);if(!live){stopVoice();setEnabled(false);}return()=>{};},[live]);
 useEffect(()=>{return()=>{generation.current++;terminal.current=true;player.current?.stop();const current=id.current;if(current)void stop({data:{id:current}}).catch(()=>{});bind(null);};},[]);
 useEffect(()=>{if(!session)return;const timer=window.setInterval(()=>{if(premiumExpired(timing.current.start,timing.current.last,Date.now())){stopVoice();setEnabled(false);setError(premiumCopy[locale].ended);}},1000);return()=>clearInterval(timer);},[session]);
 async function begin(){if(!consent.current)return;setNotice(false);setError('');const n=++generation.current;try{await getPlayer().enable();const result=await start();if(n!==generation.current||!live){void stop({data:{id:result.id}});return;}id.current=result.id;terminal.current=false;const now=Date.now();timing.current={start:now,last:now};setStarted(now);setSession(result.id);queue.current=Promise.resolve();bind(text=>{const current=id.current;queue.current=queue.current.then(async()=>{if(terminal.current||n!==generation.current||!current)return;timing.current.last=Date.now();await activity({data:{id:current}});await getPlayer().speak(text,current);}).catch((e:unknown)=>{if(n!==generation.current)return;terminal.current=true;player.current?.stop();setError(e instanceof Error?e.message:premiumCopy[locale].error);});return queue.current;});}catch{stopVoice();setError(premiumCopy[locale].verification);setEnabled(false);}}
 return <div className="w-full"><PremiumVoiceControls locale={locale} enabled={enabled} active={false} onConsent={v=>{consent.current=v;if(v&&enabled&&live)setNotice(true);}} onEnabled={v=>{setEnabled(v);if(!v){stopVoice();setNotice(false);}else if(live&&consent.current)setNotice(true);}} onVoice={v=>getPlayer().setVoice(v)} onPitch={v=>getPlayer().setLocalPitch(v)} onCharacter={v=>getPlayer().setCharacter(v)}/><PremiumSpendNotice locale={locale} open={notice} onAgree={()=>void begin()} onCancel={()=>{setNotice(false);setEnabled(false);stopVoice();}}/>{session&&<PremiumSessionLedger locale={locale} start={started} session={session} country={localStorage.getItem('pricing_country')??'US'}/>} {error&&<div role="alert" className="space-y-2 text-left text-xs"><p>{error}</p><p>{everydayVoiceCopy[locale].failure}</p><Button variant="outline" onClick={()=>window.dispatchEvent(new Event('ml-open-wallet'))}>{premiumCopy[locale].details}</Button></div>}</div>;
}