import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { translatorCopy } from '@/lib/translator-copy';

const LOCALES = ['en', 'es', 'zh', 'de', 'tl', 'ja'] as const;
const componentSource = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');

describe('trial pass invite contact inputs', () => {
  it('offers a recipient email input alongside the phone number', () => {
    expect(componentSource).toContain('type="tel"');
    expect(componentSource).toContain('type="email"');
    expect(componentSource).toContain('!phone.trim()&&!email.trim()');
  });

  it('localizes the email label in every native locale', () => {
    for (const locale of LOCALES) {
      expect(translatorCopy[locale].email.trim().length).toBeGreaterThan(3);
    }
  });
});

describe('camera connects two phones through QR', () => {
  it('opens scanned same-origin call links directly', () => {
    expect(componentSource).toContain('window.location.assign(value)');
  });

  it('offers a tap-to-open button for external scanned links', () => {
    expect(componentSource).toContain("window.open(decoded,'_blank','noopener,noreferrer')");
    for (const locale of LOCALES) {
      expect(translatorCopy[locale].openLink.trim().length).toBeGreaterThan(3);
    }
  });
});
