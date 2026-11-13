import { PitchDetector } from 'pitchy';

// Local, short-lived pitch estimates only; this is not a speaker identity model.
export function speechPitch(frequency: number | null): number {
  if (frequency === null || !Number.isFinite(frequency) || frequency <= 0) return 1;
  return Math.min(1.8, Math.max(0.6, frequency / 180));
}

export class SentencePitch {
  private detector: PitchDetector<Float32Array>;
  private frequencies: number[] = [];
  constructor(length: number) { this.detector = PitchDetector.forFloat32Array(length); }
  sample(data: Float32Array, sampleRate: number) {
    if (!Number.isFinite(sampleRate) || sampleRate <= 0) return;
    const [frequency, clarity] = this.detector.findPitch(data, sampleRate);
    if (clarity >= 0.9 && frequency >= 70 && frequency <= 500) {
      if (this.frequencies.length === 64) this.frequencies.shift();
      this.frequencies.push(frequency);
    }
  }
  finish(): number {
    this.frequencies.sort((a, b) => a - b);
    const middle = Math.floor(this.frequencies.length / 2);
    const frequency = this.frequencies.length >= 3 ? this.frequencies[middle] : undefined;
    this.reset();
    return speechPitch(frequency ?? null);
  }
  reset() { this.frequencies.fill(0); this.frequencies.length = 0; }
}