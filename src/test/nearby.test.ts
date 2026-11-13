import { describe, it, expect } from 'vitest';
import { validInvite, peersFromPresence, normalizeMeetCode, meetCodeChannel, mergePeers } from '@/lib/nearby';
describe('nearby', () => {
  it('ignores invites for other phones', () => { expect(validInvite({ to: 'b', from: 'a', room: 'meeting-abc123' }, 'me')).toBeNull(); });
  it('accepts invite addressed to me', () => { expect(validInvite({ to: 'me', from: 'a', room: 'meeting-abc123' }, 'me')?.room).toBe('meeting-abc123'); });
  it('excludes self from peers', () => { expect(peersFromPresence({ me: [{}], x: [{ name: 'Ana', lang: 'es' }] }, 'me')).toEqual([{ id: 'x', name: 'Ana', lang: 'es' }]); });
  it('keeps a meet code to letters and digits only, upper case, eight long', () => {
    expect(normalizeMeetCode(' ok-9 c! ')).toBe('OK9C');
    expect(normalizeMeetCode('abcdefghij')).toBe('ABCDEFGH');
  });
  it('needs at least three characters before it opens a shared list', () => {
    expect(meetCodeChannel('ok')).toBeNull();
    expect(meetCodeChannel(' ok ')).toBeNull();
    expect(meetCodeChannel('ok9')).toBe('ml-nearby-code-OK9');
  });
  it('lists a phone once even when it appears in both the Wi-Fi and code lists', () => {
    expect(mergePeers([[{ id: 'x', name: 'Ana', lang: 'es' }], [{ id: 'x', name: 'Ana', lang: 'es' }, { id: 'y', name: 'Ben', lang: 'de' }]]))
      .toEqual([{ id: 'x', name: 'Ana', lang: 'es' }, { id: 'y', name: 'Ben', lang: 'de' }]);
  });
});
