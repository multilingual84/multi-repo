import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { broadcastHeading, browserTellerLocale, isSampleLogOlderThanSevenDays, tapTabCopy } from '@/lib/ecosystem-preview';

describe('broadcast heading', () => {
  it('uses the requested wording in English', () => {
    expect(broadcastHeading.en).toBe('SPEAK IN PUBLIC IN ANY LANGUAGE');
  });
  it('does not keep the old node wording', () => {
    expect(Object.values(broadcastHeading)).not.toContain('1-to-Many Public Broadcast Node');
  });
});

describe('teller tap tab', () => {
  it('uses the requested wording in English', () => {
    expect(tapTabCopy.en).toBe('TAP HERE TO START TALKING');
  });

  it('renders a yellow tab without tapping phones', () => {
    const source = readFileSync('src/components/EcosystemPreview.tsx', 'utf8');
    expect(source).toContain('bg-signal');
    expect(source).not.toContain('tap-phone-left');
    expect(source).not.toContain('tap-phone-right');
    expect(source).not.toContain('TO THE TELLER');
    expect(source).not.toContain('Conversation preview only');
  });

  it('keeps the tab compact but a step larger than the other tabs', () => {
    const source = readFileSync('src/components/EcosystemPreview.tsx', 'utf8');
    expect(source).toContain('max-w-xl');
    expect(source).toContain('rounded-md');
    expect(source).toContain('px-3 py-0.5');
    expect(source).toContain('text-[13px] font-bold');
    expect(source).not.toContain('text-lg font-black');
    expect(source).not.toContain('px-4 py-5');
    expect(source).not.toContain('max-w-6xl');
  });

  it('glows around the tab', () => {
    const source = readFileSync('src/components/EcosystemPreview.tsx', 'utf8');
    const styles = readFileSync('src/styles.css', 'utf8');
    expect(source).toContain('tap-glow');
    expect(styles).toContain('.tap-glow');
    expect(styles).toContain('@keyframes tap-halo');
    expect(styles).toContain('@media (prefers-reduced-motion: reduce) { .tap-glow { animation: none; } }');
  });

  it('keeps the glow inside the tab row so it never washes over the neighbouring tabs', () => {
    const styles = readFileSync('src/styles.css', 'utf8');
    const glowLine = styles.split('\n').find((line) => line.trim().startsWith('.tap-glow {'));
    const haloLine = styles.split('\n').find((line) => line.trim().startsWith('@keyframes tap-halo'));
    expect(glowLine).toBeDefined();
    expect(haloLine).toBeDefined();

    // Every shadow layer is written as "0 0 <blur>px <spread>px"; the ring layer has no blur.
    const layers = (line: string) => [...line.matchAll(/0 0 (\d+(?:\.\d+)?)px (\d+(?:\.\d+)?)px/g)]
      .map(([, blur, spread]) => ({ blur: Number(blur), spread: Number(spread) }));

    for (const line of [glowLine!, haloLine!]) {
      const found = layers(line);
      expect(found.length).toBeGreaterThan(0);
      expect(Math.max(...found.map((l) => l.spread))).toBeLessThanOrEqual(2);
      expect(Math.max(...found.map((l) => l.blur))).toBeLessThanOrEqual(12);
    }
  });

  it('centers the words without tapping phone decoration', () => {
    const source = readFileSync('src/components/EcosystemPreview.tsx', 'utf8');
    expect(source).toContain('flex-col items-center');
    expect(source).not.toContain('Smartphone');
  });
});

describe('seven-day sample log warning threshold', () => {
  const created = '2026-10-01T12:00:00Z';
  it('does not warn at exactly seven days', () => {
    expect(isSampleLogOlderThanSevenDays(created, new Date('2026-10-08T12:00:00Z'))).toBe(false);
  });
  it('warns only after seven days', () => {
    expect(isSampleLogOlderThanSevenDays(created, new Date('2026-10-08T12:00:00.001Z'))).toBe(true);
  });
  it('does not warn for recent, future or invalid dates', () => {
    expect(isSampleLogOlderThanSevenDays(created, new Date('2026-10-07T12:00:00Z'))).toBe(false);
    expect(isSampleLogOlderThanSevenDays(created, new Date('2026-09-30T12:00:00Z'))).toBe(false);
    expect(isSampleLogOlderThanSevenDays('invalid')).toBe(false);
  });
});

describe('browser teller language selection', () => {
  it('recognizes Spanish browser locales', () => { expect(browserTellerLocale('es-MX')).toBe('es'); });
  it('recognizes Filipino as Tagalog', () => { expect(browserTellerLocale('fil-PH')).toBe('tl'); });
  it('leaves unsupported locales for whole-page translation', () => { expect(browserTellerLocale('fr-FR')).toBe(null); });
});