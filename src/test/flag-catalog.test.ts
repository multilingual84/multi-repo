import { describe, expect, it } from 'vitest';
import { ALL_FLAGS } from '@/lib/flag-catalog';
import { filterFlags } from '@/lib/flag-search';
import { boundedFlagPosition } from '@/lib/flag-scroll';

describe('country flags and finite browsing', () => {
  it('starts at the US English flag', () => {
    expect(ALL_FLAGS[0]).toMatchObject({ country: 'us', lang: 'en' });
  });
  it('retains regional English flags alongside local language choices', () => {
    for (const country of ['us', 'gb', 'au', 'ie', 'ca', 'nz', 'jm', 'tt', 'ph', 'in']) {
      expect(ALL_FLAGS.some(flag => flag.country === country && flag.lang === 'en')).toBe(true);
    }
    expect(ALL_FLAGS.some(flag => flag.country === 'ph' && flag.lang === 'tl')).toBe(true);
    expect(ALL_FLAGS.some(flag => flag.country === 'in' && flag.lang === 'hi')).toBe(true);
  });
  it('adds searchable major languages with widget-compatible codes', () => {
    for (const [query, lang] of [['tamil','ta'], ['telugu','te'], ['marathi','mr'], ['javanese','jw'], ['cantonese','yue'], ['oromo','om']]) {
      expect(filterFlags(ALL_FLAGS, query ?? '').some(flag => flag.lang === lang)).toBe(true);
    }
  });
  it('cannot move backward beyond the US starting boundary', () => {
    expect(boundedFlagPosition(-120, 2000, 500)).toBe(0);
    expect(boundedFlagPosition(0, 2000, 500)).toBe(0);
  });
  it('can move forward from the beginning and cannot wrap at the end', () => {
    expect(boundedFlagPosition(120, 2000, 500)).toBe(120);
    expect(boundedFlagPosition(1800, 2000, 500)).toBe(1500);
    expect(boundedFlagPosition(120, 300, 500)).toBe(0);
  });
});