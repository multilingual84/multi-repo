import {useEffect,useState} from 'react';
import {Volume2,Square} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {claraSpeak,isVoiceSupported} from '@/lib/clara-voice';
import {messageCopy} from '@/lib/private-message-copy';
export default function ClaraMessageReply({text,locale}:{text:string;locale:string}){
 const [speaking,setSpeaking]=useState(false),[supported,setSupported]=useState(false);const c=messageCopy(locale);
 useEffect(()=>{setSupported(isVoiceSupported());return ()=>{if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();};},[]);
 const stop=()=>{speechSynthesis.cancel();setSpeaking(false);};
 return <div className="space-y-3"><p className="whitespace-pre-wrap break-words" data-clara-message-text>{text}</p><Button variant="outline" disabled={!supported} onClick={()=>{if(speaking){stop();return;}setSpeaking(true);void claraSpeak(text,locale==='tl'?'fil-PH':locale).catch(()=>{}).finally(()=>setSpeaking(false));}}><span aria-hidden>{speaking?<Square size={16}/>:<Volume2 size={16}/>}</span>{speaking?c.stop:c.listen}</Button></div>;
}
