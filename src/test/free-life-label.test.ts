import { describe, expect, it } from 'vitest';
import { travelUtilityCopy, walkingTabLines } from '@/lib/travel-utility-copy';

const LOCALES = ['en', 'es', 'tl', 'zh', 'de', 'ja'] as const;

describe('Walking Translator free-for-life label', () => {
  it('carries the owner wording in English', () => {
    expect(travelUtilityCopy.en.freeLife).toBe('FREE FOR LIFE NO SIGNUPS');
  });

  it('is present as a distinct native string in every hand-written locale', () => {
    const seen = new Set<string>();
    for (const locale of LOCALES) {
      const value = travelUtilityCopy[locale].freeLife;
      expect(value.trim().length).toBeGreaterThan(0);
      seen.add(value);
    }
    expect(seen.size).toBe(LOCALES.length);
  });

  it('does not reuse the older free-for-all-levels sentence', () => {
    for (const locale of LOCALES) {
      expect(travelUtilityCopy[locale].freeLife).not.toBe(travelUtilityCopy[locale].free);
    }
  });

  it('stacks the tab into a name line and a device line in every hand-written locale', () => {
    const seen = new Set<string>();
    for (const locale of LOCALES) {
      const lines = walkingTabLines(locale);
      expect(lines.name.trim().length).toBeGreaterThan(0);
      expect(lines.device.trim().length).toBeGreaterThan(0);
      expect(lines.name).not.toContain('🔥');
      expect(lines.device).not.toContain('🔥');
      seen.add(`${lines.name}|${lines.device}`);
    }
    expect(seen.size).toBe(LOCALES.length);
  });

  it('keeps the owner wording on the stacked lines in English', () => {
    expect(walkingTabLines('en').name).toBe('Personal Translator™');
    expect(walkingTabLines('en').device).toBe('In your phone');
  });
});
