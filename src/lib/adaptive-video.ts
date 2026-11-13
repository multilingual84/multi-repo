// Live video adaptation: steps the outgoing video down on a weak phone/signal
// and back up when it recovers. Audio senders are never touched.
export type VideoStep = { maxBitrate: number; scale: number; fps: number };
export const VIDEO_STEPS: VideoStep[] = [
  { maxBitrate: 120_000, scale: 4, fps: 10 },
  { maxBitrate: 300_000, scale: 2, fps: 15 },
  { maxBitrate: 700_000, scale: 1.5, fps: 24 },
  { maxBitrate: 1_500_000, scale: 1, fps: 30 },
];

/** Pure decision: poor link → step down, healthy link → step up slowly. */
export function nextVideoStep(current: number, loss: number, rttMs: number, cpuLimited: boolean): number {
  if (loss > 0.08 || rttMs > 600 || cpuLimited) return Math.max(0, current - 1);
  if (loss < 0.02 && rttMs < 250) return Math.min(VIDEO_STEPS.length - 1, current + 1);
  return current;
}

export function startAdaptiveVideo(pc: RTCPeerConnection, startStep = 2): () => void {
  let step = startStep, prevLost = 0, prevSent = 0, stopped = false;
  const apply = async () => {
    const s = VIDEO_STEPS[step]; if (!s) return;
    for (const sender of pc.getSenders()) {
      if (sender.track?.kind !== 'video') continue;
      const p = sender.getParameters();
      if (!p.encodings?.length) p.encodings = [{}];
      const e = p.encodings[0]!;
      e.maxBitrate = s.maxBitrate; e.scaleResolutionDownBy = s.scale; e.maxFramerate = s.fps;
      try { await sender.setParameters(p); } catch { /* unsupported browser */ }
    }
  };
  const tick = async () => {
    if (stopped || pc.connectionState === 'closed') return;
    try {
      const stats = await pc.getStats();
      let lost = 0, sent = 0, rtt = 0, cpu = false;
      stats.forEach((r: any) => {
        if (r.type === 'remote-inbound-rtp' && r.kind === 'video') { lost = r.packetsLost ?? 0; rtt = (r.roundTripTime ?? 0) * 1000; }
        if (r.type === 'outbound-rtp' && r.kind === 'video') { sent = r.packetsSent ?? 0; cpu = r.qualityLimitationReason === 'cpu'; }
      });
      const dSent = sent - prevSent, dLost = lost - prevLost;
      prevSent = sent; prevLost = lost;
      if (dSent <= 0) return;
      const next = nextVideoStep(step, dLost / (dSent + Math.max(0, dLost)), rtt, cpu);
      if (next !== step) { step = next; await apply(); }
    } catch { /* stats unavailable */ }
  };
  void apply();
  const id = setInterval(() => { void tick(); }, 3000);
  const conn = (navigator as any).connection;
  const onNet = () => { const t = conn?.effectiveType; if (t === '2g' || t === 'slow-2g') { step = 0; void apply(); } };
  conn?.addEventListener?.('change', onNet);
  return () => { stopped = true; clearInterval(id); conn?.removeEventListener?.('change', onNet); };
}
