import {useEffect,useState} from 'react';
import {Switch} from '@/components/ui/switch';
import {setVoiceMatch,voiceMatchCopy,voiceMatchOn} from '@/lib/voice-match';
import {enableMatchedVoice} from '@/lib/audio/voice-changer';
import {stopVoicePreview} from '@/lib/audio/voice-preview';
import type {UILocale} from '@/lib/ui-copy';
export default function VoiceMatchSwitch({locale,onChange}:{locale:UILocale;onChange?:(on:boolean)=>void}){
 const [on,setOn]=useState(true);
 useEffect(()=>{const sync=()=>{const v=voiceMatchOn();setOn(v);onChange?.(v);};sync();window.addEventListener('ml-voice-match',sync);return()=>window.removeEventListener('ml-voice-match',sync);},[]);
 const c=voiceMatchCopy[locale]??voiceMatchCopy.en;
 return <div data-voice-match className="w-full space-y-1 text-left text-xs">
  <label className="flex items-center justify-between gap-3 font-bold"><span>{c.label}</span><Switch checked={on} onCheckedChange={v=>{stopVoicePreview();if(v)enableMatchedVoice();else setVoiceMatch(false);}} aria-label={c.label}/></label>
  <p className="text-muted-foreground">{c.note}</p>
 </div>;
}
