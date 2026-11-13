import { Mic } from 'lucide-react';

export default function MicrophoneMeter({ level, active, label }: { level: number; active: boolean; label: string }) {
  const segments = active ? Math.ceil(Math.max(0, Math.min(1, level)) * 12) : 0;
  return <div data-microphone-meter role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(active ? level * 100 : 0)} className="flex w-5 shrink-0 flex-col items-center gap-2">
    <div aria-hidden="true" className="flex h-40 w-4 flex-col-reverse gap-1">
      {Array.from({ length: 12 }, (_, index) => <span key={index} className={`min-h-0 flex-1 rounded-sm transition-colors duration-75 ${index < segments ? 'bg-voice-ready' : 'bg-muted'}`} />)}
    </div>
    <Mic aria-hidden="true" size={16} className={active ? 'text-voice-ready' : 'text-muted-foreground'} />
  </div>;
}