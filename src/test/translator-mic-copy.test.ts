import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { translatorCopy } from '@/lib/translator-copy';
import type { UILocale } from '@/lib/ui-copy';

const SOURCE = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');
const locales: UILocale[] = ['en', 'es', 'zh', 'de', 'tl', 'ja'];

describe('Microphone tap-to-toggle wording', () => {
  it('uses the owner wording in English above the circle', () => {
    expect(translatorCopy.en.pressHint).toBe(
      'Tap once in front of someone you need to speak to — tap again to stop.',
    );
  });

  it('uses the owner wording in English inside the circle', () => {
    expect(translatorCopy.en.micInside).toBe(
      'Tap to speak to someone instantly! Any Language No Monthly Fees.',
    );
  });

  it.each(locales)('%s has both press-hold lines', (locale) => {
    expect(translatorCopy[locale].pressHint.length).toBeGreaterThanOrEqual(8);
    expect(translatorCopy[locale].micInside.length).toBeGreaterThanOrEqual(8);
    expect(translatorCopy[locale].pressHint).not.toBe(translatorCopy[locale].mic);
    expect(translatorCopy[locale].micInside).not.toBe(translatorCopy[locale].mic);
  });

  it('renders the press-hold line above the mic and the longer line inside it', () => {
    const hint = SOURCE.indexOf('data-press-hint');
    const button = SOURCE.indexOf('<Button ref={micBtn}');
    const micLine = SOURCE.indexOf('data-mic-line');
    expect(hint).toBeGreaterThan(-1);
    expect(hint).toBeLessThan(button);
    expect(button).toBeLessThan(micLine);
    expect(SOURCE).toContain('mic-glow');
    expect(SOURCE).toContain('h-64 w-64');
    expect(SOURCE).toContain('font-light');
    // The button shell caps child icons at 16px, so the enlarged symbol needs its own rule.
    const css = readFileSync('src/styles.css', 'utf8');
    expect(css).toContain('.mic-glow svg');
  });
});

describe('Microphone tap toggle', () => {
  it('toggles on tap instead of press-and-hold', () => {
    const src = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');
    expect(src).not.toContain('onPointerUp={()=>setHolding(false)}');
  });
});
