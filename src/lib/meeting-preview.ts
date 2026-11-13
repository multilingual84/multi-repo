export function meetingPreviewLink(origin: string, roomId: string) {
  const url = new URL(origin);
  url.hash = `meeting-${encodeURIComponent(roomId)}`;
  return url.href;
}

export function meetingPreviewId(hash: string) {
  if (!hash.startsWith('#meeting-')) return null;
  const value = hash.slice('#meeting-'.length);
  if (!/^[a-zA-Z0-9-]{1,80}$/.test(value)) return null;
  return value;
}