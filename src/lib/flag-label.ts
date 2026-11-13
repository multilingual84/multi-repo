import type { FlagEntry } from '@/lib/flag-catalog';

// Browser-safe locale names; currency selection always uses the original country.
export function localizedFlagLabel(flag: FlagEntry, locale: string): string {
  if (locale === 'en') return flag.label;
  try {
    const language = flag.lang === 'iw' ? 'he' : flag.lang === 'jw' ? 'jv' : flag.lang;
    const target = locale === 'tl' ? 'fil' : locale.replace(/^gt:/, '');
    const names = new Intl.DisplayNames([target || 'en'], { type: 'language', fallback: 'none' });
    const name = names.of(language);
    if (!name) return flag.label;
    if (!flag.label.includes('(')) return name;
    const country = flag.country.slice(0, 2).toUpperCase();
    const region = new Intl.DisplayNames([target || 'en'], { type: 'region' }).of(country);
    return region ? `${name} (${region})` : name;
  } catch {
    return flag.label;
  }
}