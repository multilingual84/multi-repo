// Public translation entry contains an address only, never recovery credentials.
export function publicTranslatorLink(origin: string, code: string): string {
  if (!/^[a-zA-Z0-9_-]{6,80}$/.test(code)) throw new Error('Invalid public code');
  return `${origin.replace(/\/$/, '')}/#talk-${code}`;
}
export function isPublicTranslatorHash(hash: string): boolean {
  return /^#talk-[a-zA-Z0-9_-]{6,80}$/.test(hash);
}