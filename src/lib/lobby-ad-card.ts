// Browser-safe data for the Public Lobby Ingress QR marketing ad card.
// Pure helpers only — no live calls, billing, or verification happen here.
import { ALL_FLAGS, type FlagEntry } from './flag-catalog';

// The owner's specified point-and-select flag matrix, three stacked rows.
export const LOBBY_FLAG_ROWS: string[][] = [
  ['us', 'ca', 'mx', 'ph', 'cn', 'jp', 'kr', 'vn', 'th', 'id', 'my', 'in'],
  ['gb', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ua', 'by', 'ru', 'tr'],
  ['sa', 'ae', 'eg', 'ma', 'il', 'za', 'ke', 'ng', 'br', 'cl', 'ar', 'au'],
];

export function flagEmoji(country: string): string {
  if (!/^[a-z]{2}$/.test(country)) return '🏳️';
  return String.fromCodePoint(...[...country].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 97));
}

export function lobbyFlagEntry(country: string): FlagEntry | undefined {
  return ALL_FLAGS.find((flag) => flag.country === country);
}

// A free operator is gated once the complimentary 1-week pass has expired
// (Day 8 onward) and no upgrade is on file. Billing is handled elsewhere.
export function isReturnCallGated(expiresAt: number, now: number, upgraded: boolean): boolean {
  return !upgraded && now > expiresAt;
}

export const lobbyAdCardBranding = {
  header: '🛡️ BRICKTOWN SOFTWARE SYSTEMS',
  domain: '🌐 Multi-Lingual.tech',
  footer: '© 2026 Multi-Lingual.tech, a division of Bricktown Software Systems LLC',
} as const;
