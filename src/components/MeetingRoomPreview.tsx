import { useMemo, useState } from 'react';
import { Copy, Link2, Mic, MicOff, PhoneOff, Plus, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { meetingRoomCopy } from '@/lib/meeting-room-copy';
import { CALLER_SLOTS, meetingInviteLink, sampleSeatCodes, type MeetingParticipant } from '@/lib/meeting-room';
import { ALL_FLAGS } from '@/lib/flag-catalog';
import { localizedFlagLabel } from '@/lib/flag-label';
import type { UILocale } from '@/lib/ui-copy';
import { browserCallCopy } from '@/lib/browser-call-copy';
import { openBrowserCall } from '@/lib/browser-call';
import CallRecents from '@/components/CallRecents';
import AgencyWifiGuide from '@/components/AgencyWifiGuide';

// Zoom-style board meeting room preview: participant grid, per-person listening
// language, host controls, and shareable seat codes. Presentation only — no live streams.
export default function MeetingRoomPreview({ locale }: { locale: UILocale }) {
  const c = meetingRoomCopy[locale];
  const callCopy = browserCallCopy[locale];
  const [mode, setMode] = useState<'video' | 'audio'>('video');
  const [muted, setMuted] = useState(false);
  const [camera, setCamera] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [callers, setCallers] = useState<(MeetingParticipant | null)[]>(() => Array.from({ length: CALLER_SLOTS }, () => null));
  const roomId = useMemo(() => Math.random().toString(36).slice(2, 8), []);
  const invite = meetingInviteLink(window.location.origin, roomId);
  const seats = useMemo(() => sampleSeatCodes(4), []);
  const addCaller = (slot: number) => setCallers(list => list.map((p, i) => (i === slot ? { name: '', lang: 'en', speaking: false } : p)));
  const renameCaller = (slot: number, name: string) => setCallers(list => list.map((p, i) => (i === slot && p ? { ...p, name } : p)));
  const copy = async (value: string) => {
    try { await navigator.clipboard.writeText(value); setCopied(value); }
    catch { setCopied(null); }
    window.setTimeout(() => setCopied(null), 3000);
  };
  return <section data-meeting-room className="mx-auto flex w-full max-w-4xl flex-col gap-4">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-xl font-black">{c.title}</h2>
      <div className="flex gap-1 rounded-lg border border-border bg-card p-1" role="group" aria-label={c.title}>
        <Button type="button" size="sm" variant={mode === 'video' ? 'default' : 'ghost'} onClick={() => setMode('video')} data-meeting-video><Video size={14}/> {c.video}</Button>
        <Button type="button" size="sm" variant={mode === 'audio' ? 'default' : 'ghost'} onClick={() => setMode('audio')} data-meeting-audio>{c.audio}</Button>
      </div>
    </div>
    <div className="flex flex-wrap justify-center gap-2" data-meeting-call-actions>
      <Button onClick={() => openBrowserCall(roomId, true)}><Video size={16}/>{callCopy.video}</Button>
      <Button variant="outline" onClick={() => openBrowserCall(roomId, false)}><Mic size={16}/>{callCopy.audio}</Button>
    </div>
    <p className="text-center text-xs text-muted-foreground">{callCopy.note}</p>
    <CallRecents locale={locale}/>
    <AgencyWifiGuide locale={locale}/>
    <div className={`grid gap-2 ${mode === 'video' ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5'}`}>
      <div className={`flex flex-col items-center gap-2 rounded-2xl border p-3 ${mode === 'video' ? 'aspect-video justify-center bg-banner-navy text-ink-foreground' : 'bg-card'}`} data-meeting-tile>
        <span className={`flex items-center justify-center rounded-full font-black ${mode === 'video' ? 'h-16 w-16 bg-primary text-2xl text-primary-foreground' : 'h-12 w-12 bg-primary/15 text-lg'}`} aria-hidden>{c.you.slice(0, 1)}</span>
        <span className="text-xs font-bold">{c.you} {!muted && <Mic size={12} className="inline text-signal" aria-hidden/>}</span>
        <label className="flex w-full flex-col gap-0.5 text-[10px] font-bold">
          <span>{c.listening}</span>
          <select defaultValue={locale} aria-label={`${c.listening} — ${c.you}`} className="min-h-11 w-full rounded-md border border-border bg-background px-1 text-xs text-foreground">
            {ALL_FLAGS.map(f => <option key={f.lang} value={f.lang}>{localizedFlagLabel(f, locale)}</option>)}
          </select>
        </label>
      </div>
      {callers.map((p, slot) => p === null ? (
        <button key={slot} type="button" onClick={() => addCaller(slot)} aria-label={c.addCaller} data-meeting-add-caller
          className={`flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-card/40 p-3 backdrop-blur-md transition-colors hover:bg-card/60 ${mode === 'video' ? 'aspect-video' : ''}`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background/60" aria-hidden><Plus size={22}/></span>
          <span className="text-xs font-bold text-muted-foreground">{c.addCaller}</span>
        </button>
      ) : (
        <div key={slot} className={`flex flex-col items-center gap-2 rounded-2xl border p-3 ${mode === 'video' ? 'aspect-video justify-center bg-banner-navy text-ink-foreground' : 'bg-card'}`} data-meeting-tile>
          <span className={`flex items-center justify-center rounded-full font-black ${mode === 'video' ? 'h-16 w-16 bg-primary text-2xl text-primary-foreground' : 'h-12 w-12 bg-primary/15 text-lg'}`} aria-hidden>{(p.name || '?').slice(0, 1).toUpperCase()}</span>
          <input value={p.name} onChange={e => renameCaller(slot, e.target.value)} placeholder={c.callerName} aria-label={`${c.callerName} ${slot + 1}`} maxLength={40}
            className="min-h-11 w-full rounded-md border border-border bg-background px-2 text-center text-xs font-bold text-foreground" />
          <label className="flex w-full flex-col gap-0.5 text-[10px] font-bold">
            <span>{c.listening}</span>
            <select value={p.lang} onChange={e => setCallers(list => list.map((q, i) => (i === slot && q ? { ...q, lang: e.target.value } : q)))} aria-label={`${c.listening} — ${p.name || c.callerName}`} className="min-h-11 w-full rounded-md border border-border bg-background px-1 text-xs text-foreground">
              {ALL_FLAGS.map(f => <option key={f.lang} value={f.lang}>{localizedFlagLabel(f, locale)}</option>)}
            </select>
          </label>
        </div>
      ))}
    </div>
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border bg-card p-3">
      <Button type="button" variant="outline" className="min-h-11" onClick={() => setMuted(m => !m)} aria-pressed={muted}>{muted ? <MicOff size={16}/> : <Mic size={16}/>} {muted ? c.unmute : c.mute}</Button>
      {mode === 'video' && <Button type="button" variant="outline" className="min-h-11" onClick={() => setCamera(v => !v)} aria-pressed={!camera}>{camera ? <Video size={16}/> : <VideoOff size={16}/>} {camera ? c.cameraOff : c.cameraOn}</Button>}
      <Button type="button" variant="outline" className="min-h-11" onClick={() => void copy(invite)}><Link2 size={16}/> {copied === invite ? c.copied : c.invite}</Button>
      <Button type="button" variant="destructive" className="min-h-11"><PhoneOff size={16}/> {c.end}</Button>
    </div>
    <div className="rounded-2xl border border-border bg-card p-4" data-meeting-seats>
      <h3 className="text-sm font-black">{c.seatsTitle}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{c.seatsBody}</p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {seats.map(code => (
          <li key={code} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <code className="text-xs font-bold">{code}</code>
            <Button type="button" size="sm" variant="outline" className="min-h-11" onClick={() => void copy(code)}><Copy size={14}/> {copied === code ? c.copied : c.copyCode}</Button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-muted-foreground">{c.previewNote}</p>
    </div>
    <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-4" data-meeting-capacity-gate>
      <h3 className="text-sm font-black">{c.capacityGateTitle}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{c.capacityGateBody}</p>
    </div>
  </section>;
}
