import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');

// The owner removed the "🗣️ Talk to me in any language" tab from the Personal
// Translator™ screen. The press-and-hold mic and the lines under it stay.
describe('Talk-to-me tab is gone from the translator screen', () => {
  it('no longer renders the tab or its notices', () => {
    expect(SOURCE).not.toContain('data-talk-banner');
    expect(SOURCE).not.toContain('toggleTalk');
    expect(SOURCE).not.toContain('isLiveChannelOpen');
    expect(SOURCE).not.toContain('markFreeLifetimeActivated');
    expect(SOURCE).not.toContain('{c.talk}');
    expect(SOURCE).not.toContain('talkNote');
  });

  it('keeps the free-for-life header, the press-hold line and the mic', () => {
    const freeLife = SOURCE.indexOf('data-free-life');
    const press = SOURCE.indexOf('data-press-hint');
    const mic = SOURCE.indexOf('data-mic-line');
    expect(freeLife).toBeGreaterThan(-1);
    expect(press).toBeGreaterThan(freeLife);
    expect(mic).toBeGreaterThan(press);
    expect(SOURCE).toContain('mic-glow');
  });
});
