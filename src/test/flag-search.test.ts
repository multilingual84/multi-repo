import { describe, expect, it } from 'vitest';
import { filterFlags, flagMatches, type SearchableFlag } from '@/lib/flag-search';
import { flagSearchCopy } from '@/lib/flag-search-copy';

const FLAGS: SearchableFlag[] = [
  { country: 'us', label: 'English', lang: 'en', locale: 'en' },
  { country: 'mx', label: 'Español', lang: 'es', locale: 'es' },
  { country: 'cn', label: '中文', lang: 'zh-CN', locale: 'zh' },
  { country: 'tw', label: '繁體中文', lang: 'zh-TW' },
  { country: 'de', label: 'Deutsch', lang: 'de', locale: 'de' },
  { country: 'ph', label: 'Tagalog', lang: 'tl', locale: 'tl' },
  { country: 'jp', label: '日本語', lang: 'ja', locale: 'ja' },
  { country: 'fr', label: 'Français', lang: 'fr' },
  { country: 'tz', label: 'Kiswahili (TZ)', lang: 'sw' },
];

const labels = (query: string) => filterFlags(FLAGS, query).map((flag) => flag.country);

describe('flag search box', () => {
  it('finds the Philippines flag from "filipino"', () => {
    expect(labels('filipino')).toEqual(['ph']);
  });

  it('finds both Chinese flags from "chinese"', () => {
    expect(labels('chinese')).toEqual(['cn', 'tw']);
  });

  it('ignores accent marks, so "francais" finds Français', () => {
    expect(labels('francais')).toEqual(['fr']);
    expect(flagMatches({ country: 'fr', label: 'Français', lang: 'fr' }, 'FRANCAIS')).toBe(true);
  });

  it('matches a country code and a language code', () => {
    expect(labels('jp')).toEqual(['jp']);
    expect(labels('sw')).toEqual(['tz']);
  });

  it('matches part of the flag label itself', () => {
    expect(labels('espa')).toEqual(['mx']);
    expect(labels('日本語')).toEqual(['jp']);
  });

  it('returns nothing for an unknown word, and everything when empty', () => {
    expect(labels('zzzz')).toEqual([]);
    expect(filterFlags(FLAGS, '   ')).toHaveLength(FLAGS.length);
  });

  it('carries its own wording in all six native locales', () => {
    const hints = Object.values(flagSearchCopy).map((entry) => entry.hint);
    expect(hints).toHaveLength(6);
    expect(new Set(hints).size).toBe(6);
    for (const entry of Object.values(flagSearchCopy)) {
      expect(entry.placeholder.length).toBeGreaterThan(0);
      expect(entry.none.length).toBeGreaterThan(0);
      expect(entry.clear.length).toBeGreaterThan(0);
    }
  });
});
