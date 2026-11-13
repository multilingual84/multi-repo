import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const markup = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');

describe('Overview hero note removal', () => {
  it('no longer renders the free-for-life line above the boardroom photo', () => {
    expect(markup.match(/\{ui\.heroNote\}/g)).toBeNull();
    expect(markup).not.toContain('Free for life · No sign up');
  });

  it('keeps the venue QR block directly above the boardroom photo', () => {
    const venue = markup.indexOf('data-overview-venue-qr');
    const heroImg = markup.indexOf('<img src={heroTeam}');
    expect(venue).toBeGreaterThan(-1);
    expect(heroImg).toBeGreaterThan(venue);
    const between = markup.slice(venue, heroImg);
    expect(between).toContain('VenueQRPreview');
    expect(between).not.toContain('<p ');
  });
});
