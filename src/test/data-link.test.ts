import { describe, expect, it } from 'vitest';

import { createLiveVoiceLink, parseDataRecipients } from '@/lib/data-link';
import { isSharedCallLink } from '@/lib/answer-call';
import { roomFromHash } from '@/lib/call-room';

describe('data-link recipients', () => {
  it('reads one recipient per line and drops blanks and repeats', () => {
    expect(parseDataRecipients('a@x.com\n\nb@x.com\na@x.com\n  ')).toEqual(['a@x.com', 'b@x.com']);
  });
});

describe('live voice links', () => {
  it('makes a link that really opens a call room on this site', () => {
    const link = createLiveVoiceLink('https://example.org', 'abc123');
    expect(link).toBe('https://example.org/#meeting-abc123');
    const hash = new URL(link).hash;
    expect(isSharedCallLink(hash)).toBe(true);
    expect(roomFromHash(hash)).toBe('meeting-abc123');
  });

  it('gives every recipient their own room when none is chosen', () => {
    const first = createLiveVoiceLink('https://example.org');
    const second = createLiveVoiceLink('https://example.org');
    expect(first).not.toBe(second);
    expect(roomFromHash(new URL(first).hash)).toBeTruthy();
  });

  it('keeps the recipient address out of the link', () => {
    const link = createLiveVoiceLink('https://example.org', 'room9');
    expect(link).not.toMatch(/x\.com|@/);
  });
});
