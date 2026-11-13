// Browser-safe zero-signup free-session state. The credential handle is a
// random UUID kept in this device's storage only — no accounts, no signups.

import { activateFreeLifetime, getFreeSessionState, startFreeSession } from './free-session.functions';
import { ensureQrAccess } from './qr-access-browser';

const STORAGE_KEY = 'ml-free-credential-handle';

export type FreeSessionState = {
  userId: string;
  trialExpiresAt: string | null;
  isSubscriptionActive: boolean | null;
  freeLifetimeActivated: boolean | null;
};

export function getCredentialHandle(): string {
  if (typeof window === 'undefined') return '';
  let handle = window.localStorage.getItem(STORAGE_KEY);
  if (!handle) {
    handle = crypto.randomUUID();
    window.localStorage.setItem(STORAGE_KEY, handle);
  }
  return handle;
}

/** Live audio/video stay open while the 7-day trial runs or a package is active;
 *  camera document translation and the mic handshake stay free for life. */
export function isLiveChannelOpen(state: FreeSessionState | null, now: Date = new Date()): boolean {
  if (!state) return true; // not yet registered — first visit is always inside the trial
  if (state.isSubscriptionActive || state.freeLifetimeActivated) return true;
  if (!state.trialExpiresAt) return true;
  return new Date(state.trialExpiresAt).getTime() > now.getTime();
}

export async function ensureFreeSession(channelType: string): Promise<FreeSessionState | null> {
  // Complete atomic QR enrollment before a legacy free-session read can create
  // a conflicting anonymous row on first arrival.
  const handle = (await ensureQrAccess()).id;
  if (!handle) return null;
  const existing = await getFreeSessionState({ data: { credentialHandle: handle } });
  if (existing) return existing;
  const started = await startFreeSession({ data: { credentialHandle: handle, channelType } });
  return {
    userId: started.userId,
    trialExpiresAt: started.trialExpiresAt,
    isSubscriptionActive: started.isSubscriptionActive,
    freeLifetimeActivated: started.freeLifetimeActivated,
  };
}

export async function markFreeLifetimeActivated(): Promise<void> {
  const handle = getCredentialHandle();
  if (!handle) return;
  await activateFreeLifetime({ data: { credentialHandle: handle } });
}
