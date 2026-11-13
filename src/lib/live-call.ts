import { startAdaptiveVideo } from './adaptive-video';
// Browser-only: connects two phones that opened the same shared link, then
// interprets each spoken sentence for the other phone. No recordings are kept.
import { supabase } from '@/integrations/supabase/client';
import { createPeerConnection } from '@/lib/webrtc';
import { shouldOffer, needsTranslation } from '@/lib/call-room';
import { interpretSpeechFn } from '@/lib/interpret.functions';
import { claraSpeak } from '@/lib/clara-voice';
import { CALL_CONNECT_MS, CALL_RECOVERY_MS } from '@/lib/call-reliability';
import { encodeActiveAudio } from '@/lib/audio/transient-audio';
import { isHdSpeaking, stopHdVoice } from '@/lib/audio/hd-voice';
import { applyPreferredSink } from '@/lib/audio/audio-output';


export type CallStatus = 'waiting' | 'connecting' | 'reconnecting' | 'connected' | 'failed' | 'ended';
export type Caption = { who: 'me' | 'them'; text: string };

type Events = { onStatus: (s: CallStatus) => void; onCaption: (c: Caption) => void; onRemoteStream?: (stream: MediaStream) => void; onAudioBlocked?: (blocked: boolean) => void; onMediaEnded?: () => void };

export class LiveCall {
  private id = crypto.randomUUID();
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private channel: ReturnType<typeof supabase.channel> | null = null;
  private peerLang = '';
  private audioEl = new Audio();
  private sinkListener = () => { if (!this.closed) applyPreferredSink(this.audioEl); };

  private ctx: AudioContext | null = null;
  private raf = 0;
  private recorder: MediaRecorder | null = null;
  private samples: Float32Array | null = null;
  private chunks: Blob[] = [];
  private closed = false;
  private offered = false;
  private remoteId = '';
  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;
  private connectTimer: ReturnType<typeof setTimeout> | null = null;
  private pendingIce: { from: string; candidate: RTCIceCandidateInit }[] = [];
  private remoteReady = false;
  private offerer = false;
  private negotiating = false;
  private signalQueue: Promise<void> = Promise.resolve();
  private premiumOutput: ((text:string)=>Promise<void>) | null = null;
  setPremiumOutput(output:((text:string)=>Promise<void>)|null){this.premiumOutput=output;this.audioEl.muted=Boolean(output);if(output&&typeof speechSynthesis!=='undefined')speechSynthesis.cancel();}

  constructor(private room: string, private stream: MediaStream, private lang: string, private ev: Events) {
    this.audioEl.autoplay = true;
    // Capture is consented before construction; never leak original packets,
    // including before the peer's language handshake arrives.
    this.audioEl.volume = 0;
    (this.audioEl as HTMLAudioElement & { playsInline?: boolean }).playsInline = true;
    applyPreferredSink(this.audioEl);
    if (typeof window !== 'undefined') window.addEventListener('ml-audio-sink', this.sinkListener);

    this.stream.getTracks().forEach(track => { track.onended = () => { if (!this.closed) { this.ev.onMediaEnded?.(); this.fail(); } }; });
  }

  async resumeAudio() {
    if (this.closed) return;
    try { await this.audioEl.play(); await this.ctx?.resume(); if (!this.closed) this.ev.onAudioBlocked?.(false); }
    catch { if (!this.closed) this.ev.onAudioBlocked?.(true); }
  }

  private clearRecovery() {
    if (this.recoveryTimer) clearTimeout(this.recoveryTimer);
    this.recoveryTimer = null;
  }

  private recover() {
    if (this.closed || this.recoveryTimer) return;
    this.ev.onStatus('reconnecting');
    this.recoveryTimer = setTimeout(() => this.fail(), CALL_RECOVERY_MS);
    if (this.offerer && this.pc && !this.negotiating) void this.makeOffer(true).catch(() => this.fail());
  }

  private fail() {
    if (this.closed) return;
    this.hangUp(false);
    this.ev.onStatus('failed');
  }

  start() {
    if (this.closed || this.channel) return;
    this.ev.onStatus('waiting');
    const ch = supabase.channel(`ml-call-${this.room}`, { config: { presence: { key: this.id }, broadcast: { self: false } } });
    this.channel = ch;
    ch.on('presence', { event: 'sync' }, () => {
      if (this.closed) return;
      const ids = Object.keys(ch.presenceState());
      if (!this.offered && shouldOffer(this.id, ids)) {
        this.remoteId = ids.filter(id => id !== this.id).sort()[0] ?? '';
        this.offered = true; this.offerer = true; void this.makeOffer().catch(() => this.fail());
      }
    });
    ch.on('presence', { event: 'leave' }, ({ key }) => { if (key === this.remoteId) this.recover(); });
    ch.on('broadcast', { event: 'signal' }, ({ payload }) => {
      this.signalQueue = this.signalQueue.then(() => this.onSignal(payload)).catch(() => this.fail());
    });
    ch.subscribe(status => {
      if (this.closed) return;
      if (status === 'SUBSCRIBED') {
        void ch.track({ at: Date.now() });
        if (this.pc?.connectionState === 'connected') { this.clearRecovery(); this.ev.onStatus('connected'); }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') this.recover();
    });
  }

  private send(payload: Record<string, unknown>) {
    void this.channel?.send({ type: 'broadcast', event: 'signal', payload: { ...payload, from: this.id, to: this.remoteId || undefined } });
  }

  private stopAdaptive: (() => void) | null = null;
  private setupPc() {
    if (this.pc) return this.pc;
    const pc = createPeerConnection();
    this.pc = pc;
    this.stream.getTracks().forEach(t => pc.addTrack(t, this.stream));
    if (this.stream.getVideoTracks?.().length) this.stopAdaptive = startAdaptiveVideo(pc);
    pc.onicecandidate = e => { if (e.candidate) this.send({ kind: 'ice', candidate: e.candidate.toJSON() }); };
    pc.ontrack = e => {
      const remote = e.streams[0];
      this.audioEl.srcObject = remote ?? null;
      void this.resumeAudio();
      if (remote) this.ev.onRemoteStream?.(remote);
    };
    pc.ondatachannel = e => this.bindDc(e.channel);
    pc.onconnectionstatechange = () => {
      if (this.closed) return;
      if (pc.connectionState === 'connected') {
        this.clearRecovery();
        if (this.connectTimer) clearTimeout(this.connectTimer); this.connectTimer = null;
        this.ev.onStatus('connected');
      }
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') this.recover();
      if (pc.connectionState === 'closed') this.fail();
    };
    this.ev.onStatus('connecting');
    this.connectTimer = setTimeout(() => this.fail(), CALL_CONNECT_MS);
    return pc;
  }

  private async makeOffer(restart = false) {
    if (this.closed || this.negotiating) return;
    const pc = this.setupPc();
    this.negotiating = true;
    try {
      if (!restart) this.bindDc(pc.createDataChannel('ml-interpret'));
      await pc.setLocalDescription(await pc.createOffer(restart ? { iceRestart: true } : undefined));
      if (!this.closed) this.send({ kind: 'offer', sdp: pc.localDescription });
    } finally { this.negotiating = false; }
  }

  private async onSignal(p: { kind: string; from: string; to?: string; sdp?: RTCSessionDescriptionInit; candidate?: RTCIceCandidateInit }) {
    if (!p || typeof p.from !== 'string' || this.closed || p.from === this.id || (p.to && p.to !== this.id)) return;
    if (this.remoteId && this.remoteId !== p.from) return;
    if (p.kind === 'offer' || p.kind === 'answer') this.remoteId = p.from;
    if (p.kind === 'offer' && p.sdp) {
      const pc = this.setupPc();
      this.remoteReady = false;
      await pc.setRemoteDescription(p.sdp);
      if (this.closed) return;
      this.remoteReady = true;
      await this.flushIce();
      await pc.setLocalDescription(await pc.createAnswer());
      if (!this.closed) this.send({ kind: 'answer', sdp: pc.localDescription });
    } else if (p.kind === 'answer' && p.sdp && this.pc) {
      await this.pc.setRemoteDescription(p.sdp);
      if (this.closed) return;
      this.remoteReady = true; await this.flushIce();
    } else if (p.kind === 'ice' && p.candidate) {
      if (!this.pc || !this.remoteReady) {
        if (this.pendingIce.length < 100) this.pendingIce.push({ from: p.from, candidate: p.candidate });
      } else await this.pc.addIceCandidate(p.candidate).catch(() => {});
    } else if (p.kind === 'bye') {
      if (this.remoteId === p.from) this.hangUp();
    }
  }

  private async flushIce() {
    const pending = this.pendingIce.splice(0);
    for (const entry of pending) {
      if (this.closed) return;
      if (entry.from === this.remoteId) await this.pc?.addIceCandidate(entry.candidate).catch(() => {});
    }
  }

  private bindDc(dc: RTCDataChannel) {
    if (this.closed) { dc.close(); return; }
    this.dc = dc;
    dc.onclose = () => { if (!this.closed) this.recover(); };
    dc.onopen = () => { if (this.closed) return; dc.send(JSON.stringify({ type: 'lang', lang: this.lang })); this.listen(); };
    dc.onmessage = e => {
      if (this.closed) return;
      try {
        const m = JSON.parse(String(e.data)) as { type: string; lang?: string; text?: string };
        if (m.type === 'lang' && m.lang) {
          this.peerLang = m.lang;
          this.audioEl.volume = 0;
        }
        if (m.type === 'say' && m.text) {
          this.ev.onCaption({ who: 'them', text: m.text });
          if(this.premiumOutput)void this.premiumOutput(m.text).catch(()=>{if(!this.closed)this.ev.onAudioBlocked?.(true);});
          else void claraSpeak(m.text, this.lang).catch(() => { if (!this.closed) this.ev.onAudioBlocked?.(true); });
        }
      } catch { /* ignore */ }
    };
  }

  /** Voice-activity detection: each spoken sentence is recorded, interpreted, sent. */
  private listen() {
    if (this.closed || this.ctx || typeof MediaRecorder === 'undefined') return;
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx(); this.ctx = ctx;
    void ctx.resume().catch(() => { if (!this.closed) this.ev.onAudioBlocked?.(true); });
    const analyser = ctx.createAnalyser(); analyser.fftSize = 1024;
    ctx.createMediaStreamSource(this.stream).connect(analyser);
    const data = new Float32Array(analyser.fftSize);
    this.samples = data;
    let speaking = false, lastVoice = 0, startedAt = 0;
    const tick = () => {
      if (this.closed) return;
      analyser.getFloatTimeDomainData(data);
      let sum = 0; for (const v of data) sum += v * v;
      const rms = Math.sqrt(sum / data.length), now = performance.now();
      const speechSynthBusy = (typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking) || isHdSpeaking();
      if (rms > 0.02 && !speechSynthBusy) {
        lastVoice = now;
        if (!speaking) { speaking = true; startedAt = now; this.beginRecording(); }
      }
      if (speaking && (now - lastVoice > 200 || now - startedAt > 15000)) {
        speaking = false; this.recorder?.stop();
      }
      this.raf = requestAnimationFrame(tick);
    };
    tick();
  }

  private beginRecording() {
    const audioOnly = new MediaStream(this.stream.getAudioTracks());
    const mime = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/ogg'].find(t => MediaRecorder.isTypeSupported?.(t)) ?? '';
    const rec = new MediaRecorder(audioOnly, mime ? { mimeType: mime, audioBitsPerSecond: 16000 } : { audioBitsPerSecond: 16000 });
    const chunks: Blob[] = []; this.chunks = chunks; const started = performance.now();
    rec.ondataavailable = e => { if (!this.closed && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      if (performance.now() - started >= 400 && !this.closed) {
        void this.interpret(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
      }
      chunks.length = 0;
    };
    rec.start(); this.recorder = rec;
  }

  private async interpret(blob: Blob) {
    const target = this.peerLang || this.lang;
    try {
      const audio = await encodeActiveAudio(blob, () => !this.closed);
      if (audio === null || this.closed) return;
      const r = await interpretSpeechFn({ data: {
        audio, mime: blob.type,
        target, translate: needsTranslation(this.lang, target),
      } });
      if (!r.text || this.closed) return;
      this.ev.onCaption({ who: 'me', text: r.heard });
      if (this.dc?.readyState === 'open') this.dc.send(JSON.stringify({ type: 'say', text: r.text }));
    } catch (e) { console.error('interpret failed', e); }
  }

  hangUp(announce = true) {
    if (this.closed) return;
    this.send({ kind: 'bye' });
    this.closed = true;
    if (typeof window !== 'undefined') window.removeEventListener('ml-audio-sink', this.sinkListener);

    this.clearRecovery();
    if (this.connectTimer) clearTimeout(this.connectTimer); this.connectTimer = null;
    this.pendingIce = [];
    this.stream.getTracks().forEach(t => { t.onended = null; });
    this.stream.getTracks().forEach(t => t.stop());
    cancelAnimationFrame(this.raf);
    this.samples?.fill(0); this.samples = null;
    this.chunks.length = 0;
    this.peerLang = '';
    if (this.recorder) { this.recorder.ondataavailable = null; this.recorder.onstop = null; }
    try { this.recorder?.state === 'recording' && this.recorder.stop(); } catch { /* */ }
    void this.ctx?.close().catch(() => {});
    this.stopAdaptive?.(); this.stopAdaptive = null;
    this.dc?.close(); this.pc?.close();
    this.audioEl.pause();
    this.audioEl.srcObject = null;
    if (this.channel) void supabase.removeChannel(this.channel);
    this.dc = null;
    this.pc = null;
    this.channel = null;
    this.recorder = null;
    this.ctx = null;
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    stopHdVoice();
    if (announce) this.ev.onStatus('ended');
  }
}
