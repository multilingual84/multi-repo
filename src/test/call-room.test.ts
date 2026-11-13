import { expect, it } from 'vitest';
import { newRoomId, roomFromHash, shouldOffer, needsTranslation } from '@/lib/call-room';

it('both phones on the same link join the same room', () => {
  expect(roomFromHash('#meeting-abc123')).toBe('meeting-abc123');
  expect(roomFromHash('#pricing')).toBeNull();
});
it('creates a fresh room id that reads back as a meeting room', () => {
  const id = newRoomId();
  expect(id).toMatch(/^[a-zA-Z0-9-]{1,80}$/);
  expect(roomFromHash(`#meeting-${id}`)).toBe(`meeting-${id}`);
  expect(newRoomId()).not.toBe(id);
});
it('only one phone starts the connection', () => {
  expect(shouldOffer('a', ['a', 'b'])).toBe(true);
  expect(shouldOffer('b', ['a', 'b'])).toBe(false);
  expect(shouldOffer('a', ['a'])).toBe(false);
});
it('translates only between different languages', () => {
  expect(needsTranslation('en', 'es')).toBe(true);
  expect(needsTranslation('en-US', 'en')).toBe(false);
});
