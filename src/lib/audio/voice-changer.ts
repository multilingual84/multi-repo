import type { UILocale } from '@/lib/ui-copy';
import { setVoiceMatch } from '@/lib/voice-match';

// Free voice changer: shapes the device translation voice deeper or higher, on this
// phone only. It is not voice copying or identity matching. The choice is saved on
// this device; no audio, text or pitch data leaves the phone for this feature.
// Default is Natural (scale 1.0), so the engine is active from the first use.

export const VOICE_CHANGER_PROFILES = [
  { id: 'deeper', scale: 0.75 },
  { id: 'natural', scale: 1 },
  { id: 'higher', scale: 1.3 },
] as const;

// Real Kokoro speaker identities, plus explicitly labeled tonal variations.
// There are 28 underlying speakers, not 60 independent speaker identities.
export const PRO_VOICE_PROFILES = [
  { id: 'f-ava', name: 'Heart', gender: 'f', voice: 'af_heart', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-olivia', name: 'Alloy', gender: 'f', voice: 'af_alloy', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-emma', name: 'Aoede', gender: 'f', voice: 'af_aoede', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-sophia', name: 'Bella', gender: 'f', voice: 'af_bella', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-mia', name: 'Jessica', gender: 'f', voice: 'af_jessica', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-grace', name: 'Kore', gender: 'f', voice: 'af_kore', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-chloe', name: 'Nicole', gender: 'f', voice: 'af_nicole', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-lily', name: 'Nova', gender: 'f', voice: 'af_nova', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-zoe', name: 'River', gender: 'f', voice: 'af_river', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-nora', name: 'Sarah', gender: 'f', voice: 'af_sarah', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-hannah', name: 'Sky', gender: 'f', voice: 'af_sky', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-leah', name: 'Emma', gender: 'f', voice: 'bf_emma', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-ruby', name: 'Isabella', gender: 'f', voice: 'bf_isabella', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-claire', name: 'Alice', gender: 'f', voice: 'bf_alice', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-elena', name: 'Lily', gender: 'f', voice: 'bf_lily', tone: 'natural', scale: 1, rate: 1 },
  { id: 'f-maya', name: 'Heart', gender: 'f', voice: 'af_heart', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-isla', name: 'Alloy', gender: 'f', voice: 'af_alloy', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-aria', name: 'Aoede', gender: 'f', voice: 'af_aoede', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-stella', name: 'Bella', gender: 'f', voice: 'af_bella', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-hazel', name: 'Jessica', gender: 'f', voice: 'af_jessica', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-naomi', name: 'Kore', gender: 'f', voice: 'af_kore', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-vera', name: 'Nicole', gender: 'f', voice: 'af_nicole', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-ivy', name: 'Nova', gender: 'f', voice: 'af_nova', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-jade', name: 'River', gender: 'f', voice: 'af_river', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-alice', name: 'Sarah', gender: 'f', voice: 'af_sarah', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-laura', name: 'Sky', gender: 'f', voice: 'af_sky', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-diana', name: 'Emma', gender: 'f', voice: 'bf_emma', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-rosa', name: 'Isabella', gender: 'f', voice: 'bf_isabella', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-anna', name: 'Alice', gender: 'f', voice: 'bf_alice', tone: 'warm', scale: 1, rate: 1 },
  { id: 'f-eva', name: 'Lily', gender: 'f', voice: 'bf_lily', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-james', name: 'Adam', gender: 'm', voice: 'am_adam', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-liam', name: 'Echo', gender: 'm', voice: 'am_echo', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-noah', name: 'Eric', gender: 'm', voice: 'am_eric', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-ethan', name: 'Fenrir', gender: 'm', voice: 'am_fenrir', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-lucas', name: 'Liam', gender: 'm', voice: 'am_liam', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-mason', name: 'Michael', gender: 'm', voice: 'am_michael', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-owen', name: 'Onyx', gender: 'm', voice: 'am_onyx', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-henry', name: 'Puck', gender: 'm', voice: 'am_puck', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-leo', name: 'Santa', gender: 'm', voice: 'am_santa', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-jack', name: 'George', gender: 'm', voice: 'bm_george', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-daniel', name: 'Lewis', gender: 'm', voice: 'bm_lewis', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-adam', name: 'Daniel', gender: 'm', voice: 'bm_daniel', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-ryan', name: 'Fable', gender: 'm', voice: 'bm_fable', tone: 'natural', scale: 1, rate: 1 },
  { id: 'm-caleb', name: 'Adam', gender: 'm', voice: 'am_adam', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-isaac', name: 'Echo', gender: 'm', voice: 'am_echo', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-luke', name: 'Eric', gender: 'm', voice: 'am_eric', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-gabriel', name: 'Fenrir', gender: 'm', voice: 'am_fenrir', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-david', name: 'Liam', gender: 'm', voice: 'am_liam', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-samuel', name: 'Michael', gender: 'm', voice: 'am_michael', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-victor', name: 'Onyx', gender: 'm', voice: 'am_onyx', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-marcus', name: 'Puck', gender: 'm', voice: 'am_puck', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-oscar', name: 'Santa', gender: 'm', voice: 'am_santa', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-felix', name: 'George', gender: 'm', voice: 'bm_george', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-hugo', name: 'Lewis', gender: 'm', voice: 'bm_lewis', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-arthur', name: 'Daniel', gender: 'm', voice: 'bm_daniel', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-simon', name: 'Fable', gender: 'm', voice: 'bm_fable', tone: 'warm', scale: 1, rate: 1 },
  { id: 'm-peter', name: 'Adam', gender: 'm', voice: 'am_adam', tone: 'bright', scale: 1, rate: 1 },
  { id: 'm-paul', name: 'Echo', gender: 'm', voice: 'am_echo', tone: 'bright', scale: 1, rate: 1 },
  { id: 'm-thomas', name: 'Eric', gender: 'm', voice: 'am_eric', tone: 'bright', scale: 1, rate: 1 },
  { id: 'm-martin', name: 'Fenrir', gender: 'm', voice: 'am_fenrir', tone: 'bright', scale: 1, rate: 1 },
] as const;
export type ProVoiceProfile = (typeof PRO_VOICE_PROFILES)[number]['id'];
export type VoiceChangerProfile = (typeof VOICE_CHANGER_PROFILES)[number]['id'] | ProVoiceProfile;

const KEY = 'ml_voice_changer';

export function voiceChangerProfile(): VoiceChangerProfile {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === 'deeper' || raw === 'higher') return raw;
    const fun = PRO_VOICE_PROFILES.find(p => p.id === raw);
    if (fun) return fun.id;
  } catch { /* private mode */ }
  return 'natural';
}

export function setVoiceChangerProfile(id: VoiceChangerProfile) {
  setVoiceMatch(false);
  try { localStorage.setItem(KEY, id); } catch { /* private mode */ }
  window.dispatchEvent(new Event('ml-voice-changer'));
}

// Matching uses the lightweight natural device voice, not a professional model.
export function enableMatchedVoice() {
  setVoiceChangerProfile('natural');
  setVoiceMatch(true);
}

// Pitch scale applied to translated speech, bounded to the 0.6–1.8 band the
// playback clamp already enforces.
export function voiceChangerScale(): number {
  const id = voiceChangerProfile();
  return [...VOICE_CHANGER_PROFILES, ...PRO_VOICE_PROFILES].find(p => p.id === id)?.scale ?? 1;
}

// Speed multiplier for professional presets (1 for the everyday shapes).
export function voiceChangerRateScale(): number {
  const id = voiceChangerProfile();
  return PRO_VOICE_PROFILES.find(p => p.id === id)?.rate ?? 1;
}

// Professional choices use real neural speaker identities, not phone-pitch aliases.
export function voiceChangerIsPreset(): boolean {
  const id = voiceChangerProfile();
  return PRO_VOICE_PROFILES.some(p => p.id === id);
}

export function selectedProfessionalVoice() {
  const id = voiceChangerProfile();
  return PRO_VOICE_PROFILES.find(p => p.id === id);
}

export type VoiceTone = 'natural' | 'warm' | 'bright';
export const professionalDetailCopy: Record<UILocale, { exit: string; loading: string; error: string; note: string; natural: string; warm: string; bright: string }> = {
  en: { exit: 'Exit', loading: 'Preparing voice…', error: 'This voice could not play. Tap to retry.', note: '28 distinct English speakers with 60 voice styles. Other languages use available phone voices.', natural: 'Original', warm: 'Warm', bright: 'Bright' },
  es: { exit: 'Salir', loading: 'Preparando voz…', error: 'No se pudo reproducir esta voz. Toca para reintentar.', note: '28 voces inglesas distintas con 60 estilos. Otros idiomas usan las voces disponibles del teléfono.', natural: 'Original', warm: 'Cálida', bright: 'Clara' },
  tl: { exit: 'Lumabas', loading: 'Inihahanda ang boses…', error: 'Hindi tumunog ang boses. Pindutin upang subukan muli.', note: '28 magkakaibang boses sa Ingles na may 60 estilo. Ibang wika ay gumagamit ng boses ng telepono.', natural: 'Orihinal', warm: 'Mainit', bright: 'Maliwanag' },
  zh: { exit: '退出', loading: '正在准备声音…', error: '无法播放此声音，请点击重试。', note: '28种不同的英语人声，提供60种声音风格。其他语言使用手机可用的声音。', natural: '原声', warm: '温暖', bright: '明亮' },
  de: { exit: 'Schließen', loading: 'Stimme wird vorbereitet…', error: 'Diese Stimme konnte nicht abgespielt werden. Erneut versuchen.', note: '28 unterschiedliche englische Stimmen mit 60 Klangstilen. Andere Sprachen nutzen verfügbare Telefonstimmen.', natural: 'Original', warm: 'Warm', bright: 'Hell' },
  ja: { exit: '閉じる', loading: '音声を準備中…', error: '音声を再生できませんでした。タップして再試行。', note: '28種類の異なる英語音声と60種類のスタイル。他の言語では端末の音声を使用します。', natural: '原音', warm: '温かい', bright: '明るい' },
};

export const proVoiceCopy: Record<UILocale, { label: string; female: string; male: string; hear: string }> = {
  en: { label: 'Professional voices · 60', female: 'Female', male: 'Male', hear: 'Hear' },
  es: { label: 'Voces profesionales · 60', female: 'Mujer', male: 'Hombre', hear: 'Escuchar' },
  tl: { label: 'Propesyonal na boses · 60', female: 'Babae', male: 'Lalaki', hear: 'Pakinggan' },
  zh: { label: '专业声音 · 60', female: '女声', male: '男声', hear: '试听' },
  de: { label: 'Professionelle Stimmen · 60', female: 'Weiblich', male: 'Männlich', hear: 'Anhören' },
  ja: { label: 'プロの声 · 60', female: '女性', male: '男性', hear: '試聴' },
};

// Session cleanup: leaving or closing the tab stops any queued speech and drops
// transient playback state. Saved preferences stay; no audio is kept.
let cleanupInstalled = false;
export function installVoiceChangerCleanup() {
  if (cleanupInstalled || typeof window === 'undefined') return;
  cleanupInstalled = true;
  const release = () => {
    try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch { /* ignore */ }
  };
  window.addEventListener('pagehide', release);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') release(); });
}
if (typeof window !== 'undefined') installVoiceChangerCleanup();

export const voiceChangerCopy: Record<UILocale, { label: string; note: string; deeper: string; natural: string; higher: string; sample: string; sampleText: string }> = {
  en: { label: 'Free voice changer', note: 'Shapes the translation voice on this phone. It does not copy anyone’s voice.', deeper: 'Deeper', natural: 'Natural', higher: 'Higher', sample: 'Hear a sample', sampleText: 'Hello! This is how your translation will sound.' },
  es: { label: 'Cambiador de voz gratis', note: 'Cambia el tono de la voz de la traducción en este teléfono. No copia la voz de nadie.', deeper: 'Más grave', natural: 'Natural', higher: 'Más aguda', sample: 'Escuchar muestra', sampleText: '¡Hola! Así sonará tu traducción.' },
  tl: { label: 'Libreng voice changer', note: 'Binabago ang tono ng boses ng salin sa teleponong ito. Hindi nito kinokopya ang boses ng kahit sino.', deeper: 'Mas mababa', natural: 'Natural', higher: 'Mas mataas', sample: 'Pakinggan', sampleText: 'Kumusta! Ganito ang tunog ng salin mo.' },
  zh: { label: '免费变声器', note: '在本机改变翻译声音的音调，不会复制任何人的声音。', deeper: '更低沉', natural: '自然', higher: '更清亮', sample: '试听', sampleText: '您好！这就是您翻译的声音效果。' },
  de: { label: 'Kostenloser Stimmenwechsler', note: 'Ändert den Klang der Übersetzungsstimme auf diesem Telefon. Sie kopiert niemandes Stimme.', deeper: 'Tiefer', natural: 'Natürlich', higher: 'Höher', sample: 'Probe anhören', sampleText: 'Hallo! So klingt deine Übersetzung.' },
  ja: { label: '無料ボイスチェンジャー', note: 'この端末で翻訳音声のトーンを変えます。誰の声もコピーしません。', deeper: '低め', natural: '自然', higher: '高め', sample: 'サンプルを聞く', sampleText: 'こんにちは！翻訳はこのように聞こえます。' },
};
