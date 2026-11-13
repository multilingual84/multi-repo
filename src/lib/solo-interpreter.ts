import { matchedPitch, voiceMatchOn } from '@/lib/voice-match';
import { SessionVoiceSignature } from '@/lib/voice-signature';
// One phone, two people. Product unit is TEXT after capture.
// UI unchanged — this class backs the existing big mic.
import { interpretSpeechFn } from '@/lib/interpret.functions';
import { speakTranslation, getResponsePauseMs } from '@/lib/speech-playback';
import { translateRegisteredText } from '@/lib/realtime-text-pipeline';
import { microphoneLevel } from '@/lib/microphone-level';
import { nextLocalLanguage } from '@/lib/local-language';
import { SentencePitch } from '@/lib/voice-pitch';
import { encodeActiveAudio } from '@/lib/audio/transient-audio';
import { isHdSpeaking, stopHdVoice, primeHdVoice } from '@/lib/audio/hd-voice';

export type SoloLine = { heard: string; text: string; lang?: string; pitch?: number };
export const SENTENCE_PAUSE_MS = 200;

type BrowserRec = { start: () => void; stop: () => void; abort: () => void };

function tryBrowserStt(lang: string, onFinal: (text: string) => void): BrowserRec | null {
  const w = typeof window !== 'undefined' ? (window as unknown as Record<string, unknown>) : null;
  const SR = w && ((w['SpeechRecognition'] as (new () => SpeechRec) | undefined) || (w['webkitSpeechRecognition'] as (new () => SpeechRec) | undefined));
  if (!SR) return null;
  const rec = new SR();
  rec.lang = lang || 'en-US';
  rec.interimResults = false;
  rec.continuous = false;
  rec.onresult = (ev: SpeechRecEvent) => {
    let fin = '';
    for (let i = ev.resultIndex; i < ev.results.length; i++) {
      const row = ev.results[i];
      if (row?.isFinal) fin += row[0]?.transcript ?? '';
    }
    fin = fin.trim();
    if (fin) onFinal(fin);
  };
  return {
    start: () => { try { rec.start(); } catch { /* */ } },
    stop: () => { try { rec.stop(); } catch { /* */ } },
    abort: () => { try { rec.abort(); } catch { /* */ } },
  };
}

type SpeechRec = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((ev: SpeechRecEvent) => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};
type SpeechRecEvent = {
  resultIndex: number;
  results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } };
};

export class SoloInterpreter {
  private stream: MediaStream | null = null;
  private ctx: AudioContext | null = null;
  private recorder: MediaRecorder | null = null;
  private raf = 0;
  private closed = false;
  private starting = false;
  private processing = false;
  private pitch: SentencePitch | null = null;
  private signature = new SessionVoiceSignature();
  private matching = false;
  private samples: Float32Array | null = null;
  private chunks: Blob[] = [];
  private browserRec: BrowserRec | null = null;
  private sttText: string | null = null;
  private interpretGen = 0;

  constructor(
    private mine: string,
    private other: string,
    private onLine: (l: SoloLine) => void,
    private onBusy: (b: boolean) => void,
    private onLevel: (level: number) => void = () => {},
    private automatic = false,
    private onError: () => void = () => {},
    private onPartner: (language: string) => void = () => {},
  ) {}

  setLanguages(mine: string, other: string) { this.mine = mine; this.other = other; }
  setAutomatic(automatic: boolean) { this.automatic = automatic; }
  private output: ((text: string, language: string, pitch: number) => Promise<void>) | null = null;
  private activity: (() => void) | null = null;
  setOutput(output: (text: string, language: string, pitch: number) => Promise<void>, activity: () => void) {
    this.output = output; this.activity = activity;
  }

  async start(audio: boolean | MediaTrackConstraints = true) {
    if (this.closed || this.starting || this.stream) return;
    this.starting = true;
    let stream: MediaStream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio }); }
    finally { this.starting = false; }
    if (this.closed) { stream.getTracks().forEach(t => t.stop()); return; }
    this.stream = stream;
    primeHdVoice();
    this.matching = voiceMatchOn();
    this.pitch = null;
    const ctx = new AudioContext();
    this.ctx = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    this.samples = new Float32Array(analyser.fftSize) as Float32Array<ArrayBuffer>;
    const samples = this.samples;
    if (this.matching) this.pitch = new SentencePitch(analyser.fftSize);
    let speaking = false;
    let last = 0;
    let startAt = 0;
    const tick = () => {
      if (this.closed) return;
      analyser.getFloatTimeDomainData(samples as Float32Array<ArrayBuffer>);
      this.onLevel(microphoneLevel(samples));
      if (this.matching) this.pitch?.sample(samples as unknown as Float32Array<ArrayBuffer>, ctx.sampleRate);
      let sum = 0;
      for (const v of samples) sum += v * v;
      const rms = Math.sqrt(sum / samples.length);
      const now = performance.now();
      const talking = (typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking) || isHdSpeaking();
      if (rms > 0.025 && !this.processing && !talking) {
        last = now;
        if (!speaking) { speaking = true; startAt = now; this.record(); }
      }
      if (speaking && (now - last > getResponsePauseMs() || now - startAt > 12000)) {
        speaking = false;
        if (this.recorder?.state === 'recording') this.recorder.stop();
        this.browserRec?.stop();
      }
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  private record() {
    if (this.closed || !this.stream) return;
    this.sttText = null;
    this.browserRec?.abort();
    this.browserRec = tryBrowserStt(this.mine || 'en', text => { this.sttText = text; });
    this.browserRec?.start();
    const chunks = this.chunks;
    chunks.length = 0;
    const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
      ? 'audio/webm;codecs=opus'
      : MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
    const rec = mime ? new MediaRecorder(this.stream, { mimeType: mime }) : new MediaRecorder(this.stream);
    const t0 = performance.now();
    rec.ondataavailable = e => { if (!this.closed && e.data.size) chunks.push(e.data); };
    rec.onstop = () => {
      const pitch = this.pitch?.finish() ?? 1;
      if (performance.now() - t0 >= 150 && !this.closed) void this.interpret(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }), pitch);
      chunks.length = 0;
    };
    rec.start();
    this.recorder = rec;
  }

  private async deliverText(heard: string, translated: string, lang: string, pitch: number) {
    if (this.closed || !translated) return;
    const voicePitch = voiceMatchOn() ? this.signature.observe(matchedPitch(pitch), lang) : 1;
    this.onLine({ heard, text: translated, lang, pitch: voicePitch });
    this.activity?.();
    if (this.output) await this.output(translated, lang, voicePitch);
    else await speakTranslation(translated, lang, voicePitch);
  }

  private async interpret(blob: Blob, pitch: number) {
    if (this.closed || this.processing) return;
    this.processing = true;
    this.onBusy(true);
    const gen = ++this.interpretGen;
    try {
      const target = this.other || this.mine || 'en';
      const quick = this.sttText?.trim();
      this.sttText = null;
      this.browserRec?.abort();
      this.browserRec = null;

      if (quick) {
        const { text } = await translateRegisteredText(quick, target);
        if (this.closed || gen !== this.interpretGen) return;
        this.onBusy(false);
        await this.deliverText(quick, text, target, pitch);
        return;
      }

      const audio = await encodeActiveAudio(blob, () => !this.closed && gen === this.interpretGen);
      if (audio === null || this.closed || gen !== this.interpretGen) return;
      const r = await interpretSpeechFn({
        data: {
          audio, mime: blob.type, target: this.mine,
          ...(this.other ? { other: this.other } : {}),
          automatic: this.automatic,
        },
      });
      if (!r.text || this.closed || gen !== this.interpretGen) return;
      if (this.automatic && 'source' in r && typeof r.source === 'string') {
        this.other = nextLocalLanguage(this.mine, r.source, this.other, true);
        this.onPartner(this.other);
      }
      const lang = 'lang' in r && r.lang ? String(r.lang) : this.other || this.mine;
      this.onBusy(false);
      await this.deliverText(r.heard || '', r.text, lang, pitch);
    } catch (e) {
      console.error('interpret failed', e);
      if (!this.closed) { this.stop(); this.onError(); }
    } finally {
      this.processing = false;
      if (!this.closed) this.onBusy(false);
    }
  }

  stop() {
    this.closed = true;
    this.interpretGen += 1;
    this.signature.reset();
    this.pitch?.reset(); this.pitch = null;
    this.samples?.fill(0); this.samples = null;
    cancelAnimationFrame(this.raf);
    this.chunks.length = 0;
    this.browserRec?.abort(); this.browserRec = null; this.sttText = null;
    if (this.recorder) { this.recorder.ondataavailable = null; this.recorder.onstop = null; }
    try { if (this.recorder?.state === 'recording') this.recorder.stop(); } catch { /* */ }
    this.stream?.getTracks().forEach(t => t.stop());
    void this.ctx?.close().catch(() => {});
    this.recorder = null; this.stream = null; this.ctx = null;
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
    stopHdVoice();
    this.onBusy(false); this.onLevel(0);
  }
}
