import { describe, expect, it } from 'vitest';
import { resolveShareLocale } from '@/lib/share-metadata';

describe('Share request language selection', () => {
  it('maps Mexico and Colombia to Spanish', () => {
    expect(resolveShareLocale('es-MX')).toBe('es');
    expect(resolveShareLocale('es-CO')).toBe('es');
  });
  it('distinguishes Simplified from Traditional Chinese', () => {
    expect(resolveShareLocale('zh-CN')).toBe('zh-CN');
    expect(resolveShareLocale('zh-TW')).toBe('zh-TW');
    expect(resolveShareLocale('zh-Hant-HK')).toBe('zh-TW');
  });
  it('respects preference weights and excludes disabled languages', () => {
    expect(resolveShareLocale('de;q=0.2,ja;q=0.9,en;q=0')).toBe('ja');
    expect(resolveShareLocale('ja;q=0,en;q=1')).toBe('en');
  });
  it('maps device Filipino to Tagalog and falls back safely', () => {
    expect(resolveShareLocale('fil-PH')).toBe('tl');
    expect(resolveShareLocale('xx-XX')).toBe('en');
  });
});