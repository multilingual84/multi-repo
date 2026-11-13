import { ALL_FLAGS } from '@/lib/flag-catalog';

// Approximate region defaults only. Never use a selected flag as location.
const regionalDefaults: Record<string, string> = { ie: 'en', ca: 'en', ch: 'de', be: 'nl', sg: 'en', za: 'en' };
const zoneCountries: Record<string, string> = {
  'America/Chicago': 'us', 'America/New_York': 'us', 'America/Denver': 'us', 'America/Los_Angeles': 'us',
  'America/Mexico_City': 'mx', 'America/Toronto': 'ca', 'America/Sao_Paulo': 'br',
  'Europe/London': 'gb', 'Europe/Paris': 'fr', 'Europe/Berlin': 'de', 'Europe/Madrid': 'es',
  'Europe/Rome': 'it', 'Europe/Dublin': 'ie', 'Europe/Lisbon': 'pt',
  'Asia/Manila': 'ph', 'Asia/Tokyo': 'jp', 'Asia/Shanghai': 'cn', 'Asia/Hong_Kong': 'hk',
  'Asia/Taipei': 'tw', 'Asia/Seoul': 'kr', 'Asia/Kolkata': 'in', 'Asia/Bangkok': 'th',
  'Asia/Singapore': 'sg', 'Asia/Jakarta': 'id', 'Asia/Dubai': 'ae', 'Australia/Sydney': 'au',
};
export function approximateLocalLanguage(country?: string | null, timeZone = ''): string {
  const region = (country || zoneCountries[timeZone] || '').toLowerCase();
  return regionalDefaults[region] ?? ALL_FLAGS.find(flag => flag.country === region)?.lang ?? '';
}
export const defaultAutoDetect = true;

// Geo gets first priority for the outgoing translation language. A tapped flag is
// remembered for the current location and stays on — until the location changes,
// then the geo estimate takes first priority again.
const MANUAL_KEY = 'ml-manual-language';
export function loadManualLanguage(country: string | null): string {
  if (typeof window === 'undefined') return '';
  try {
    const raw = window.localStorage.getItem(MANUAL_KEY);
    if (!raw) return '';
    const saved = JSON.parse(raw) as { language?: string; country?: string | null };
    if (saved.language && (saved.country ?? null) === country) return saved.language;
  } catch { /* stored value unreadable — fall back to geo */ }
  return '';
}
export function saveManualLanguage(language: string, country: string | null) {
  if (typeof window === 'undefined' || !language) return;
  window.localStorage.setItem(MANUAL_KEY, JSON.stringify({ language, country }));
}
export function nextLocalLanguage(owner: string, source: string, current: string, autoDetect: boolean): string {
  const base = (language: string) => language.toLowerCase().split('-')[0];
  return autoDetect && base(source) !== base(owner) ? source : current;
}