import { useEffect, useRef, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Mic, Radio, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {savedQrAccess} from '@/lib/qr-access-browser';
import {
  mailboxStateFn,
  openPrivateMessageFn,
  recipientMailboxFn,
  sendPrivateMessageFn,
} from '@/lib/private-messages.functions';
import { encodeBytes, openMessage, sealMessage } from '@/lib/private-message-crypto';
import { mailboxAddress } from '@/lib/private-message-policy';
import { walkieCopy } from '@/lib/walkie-copy';
import MicrophonePermissionNotice from '@/components/MicrophonePermissionNotice';
import AccessNotice from '@/components/AccessNotice';
import {
  addUsage,
  allowanceTopUpCopy,
  currentUsage,
  minutesLeft,
  paywallCopy,
  resetsAt,
} from '@/lib/free-allowance-policy';
import type { UILocale } from '@/lib/ui-copy';

export default function WalkieTalkie({ locale }: { locale: string }) {
  const native = (locale.replace(/^gt:/, '').split('-')[0]) as UILocale;
  const c = walkieCopy[native] ?? walkieCopy['en'];
  const wall = paywallCopy[native] ?? paywallCopy['en'];
  const topUp = allowanceTopUpCopy[native] ?? allowanceTopUpCopy['en'];

  const getState = useServerFn(mailboxStateFn);
  const recipientFn = useServerFn(recipientMailboxFn);
  const sendFn = useServerFn(sendPrivateMessageFn);
  const openFn = useServerFn(openPrivateMessageFn);

  const [account, setAccount] = useState('');
  const [contact, setContact] = useState('');
  const [added, setAdded] = useState('');
  const [peers, setPeers] = useState<{ id: string; nickname: string }[]>([]);
  const [listening, setListening] = useState(false);
  const [recording, setRecording] = useState(false);
  const [permission, setPermission] = useState(false);
  const [status, setStatus] = useState('');
  const [blocked, setBlocked] = useState(false);

  const keys = useRef<{ publicKey: string; privateKey: string } | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seen = useRef<Set<string> | null>(null);
  const alive = useRef(true);
  const player = useRef<HTMLAudioElement | null>(null);
  const started = useRef(0);

  const stop = () => {
    if (recorder.current?.state === 'recording') recorder.current.stop();
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    if (timer.current) clearTimeout(timer.current);
    setRecording(false);
  };

  const play = async (id: string) => {
    try {
      const envelope = await openFn({ data: { id } });
      if (!alive.current || !keys.current) return;
      const text = openMessage(envelope, keys.current.privateKey);
      const packet = JSON.parse(text) as { mime: string; audio: string };
      if (!packet.mime.startsWith('audio/')) return;
      const bytes = Uint8Array.from(atob(packet.audio), (x) => x.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: packet.mime }));
      const el = new Audio(url);
      player.current = el;
      setStatus(c.playing);
      el.onended = () => {
        URL.revokeObjectURL(url);
        if (alive.current) setStatus('');
      };
      await el.play();
    } catch {
      if (alive.current) setStatus(c.error);
    }
  };

  const poll = async () => {
    if (!alive.current) return;
    let state;
    try {
      state = await getState();
    } catch {
      return;
    }
    if (!alive.current || !state) return;
    setPeers(state.replyContacts.map((x) => ({ id: x.mailbox_id, nickname: x.nickname })));
    if (!seen.current) seen.current = new Set(state.messages.map((m) => m.id));
    const seenMessages=seen.current;
    if(!seenMessages)return;
    const fresh = state.messages.filter((m) => !seenMessages.has(m.id));
    for (const m of fresh) {
      seenMessages.add(m.id);
      if (listening && m.kind === 'audio' && keys.current) void play(m.id);
    }
  };

  useEffect(() => {
    alive.current = true;
    const refresh=()=>setAccount(savedQrAccess()?.id??'');refresh();
    const revoke=()=>{setAccount('');stop();player.current?.pause();};
    window.addEventListener('ml-wallet-change',refresh);window.addEventListener('ml-access-revoked',revoke);
    return () => {
      alive.current = false;
      window.removeEventListener('ml-wallet-change',refresh);window.removeEventListener('ml-access-revoked',revoke);
      stop();
      player.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (!account) {
      setPeers([]);
      keys.current = null;
      seen.current = null;
      return;
    }
    try {
      const stored = localStorage.getItem(`ml-mailbox-key-${account}`);
      keys.current = stored ? JSON.parse(stored) : null;
    } catch {
      keys.current = null;
    }
    seen.current = null;
    void poll();
    const id = setInterval(() => {
      if (document.visibilityState === 'visible') void poll();
    }, 1000);
    return () => clearInterval(id);
  }, [account, listening]);

  const begin = async () => {
    setPermission(false);
    try {
      const capture = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, sampleRate: 16000, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      if (!alive.current) {
        capture.getTracks().forEach((t) => t.stop());
        return;
      }
      stream.current = capture;
      const mime = ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4'].find(
        (t) => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(t),
      );
      const rec = new MediaRecorder(capture, mime ? { mimeType: mime, audioBitsPerSecond: 16000 } : { audioBitsPerSecond: 16000 });
      recorder.current = rec;
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = () => {
        capture.getTracks().forEach((t) => t.stop());
        if (!alive.current) return;
        const blob = new Blob(chunks, { type: rec.mimeType });
        if (started.current) addUsage(Date.now() - started.current);
        started.current = 0;
        if (blob.size > 1000000) {
          setStatus(c.error);
          return;
        }
        void blob.arrayBuffer().then(async (buffer) => {
          if (!alive.current) return;
          try {
            const target = await recipientFn({ data: { mailboxId: mailboxAddress(contact) } });
            const payload = JSON.stringify({ mime: rec.mimeType, audio: encodeBytes(new Uint8Array(buffer)) });
            await sendFn({ data: { mailboxId: target.mailbox_id, ...sealMessage(payload, target.public_key), kind: 'audio' } });
            if (alive.current) setStatus(c.sent);
          } catch {
            if (alive.current) setStatus(c.error);
          }
        });
      };
      started.current = Date.now();
      rec.start();
      setRecording(true);
      timer.current = setTimeout(() => stop(), 30000);
    } catch {
      setStatus(c.error);
    }
  };

  const talk = () => {
    if (recording) {
      stop();
      return;
    }
    if (!contact) {
      setStatus(c.needContact);
      return;
    }
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('ml-free-allowance') ?? 'null');
    } catch {
      saved = null;
    }
    if (minutesLeft(currentUsage(saved, Date.now()).usedMs) <= 0) {
      setBlocked(true);
      return;
    }
    setPermission(true);
  };

  return (
    <section data-walkie className="space-y-3 border-y border-border py-4">
      <div className="flex items-center gap-2">
        <Radio size={18} className="text-accent" />
        <h3 className="font-bold">{c.title}</h3>
      </div>
      <p className="text-xs leading-snug text-muted-foreground">{c.notice}</p>
      <div className="space-y-2">
        <p className="font-bold">{c.network}</p>
        <div className="flex flex-wrap gap-2">
          {peers.map((p) => (
            <Button key={p.id} variant={contact === p.id ? 'default' : 'outline'} onClick={() => setContact(p.id)}>
              {p.nickname}
            </Button>
          ))}
          {peers.length === 0 && <p className="text-xs text-muted-foreground">{c.none}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <Input aria-label={c.add} placeholder={c.add} value={added} onChange={(e) => setAdded(e.target.value)} className="max-w-xs" />
          <Button
            variant="outline"
            onClick={() => {
              const id = mailboxAddress(added);
              if (id) {
                setContact(id);
                setAdded('');
              }
            }}
          >
            {c.pick}
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          data-walkie-talk
          className={recording ? 'bg-accent text-accent-foreground' : 'border-orange bg-orange font-bold text-orange-foreground hover:bg-orange/90'}
          onClick={talk}
        >
          {recording ? <Square size={16} /> : <Mic size={16} />} {recording ? c.stop : c.talk}
        </Button>
        <Button data-walkie-listen variant={listening ? 'default' : 'outline'} onClick={() => setListening((v) => !v)}>
          {listening ? c.stopListen : c.listen}
        </Button>
      </div>
      {blocked && (
        <AccessNotice>
          <p className="font-black">{wall.title}</p>
          <p className="text-xs">{wall.body}</p>
          <p className="text-xs font-bold">
            {wall.resets}{' '}
            {new Intl.DateTimeFormat(locale.replace(/^gt:/, ''), { dateStyle: 'medium', timeStyle: 'short' }).format(
              resetsAt(currentUsage((() => {
                try {
                  return JSON.parse(localStorage.getItem('ml-free-allowance') ?? 'null');
                } catch {
                  return null;
                }
              })(), Date.now())),
            )}
          </p>
          <Button
            variant="outline"
            className="h-auto w-full whitespace-normal"
            onClick={() => window.dispatchEvent(new CustomEvent('ml-open-pricing', { detail: { packageId: 'single' } }))}
          >
            {topUp}
          </Button>
        </AccessNotice>
      )}
      {permission && (
        <MicrophonePermissionNotice locale={locale} description={c.permission} onContinue={() => void begin()} onCancel={() => setPermission(false)} />
      )}
      {status && <p role="status">{status}</p>}
    </section>
  );
}
