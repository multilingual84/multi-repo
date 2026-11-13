import type { WalletIdentity } from './schema';

/** Tab-scoped record of an unlocked wallet; cleared when the tab closes or the wallet locks. */
export const WALLET_SESSION_KEY = 'ml-wallet-session-identity';

export function readSessionIdentity(): WalletIdentity | null {
  try { const raw = sessionStorage.getItem(WALLET_SESSION_KEY); return raw ? JSON.parse(raw) as WalletIdentity : null; } catch { return null; }
}
export function saveSessionIdentity(identity: WalletIdentity) {
  try { sessionStorage.setItem(WALLET_SESSION_KEY, JSON.stringify(identity)); } catch { /* storage blocked */ }
}
export function clearSessionIdentity() {
  try { sessionStorage.removeItem(WALLET_SESSION_KEY); } catch { /* storage blocked */ }
}
/** Signed in only when the server session is verified AND this tab unlocked the wallet. */
export function isWalletSignedIn(serverVerified: boolean): boolean {
  return serverVerified && readSessionIdentity() !== null;
}
