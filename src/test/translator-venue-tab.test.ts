import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/components/WalkingTranslator.tsx', 'utf8');

describe('Venue QR tab placement', () => {
  const mic = source.indexOf('<Button ref={micBtn}');
  const tab = source.indexOf('<VenueQRPreview locale={locale}/>');
  const hint = source.indexOf('data-press-hint');
  const free = source.indexOf('{travelUtilityCopy[locale].free}');
  const qrSection = source.indexOf('data-qr-primary');

  it('renders every control', () => {
    expect(mic).toBeGreaterThan(-1);
    expect(tab).toBeGreaterThan(-1);
    expect(hint).toBeGreaterThan(-1);
    expect(free).toBeGreaterThan(-1);
    expect(qrSection).toBeGreaterThan(-1);
  });

  it('sits directly above the choose-your-flag hint', () => {
    expect(tab).toBeLessThan(hint);
    expect(hint).toBeLessThan(mic);
  });

  it('is above the mic, the free note and the QR section', () => {
    expect(tab).toBeLessThan(mic);
    expect(tab).toBeLessThan(free);
    expect(tab).toBeLessThan(qrSection);
  });
});
