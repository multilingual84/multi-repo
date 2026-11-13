import { expect, it } from 'vitest';
import { approximateLocalLanguage, defaultAutoDetect, nextLocalLanguage } from '@/lib/local-language';
it('starts auto detect on', () => { expect(defaultAutoDetect).toBe(true); });
it('uses geography independently of the owner flag', () => {
  expect(approximateLocalLanguage('ph', 'America/Chicago')).toBe('tl');
  expect(approximateLocalLanguage(null, 'America/Chicago')).toBe('en');
});
it('selects Japanese on arrival in Japan even with a home time zone', () => {
  expect(approximateLocalLanguage('jp', 'America/Chicago')).toBe('ja');
});
it('uses the Tokyo time zone when country detection is unavailable', () => {
  expect(approximateLocalLanguage(null, 'Asia/Tokyo')).toBe('ja');
});
it('does not invent a language for unknown geography', () => { expect(approximateLocalLanguage(null, 'Unknown/Place')).toBe(''); });
it('updates a different detected reply language with auto detect on', () => { expect(nextLocalLanguage('tl', 'es', 'en', true)).toBe('es'); });
it('keeps the chosen local language when auto detect is off', () => { expect(nextLocalLanguage('tl', 'es', 'en', false)).toBe('en'); });
it('does not replace local language with owner speech', () => { expect(nextLocalLanguage('tl', 'tl-PH', 'en', true)).toBe('en'); });
it('keeps Japanese for the owner then learns a different reply language', () => {
  const local=approximateLocalLanguage('jp','America/Chicago');
  expect(nextLocalLanguage('en','en-US',local,true)).toBe('ja');
  expect(nextLocalLanguage('en','ko',local,true)).toBe('ko');
});