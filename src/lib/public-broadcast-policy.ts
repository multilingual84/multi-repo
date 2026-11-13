export const BROADCAST_LISTENERS = 5;
export const BROADCAST_SESSION_MS = 30 * 60 * 1000;
export const BROADCAST_FREE_MS = 7 * 24 * 60 * 60 * 1000;
export function broadcastAccessEnd(created: string, paid: boolean, renews: string | null, now: number) {
 const end = paid && renews ? Date.parse(renews) : Date.parse(created) + BROADCAST_FREE_MS;
 return Number.isFinite(end) && end > now ? Math.min(end, now + BROADCAST_SESSION_MS) : null;
}
export function broadcastLanguages(values: string[]) { return [...new Set(values.filter(x=>/^[a-z]{2,3}(?:-[a-zA-Z]{2,8})?$/.test(x)))].slice(0,5); }
export function broadcastLink(origin: string, id: string) { return new URL(`/listen/${encodeURIComponent(id)}`,origin).href; }
