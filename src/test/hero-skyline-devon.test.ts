import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');
const CSS = readFileSync('src/styles.css', 'utf8');

// The Devon Energy Center sits about 62% across src/assets/okc-skyline.jpg.
// A centred crop cut it out on phone portrait and landscape, so the crop is
// anchored on the tower and bounded to a band below desktop widths.
describe('OKC skyline keeps the Devon building in frame', () => {
  it('paints the skyline in its own layer instead of stretching the card', () => {
    const layer = SOURCE.indexOf('data-skyline-layer');
    expect(layer).toBeGreaterThan(-1);
    expect(SOURCE).toContain('ml-skyline-layer');
    expect(SOURCE).toContain('url(${okcSkyline})');
    expect(SOURCE).not.toContain('bg-cover bg-center');
  });

  it('anchors the crop on the tower and gives the card a solid base', () => {
    expect(CSS).toMatch(/\.ml-skyline-layer\s*\{[^}]*background-position:\s*62%/);
    expect(CSS).toMatch(/\.ml-skyline-layer\s*\{[^}]*background-size:\s*cover/);
    const section = SOURCE.slice(SOURCE.indexOf('data-hero-skyline') - 400, SOURCE.indexOf('data-hero-skyline'));
    expect(section).toContain('bg-banner-navy');
  });

  it('bounds the crop to a band on phones and tablets', () => {
    const band = CSS.match(/@media\s*\(max-width:\s*1023px\)\s*\{[\s\S]*?\.ml-skyline-layer\s*\{[^}]*\}/);
    expect(band).not.toBeNull();
    expect(band?.[0]).toMatch(/height:\s*46%/);
    expect(band?.[0]).toMatch(/inset:\s*0 0 auto 0/);
  });

  it('keeps the skyline layer behind the text and the overlay', () => {
    const layer = SOURCE.indexOf('data-skyline-layer');
    const overlay = SOURCE.indexOf('ml-skyline-overlay absolute inset-0');
    const headline = SOURCE.indexOf('data-hero-skyline');
    expect(headline).toBeLessThan(layer);
    expect(layer).toBeLessThan(overlay);
    expect(overlay).toBeLessThan(layer + 400);
  });
});
