// Normalized display level from actual time-domain microphone samples.
export function microphoneLevel(samples: Float32Array): number {
  if (!samples.length) return 0;
  let sum = 0;
  for (const value of samples) sum += value * value;
  return Math.min(1, Math.sqrt(sum / samples.length) * 5);
}