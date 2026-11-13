import { describe, expect, it } from 'vitest';
import { ALL_FLAGS, PRIMARY_FLAGS, dialectsFor } from '@/lib/flag-catalog';

describe('One flag per country', () => {
  it('has no repeated country in the strip list', () => {
    const countries = PRIMARY_FLAGS.map((f) => f.country);
    expect(new Set(countries).size).toBe(countries.length);
  });

  it('still starts with the US flag', () => {
    expect(PRIMARY_FLAGS[0]?.country).toBe('us');
  });

  it('keeps every language reachable through a country dialect menu', () => {
    for (const flag of ALL_FLAGS) {
      expect(dialectsFor(flag.country)).toContainEqual(flag);
    }
  });

  it('groups multi-language countries behind one flag', () => {
    expect(dialectsFor('in').length).toBeGreaterThan(5);
    expect(dialectsFor('ng').map((f) => f.lang)).toEqual(['yo', 'ha', 'ig']);
    expect(dialectsFor('us')).toHaveLength(1);
  });
});
