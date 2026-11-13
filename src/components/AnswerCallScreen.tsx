import AccessNotice from './AccessNotice';
import CallCodeNotification from './CallCodeNotification';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Phone, PhoneOff, Mic, MicOff, X, Share2, Video, VideoOff, Bell, BellOff, Volume2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CallAudioControls from '@/components/CallAudioControls';
import { paidPackages } from '@/lib/pricing';
import { callAudioConstraints, isSharedCallLink, type AudioRoute } from '@/lib/answer-call';
import { roomFromHash } from '@/lib/call-room';
import { useTranslationState } from '@/context/TranslationContext';
import { networkGuidanceCopy } from '@/lib/network-guidance-copy';
import type { LiveCall, CallStatus, Caption } from '@/lib/live-call';
import { callScreenCopy } from '@/lib/call-screen-copy';
import { getFlagPricePlan, formatFlagPackagePrice } from '@/lib/flag-pricing';
import MicrophonePermissionNotice from '@/components/MicrophonePermissionNotice';
import CameraPermissionNotice from '@/components/CameraPermissionNotice';
import {readQrBonus} from '@/lib/qr-minute-bonus';
import { addUsage, hitsPaywall, resetsAt, paywallCopy } from '@/lib/free-allowance-policy';
import { activePassPreview } from '@/lib/pass-preview';
import { sharedCallConstraints, detectSignalTier, canAnswerSharedCall, callMediaCopy } from '@/lib/call-media';
import { startRingtone } from '@/lib/browser-call';
import { browserCallCopy } from '@/lib/browser-call-copy';
import { captureFailure, type CaptureFailure } from '@/lib/call-reliability';
import { callReliabilityCopy } from '@/lib/call-reliability-copy';
import { addCallHistory, callOutcome } from '@/lib/call-history';
import { walletStateFn, walletUsageFn } from '@/lib/wallet/access.functions';
import { useDevicePreference } from '@/hooks/use-device-preference';
import CallSharing from './CallSharing';
import { recipientCallLanguage } from '@/lib/shared-call-entry';

const soloPrice = paidPackages.find(p => p.id === 'single')?.price ?? 0.99;
// The Solo Pack offer after a call only appears once a call has run this long.
const UPSELL_AFTER_SECONDS = 300;

type Stage = 'ringing' | 'calling' | 'live' | 'ended' | 'closed';
const closeLabels: { en: string; [language: string]: string } = { en: 'Close call screen', es: 'Cerrar pantalla de llamada', tl: 'Isara ang screen ng tawag', zh: '关闭通话界面', de: 'Anrufbildschirm schließen', ja: '通話画面を閉じる' };

// The device that created the room gets the outgoing screen; everyone else gets "Incoming call".
/** QR / talk links connect both sides as soon as mic is allowed — no extra Answer tap. */
function isAutoConnectHash(hash: string): boolean {
  return hash.startsWith('#talk-') || hash.startsWith('#meeting-');
}

function isCallerFor(hash: string): boolean {
  try { return roomFromHash(hash) !== null && roomFromHash(hash) === (window.sessionStorage.getItem('ml-call-caller') ?? window.localStorage.getItem('ml-call-caller')); }
  catch { return false; }
}
function stageFor(hash: string): Stage {
  if (!isSharedCallLink(hash)) return 'closed';
  if (new URLSearchParams(window.location.search).get('incoming') === '1') return 'ringing';
  return isCallerFor(hash) ? 'calling' : 'ringing';
}

// Modal call screen shown when someone opens a shared QR code, link or text.
// While open it blocks the rest of the page until the visitor closes it.
export default function AnswerCallScreen() {
  const [stage, setStage] = useState<Stage>('closed');
  const [ringSound, setRingSound] = useState(false);
  const ringStop = useRef<(() => void) | null>(null);
  const ringAttempt = useRef(0);
  const [route, setRoute] = useDevicePreference<AudioRoute>('ml-audio-route', 'speaker');
  const [enhanced, setEnhanced] = useDevicePreference<boolean>('ml-audio-enhanced', true);
  const [error, setError] = useState(false);
  const [failure, setFailure] = useState<CaptureFailure>('generic');
  const [audioBlocked, setAudioBlocked] = useState(false);
  const [mediaEnded, setMediaEnded] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [cameraMuted, setCameraMuted] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [permission, setPermission] = useState(false);
  const [cameraPermission,setCameraPermission]=useState(false);
  const [videoEnabled, setVideoEnabled] = useState(false);
  const [localMedia, setLocalMedia] = useState<MediaStream | null>(null);
  const [remoteMedia, setRemoteMedia] = useState<MediaStream | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [endedSeconds, setEndedSeconds] = useState(0);
  const [linkCopied, setLinkCopied] = useState(false);
  const stream = useRef<MediaStream | null>(null);
  const call = useRef<LiveCall | null>(null);
  const attempt = useRef(0);
  const answering = useRef(false);
  const secondsRef = useRef(0);
  const historyId=useRef<string|null>(null);
  const connectedOnce=useRef(false);
  function recordCall(incoming:boolean,connected:boolean){const room=roomFromHash(window.location.hash);if(!room||!/^meeting-[a-zA-Z0-9_-]{6,64}$/.test(room))return;try{const id=historyId.current??crypto.randomUUID();historyId.current=id;addCallHistory({id,room,at:Date.now(),video:videoEnabled,outcome:callOutcome(incoming,connected)});}catch{/* local history unavailable */}}
  const [status, setStatus] = useState<CallStatus>('waiting');
  const [captions, setCaptions] = useState<Caption[]>([]);
  const tState = useTranslationState();
  const [recipientLanguage, setRecipientLanguage] = useState('');
  const lang = recipientLanguage || tState?.activeLanguage || 'en';
  useEffect(() => {
    let saved: string | null = null;
    try { saved = localStorage.getItem('user_locale'); } catch { /* optional preference */ }
    setRecipientLanguage(recipientCallLanguage(saved, navigator.languages?.[0] || navigator.language || '', null, Intl.DateTimeFormat().resolvedOptions().timeZone));
  }, []);
  useEffect(() => { if (tState?.activeLanguage && tState.activeLanguage !== 'en') setRecipientLanguage(tState.activeLanguage); }, [tState?.activeLanguage]);
  const paidRef = useRef(false);
  const [paywallAt, setPaywallAt] = useState<number | null>(null);
  const [pageLocale, setPageLocale] = useState('en');
  useEffect(() => {
    const update = () => setPageLocale(document.documentElement.lang || 'en');
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    return () => observer.disconnect();
  }, []);
  const c = callScreenCopy[pageLocale as keyof typeof callScreenCopy] ?? callScreenCopy.en;
  const mediaCopy = callMediaCopy[pageLocale as keyof typeof callMediaCopy] ?? callMediaCopy.en;
  const ringCopy = browserCallCopy[pageLocale as keyof typeof browserCallCopy] ?? browserCallCopy.en;
  const reliability = callReliabilityCopy[pageLocale as keyof typeof callReliabilityCopy] ?? callReliabilityCopy.en;
  const regionalSoloPrice = typeof window === 'undefined' ? '$0.99' : formatFlagPackagePrice('single', soloPrice, getFlagPricePlan(localStorage.getItem('user_locale') ?? pageLocale, null, localStorage.getItem('pricing_country') ?? undefined));

  useEffect(() => { setStage(stageFor(window.location.hash)); }, []);
  // QR / shared talk & meeting links: both phones auto-join the same LiveCall room (Supabase presence + WebRTC).
  // Browser still requires a user gesture / permission for the microphone; we request it immediately on open.
  useEffect(() => {
    if (stage !== 'calling' && stage !== 'ringing') return;
    if (!isAutoConnectHash(window.location.hash)) return;
    if (answering.current || call.current) return;
    let cancelled = false;
    const room = roomFromHash(window.location.hash);
    if (room) {
      try { sessionStorage.setItem('ml-call-room', room); } catch { /* */ }
    }
    // If permission was already granted, skip the notice and connect.
    const tryAuto = async () => {
      try {
        const perm = await navigator.permissions?.query?.({ name: 'microphone' as PermissionName });
        if (cancelled) return;
        if (perm?.state === 'granted') {
          void answer();
          return;
        }
      } catch { /* permissions.query not always available */ }
      if (!cancelled) setPermission(true);
    };
    void tryAuto();
    return () => { cancelled = true; };
  }, [stage]);

  useEffect(() => {
    const reset = () => {
      attempt.current += 1; answering.current = false;
      setCapturing(false); setError(false); setAudioBlocked(false); setMediaEnded(false);
      call.current?.hangUp(); call.current = null;
      stream.current?.getTracks().forEach(t => t.stop()); stream.current = null;
      setLocalMedia(null); setRemoteMedia(null); setStatus('waiting');
    };
    // Moving to a shared call link opens the call; moving away closes it.
    const onHash = () => { reset(); historyId.current=null;connectedOnce.current=false;setPermission(false); setCameraPermission(false); setVideoEnabled(false); setStage(stageFor(window.location.hash)); };
    // The "tap with another phone" tab explicitly opens an outgoing call on demand.
    const onOpen = (event: Event) => { reset(); historyId.current=null;connectedOnce.current=false;const detail=(event as CustomEvent<{ video?: boolean; immediate?:boolean }>).detail;setPermission(detail?.immediate===true); setCameraPermission(false); setVideoEnabled(detail?.video === true); setStage('calling'); };
    window.addEventListener('hashchange', onHash);
    window.addEventListener('ml-open-call', onOpen);
    return () => { window.removeEventListener('hashchange', onHash); window.removeEventListener('ml-open-call', onOpen); };
  }, []);
  function silenceRing() {
    ringAttempt.current += 1;
    ringStop.current?.(); ringStop.current = null; setRingSound(false);
  }
  async function ring() {
    if (ringSound) { silenceRing(); return; }
    const pending = ++ringAttempt.current;
    try {
      const stop = await startRingtone();
      if (pending !== ringAttempt.current) { stop(); return; }
      ringStop.current = stop; setRingSound(true);
    } catch { if (pending === ringAttempt.current) setRingSound(false); }
  }
  useEffect(() => {
    if (stage !== 'ringing' || permission || cameraPermission) silenceRing();
    return () => { ringAttempt.current += 1; ringStop.current?.(); ringStop.current = null; };
  }, [stage, permission, cameraPermission]);
  useEffect(() => () => { attempt.current += 1; call.current?.hangUp(); stream.current?.getTracks().forEach(t => t.stop()); }, []);
  useEffect(() => {
    const leave = () => { attempt.current += 1; call.current?.hangUp(); stream.current?.getTracks().forEach(t => t.stop()); };
    window.addEventListener('pagehide', leave);
    return () => window.removeEventListener('pagehide', leave);
  }, []);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') dismiss(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (stage !== 'live' || status === 'failed') return;
    const id = window.setInterval(() => {
      setSeconds(s => { secondsRef.current = s + 1; return s + 1; });
      const u = addUsage(1000);
      if (hitsPaywall(paidRef.current, u.usedMs, readQrBonus(), !!activePassPreview())) { setPaywallAt(resetsAt(u)); hangUp(); }
    }, 1000);
    return () => window.clearInterval(id);
  }, [stage, status]);
  useEffect(()=>{let alive=true;const check=()=>{void walletStateFn().then(s=>{if(alive)paidRef.current=s.verified&&s.paid;}).catch(()=>{if(alive)paidRef.current=false;});};check();window.addEventListener('ml-wallet-change',check);return()=>{alive=false;window.removeEventListener('ml-wallet-change',check);};},[]);
  useEffect(()=>{if(stage!=='live'||status!=='connected')return;let alive=true;const tick=()=>{void walletUsageFn().then(r=>{if(alive&&!r.paid&&r.usedSeconds>=r.limitSeconds){setPaywallAt(r.resetsAt?Date.parse(r.resetsAt):Date.now()+86400000);hangUp();}}).catch(()=>{});};tick();const timer=window.setInterval(tick,5000);return()=>{alive=false;window.clearInterval(timer);};},[stage,status]);
  // Announce the call state so the tap tab can light up while a call is active.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('ml-call-state', { detail: stage }));
    return () => { window.dispatchEvent(new CustomEvent('ml-call-state', { detail: 'closed' })); };
  }, [stage]);
  useEffect(() => {
    const track = stream.current?.getAudioTracks()[0];
    if (track) void track.applyConstraints(callAudioConstraints(enhanced)).catch(() => {});
  }, [enhanced]);

  async function answer() {
    if (!canAnswerSharedCall(isSharedCallLink(window.location.hash))) return;
    if (answering.current) return;
    answering.current = true;
    setCapturing(true); setError(false); setAudioBlocked(false); setMediaEnded(false);
    const currentAttempt = ++attempt.current;
    try {
      const captured = await navigator.mediaDevices.getUserMedia(sharedCallConstraints(callAudioConstraints(enhanced), videoEnabled, detectSignalTier()));
      if (currentAttempt !== attempt.current) { captured.getTracks().forEach(t => t.stop()); return; }
      stream.current = captured;
      setLocalMedia(captured); setRemoteMedia(null);
      setMicMuted(false); setCameraMuted(false); setStatus('waiting');
      setError(false); setSeconds(0); secondsRef.current = 0; setCaptions([]); setStage('live');
      const room = roomFromHash(window.location.hash);
      if (room) {
        const { LiveCall } = await import('@/lib/live-call');
        if (currentAttempt !== attempt.current) { captured.getTracks().forEach(track => track.stop()); return; }
        const c = new LiveCall(room, captured, lang, {
          onStatus: next => {
            if (currentAttempt !== attempt.current) return;
            setStatus(next);
            if(next==='connected'){connectedOnce.current=true;recordCall(!isCallerFor(window.location.hash),true);}
            if (next === 'ended') {
              stream.current?.getTracks().forEach(t => t.stop()); stream.current = null;
              setEndedSeconds(secondsRef.current); setStage('ended');
            }
            if (next === 'failed') { stream.current = null; setLocalMedia(null); setRemoteMedia(null); }
          },
          onCaption: cap => { if (currentAttempt === attempt.current) setCaptions(list => [...list.slice(-5), cap]); },
          onRemoteStream: media => { if (currentAttempt === attempt.current) setRemoteMedia(media); },
          onAudioBlocked: blocked => { if (currentAttempt === attempt.current) setAudioBlocked(blocked); },
          onMediaEnded: () => { if (currentAttempt === attempt.current) setMediaEnded(true); },
        });
        call.current = c; c.start();
      }
    } catch (error) {
      if (currentAttempt === attempt.current) {
        attempt.current += 1; call.current?.hangUp(); call.current = null;
        stream.current?.getTracks().forEach(t => t.stop()); stream.current = null;
        setLocalMedia(null); setRemoteMedia(null); setFailure(captureFailure(error)); setError(true);
        setStage(stageFor(window.location.hash)); answering.current = false; setCapturing(false);
      }
    }
    finally { if (currentAttempt === attempt.current) { answering.current = false; setCapturing(false); } }
  }
  function retryCall() {
    attempt.current += 1; answering.current = false;
    call.current?.hangUp(); call.current = null;
    stream.current?.getTracks().forEach(t => t.stop()); stream.current = null;
    setLocalMedia(null); setRemoteMedia(null); setAudioBlocked(false); setMediaEnded(false);
    setStatus('waiting'); setError(false); setCapturing(false); setStage(stageFor(window.location.hash));
    setPermission(true); setCameraPermission(false);
  }
  function hangUp() {
    recordCall(!isCallerFor(window.location.hash),connectedOnce.current);
    attempt.current += 1; answering.current = false;
    call.current?.hangUp(); call.current = null;
    stream.current?.getTracks().forEach(t => t.stop()); stream.current = null;
    setEndedSeconds(secondsRef.current);
    setStage('ended');
    setLocalMedia(null); setRemoteMedia(null); setCapturing(false);
  }
  function dismiss() {
    recordCall(!isCallerFor(window.location.hash),connectedOnce.current);
    silenceRing();
    attempt.current += 1; answering.current = false;
    call.current?.hangUp(); call.current = null;
    stream.current?.getTracks().forEach(t => t.stop()); stream.current = null;
    setStage('closed'); setError(false); setPermission(false); setCameraPermission(false);
    try { window.localStorage.removeItem('ml-call-caller'); } catch { /* private mode */ }
    try { window.sessionStorage.removeItem('ml-call-caller'); } catch { /* private mode */ }
    if (isSharedCallLink(window.location.hash)) {
      window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
    }
  }

  async function shareCall() {
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    try {
      if (nav.share) await nav.share({ title: 'Multi-Lingual™', text: c.shareText, url: window.location.href });
      else { await navigator.clipboard.writeText(window.location.href); setLinkCopied(true); window.setTimeout(() => setLinkCopied(false), 2500); }
    } catch { /* sharer dismissed the sheet */ }
  }

  if (stage === 'closed') return null;
  const time = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  const endedTime = `${Math.floor(endedSeconds / 60)}:${String(endedSeconds % 60).padStart(2, '0')}`;
  const closeLabel = closeLabels[pageLocale] ?? closeLabels.en;
  const network = networkGuidanceCopy[lang as keyof typeof networkGuidanceCopy] ?? networkGuidanceCopy.en;
  // One clear status line at a time — never "Connected" while still waiting.
  const liveStatus = status === 'connected'
    ? c.connectedStatus
    : status === 'connecting'
      ? c.connectingStatus
      : status === 'failed'
        ? network.private
        : c.waiting;

  // Portaled to <body> so the backdrop truly covers the whole screen — the sticky
  // header this is mounted in has transforms that would otherwise trap `fixed`.
  return createPortal(
    // Full-screen backdrop: nothing behind the call card can be tapped while it is open.
    <div data-answer-call className="fixed inset-0 z-[200] flex items-start justify-center bg-black/70 p-3 pt-[10dvh]"
      role="presentation" onClick={e => e.stopPropagation()}>
      <div role="dialog" aria-modal="true" aria-label={stage === 'calling' ? pageLocale === 'en' ? 'Outgoing call' : c.outgoing : c.incoming}
        className="relative flex max-h-[80dvh] w-full max-w-sm flex-col items-center gap-3 overflow-y-auto rounded-2xl border border-border bg-card px-4 pb-4 pt-3 text-center shadow-2xl">

        <Button variant="ghost" size="icon" onClick={dismiss} title={closeLabel} className="absolute right-1.5 top-1.5 z-[101] bg-card">
          <X aria-hidden="true" /><span className="sr-only">{closeLabel}</span>
        </Button>

        {(stage === 'ringing' || stage === 'calling') && <div className="w-full space-y-2 pr-8">
          <Button disabled={capturing || permission || cameraPermission} variant={videoEnabled ? 'default' : 'outline'} aria-pressed={videoEnabled} onClick={() => setVideoEnabled(value => !value)}><Video size={16} />{videoEnabled ? mediaCopy.video : mediaCopy.audio}</Button>
          {videoEnabled && <p className="text-xs text-muted-foreground">{mediaCopy.camera}</p>}
        </div>}

        {(stage === 'ringing' || stage === 'calling') && /^#my-code-[0-9a-f-]{36}$/.test(window.location.hash) && !new URLSearchParams(window.location.search).has('incoming') && <CallCodeNotification locale={pageLocale} onSent={()=>{const room=roomFromHash(window.location.hash);if(room)sessionStorage.setItem('ml-call-caller',room);setStage('calling');}}/>}

        {stage === 'ringing' && <>
          <div className="w-full pr-10 text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Multi-Lingual™</p>
            <h2 className="text-xl font-black">{c.incoming}</h2>
            <p className="mt-1 text-xs font-bold text-muted-foreground">{c.intro}</p>
          </div>
          <div className="flex w-full items-center justify-center gap-6">
            <button type="button" onClick={dismiss} aria-label={c.decline}
              className="grid h-14 w-14 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-lg">
              <PhoneOff size={24} />
            </button>
            <button type="button" disabled={capturing || permission || cameraPermission} onClick={() => setPermission(true)} aria-label={c.answer}
              className="grid h-16 w-16 place-items-center rounded-full bg-voice-ready text-ink shadow-lg motion-safe:animate-pulse">
              <Phone size={28} />
            </button>
          </div>
          <Button variant="outline" onClick={() => void ring()} aria-pressed={ringSound}>
            {ringSound ? <BellOff size={16}/> : <Bell size={16}/>}{ringSound ? ringCopy.stopSound : ringCopy.sound}
          </Button>
          <CallAudioControls compact route={route} onRoute={setRoute} enhanced={enhanced} onEnhanced={setEnhanced} />
          {error && <p role="alert" className="text-xs font-bold">{reliability[failure]}</p>}
        </>}

        {stage === 'calling' && <>
          <div className="w-full pr-10 text-left">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Multi-Lingual™</p>
            <h2 className="text-xl font-black">{c.outgoing}</h2>
          </div>
          <CallSharing link={window.location.href} locale={pageLocale} />
          <button type="button" onClick={() => void shareCall()}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-bold text-primary-foreground">
            <Share2 size={16} aria-hidden="true" />
            {linkCopied ? c.copied : c.share}
          </button>
          <button type="button" disabled={capturing || permission || cameraPermission} onClick={() => setPermission(true)} aria-label={c.start}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-voice-ready px-3 text-sm font-bold">
            <Phone size={16} aria-hidden="true" /> {c.start}
          </button>
          <CallAudioControls compact route={route} onRoute={setRoute} enhanced={enhanced} onEnhanced={setEnhanced} />
          {error && <p role="alert" className="text-xs font-bold">{reliability[failure]}</p>}
        </>}

        {stage === 'live' && <>
          <div className="flex w-full items-center justify-between gap-3 pr-10">
            <div className="min-w-0 text-left">
              <h2 className="text-lg font-black">{status === 'connected' ? c.connected : status === 'failed' ? network.title : c.calling}</h2>
              <p className="text-sm tabular-nums" aria-live="off">{time}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Button variant="outline" size="icon" disabled={status === 'failed'} data-live-mic={!micMuted} aria-pressed={!micMuted} title={micMuted ? reliability.unmute : reliability.mute} aria-label={micMuted ? reliability.unmute : reliability.mute} onClick={() => {
                const muted = !micMuted; stream.current?.getAudioTracks().forEach(track => { track.enabled = !muted; }); setMicMuted(muted);
              }} className={micMuted ? 'rounded-full' : 'rounded-full border-2 border-primary'}>{micMuted ? <MicOff size={20}/> : <Mic size={20}/>}</Button>
              <button type="button" onClick={hangUp} aria-label={c.end}
                className="grid h-12 w-12 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-lg">
                <PhoneOff size={22} />
              </button>
            </div>
          </div>
          <p role="status" className="w-full text-xs font-bold">{status === 'reconnecting' ? reliability.reconnecting : liveStatus}</p>
          {audioBlocked && status !== 'failed' && <div className="w-full space-y-2">
            <p className="text-xs">{reliability.audioFailed}</p>
            <Button variant="outline" onClick={() => void call.current?.resumeAudio()}><Volume2 size={16}/>{reliability.audio}</Button>
          </div>}
          {(videoEnabled || remoteMedia?.getVideoTracks().length) ? <div className="grid w-full grid-cols-2 gap-2">
            <video autoPlay playsInline muted ref={element => { if (element) element.srcObject = localMedia; }} className="aspect-video w-full rounded-md bg-muted object-cover" />
            <video autoPlay playsInline muted ref={element => { if (element) element.srcObject = remoteMedia; }} className="aspect-video w-full rounded-md bg-muted object-cover" />
          </div> : null}
          {localMedia?.getVideoTracks().length ? <Button variant="outline" aria-pressed={!cameraMuted} onClick={() => {
            const muted = !cameraMuted; stream.current?.getVideoTracks().forEach(track => { track.enabled = !muted; }); setCameraMuted(muted);
          }}>{cameraMuted ? <Video size={16}/> : <VideoOff size={16}/>} {cameraMuted ? reliability.cameraOn : reliability.cameraOff}</Button> : null}
          {/* A call that could not connect says which networks it can run on. */}
          {status === 'failed' && (
            <div className="w-full space-y-1 rounded-lg border border-border bg-muted/40 px-2 py-2 text-left">
              <p className="text-[11px] font-semibold text-muted-foreground">{network.public}</p>
              <p className="text-[11px] font-bold">{network.try}</p>
              {mediaEnded && <p className="text-xs">{reliability.interrupted}</p>}
              <Button variant="outline" onClick={retryCall}><RefreshCw size={16}/>{reliability.retry}</Button>
            </div>
          )}
          <CallAudioControls compact route={route} onRoute={setRoute} enhanced={enhanced} onEnhanced={setEnhanced} />
          {captions.length > 0 && (
            <ul aria-live="polite" className="w-full space-y-1 text-left">
              {captions.map((c, i) => (
                <li key={i} className={`rounded-lg border px-2 py-1 text-xs ${c.who === 'them' ? 'border-primary bg-card font-bold' : 'border-border text-muted-foreground'}`}>{c.text}</li>
              ))}
            </ul>
          )}
        </>}

        {permission && !capturing && (stage === 'ringing' || stage === 'calling') && <MicrophonePermissionNotice locale={pageLocale} twoPhones onContinue={()=>{setPermission(false);if(videoEnabled)setCameraPermission(true);else void answer();}} onCancel={()=>setPermission(false)}/>}
        {cameraPermission && (stage === 'ringing' || stage === 'calling') && <CameraPermissionNotice locale={pageLocale} onContinue={()=>{setCameraPermission(false);void answer();}} onCancel={()=>setCameraPermission(false)}/>}
        {stage === 'ended' && <>
          <div className="w-full pr-10 text-left">
            <h2 className="text-lg font-black">{c.ended}</h2>
            <p className="text-sm tabular-nums">{endedTime}</p>
          </div>
          {paywallAt !== null ? (() => { const pw = paywallCopy[pageLocale] ?? paywallCopy['en']; if (!pw) return null; return <>
            <AccessNotice><p data-free-paywall className="w-full text-sm font-black">{pw.title}</p>
            <p className="w-full text-xs">{pw.body}</p>
            <p className="w-full text-xs font-bold">{pw.resets} {new Intl.DateTimeFormat(pageLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(paywallAt)}</p></AccessNotice>
            <Button className="min-h-11 w-full text-xs" onClick={() => { setPaywallAt(null); setStage('closed'); window.dispatchEvent(new CustomEvent('ml-open-pricing', { detail: { packageId: 'single' } })); }}>{c.buy.replace('{price}', regionalSoloPrice)}</Button>
            <Button variant="ghost" className="w-full" onClick={() => { setPaywallAt(null); dismiss(); }}>{c.later}</Button>
          </>; })() : endedSeconds >= UPSELL_AFTER_SECONDS ? <>
            <p className="w-full text-xs font-bold">{c.offer.replace('{price}', regionalSoloPrice)}</p>
            <Button className="min-h-11 w-full text-xs" onClick={() => { setStage('closed'); window.location.hash = 'solo-pack'; }}>{c.buy.replace('{price}', regionalSoloPrice)}</Button>
            <Button variant="ghost" className="w-full" onClick={dismiss}>{c.later}</Button>
          </> : (
            <Button className="min-h-11 w-full" onClick={dismiss}>{c.close}</Button>
          )}
        </>}
      </div>
    </div>,
    document.body,
  );
}
