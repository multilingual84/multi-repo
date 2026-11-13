// Browser-safe policy; transient interruptions do not immediately end a call.
export const CALL_RECOVERY_MS = 15_000;
export const CALL_CONNECT_MS = 30_000;
export type CaptureFailure = 'denied' | 'unavailable' | 'busy' | 'generic';
export function captureFailure(error: unknown): CaptureFailure {
  const name = typeof error === 'object' && error !== null && 'name' in error ? error.name : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'unavailable';
  if (name === 'NotReadableError' || name === 'AbortError') return 'busy';
  return 'generic';
}