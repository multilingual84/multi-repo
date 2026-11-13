import { PASS_DURATION_MS } from '@/lib/pass-preview';

export const AFFILIATE_PREVIEW_KEY = 'ml-affiliate-qr-preview';
export const AFFILIATE_PASS_DURATION_MS = PASS_DURATION_MS;

export const PARTNER_CODE_KEY = 'ml-partner-code';
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export function makePartnerCode(bytes: Uint8Array) {
  const c = Array.from(bytes.slice(0, 8), b => ALPHABET[b % ALPHABET.length]).join('');
  return `ML-${c.slice(0, 4)}-${c.slice(4, 8)}`;
}
export function isPartnerCode(v: string | null): v is string { return !!v && /^ML-[A-Z2-9]{4}-[A-Z2-9]{4}$/.test(v); }
export function affiliatePreviewLink(origin: string, id: string, code?: string) {
  return `${origin}/${code ? `?ref=${code}` : ''}#trial-affiliate-${encodeURIComponent(id)}`;
}