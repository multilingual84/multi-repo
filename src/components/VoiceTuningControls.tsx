import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getSpeechRate, setSpeechRate, getResponsePause, setResponsePause, RESPONSE_PAUSES, type ResponsePause } from '@/lib/speech-playback';
import { voiceTuningCopy } from '@/lib/voice-tuning-copy';
import type { UILocale } from '@/lib/ui-copy';
import {SPEECH_RATE,PACE_PRESETS} from '@/lib/speech-playback';
import {compactCopy} from '@/lib/wallet/compact-copy';
import {speechRateAtPosition,speechPositionAtRate} from '@/lib/speech-playback';

// Owner tuning for how translations sound: speaking speed and the pause before the
// translation plays. Speed is saved per language on this device only. The device voice
// picker lives in the Voice changer; this panel no longer lists local phone voices.
export default function VoiceTuningControls({ locale, language }: { locale: UILocale; language: string }) {
  const c = voiceTuningCopy[locale];
  const [rate, setRate] = useState(SPEECH_RATE);
  const [pause, setPause] = useState<ResponsePause>(() => getResponsePause());
  // Switching the translation language loads that language's own saved tuning.
  useEffect(() => { setSpeechRate(SPEECH_RATE,language);setRate(SPEECH_RATE); }, [language]);
  return <div data-voice-tuning className="w-full space-y-2 border-b border-border py-2 text-left">
    <label className="flex flex-col gap-1 text-xs font-bold">
      <span>{c.speed}: {rate===SPEECH_RATE?compactCopy[locale].natural:rate.toFixed(2)}</span>
      <input type="range" min={0} max={100} step={1} value={speechPositionAtRate(rate)} aria-label={c.speed}
        className="min-h-11 w-full accent-primary"
        onChange={e => { const next = speechRateAtPosition(Number(e.target.value)); setRate(next); setSpeechRate(next, language); }} />
      <span className="flex justify-between text-[10px] font-normal text-muted-foreground"><span>{c.slower}</span><span>{c.faster}</span></span>
    </label>
    <div className="grid grid-cols-3 gap-1" role="group" aria-label={c.speed} data-pace-presets>
      {(['slow','normal','fast'] as const).map(k=>{const v=PACE_PRESETS[k];return <Button key={k} type="button" variant="outline" aria-pressed={rate===v} data-pace-preset={k}
        className={`min-h-11 px-1 text-[11px] font-bold ${rate===v?'border-primary bg-primary/15 text-foreground':'border-border bg-background text-muted-foreground'}`}
        onClick={()=>{setRate(v);setSpeechRate(v,language);}}>{k==='slow'?c.slower:k==='fast'?c.faster:compactCopy[locale].natural}</Button>;})}
    </div>
    <div className="flex flex-col gap-1 text-xs font-bold">
      <span>{c.response}</span>
      <div className="grid grid-cols-3 gap-1" role="group" aria-label={c.response}>
        {(['quickest', 'balanced', 'natural'] as const).map(option => (
          <Button variant="outline" key={option} type="button" data-pause-option={option} aria-pressed={pause === option}
            className={`min-h-11 flex-col gap-1 rounded-md border px-1 text-[11px] font-bold ${pause === option ? 'border-primary bg-primary/15 text-foreground' : 'border-border bg-background text-muted-foreground'}`}
            onClick={() => { setPause(option); setResponsePause(option); }}>
            {c[option]}
            <span className="block text-[9px] font-normal">{RESPONSE_PAUSES[option] / 1000}s</span>
          </Button>
        ))}
      </div>
    </div>
  </div>;
}
