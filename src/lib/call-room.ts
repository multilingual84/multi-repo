// Pure, browser-safe helpers for pairing two phones that opened the same shared link.

/** Fresh room name for a call started on this device (valid in a #meeting-<id> link). */
export function newRoomId(): string {
  const c = globalThis.crypto;
  if (c?.randomUUID) return c.randomUUID().replace(/-/g, '').slice(0, 12);
  return Math.random().toString(36).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).padEnd(12, '0');
}


/** Room name from a shared hash such as "#meeting-abc123"; null when not a shareable call link. */
export function roomFromHash(hash: string): string | null {
  const clean = decodeURIComponent(hash.replace(/^#/, '')).trim();
  if (!clean) return null;
  const m = clean.match(/^(meeting-|talk-|my-code-|trial-|travel-pass|free-pass|demo-audio=)(.*)$/);
  if (!m) return null;
  const id = ((m[1] ?? '') + (m[2] ?? '')).replace(/[^a-zA-Z0-9_=-]/g, '').slice(0, 80);
  return id || null;
}

/** Exactly one phone starts the connection: the one whose id sorts first. */
export function shouldOffer(selfId: string, presentIds: string[]): boolean {
  const others = presentIds.filter(id => id !== selfId);
  if (others.length === 0) return false;
  return [selfId, ...others].sort()[0] === selfId;
}

/** Translation is only needed when the two phones use different languages. */
export function needsTranslation(from: string, to: string): boolean {
  const base = (l: string) => l.toLowerCase().split(/[-_]/)[0];
  return !!from && !!to && base(from) !== base(to);
}
