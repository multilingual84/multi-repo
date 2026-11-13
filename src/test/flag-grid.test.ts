import { describe, expect, it } from 'vitest';
import { PRIMARY_FLAGS } from '@/lib/flag-catalog';
import { FLAG_REGION_ORDER, flagsByRegion, regionFor } from '@/lib/flag-grid';
import { FLAG_GRID_LOCALES, flagGridCopy } from '@/lib/flag-grid-copy';

describe('All-languages grid grouping', () => {
  it('maps every primary country to a region', () => {
    for (const flag of PRIMARY_FLAGS) {
      expect(FLAG_REGION_ORDER).toContain(regionFor(flag.country));
    }
  });

  it('partitions the primary countries exactly once', () => {
    const grouped = flagsByRegion().flatMap((group) => group.flags.map((flag) => flag.country));
    expect(grouped.length).toBe(PRIMARY_FLAGS.length);
    expect(new Set(grouped).size).toBe(PRIMARY_FLAGS.length);
  });

  it('keeps a stable, visitor-friendly region order', () => {
    expect(FLAG_REGION_ORDER).toEqual(['americas', 'europe', 'mena', 'africa', 'asia', 'oceania']);
  });

  it('leaves no empty region on the page', () => {
    for (const group of flagsByRegion()) {
      expect(group.flags.length).toBeGreaterThan(0);
    }
  });
});

describe('Grid picker copy', () => {
  it('carries a button label, title and close label in every locale', () => {
    for (const locale of FLAG_GRID_LOCALES) {
      const copy = flagGridCopy[locale];
      expect(copy.button.trim().length).toBeGreaterThan(0);
      expect(copy.title.trim().length).toBeGreaterThan(0);
      expect(copy.close.trim().length).toBeGreaterThan(0);
    }
  });

  it('names all six continent groups natively in every locale', () => {
    for (const locale of FLAG_GRID_LOCALES) {
      const names = Object.values(flagGridCopy[locale].groups);
      expect(names.length).toBe(6);
      expect(names.every((name) => name.trim().length > 0)).toBe(true);
      expect(new Set(names).size).toBe(6);
    }
  });
});
