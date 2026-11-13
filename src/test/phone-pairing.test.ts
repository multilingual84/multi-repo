import { describe, expect, it } from 'vitest';
import { phonePairingLink } from '@/lib/phone-pairing';
import { roomFromHash } from '@/lib/call-room';

describe('QR phone pairing', () => {
  it('pairs both phones into the same same-origin call room, not a paid-access code', () => {
    const url = new URL(phonePairingLink('https://multi-lingual.tech', 'abc123def456'));
    expect(url.origin).toBe('https://multi-lingual.tech');
    expect(url.pathname).toBe('/');
    expect(url.hash).toBe('#meeting-abc123def456');
    expect(roomFromHash(url.hash)).toBe('meeting-abc123def456');
    expect(url.search).toBe('');
  });
  it('rejects invalid pairing identifiers', () => {
    expect(() => phonePairingLink('https://multi-lingual.tech', '../wallet')).toThrow();
  });
});