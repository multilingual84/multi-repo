import { describe, expect, it } from 'vitest';
import { meetingPreviewId, meetingPreviewLink } from '@/lib/meeting-preview';

describe('Public meeting QR preview', () => {
  it('creates a same-origin standalone meeting link', () => {
    expect(meetingPreviewLink('https://example.com','meeting-123')).toBe('https://example.com/#meeting-meeting-123');
  });
  it('recognizes the meeting room on a new visit', () => {
    expect(meetingPreviewId('#meeting-meeting-123')).toBe('meeting-123');
    expect(meetingPreviewId('#travel-pass')).toBeNull();
    expect(meetingPreviewId('#meeting-')).toBeNull();
  });
});