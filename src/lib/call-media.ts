export type SignalTier = 'low' | 'medium' | 'high' | 'unknown';
type NetInfo = { effectiveType?: string; downlink?: number; saveData?: boolean };
// Video quality follows the connection; audio stays lightweight regardless.
export function detectSignalTier(net?: NetInfo | null): SignalTier {
  const c = net ?? (typeof navigator !== 'undefined' ? (navigator as unknown as { connection?: NetInfo }).connection : undefined);
  if (!c) return 'unknown';
  if (c.saveData || c.effectiveType === 'slow-2g' || c.effectiveType === '2g') return 'low';
  if (c.effectiveType === '3g' || (typeof c.downlink === 'number' && c.downlink < 1.5)) return 'medium';
  if (typeof c.downlink === 'number' && c.downlink >= 5) return 'high';
  return 'unknown';
}
export function videoConstraintsForSignal(tier: SignalTier): MediaTrackConstraints {
  if (tier === 'low') return { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 12, max: 15 } };
  if (tier === 'medium') return { facingMode: 'user', width: { ideal: 480 }, height: { ideal: 360 }, frameRate: { ideal: 20, max: 24 } };
  if (tier === 'high') return { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } };
  return { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } };
}
export function sharedCallConstraints(audio: MediaTrackConstraints, video: boolean, tier: SignalTier = 'unknown'): MediaStreamConstraints {
  return { audio, video: video ? videoConstraintsForSignal(tier) : false };
}
// Receiving a shared call never depends on the recipient's billing status.
export function canAnswerSharedCall(hasSharedLink: boolean): boolean { return hasSharedLink; }
export const callMediaCopy = {
  en: { video: 'Video call', audio: 'Audio call', camera: 'Allow microphone and camera access for this call only.' },
  es: { video: 'Videollamada', audio: 'Llamada de audio', camera: 'Permite el micrófono y la cámara solo para esta llamada.' },
  zh: { video: '视频通话', audio: '语音通话', camera: '仅为本次通话允许麦克风和摄像头。' },
  de: { video: 'Videoanruf', audio: 'Audioanruf', camera: 'Mikrofon und Kamera nur für diesen Anruf erlauben.' },
  tl: { video: 'Video call', audio: 'Audio call', camera: 'Payagan ang mikropono at camera para sa tawag na ito lamang.' },
  ja: { video: 'ビデオ通話', audio: '音声通話', camera: '今回の通話のみマイクとカメラを許可してください。' },
};