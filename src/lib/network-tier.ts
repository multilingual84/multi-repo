export type NetworkTier = 'low' | 'medium' | 'high' | 'unknown';
type NetInfo = { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean };
function readConnection(): NetInfo | null {
  if (typeof navigator === 'undefined') return null;
  const n = navigator as unknown as { connection?: NetInfo; mozConnection?: NetInfo; webkitConnection?: NetInfo };
  return n.connection ?? n.mozConnection ?? n.webkitConnection ?? null;
}
export function detectNetworkTier(net?: NetInfo | null): NetworkTier {
  const c = net ?? readConnection();
  if (!c) return 'unknown';
  if (c.saveData) return 'low';
  const t = (c.effectiveType || '').toLowerCase();
  if (t === 'slow-2g' || t === '2g') return 'low';
  if (t === '3g') return 'medium';
  if (typeof c.downlink === 'number') { if (c.downlink < 0.5) return 'low'; if (c.downlink < 1.5) return 'medium'; if (c.downlink >= 5) return 'high'; }
  if (typeof c.rtt === 'number' && c.rtt > 400) return 'low';
  if (t === '4g') return 'high';
  return 'unknown';
}
export function preferLightStt(tier: NetworkTier = detectNetworkTier()): boolean { return tier === 'low' || tier === 'medium'; }
export function allowKokoroHd(tier: NetworkTier = detectNetworkTier()): boolean { return tier === 'high' || tier === 'unknown'; }
export function adaptivePauseMs(tier: NetworkTier = detectNetworkTier()): number {
  if (tier === 'low') return 350; if (tier === 'medium') return 280; return 200;
}
