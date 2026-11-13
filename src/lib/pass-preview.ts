import { meetingPreviewLink } from './meeting-preview';

export const PASS_PREVIEW_KEY = 'ml-pass-interface-preview';
export const PASS_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
export const PASS_NOTICE_MS = 24 * 60 * 60 * 1000;
export type PassPreview = { id: string; expiresAt: number };

export function createPassPreview(id: string, now: number): PassPreview {
  return { id, expiresAt: now + PASS_DURATION_MS };
}

export function parsePassPreview(value: string | null): PassPreview | null {
  try {
    const data = JSON.parse(value ?? 'null');
    if (data && typeof data.id === 'string' && /^[a-zA-Z0-9-]{1,80}$/.test(data.id) && typeof data.expiresAt === 'number' && Number.isFinite(data.expiresAt)) return { id: data.id, expiresAt: data.expiresAt };
  } catch { /* Invalid local state is replaced with a fresh preview. */ }
  return null;
}

export function passTimeRemaining(expiresAt: number, now: number) {
  const ms = Math.max(0, expiresAt - now);
  const seconds = Math.ceil(ms / 1000);
  return {
    days: Math.floor(seconds / 86400), hours: Math.floor(seconds % 86400 / 3600),
    minutes: Math.floor(seconds % 3600 / 60), seconds: seconds % 60,
    status: ms === 0 ? 'expired' : ms <= PASS_NOTICE_MS ? 'ending' : 'running',
  } as const;
}

export function passPreviewLink(origin: string, preview: PassPreview) {
  return meetingPreviewLink(origin, preview.id);
}

/** The live pass on this device, or null when none exists or it has expired. */
export function activePassPreview(now = Date.now()): PassPreview | null {
  if (typeof window === 'undefined') return null;
  try {
    const pass = parsePassPreview(window.localStorage.getItem(PASS_PREVIEW_KEY));
    return pass && pass.expiresAt > now ? pass : null;
  } catch { /* Storage may be unavailable. */ }
  return null;
}