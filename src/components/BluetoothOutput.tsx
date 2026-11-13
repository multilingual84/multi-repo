import { useEffect, useState } from 'react';
import { Bluetooth, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { audioOutputCopy, getPreferredSink, listAudioOutputs, setPreferredSink, type AudioOutput } from '@/lib/audio/audio-output';

/**
 * A tab beside Speaker/Headset that lists the audio outputs the browser can see
 * and remembers the visitor's pick. Pairing a headset stays in the phone.
 */
export function BluetoothOutput({ locale, compact = false }: { locale: string; compact?: boolean }) {
  const c = audioOutputCopy[locale] ?? audioOutputCopy['en']!;
  const [open, setOpen] = useState(false);
  const [devices, setDevices] = useState<AudioOutput[]>([]);
  const [sink, setSink] = useState('');
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    void listAudioOutputs().then(list => {
      if (cancelled) return;
      setDevices(list);
      setSink(getPreferredSink());
      setChecked(true);
    });
    return () => { cancelled = true; };
  }, [open]);

  function choose(deviceId: string) {
    setPreferredSink(deviceId);
    setSink(deviceId);
  }

  const others = devices.filter(device => device.deviceId !== 'default');
  const named = others.filter(device => device.label);

  return (
    <div data-bluetooth-output className="relative">
      <Button variant="outline" type="button" aria-pressed={open} onClick={() => setOpen(v => !v)}
        className={`flex min-h-11 items-center gap-2 rounded-full border ${compact ? 'px-3 text-xs font-bold' : 'px-4 text-sm font-bold'} ${open ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground'}`}>
        <Bluetooth size={18} />{c.tab}
      </Button>
      {open && <div role="group" aria-label={c.heading}
        className="absolute left-1/2 top-full z-50 mt-2 w-64 max-w-[86vw] -translate-x-1/2 space-y-2 rounded-lg border border-border bg-card p-3 text-left shadow-xl">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-black">{c.heading}</p>
          <Button variant="ghost" size="icon" aria-label={c.exit} onClick={() => setOpen(false)}><X size={16} /></Button>
        </div>
        {checked && named.length === 0
          ? <p className="text-[11px] leading-snug text-muted-foreground">{others.length ? c.names : c.none}</p>
          : <div className="flex flex-col gap-1">
            <button type="button" onClick={() => choose('')} aria-pressed={sink === ''}
              className={`min-h-11 rounded-md border px-3 text-left text-xs font-bold ${sink === '' ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground'}`}>{c.speaker}</button>
            {named.map(device => <button key={device.deviceId} type="button" onClick={() => choose(device.deviceId)} aria-pressed={sink === device.deviceId}
              className={`min-h-11 rounded-md border px-3 text-left text-xs font-bold ${sink === device.deviceId ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card text-foreground'}`}>
              {device.label}{device.bluetooth ? ' 📶' : ''}
            </button>)}
          </div>}
        <p className="text-[10px] leading-snug text-muted-foreground">{c.note}</p>
      </div>}
    </div>
  );
}

export default BluetoothOutput;
