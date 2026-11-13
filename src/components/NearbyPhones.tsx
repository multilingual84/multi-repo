import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { newRoomId } from '@/lib/call-room';
import { getNearbyKey } from '@/lib/nearby.functions';
import { meetCodeChannel, mergePeers, nearbyChannelName, nearbyCopy, normalizeMeetCode, peersFromPresence, validInvite, type NearbyInvite, type NearbyPeer } from '@/lib/nearby';
import { flagFor } from '@/lib/meeting-room';
import { readDevicePreference, saveDevicePreference } from '@/lib/device-preferences';

type Channel = ReturnType<typeof supabase.channel>;

export function NearbyPhones({ locale, language }: { locale: string; language: string }) {
  const c = nearbyCopy[locale] ?? nearbyCopy['en'];
  const [on, setOn] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [activeCode, setActiveCode] = useState('');
  const [peers, setPeers] = useState<NearbyPeer[]>([]);
  const [invite, setInvite] = useState<NearbyInvite | null>(null);
  const [status, setStatus] = useState('');
  const channels = useRef<Map<string, Channel>>(new Map());
  const selfId = useRef('');

  useEffect(() => {
    setOn(readDevicePreference('ml-nearby-on', true));
    try {
      setName(localStorage.getItem('ml-nearby-name') ?? '');
      const saved = localStorage.getItem('ml-nearby-code') ?? '';
      setCode(saved); setActiveCode(saved);
    } catch { /* storage unavailable */ }
    selfId.current = newRoomId();
  }, []);

  useEffect(() => {
    if (!on) return;
    let cancelled = false;
    const sync = () => {
      if (cancelled) return;
      setPeers(mergePeers([...channels.current.values()].map(ch => peersFromPresence(ch.presenceState() as never, selfId.current))));
    };
    const open = (channelName: string) => {
      if (channels.current.has(channelName)) return;
      const channel = supabase.channel(channelName, { config: { presence: { key: selfId.current }, broadcast: { self: false } } });
      channel.on('presence', { event: 'sync' }, sync);
      channel.on('broadcast', { event: 'invite' }, ({ payload }) => { const v = validInvite(payload, selfId.current); if (v) setInvite(v); });
      channel.on('broadcast', { event: 'decline' }, ({ payload }) => { if ((payload as { to?: string })?.to === selfId.current) setStatus(c?.declined ?? ''); });
      channel.subscribe(s => { if (s === 'SUBSCRIBED') void channel.track({ name: name || 'Phone', lang: language }); });
      channels.current.set(channelName, channel);
    };
    // Same-Wi-Fi phones: found automatically on a privacy key derived from the network.
    void getNearbyKey().then(({ key }) => { if (!cancelled) open(nearbyChannelName(key)); }).catch(() => { /* nearby unavailable */ });
    // Phones on another Wi-Fi or on mobile data: they join with the same meet code.
    const codeChannel = meetCodeChannel(activeCode);
    if (codeChannel) open(codeChannel);
    return () => {
      cancelled = true;
      for (const ch of channels.current.values()) void supabase.removeChannel(ch);
      channels.current.clear();
      setPeers([]);
    };
  }, [on, language, activeCode]);

  useEffect(() => { for (const ch of channels.current.values()) void ch.track({ name: name || 'Phone', lang: language }); }, [name, language]);

  function toggle(v: boolean) { setOn(v); setStatus(''); saveDevicePreference('ml-nearby-on', v); }
  function commitCode(v: string) {
    const n = normalizeMeetCode(v);
    setCode(v); setActiveCode(n); setStatus('');
    try { localStorage.setItem('ml-nearby-code', n); } catch { /* ignore */ }
  }
  function call(p: NearbyPeer) {
    const room = `meeting-${newRoomId()}`;
    const payload: NearbyInvite = { to: p.id, from: selfId.current, name: name || 'Phone', lang: language, room };
    for (const ch of channels.current.values()) void ch.send({ type: 'broadcast', event: 'invite', payload });
    setStatus(c?.calling ?? '');
    try { sessionStorage.setItem('ml-call-caller', room); } catch { /* ignore */ }
    window.location.hash = room;
  }
  function accept() { if (!invite) return; const room = invite.room; setInvite(null); window.location.hash = room; }
  function decline() { if (!invite) return; for (const ch of channels.current.values()) void ch.send({ type: 'broadcast', event: 'decline', payload: { to: invite.from } }); setInvite(null); }

  if (!c) return null;
  return (
    <>
      <div data-nearby-phones className="max-h-32 w-full space-y-2 overflow-y-auto rounded-2xl border border-border bg-card p-3 text-left text-card-foreground">
        <p className="text-base font-black">{c.title}</p>
        <label className="flex items-center justify-between gap-3 text-sm font-bold">
          <span>{c.toggle}</span>
          <Switch checked={on} onCheckedChange={toggle} aria-label={c.toggle} />
        </label>
        {on && <>
          <input value={name} maxLength={24} placeholder={c.name} aria-label={c.name} onChange={e => { setName(e.target.value); try { localStorage.setItem('ml-nearby-name', e.target.value); } catch { /* ignore */ } }} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
          <div className="flex items-center gap-2">
            <input value={code} maxLength={8} placeholder={c.code} aria-label={c.code} onChange={e => setCode(e.target.value)} onBlur={() => commitCode(code)} onKeyDown={e => { if (e.key === 'Enter') commitCode(code); }} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm uppercase" />
            <Button variant="outline" className="h-11 shrink-0 rounded-xl px-3 text-sm font-bold" onClick={() => commitCode(code)}>{c.join}</Button>
          </div>
          <p className="text-xs text-muted-foreground">{c.hint}</p>
          <p className="text-xs text-muted-foreground">{c.codeHint}</p>
          {peers.length === 0 ? <p className="text-sm">{c.none}</p> : <div className="grid gap-2">
            {peers.map(p => <Button key={p.id} variant="outline" className="h-12 justify-start gap-2 rounded-xl text-base font-bold" onClick={() => call(p)}>{p.name} · {flagFor(p.lang)?.label ?? p.lang}</Button>)}
          </div>}
          {status && <p role="status" className="text-sm font-bold">{status}</p>}
        </>}
      </div>
      {invite && <div role="alertdialog" className="relative space-y-3 rounded-xl border-2 border-primary bg-background p-4">
        <button aria-label={c.decline} onClick={decline} className="absolute right-2 top-2"><X size={18} /></button>
        <p className="pr-6 text-base font-black">{invite.name} ({flagFor(invite.lang)?.label ?? invite.lang}) {c.wants}</p>
        <div className="flex gap-2"><Button className="flex-1" onClick={accept}>{c.accept}</Button><Button variant="outline" className="flex-1" onClick={decline}>{c.decline}</Button></div>
      </div>}
    </>
  );
}
