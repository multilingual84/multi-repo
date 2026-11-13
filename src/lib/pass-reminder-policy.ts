// Browser-safe validation for the pass-reminder signup shared by the page and the server route.
import { PASS_DURATION_MS } from './pass-preview';

export type ReminderRequest = { passId: string; email: string; expiresAt: number };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASS_ID_RE = /^[a-zA-Z0-9-]{1,80}$/;
// Reminders only make sense for a pass that is still running and not absurdly far out.
const GRACE_MS = 60 * 1000;
const MAX_AHEAD_MS = PASS_DURATION_MS + 24 * 60 * 60 * 1000;

export function validReminderRequest(input: unknown, now = Date.now()): ReminderRequest | null {
  if (!input || typeof input !== 'object') return null;
  const { passId, email, expiresAt } = input as Record<string, unknown>;
  if (typeof passId !== 'string' || !PASS_ID_RE.test(passId)) return null;
  if (typeof email !== 'string' || email.length > 254 || !EMAIL_RE.test(email)) return null;
  if (typeof expiresAt !== 'number' || !Number.isFinite(expiresAt)) return null;
  if (expiresAt <= now + GRACE_MS || expiresAt > now + MAX_AHEAD_MS) return null;
  return { passId, email: email.toLowerCase(), expiresAt };
}

/** A reminder is due once the pass ends within the next 24 hours. */
export function reminderDue(expiresAt: number, now: number): boolean {
  return expiresAt > now && expiresAt - now <= 24 * 60 * 60 * 1000;
}
