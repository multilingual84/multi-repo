import { afterEach, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadManualLanguage, saveManualLanguage } from '@/lib/local-language';

afterEach(() => { window.localStorage.removeItem('ml-manual-language'); });

describe('geo-first outgoing language', () => {
  it('remembers a tapped flag for the current location', () => {
    saveManualLanguage('es', 'us');
    expect(loadManualLanguage('us')).toBe('es');
  });

  it('hands priority back to geo when the location changes', () => {
    saveManualLanguage('es', 'us');
    expect(loadManualLanguage('mx')).toBe('');
    expect(loadManualLanguage(null)).toBe('');
  });

  it('returns nothing when no flag was tapped', () => {
    expect(loadManualLanguage('us')).toBe('');
  });

  it('the translator saves the tapped flag with the geo country', () => {
    const source = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');
    expect(source).toContain('saveManualLanguage(language,geoCountry.current)');
    expect(source).toContain('loadManualLanguage(country)');
  });
});
