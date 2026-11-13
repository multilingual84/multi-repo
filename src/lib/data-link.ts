import { newRoomId } from '@/lib/call-room';

export type DataLinkOption = 'carrier' | 'outbound' | 'virtual';

export function parseDataRecipients(input: string): string[] {
  return [...new Set(input.split(/\r?\n/).map(value => value.trim()).filter(Boolean))];
}

/**
 * A live voice link: opening it on another phone brings up the call screen and
 * pairs the two phones in a translated room. No recipient details go into the
 * address — the address only names the room.
 */
export function createLiveVoiceLink(origin: string, roomId: string = newRoomId()): string {
  const url = new URL('/', origin);
  url.hash = `meeting-${roomId}`;
  return url.toString();
}
