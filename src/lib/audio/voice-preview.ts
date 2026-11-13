import { noteBufferingStart, noteBufferingEnd } from '../buffering-veil';
import type { ProVoiceProfile } from './voice-changer';
import { applyPreferredSink } from './audio-output';


const assets = import.meta.glob<{ url: string }>('../../assets/voice-previews/*.asset.json', { eager: true, import: 'default' });

export function voicePreviewUrl(id: ProVoiceProfile): string | undefined {
  return assets[`../../assets/voice-previews/${id}.mp3.asset.json`]?.url;
}

let stopCurrent: (() => void) | null = null;
export function stopVoicePreview() {
  stopCurrent?.();
}

// Fixed, real Kokoro speaker clips: no model download, synthesis, or private text.
// play() is invoked synchronously inside the sample button's gesture.
export function playVoicePreview(id: ProVoiceProfile, rate: number): Promise<boolean> {
  stopVoicePreview();
  const url = voicePreviewUrl(id);
  if (!url || typeof Audio === 'undefined') return Promise.resolve(false);
  noteBufferingStart(true);
  return new Promise(resolve => {
    const audio = new Audio(url);
    applyPreferredSink(audio);

    audio.playbackRate = Math.max(0.5, Math.min(2, Number.isFinite(rate) ? rate : 0.8));
    audio.preservesPitch = true;
    let finished = false;
    let loading = true;
    let timer: ReturnType<typeof setTimeout>;
    const ready = () => {
      if (!loading) return;
      loading = false;
      noteBufferingEnd();
    };
    const finish = (played: boolean) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      ready();
      audio.onplaying = audio.onended = audio.onerror = null;
      audio.pause();
      audio.removeAttribute('src');
      if (stopCurrent === cancel) stopCurrent = null;
      resolve(played);
    };
    const cancel = () => finish(false);
    stopCurrent = cancel;
    timer = setTimeout(() => finish(false), 8000);
    audio.onplaying = () => {
      ready();
      clearTimeout(timer);
      timer = setTimeout(() => finish(false), 15000);
    };
    audio.onended = () => finish(true);
    audio.onerror = () => finish(false);
    try { void audio.play().catch(() => finish(false)); }
    catch { finish(false); }
  });
}

if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', stopVoicePreview);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') stopVoicePreview();
  });
}