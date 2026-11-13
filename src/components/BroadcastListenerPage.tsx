import {useEffect} from 'react';
import {useTranslationState} from '@/context/TranslationContext';
import type {UILocale} from '@/lib/ui-copy';
import PublicBroadcast from './PublicBroadcast';
import FlagBanner from './FlagBanner';
import {ALL_FLAGS} from '@/lib/flag-catalog';
import {qrAccessCopy} from '@/lib/qr-access-copy';
import {Button} from './ui/button';
import {X} from 'lucide-react';

const nativeLanguages=['en','es','tl','zh','de','ja'];
export default function BroadcastListenerPage({broadcastId}:{broadcastId:string}) {
 const translation=useTranslationState();
 const language=translation?.activeLanguage??'en';
 const locale:UILocale=language==='zh-CN'?'zh':nativeLanguages.includes(language)?language as UILocale:'en';
 useEffect(()=>{
  if(nativeLanguages.includes(language)||language==='zh-CN')return;
  let disposed=false;let attempts=0;
  const target=language.replace(/^gt:/,'');
  const windowWithTranslate=window as typeof window & {google?:{translate?:{TranslateElement:new(options:object,id:string)=>unknown}};broadcastTranslateInit?:()=>void};
  windowWithTranslate.broadcastTranslateInit=()=>{if(!disposed&&windowWithTranslate.google?.translate)new windowWithTranslate.google.translate.TranslateElement({pageLanguage:'en',autoDisplay:false},'broadcast_translate_element');};
  if(windowWithTranslate.google?.translate)windowWithTranslate.broadcastTranslateInit();
  const script=document.createElement('script');script.src='https://translate.google.com/translate_a/element.js?cb=broadcastTranslateInit';script.async=true;document.head.appendChild(script);
  const timer=window.setInterval(()=>{const combo=document.querySelector<HTMLSelectElement>('#broadcast_translate_element .goog-te-combo');if(combo){if(combo.value!==target){combo.value=target;combo.dispatchEvent(new Event('change',{bubbles:true}));}window.clearInterval(timer);}else if(++attempts>=40)window.clearInterval(timer);},250);
  return()=>{disposed=true;window.clearInterval(timer);script.remove();delete windowWithTranslate.broadcastTranslateInit;};
 },[language]);
 return <main data-broadcast-listener-page className="min-h-dvh bg-background px-4 py-10 text-foreground"><div className="mx-auto max-w-xl"><p className="mb-8 text-center text-lg font-bold text-signal" translate="no">Multi-Lingual™</p><div id="broadcast_translate_element" className="hidden"/><div className="mb-4 flex justify-end"><Button variant="outline" size="icon" aria-label={qrAccessCopy[locale].cancel} title={qrAccessCopy[locale].cancel} onClick={()=>window.location.assign('/')}><X/></Button></div><div data-listener-flags className="relative mb-6"><FlagBanner microphone={false} flags={ALL_FLAGS} locale={language.replace(/^gt:/,'')} onSelect={flag=>{translation?.setLanguage(flag.locale??flag.lang,flag.country);try{localStorage.setItem('user_locale',flag.locale??`gt:${flag.lang}`);localStorage.setItem('ml-broadcast-language',flag.lang);}catch{}}}/></div><h1 data-listener-welcome className="mb-6 text-center text-2xl font-bold">{qrAccessCopy[locale].seat}</h1><PublicBroadcast locale={locale} listenerId={broadcastId} selectedLanguage={language.replace(/^gt:/,'')}/><details className="mt-6 border-t border-border pt-4 text-sm"><summary>{qrAccessCopy[locale].home}</summary><p className="mt-3">{qrAccessCopy[locale].iphone}</p><p className="mt-2">{qrAccessCopy[locale].android}</p></details></div></main>;
}