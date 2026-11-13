import { ALL_FLAGS } from '@/lib/flag-catalog';

export interface MeetingParticipant { name: string; lang: string; speaking: boolean; }

// Empty caller slots the host fills in on the meeting screen — no invented guests.
export const CALLER_SLOTS = 4;

// Deterministic sample seat codes for the preview; real codes come from purchased packages.
export function sampleSeatCodes(count = 4): string[] {
  return Array.from({ length: count }, (_, i) => `ML-SEAT-${String(i + 1).padStart(3, '0')}`);
}

// Same-origin invite fragment: opening it lands on the meeting preview, never a live stream.
export function meetingInviteLink(origin: string, roomId: string): string {
  return `${origin}/#meeting-${roomId}`;
}

export function flagFor(lang: string) {
  return ALL_FLAGS.find(f => f.lang === lang);
}
