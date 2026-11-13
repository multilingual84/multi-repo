import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');

// The owner asked the microphone permission card to appear right above the mic
// circle, so the person sees it where they just tapped instead of below it.
describe('Microphone permission card sits above the mic circle', () => {
  const notice = SOURCE.indexOf('<MicrophonePermissionNotice');
  const toolbar = SOURCE.indexOf('data-translator-language-toolbar');
  const mic = SOURCE.indexOf('<Button ref={micBtn}');

  it('renders the permission card once', () => {
    expect(SOURCE.match(/<MicrophonePermissionNotice/g)?.length).toBe(1);
  });

  it('places it between the language toolbar and the mic button', () => {
    expect(toolbar).toBeGreaterThan(-1);
    expect(notice).toBeGreaterThan(-1);
    expect(mic).toBeGreaterThan(-1);
    expect(toolbar).toBeLessThan(notice);
    expect(notice).toBeLessThan(mic);
  });
});
