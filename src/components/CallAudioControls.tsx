import { Headphones, Volume2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import type { AudioRoute } from '@/lib/answer-call';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { BluetoothOutput } from '@/components/BluetoothOutput';


const audioCopy = {
  en: ['Audio output', 'Speaker', 'Headset', 'Noise reduction'],
  es: ['Salida de audio', 'Altavoz', 'Auriculares', 'Reducción de ruido'],
  zh: ['音频输出', '扬声器', '耳机', '降噪'],
  de: ['Audioausgabe', 'Lautsprecher', 'Headset', 'Rauschunterdrückung'],
  tl: ['Labasan ng audio', 'Speaker', 'Headset', 'Bawas ingay'],
  ja: ['音声出力', 'スピーカー', 'ヘッドセット', 'ノイズ低減'],
};

export default function CallAudioControls({ route, onRoute, enhanced, onEnhanced, compact = false, mode = 'all' }: {
  route: AudioRoute; onRoute: (r: AudioRoute) => void; enhanced: boolean; onEnhanced: (v: boolean) => void;
  compact?: boolean;
  mode?: 'all' | 'output' | 'enhancement';
}) {
  const [locale, setLocale] = useState('en');
  useEffect(() => {
    const update = () => setLocale(document.documentElement.lang || 'en');
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    return () => observer.disconnect();
  }, []);
  const copy = audioCopy[locale as keyof typeof audioCopy] ?? audioCopy.en;
  return (
    <div data-call-audio-controls className={compact ? 'flex w-full flex-wrap items-center justify-center gap-2' : 'flex flex-col items-center gap-3'}>
      {mode !== 'enhancement' && <div role="group" aria-label={copy[0]} className="flex gap-2">
        {(['speaker', 'headset'] as const).map(r => (
          <Button variant="outline" key={r} type="button" aria-pressed={route === r} onClick={() => onRoute(r)}
            className={`flex min-h-11 items-center gap-2 rounded-full border ${compact ? 'px-3 text-xs font-bold' : 'px-4 text-sm font-bold'} ${route === r ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground'}`}>
            {r === 'speaker' ? <Volume2 size={18} /> : <Headphones size={18} />}
            {r === 'speaker' ? copy[1] : copy[2]}
          </Button>
        ))}
        <BluetoothOutput locale={locale} compact={compact}/>

      </div>}
      {mode !== 'output' && <label className={`flex min-h-11 items-center ${mode === 'enhancement' ? 'flex-col justify-center gap-2 text-xs font-bold' : compact ? 'gap-2 text-xs font-bold' : 'gap-3 text-sm font-bold'}`}>
        <Switch checked={enhanced} onCheckedChange={onEnhanced} aria-label={copy[3]} />
        <span>{copy[3]}</span>
      </label>}
    </div>
  );
}
