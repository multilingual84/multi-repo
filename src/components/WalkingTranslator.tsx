import AccessNotice from './AccessNotice';
import { useEffect, useRef, useState } from 'react';
import { Camera, Copy, Mic, QrCode, Upload, Volume2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { voiceTuningCopy } from '@/lib/voice-tuning-copy';
import { translatorCopy } from '@/lib/translator-copy';
import { travelUtilityCopy } from '@/lib/travel-utility-copy';
import type { UILocale } from '@/lib/ui-copy';
import MeetingBroadcastPreview from '@/components/MeetingBroadcastPreview';
import { ensureFreeSession, type FreeSessionState } from '@/lib/free-session';
import VenueQRPreview from '@/components/VenueQRPreview';
import TalkPairPanel from '@/components/TalkPairPanel';
import { talkDirectorCopy } from '@/lib/talk-director-copy';
import { showTranslationVeil, hideTranslationVeil, setTranslationVeilStatus } from '@/lib/translation-veil';
import { SoloInterpreter, type SoloLine } from '@/lib/solo-interpreter';
import { enableSpeechPlayback, speakTranslation } from '@/lib/speech-playback';
import CameraPermissionNotice from '@/components/CameraPermissionNotice';
import CallAudioControls from '@/components/CallAudioControls';
import { callAudioConstraints, type AudioRoute } from '@/lib/answer-call';
import MicrophoneMeter from '@/components/MicrophoneMeter';
import { automaticConversationCopy } from '@/lib/automatic-conversation-copy';
import MicrophonePermissionNotice from '@/components/MicrophonePermissionNotice';
import TranslatorLocalLanguage from '@/components/TranslatorLocalLanguage';
import { approximateLocalLanguage, defaultAutoDetect, loadManualLanguage, saveManualLanguage } from '@/lib/local-language';
import { getLocalCountry } from '@/lib/local-language.functions';
import { localLanguageCopy } from '@/lib/local-language-copy';
import { Switch } from '@/components/ui/switch';
import QrSaveHint from '@/components/QrSaveHint';
import QrEarningFooter from '@/components/QrEarningFooter';
import VoiceTuningControls from '@/components/VoiceTuningControls';
import TranslatedTextDraft from '@/components/TranslatedTextDraft';
import TranslatorTextInput from '@/components/TranslatorTextInput';
import { communicationCopy } from '@/lib/communication-copy';
import VoiceMatchSwitch from '@/components/VoiceMatchSwitch';
import VoiceChangerPicker from '@/components/VoiceChangerPicker';
import PrivateMessaging from '@/components/PrivateMessaging';
import { getGeoPlan } from '@/lib/geo-pricing';
import { addUsage, hitsPaywall, resetsAt, paywallCopy, allowanceCopy, allowanceTopUpCopy, currentUsage, minutesLeft, type AllowanceUsage } from '@/lib/free-allowance-policy';
import { activePassPreview } from '@/lib/pass-preview';
import { walletStateFn, walletUsageFn } from '@/lib/wallet/access.functions';
import { readQrBonus, awardQrBonus } from '@/lib/qr-minute-bonus';
import { standardVoiceCopy } from '@/lib/standard-voice-copy';
import { claimQrShareBonusFn } from '@/lib/wallet/qr-bonus.functions';
import { NearbyPhones } from '@/components/NearbyPhones';
import { useDevicePreference } from '@/hooks/use-device-preference';
import CallRecents from '@/components/CallRecents';
import CallSharing from '@/components/CallSharing';
import { newRoomId, roomFromHash } from '@/lib/call-room';
import {publicTranslatorLink} from '@/lib/public-translator-link';
import {ensureQrAccess,syncQrAccount,activateQrProduct} from '@/lib/qr-access-browser';
import {getPersonalCode,personalCodeLink} from '@/lib/personal-code';
import {tapTabCopy} from '@/lib/ecosystem-preview';
import { openBrowserCall } from '@/lib/browser-call';


export default function WalkingTranslator({locale}:{locale:UILocale}) {
 const c=translatorCopy[locale];
 const voiceCopy=automaticConversationCopy[locale];
 const video=useRef<HTMLVideoElement>(null);
 const canvas=useRef<HTMLCanvasElement>(null);
 const input=useRef<HTMLInputElement>(null);
 const micBtn=useRef<HTMLButtonElement>(null);
 const stream=useRef<MediaStream | null>(null);
 const audioStream=useRef<MediaStream | null>(null);
 const peer=useRef<RTCPeerConnection | null>(null);
 const [camera,setCamera]=useState(false);
 const [cameraPermission,setCameraPermission]=useState(false);
 const cameraAttempt=useRef(0);
 const [lastLine,setLastLine]=useState<SoloLine|null>(null);
 const [snapshot,setSnapshot]=useState(false);
 const [qr,setQr]=useState('');
 const [decoded,setDecoded]=useState('');
 const [ocrText,setOcrText]=useState('');
 const [reading,setReading]=useState(false);
 const [status,setStatus]=useState<'ready'|'noQr'|'error'|null>(null);
 const [holding,setHolding]=useState(false);
 const [permission,setPermission]=useState(false);
 const [route,setRoute]=useDevicePreference<AudioRoute>('ml-audio-route','speaker');
 const [enhanced,setEnhanced]=useDevicePreference<boolean>('ml-audio-enhanced',true);
 const [spokenLocale,setSpokenLocale]=useState<string>(locale);
 const [localLanguage,setLocalLanguage]=useState('');
 const [touristLang,setTouristLang]=useState('en');
 const [talkTurn,setTalkTurn]=useState<'local'|'tourist'>('local');
 const [showTextOpt,setShowTextOpt]=useState(false);
 const [autoDetect,setAutoDetect]=useDevicePreference<boolean>('ml-auto-detect',defaultAutoDetect);
 const manuallySelected=useRef(false);
 const geoCountry=useRef<string|null>(null);
 const [voiceError,setVoiceError]=useState(false);
 const [level,setLevel]=useState(0);
 const [busy,setBusy]=useState(false);
 const [copied,setCopied]=useState(false);
 const copiedSuccessfully=useRef(false);
 const interp=useRef<SoloInterpreter|null>(null);
 const paidRef=useRef(false);
 const [paid,setPaid]=useState(false);
 const [paywallAt,setPaywallAt]=useState<number|null>(null);
 const [allowance,setAllowance]=useState<AllowanceUsage|null>(null);
 const [bonus,setBonus]=useState(0);
 const prepareMic=async()=>{enableSpeechPlayback();setLastLine(null);setPermission(false);try{const state=await activateQrProduct();paidRef.current=state.paid;setPaid(state.paid);if(!state.paid&&state.remainingSeconds<=0){setPaywallAt(resetsAt(currentUsage(allowance,Date.now())));return;}setHolding(true);}catch{setVoiceError(true);}};
 useEffect(()=>{const stop=()=>setHolding(false);window.addEventListener('pagehide',stop);window.addEventListener('ml-access-revoked',stop);return()=>{window.removeEventListener('pagehide',stop);window.removeEventListener('ml-access-revoked',stop);};},[]);
 useEffect(()=>{let alive=true;const check=()=>{void walletStateFn().then(s=>{if(alive){paidRef.current=s.verified&&s.paid;setPaid(paidRef.current);}}).catch(()=>{if(alive){paidRef.current=false;setPaid(false);}});};check();window.addEventListener('ml-wallet-change',check);return()=>{alive=false;window.removeEventListener('ml-wallet-change',check);};},[]);
 // Read the saved rolling allowance after mount (device-local storage is not available during SSR).
 useEffect(()=>{
  let saved:AllowanceUsage|null=null;
  try{saved=JSON.parse(localStorage.getItem('ml-free-allowance')??'null');}catch{/* storage optional */}
  setAllowance(currentUsage(saved,Date.now()));
 },[]);
 // One-phone translation shares the same rolling 30-minute daily allowance as calls and video.
 useEffect(()=>{
  if(!holding)return;
  const id=window.setInterval(()=>{
   const u=addUsage(1000);
   setAllowance(u);
   if(hitsPaywall(paidRef.current,u.usedMs,0,false)){setPaywallAt(resetsAt(u));setHolding(false);}
  },1000);
  return()=>window.clearInterval(id);
 },[holding]);
 useEffect(()=>{if(!holding)return;let alive=true;const tick=()=>{void walletUsageFn().then(r=>{if(alive&&!r.paid&&r.usedSeconds>=r.limitSeconds){setPaywallAt(r.resetsAt?Date.parse(r.resetsAt):Date.now()+86400000);setHolding(false);}}).catch(()=>{if(alive)setHolding(false);});};tick();const timer=window.setInterval(tick,5000);return()=>{alive=false;window.clearInterval(timer);};},[holding]);
  useEffect(()=>{
  let alive=true;
  let inFlight=false;
  let lastCheck=0;
  let initialized=false;
  let lastZone='';
  const refresh=()=>{
   if(document.visibilityState==='hidden'||inFlight||(initialized&&Date.now()-lastCheck<60000))return;
   inFlight=true;lastCheck=Date.now();
   const zone=Intl.DateTimeFormat().resolvedOptions().timeZone;
   if(!initialized)setLocalLanguage(approximateLocalLanguage(null,zone));
   getLocalCountry().then(country=>{
    if(!alive)return;
    const changed=initialized&&(country!==geoCountry.current||(!country&&zone!==lastZone));
    lastZone=zone;
    geoCountry.current=country;
    if(changed)manuallySelected.current=false;
    const manual=loadManualLanguage(country);
    if(manual){manuallySelected.current=true;setLocalLanguage(manual);}
    else if((!initialized||changed)&&!manuallySelected.current){const language=approximateLocalLanguage(country,zone);if(language)setLocalLanguage(language);}
    initialized=true;
   }).catch(()=>{}).finally(()=>{inFlight=false;});
  };
  refresh();
  window.addEventListener('focus',refresh);
  document.addEventListener('visibilitychange',refresh);
  return ()=>{alive=false;window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
 },[]);
 useEffect(()=>{interp.current?.setLanguages(talkTurn==='local'?(localLanguage||spokenLocale):(touristLang||'en'), talkTurn==='local'?(touristLang||'en'):(localLanguage||spokenLocale));interp.current?.setAutomatic(autoDetect);},[spokenLocale,localLanguage,touristLang,talkTurn,autoDetect]);
 useEffect(()=>{
  const update=()=>setSpokenLocale(localStorage.getItem('user_locale')?.replace(/^gt:/,'') || (document.documentElement.lang!=='en'?document.documentElement.lang:navigator.language) || locale);
  update();
  const observer=new MutationObserver(update);
  observer.observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  return ()=>observer.disconnect();
 },[locale]);
 useEffect(()=>{
  if(!holding)return;
  setVoiceError(false);
  const i=new SoloInterpreter(talkTurn==='local'?(localLanguage||spokenLocale):(touristLang||'en'), talkTurn==='local'?(touristLang||'en'):(localLanguage||spokenLocale),setLastLine,setBusy,setLevel,autoDetect,()=>{setHolding(false);setVoiceError(true);},setLocalLanguage);
  interp.current=i;
  i.start(callAudioConstraints(enhanced)).catch(()=>{setHolding(false);setVoiceError(true);});
   return ()=>{i.stop();interp.current=null;setBusy(false);setLevel(0);setLastLine(line=>line?{heard:line.heard,text:line.text,...(line.lang?{lang:line.lang}:{})}:null);};
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[holding,spokenLocale,localLanguage,touristLang,talkTurn,autoDetect]);
 const [phone,setPhone]=useState('');
 const [email,setEmail]=useState('');
 const [pass,setPass]=useState('');
 const [session,setSession]=useState<FreeSessionState | null>(null);
 useEffect(()=>{let alive=true; ensureFreeSession('camera').then(s=>{if(alive)setSession(s);}).catch(()=>{}); return ()=>{alive=false;};},[]);
 function close(){ stream.current?.getTracks().forEach(t=>t.stop()); stream.current=null; setCamera(false); }
 useEffect(()=>()=>{cameraAttempt.current+=1;stream.current?.getTracks().forEach(t=>t.stop()); audioStream.current?.getTracks().forEach(t=>t.stop()); peer.current?.close();},[]);
 useEffect(()=>{if(camera && video.current) video.current.srcObject=stream.current;},[camera]);
 // The copied link and the printed code are the same address, so they can never drift apart.
 const [passLink,setPassLink]=useState('');
 useEffect(()=>{const update=()=>{const link=publicTranslatorLink(window.location.origin,getPersonalCode());setPassLink(link);try{const hash=new URL(link).hash;const room=hash.replace(/^#/,'');if(room.startsWith('talk-')){sessionStorage.setItem('ml-call-caller',room);sessionStorage.setItem('ml-call-room',room);}}catch{/* */}};update();window.addEventListener('ml-wallet-change',update);return()=>window.removeEventListener('ml-wallet-change',update);},[]);
  useEffect(()=>{if(!passLink)return;let alive=true; import('qrcode').then(m=>m.toDataURL(passLink,{width:224,margin:2})).then(url=>{if(alive)setQr(url);}); return ()=>{alive=false;};},[passLink]);
 async function copyPassLink(){
  try{ await navigator.clipboard.writeText(passLink); copiedSuccessfully.current=true;setCopied(true); }
  catch{
   // Some browsers refuse clipboard writes; fall back to a hidden field the browser can copy from.
   const ta=document.createElement('textarea'); ta.value=passLink; ta.setAttribute('readonly',''); ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select();
   let ok=false; try{ ok=document.execCommand('copy'); }catch{ ok=false; } document.body.removeChild(ta); copiedSuccessfully.current=ok;setCopied(ok);
  }
  window.setTimeout(()=>setCopied(false),4000);
 }
 async function open(){const attempt=++cameraAttempt.current;try{stream.current?.getTracks().forEach(t=>t.stop());const capture=await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment',width:{ideal:1280}},audio:false});if(attempt!==cameraAttempt.current){capture.getTracks().forEach(t=>t.stop());return;}stream.current=capture;setCamera(true);setStatus(null);if(video.current)video.current.srcObject=capture;}catch{if(attempt===cameraAttempt.current)setStatus('error');}}
 async function scan(source:CanvasImageSource,width:number,height:number){
  const node=canvas.current; if(!node)return;
  const scale=Math.min(1,1280/Math.max(width,height));node.width=Math.round(width*scale);node.height=Math.round(height*scale);
  const ctx=node.getContext('2d',{willReadFrequently:true});if(!ctx)return;
  ctx.drawImage(source,0,0,node.width,node.height);setSnapshot(true);
  const {default:jsQR}=await import('jsqr'); const pixels=ctx.getImageData(0,0,node.width,node.height);const result=jsQR(pixels.data,node.width,node.height);
  const value=result?.data ?? '';
  setDecoded(value);setStatus(result?'ready':'noQr');
  // A scanned Multi-Lingual link connects the two phones straight away.
  if(value){const origin=window.location.origin;
   if(value.startsWith(origin)){window.location.assign(value);return;}
   if(value.startsWith('#')){window.location.assign(`${origin}/${value}`);return;}
   if(value.startsWith('/')){window.location.assign(`${origin}${value}`);return;}
  }
  // Character recognition runs entirely on the device — no image leaves the phone.
  setReading(true);setOcrText('');
  try{
   const {createWorker}=await import('tesseract.js');
   const worker=await createWorker('eng');
   const {data}=await worker.recognize(node);
   await worker.terminate();
   setOcrText(data.text.trim());
  }catch{/* recognition is best-effort; the snapshot stays available */}
  finally{setReading(false);}
 }
 async function upload(file?:File){if(!file)return;const url=URL.createObjectURL(file);const img=new Image();img.onload=()=>{scan(img,img.naturalWidth,img.naturalHeight).finally(()=>URL.revokeObjectURL(url));};img.onerror=()=>{URL.revokeObjectURL(url);setStatus('error');};img.src=url;}

useEffect(()=>{
  if(!busy){hideTranslationVeil();return;}
  showTranslationVeil();
  const d=talkDirectorCopy[locale]??talkDirectorCopy.en;
  setTranslationVeilStatus(d.frostWorking);
  const t2=window.setTimeout(()=>setTranslationVeilStatus(d.busyTranslate),400);
  const t3=window.setTimeout(()=>setTranslationVeilStatus(d.frostAlmost),2500);
  return()=>{window.clearTimeout(t2);window.clearTimeout(t3);hideTranslationVeil();};
 },[busy,locale]);
 return <section className="mx-auto flex max-w-xl flex-col items-center gap-6 text-center" data-walking-translator>
  <h2 className="text-xl font-black text-signal">{tapTabCopy[locale]}</h2>
  <Button data-press-hint variant="outline" aria-pressed={holding&&autoDetect} className="h-auto max-w-md whitespace-normal text-sm font-black leading-snug" onClick={()=>{setAutoDetect(true);if(!holding)setPermission(true);}}>{localLanguageCopy[locale].hint}</Button>
  <TalkPairPanel
   locale={locale}
   pageLanguage={spokenLocale}
   localLang={localLanguage||spokenLocale}
   touristLang={touristLang}
   onLocalLang={lang=>{manuallySelected.current=true;saveManualLanguage(lang,geoCountry.current);setLocalLanguage(lang);}}
   onTouristLang={setTouristLang}
   shareLink={passLink}
   turn={talkTurn}
   onTurn={setTalkTurn}
   busy={busy}
   lastHeard={lastLine?.heard}
   lastText={lastLine?.text}
   showText={showTextOpt}
   onShowText={setShowTextOpt}
   onSpeakAgain={()=>{if(!lastLine)return;enableSpeechPlayback();setVoiceError(false);void speakTranslation(lastLine.text,lastLine.lang||touristLang||spokenLocale,lastLine.pitch).catch(()=>setVoiceError(true));}}
  />
  <div data-primary-talking-mic className="flex w-full max-w-xs flex-col items-center gap-3">
   {!paid&&allowance&&<div data-allowance-indicator className="w-full space-y-2 text-center text-base font-bold">
    <p>{(allowanceCopy[locale]??allowanceCopy['en'])?.left}: {Math.ceil(minutesLeft(allowance.usedMs,bonus))}</p>
    <p className="text-sm text-muted-foreground">{(paywallCopy[locale]??paywallCopy['en'])?.resets} {new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(resetsAt(allowance))}</p>
   </div>}
   {permission&&<MicrophonePermissionNotice locale={locale} description={communicationCopy[locale].processing} onContinue={()=>void prepareMic()} onCancel={()=>setPermission(false)}/>}
   <div className="flex w-full items-center justify-center gap-3">
   <Button ref={micBtn} aria-label={c.mic} aria-pressed={holding} onClick={()=>{if(holding)setHolding(false);else setPermission(true);}} variant="outline" className="mic-glow h-64 w-64 shrink-0 touch-none flex-col gap-2 whitespace-normal rounded-full border-4 px-8 font-light text-sm leading-snug">{holding&&<span data-mic-leave-on className="text-base font-black tracking-wide">{({en:'LEAVE ON POSITION',es:'POSICIÓN ENCENDIDA',zh:'保持开启',de:'EINGESCHALTET LASSEN',tl:'IWANANG NAKABUKAS',ja:'オンのままにする'} as Record<string,string>)[locale]??'LEAVE ON POSITION'}</span>}<Mic size={56}/><span data-mic-line>{holding?voiceCopy.active:c.micInside}</span></Button>
   <MicrophoneMeter level={level} active={holding} label={c.mic}/>
   </div>
  </div>
  <CallRecents locale={locale}/>
  <div className="flex w-full max-w-xs flex-col items-center gap-3" data-share-block>
   {passLink&&<CallSharing link={passLink} locale={locale}/>}
   <NearbyPhones locale={locale} language={spokenLocale}/>
   <p data-qr-no-charge className="text-sm font-bold leading-snug text-accent">{standardVoiceCopy[locale].noCharge}</p>
   {copied&&<p role="status" className="text-sm">{standardVoiceCopy[locale].credited}</p>}
  </div>

   <CallAudioControls route={route} onRoute={setRoute} enhanced={enhanced} onEnhanced={setEnhanced} mode="output"/>
  <div className="relative flex w-full max-w-xs flex-col items-center justify-center gap-3">
   <div className="relative grid w-full grid-cols-3 items-start gap-2" data-translator-language-toolbar>
    <TranslatorLocalLanguage locale={locale} pageLanguage={spokenLocale} language={localLanguage} onLanguage={language=>{manuallySelected.current=true;saveManualLanguage(language,geoCountry.current);setLocalLanguage(language);}}/>
    <label className="flex min-h-11 flex-col items-center justify-center gap-2 text-xs font-bold">
     <Switch id="translator-auto-detect" checked={autoDetect} onCheckedChange={setAutoDetect} aria-label={localLanguageCopy[locale].auto}/>
     <span>{localLanguageCopy[locale].auto}</span>
    </label>
    <CallAudioControls route={route} onRoute={setRoute} enhanced={enhanced} onEnhanced={setEnhanced} mode="enhancement"/>
   </div>
   <p data-voice-privacy className="w-full text-left text-[10px] leading-relaxed text-muted-foreground">{communicationCopy[locale].privacy}</p>
   <VoiceChangerPicker locale={locale} language={spokenLocale} />
   <VoiceTuningControls locale={locale} language={localLanguage || spokenLocale} />
   <VoiceMatchSwitch locale={locale} />
   {paywallAt!==null&&(()=>{const pw=paywallCopy[locale]??paywallCopy['en'];if(!pw)return null;return <div data-translator-exhausted role="alert" className="w-full space-y-1 rounded-lg border border-border bg-card p-3 text-left">
    <AccessNotice><p className="text-sm font-black">{pw.title}</p>
    <p className="text-xs">{pw.body}</p>
    <p className="text-xs font-bold">{pw.resets} {new Intl.DateTimeFormat(locale,{dateStyle:'medium',timeStyle:'short'}).format(paywallAt)}</p>
    <Button variant="outline" className="h-auto w-full whitespace-normal" onClick={()=>window.dispatchEvent(new CustomEvent('ml-open-pricing',{detail:{packageId:'single'}}))}>{allowanceTopUpCopy[locale]??allowanceTopUpCopy['en']}</Button>
    </AccessNotice>
   </div>;})()}

  </div>

  <TranslatorTextInput locale={locale} language={localLanguage || spokenLocale}/>
  <PrivateMessaging locale={spokenLocale} pricePlan={getGeoPlan(spokenLocale,'')} freeLifetime/>
  
 {busy&&<p data-translation-processing role="status" aria-live="polite" className="animate-pulse text-center font-bold text-accent">{voiceTuningCopy[locale].processing}</p>}
  {voiceError&&<p role="alert" className="text-sm text-destructive">{voiceCopy.error}</p>}
  {lastLine&&<TranslatedTextDraft text={lastLine.text} locale={locale}/>}
   {lastLine&&<Button variant="outline" onClick={()=>{enableSpeechPlayback();setVoiceError(false);void speakTranslation(lastLine.text,lastLine.lang||localLanguage||spokenLocale,lastLine.pitch).catch(()=>setVoiceError(true));}}><Volume2 size={16}/>{voiceCopy.play}</Button>}
  <div className="flex flex-col items-center gap-1">
   <p className="text-sm text-muted-foreground">{travelUtilityCopy[locale].free}</p>
   <p data-connect-hint className="max-w-md text-sm font-bold leading-snug">📲 {travelUtilityCopy[locale].connectHint}</p>
  </div>
  <div className="w-full min-w-0 space-y-4" data-qr-primary>

   <h3 className="flex items-center justify-center gap-2 font-black"><QrCode size={20}/>{c.qr}</h3>
   <p data-lifetime-qr className="text-base font-black leading-snug">{c.lifetimeQr}</p>
   <div onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();void upload(e.dataTransfer.files[0]);}} className="relative grid min-h-64 w-full place-items-center gap-3 overflow-hidden rounded-lg border-2 border-dashed border-primary bg-card p-4">
     {camera ? <video ref={video} autoPlay playsInline muted className="aspect-video w-full object-contain"/> : qr ? <div data-qr-guide-box className="grid w-full place-items-center gap-2"><QrSaveHint locale={locale}/><img src={qr} width={224} height={224} alt={c.qr} className="h-56 w-56 rounded-lg"/><QrEarningFooter locale={locale}/></div> : <QrCode size={64} className="text-primary"/>}
    <p data-camera-hint className="mx-auto max-w-md text-center text-sm font-bold leading-snug">📷 {c.cameraHint}</p>
    <div className="flex flex-wrap justify-center gap-2">
     <Button className="h-auto max-w-full whitespace-normal" onClick={()=>setCameraPermission(true)}><Camera size={16}/>{c.camera}</Button>
     <Button className="h-auto max-w-full whitespace-normal" variant="outline" onClick={()=>input.current?.click()}><Upload size={16}/>{c.upload}</Button>
     {camera && <><Button className="h-auto max-w-full whitespace-normal" variant="outline" onClick={()=>{const v=video.current;if(v?.videoWidth)void scan(v,v.videoWidth,v.videoHeight);}}><Camera size={16}/>{c.capture}</Button><Button variant="ghost" onClick={close}><X size={16}/>{c.stop}</Button></>}
    </div>
   </div>
   {cameraPermission&&<CameraPermissionNotice locale={locale} onContinue={()=>{setCameraPermission(false);void open();}} onCancel={()=>setCameraPermission(false)}/>}
   <p data-share-hint className="max-w-md text-sm font-bold leading-snug">🔗 {travelUtilityCopy[locale].shareHint}</p>
   <div data-share-link className="w-full max-w-md space-y-2">
    <p translate="no" className="notranslate break-all rounded-lg border border-border bg-card p-2 text-xs">{passLink}</p>
    <Button variant="outline" className="h-auto max-w-full whitespace-normal" onClick={()=>{void copyPassLink();}}><Copy/>{travelUtilityCopy[locale].copyLink}</Button>
    {copied && <p role="status" className="text-sm font-bold">{travelUtilityCopy[locale].linkCopied}</p>}
   </div>
   <input ref={input} type="file" accept="image/*" capture="environment" aria-label={c.upload} className="hidden" onChange={e=>void upload(e.target.files?.[0])}/>
   <canvas ref={canvas} className={`max-h-80 w-full rounded-lg object-contain ${snapshot?'':'hidden'}`}/>
   {snapshot && <p className="text-xs text-muted-foreground">{c.preview}</p>}
   {reading && <p role="status" className="text-xs font-bold text-accent">{c.reading}</p>}
   {ocrText && <div className="space-y-1"><p className="text-xs font-bold uppercase tracking-wider text-accent">{c.recognized}</p><p data-ocr-result className="select-all whitespace-pre-wrap break-words rounded-lg border border-border bg-card p-3 text-left text-xs">{ocrText}</p></div>}
   {status && <p role="status" className="break-words text-sm">{c[status]}</p>}
   {decoded && <p className="notranslate select-all break-all text-xs" translate="no">{decoded}</p>}
   {decoded && /^https?:\/\//.test(decoded) && !decoded.startsWith(window.location.origin) && <Button variant="outline" className="h-auto max-w-full whitespace-normal" onClick={()=>window.open(decoded,'_blank','noopener,noreferrer')}>{c.openLink}</Button>}
  </div>
  <p className="text-xs text-muted-foreground">{c.notice}</p>
  <MeetingBroadcastPreview locale={locale}/>
 </section>;
}
