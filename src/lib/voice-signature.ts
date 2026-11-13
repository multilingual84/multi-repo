// Tiny session pitch profile, not a biometric identifier or a speaker model.
// Separate conversation directions prevent mixing the two speakers' pitch.
export class SessionVoiceSignature {
  private pitches = new Map<string, number[]>();
  observe(pitch: number, direction: string): number {
    if (!Number.isFinite(pitch) || pitch < 0.6 || pitch > 1.8) return 1;
    const history = this.pitches.get(direction) ?? [];
    if (history.length === 5) history.shift();
    history.push(pitch);
    this.pitches.set(direction, history);
    // Only two directions are needed for a two-person conversation.
    if (this.pitches.size > 2) {
      const oldest = this.pitches.keys().next().value;
      if (oldest !== undefined) this.pitches.delete(oldest);
    }
    const sorted = [...history].sort((a, b) => a - b);
    const baseline = sorted[Math.floor(sorted.length / 2)] ?? pitch;
    return Math.max(0.6, Math.min(1.8, baseline * 0.7 + pitch * 0.3));
  }
  reset() {
    for (const values of this.pitches.values()) values.fill(0);
    this.pitches.clear();
  }
}