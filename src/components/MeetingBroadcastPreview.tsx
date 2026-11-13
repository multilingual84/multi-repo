import { useEffect, useState } from 'react';
import { Copy, QrCode, Volume2, Square, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { meetingCopy, meetingLanguages } from '@/lib/meeting-copy';
import { meetingPreviewId, meetingPreviewLink } from '@/lib/meeting-preview';
import type { UILocale } from '@/lib/ui-copy';
import QrSaveHint from '@/components/QrSaveHint';
import QrEarningFooter from '@/components/QrEarningFooter';
import { pickNaturalVoice, whenVoicesReady, getSpeechRate, getVoicePreference } from '@/lib/speech-playback';

export default function MeetingBroadcastPreview({locale}:{locale:UILocale}) {
  const c = meetingCopy[locale];
  const [link,setLink] = useState('');
  const [qr,setQr] = useState('');
  const [room,setRoom] = useState<string|null>(null);
  const [listening,setListening] = useState<UILocale>(locale);
  const [playing,setPlaying] = useState(false);
  const [copied,setCopied] = useState(false);
  useEffect(() => {
    const detect = () => {
      const id = meetingPreviewId(window.location.hash);
      setRoom(id);
      if(id) setLink(meetingPreviewLink(window.location.origin,id));
    };
    detect();
    const deviceLanguage = navigator.language.split('-')[0];
    const language = meetingLanguages.find(l => l.locale === deviceLanguage || (l.locale === 'tl' && deviceLanguage === 'fil'));
    setListening(language?.locale ?? locale);
    window.addEventListener('hashchange',detect);
    return () => {window.removeEventListener('hashchange',detect);window.speechSynthesis?.cancel();};
  },[locale]);
  useEffect(() => {
    if(!link) return;
    let alive = true;
    import('qrcode').then(m => m.toDataURL(link,{width:224,margin:2})).then(image => {if(alive)setQr(image);}).catch(() => {if(alive)setQr('');});
    return () => {alive=false;};
  },[link]);
  const stop = () => {window.speechSynthesis?.cancel();setPlaying(false);};
  const play = () => {
    if(!window.speechSynthesis) return;
    stop();
    const synth = window.speechSynthesis;
    const lang = meetingLanguages.find(l => l.locale === listening)?.speech ?? 'en-US';
    const speak = (voices: SpeechSynthesisVoice[]) => {
      const speech = new SpeechSynthesisUtterance(meetingCopy[listening].sample);
      speech.lang = lang;
      speech.rate = getSpeechRate(lang);
      const preferred = getVoicePreference(lang);
      const voice = (preferred ? voices.find(v => v.voiceURI === preferred) : undefined) ?? pickNaturalVoice(voices, lang);
      if (voice) speech.voice = voice;
      speech.onend = () => setPlaying(false);
      speech.onerror = () => setPlaying(false);
      setPlaying(true);
      synth.speak(speech);
    };
    const immediate = synth.getVoices();
    if (immediate.length || typeof synth.addEventListener !== 'function') speak(immediate);
    else void whenVoicesReady().then(speak);
  };
  return <div className="w-full min-w-0 space-y-4 border-t border-border pt-6" data-meeting-preview>
    <h3 className="flex items-center justify-center gap-2 text-xl font-black"><QrCode size={20}/>{room?c.room:c.title}</h3>
    {!link && <Button className="h-auto max-w-full whitespace-normal" onClick={() => {setLink(meetingPreviewLink(window.location.origin,crypto.randomUUID()));setCopied(false);}}><QrCode/>{c.create}</Button>}
    {qr && <div data-qr-guide-box className="mx-auto w-full max-w-xl space-y-2 rounded-xl bg-background p-3">
      <QrSaveHint locale={locale}/>
      <img src={qr} width={224} height={224} alt={c.title} className="mx-auto h-56 w-56 max-w-full"/>
      <QrEarningFooter locale={locale} purpose="business"/>
    </div>}
    {link && <>
      <p translate="no" className="notranslate break-all text-xs">{link}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild variant="outline" className="h-auto max-w-full whitespace-normal"><a href={link}><ExternalLink/>{c.open}</a></Button>
        <Button variant="outline" className="h-auto max-w-full whitespace-normal" onClick={() => {void navigator.clipboard.writeText(link).then(() => setCopied(true)).catch(() => setCopied(false));}}><Copy/>{c.copy}</Button>
      </div>
      {copied && <p role="status" className="text-sm">{c.copied}</p>}
      <label className="block space-y-2 text-sm font-bold">{c.language}<select aria-label={c.language} value={listening} onChange={e => {stop();setListening(e.target.value as UILocale);}} className="block w-full rounded-md border border-input bg-background p-3 text-foreground">{meetingLanguages.map(l => <option key={l.locale} value={l.locale}>{l.label}</option>)}</select></label>
      <Button variant="outline" aria-pressed={playing} className="h-auto max-w-full whitespace-normal" onClick={playing?stop:play}>{playing?<Square/>:<Volume2/>}{playing?c.stop:c.listen}</Button>
    </>}
  </div>;
}
