import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { meetingRoomCopy } from '@/lib/meeting-room-copy';
import { CALLER_SLOTS, meetingInviteLink, sampleSeatCodes } from '@/lib/meeting-room';

describe('board meeting room', () => {
  it('is mounted as its own tab', () => {
    const source = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');
    expect(source).toContain("'meetings'");
    expect(source).toContain('data-meetings-tab');
    expect(source).toContain("<MeetingRoomPreview locale={globalLocale} />");
  });

  it('has a video/audio toggle, frosted add-a-caller slots, host controls, and seat codes', () => {
    const source = readFileSync('src/components/MeetingRoomPreview.tsx', 'utf8');
    for (const marker of ['data-meeting-room', 'data-meeting-video', 'data-meeting-audio', 'data-meeting-tile', 'data-meeting-seats', 'data-meeting-add-caller', 'backdrop-blur']) {
      expect(source).toContain(marker);
    }
    expect(source).not.toContain('sampleParticipants');
  });

  it('starts with empty caller slots the host fills in — no invented guests', () => {
    expect(CALLER_SLOTS).toBe(4);
    const lib = readFileSync('src/lib/meeting-room.ts', 'utf8');
    expect(lib).not.toContain('sampleParticipants');
    for (const locale of ['en', 'es', 'zh', 'de', 'tl', 'ja'] as const) {
      expect(meetingRoomCopy[locale].addCaller.length, `${locale}.addCaller`).toBeGreaterThan(0);
      expect(meetingRoomCopy[locale].callerName.length, `${locale}.callerName`).toBeGreaterThan(0);
    }
  });

  it('labels every control in all six native locales', () => {
    for (const locale of ['en', 'es', 'zh', 'de', 'tl', 'ja'] as const) {
      const c = meetingRoomCopy[locale];
      for (const key of ['tab', 'title', 'video', 'audio', 'invite', 'end', 'mute', 'unmute', 'listening', 'seatsTitle', 'seatsBody', 'copyCode', 'you', 'previewNote'] as const) {
        expect(c[key].length, `${locale}.${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('seat codes are deterministic samples and invites stay same-origin', () => {
    expect(sampleSeatCodes(4)).toEqual(['ML-SEAT-001', 'ML-SEAT-002', 'ML-SEAT-003', 'ML-SEAT-004']);
    expect(meetingInviteLink('https://multi-lingual.tech', 'abc123')).toBe('https://multi-lingual.tech/#meeting-abc123');
  });

  it('shows an honest multi-person capacity gate in all six native locales', () => {
    const source = readFileSync('src/components/MeetingRoomPreview.tsx', 'utf8');
    expect(source).toContain('data-meeting-capacity-gate');
    for (const locale of ['en', 'es', 'zh', 'de', 'tl', 'ja'] as const) {
      const c = meetingRoomCopy[locale];
      expect(c.capacityGateTitle.length, `${locale}.capacityGateTitle`).toBeGreaterThan(0);
      expect(c.capacityGateBody.length, `${locale}.capacityGateBody`).toBeGreaterThan(0);
    }
    expect(meetingRoomCopy.en.capacityGateBody).toContain('premium');
  });
});
