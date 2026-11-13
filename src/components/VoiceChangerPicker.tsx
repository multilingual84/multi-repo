import { useEffect, useRef, useState } from 'react';
import { X, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PRO_VOICE_PROFILES, professionalDetailCopy, proVoiceCopy, setVoiceChangerProfile, voiceChangerCopy, voiceChangerProfile, type VoiceChangerProfile } from '@/lib/audio/voice-changer';
import { getSpeechRate } from '@/lib/speech-playback';
import { stopHdVoice } from '@/lib/audio/hd-voice';
import { playVoicePreview, stopVoicePreview } from '@/lib/audio/voice-preview';
import { voiceMatchOn } from '@/lib/voice-match';
import type { UILocale } from '@/lib/ui-copy';

// Free voice changer picker: everyday shapes plus one tab holding 60 professional
// voices (30 female, 30 male), each with its own fixed real-speaker preview.
export default function VoiceChangerPicker({ locale, language }: { locale: UILocale; language?: string | undefined }) {
  const c = voiceChangerCopy[locale] ?? voiceChangerCopy.en;
  const p = proVoiceCopy[locale] ?? proVoiceCopy.en;
  const d = professionalDetailCopy[locale] ?? professionalDetailCopy.en;
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<VoiceChangerProfile | null>(null);
  const sampleRequest = useRef(0);
  const [profile, setProfile] = useState<VoiceChangerProfile>('natural');
  const [sampleError, setSampleError] = useState(false);
  useEffect(() => {
    const sync = () => setProfile(voiceChangerProfile());
    sync();
    window.addEventListener('ml-voice-changer', sync);
    return () => window.removeEventListener('ml-voice-changer', sync);
  }, []);
  useEffect(() => {
    const switchedToMatch = () => {
      if (!voiceMatchOn()) return;
      sampleRequest.current += 1;
      stopVoicePreview();
      setPreview(null);
      setSampleError(false);
    };
    window.addEventListener('ml-voice-match', switchedToMatch);
    return () => window.removeEventListener('ml-voice-match', switchedToMatch);
  }, []);
  const options: { id: VoiceChangerProfile; label: string }[] = [
    { id: 'deeper', label: c.deeper },
    { id: 'natural', label: c.natural },
    { id: 'higher', label: c.higher },
  ];
  const exit = () => {
    sampleRequest.current += 1;
    stopVoicePreview();
    stopHdVoice();
    window.speechSynthesis?.cancel();
    setSampleError(false);
    setPreview(null);
    setOpen(false);
  };
  const openChooser = () => {
    setOpen(true);
  };
  useEffect(() => () => { sampleRequest.current += 1; stopVoicePreview(); }, []);
  const select = (id: VoiceChangerProfile) => {
    sampleRequest.current += 1;
    stopVoicePreview();
    setPreview(null);
    setSampleError(false);
    setVoiceChangerProfile(id);
  };
  const hear = async (id: VoiceChangerProfile) => {
    const request = ++sampleRequest.current;
    setSampleError(false);
    setPreview(id);
    stopHdVoice();
    window.speechSynthesis?.cancel();
    setVoiceChangerProfile(id);
    const lang = language || document.documentElement.lang || locale;
    try {
      const professional = PRO_VOICE_PROFILES.find(v => v.id === id);
      if (!professional || !await playVoicePreview(professional.id, getSpeechRate(lang))) throw new Error('Playback failed');
    } catch { if (request === sampleRequest.current) setSampleError(true); }
    finally { if (request === sampleRequest.current) setPreview(null); }
  };
  const active = (id: string) => profile === id ? 'border-primary bg-primary/15 text-foreground' : 'border-border bg-background text-muted-foreground';
  const column = (gender: 'f' | 'm', title: string) => (
    <div className="space-y-1">
      <p className="font-bold">{title}</p>
      {PRO_VOICE_PROFILES.filter(v => v.gender === gender).map(v => (
        <div key={v.id} className="flex gap-1">
          <Button type="button" variant="outline" aria-pressed={profile === v.id} data-voice-shape={v.id}
            className={`min-h-11 flex-1 px-2 text-[11px] font-bold ${active(v.id)}`}
            onClick={() => void hear(v.id)}>{preview === v.id && <LoaderCircle className="size-4 shrink-0 animate-spin motion-reduce:animate-none"/>}<span>{v.name}<span className="block text-[10px] font-normal">{d[v.tone]}</span></span></Button>
        </div>
      ))}
    </div>
  );
  return (
    <div data-voice-changer className="w-full space-y-2 text-left text-xs">
      <div data-pro-voices className="rounded-md border border-border bg-background">
        <Button variant="ghost" className="min-h-11 w-full justify-start whitespace-normal px-3 py-3 text-xs font-bold" aria-expanded={open} onClick={() => open ? exit() : openChooser()}>{c.label}</Button>
        {open && <>
        <div className="flex justify-end px-2"><Button variant="outline" onClick={exit} aria-label={d.exit}><X className="size-4"/>{d.exit}</Button></div>
      <div className="px-2 pt-2">
      <div className="grid grid-cols-3 gap-1" role="group" aria-label={c.label}>
        {options.map(option => (
          <Button key={option.id} type="button" variant="outline" aria-pressed={profile === option.id} data-voice-shape={option.id}
            className={`min-h-11 px-1 text-[11px] font-bold ${active(option.id)}`}
            onClick={() => select(option.id)}>{option.label}</Button>
        ))}
      </div>
      <p className="pt-3 font-bold">{p.label}</p>
      </div>
        <div className="grid max-h-80 grid-cols-2 gap-2 overflow-y-auto p-2">
          {column('f', p.female)}
          {column('m', p.male)}
        </div>
      <p className="px-2 pb-2 text-muted-foreground">{d.note}</p>
      {preview && <p role="status">{d.loading}</p>}
      {sampleError && <p role="alert" className="text-destructive">{d.error}</p>}
        </>}
      </div>
    </div>
  );
}
