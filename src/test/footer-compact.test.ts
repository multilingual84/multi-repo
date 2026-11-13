import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const source = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');
const start = source.indexOf('<footer');
const footer = source.slice(start, source.indexOf('</footer>', start) + '</footer>'.length);

describe('footer stays one compact line-flow', () => {
  it('exists', () => {
    expect(start).toBeGreaterThan(-1);
    expect(footer.length).toBeGreaterThan(80);
  });

  it('puts every item in one wrapping row instead of stacked rows', () => {
    expect(footer).toContain('flex-wrap');
    expect(footer).toContain('justify-center');
    expect(footer).not.toContain('grid-cols-2');
    expect(footer).not.toContain('lg:grid-cols-');
  });

  it('drops the extra vertical spacers', () => {
    expect(footer).not.toContain('border-t border-border pt-4');
    expect(footer).not.toContain('py-6');
    expect(footer).toContain('py-3');
    expect(footer).toContain('gap-y-0');
  });

  it('keeps all four pieces of wording in the same order', () => {
    const order = ['{ui.legalPrivacy}', '{ui.terms}', '{ui.adFree}', '{corporateName}'];

    let previous = -1;
    for (const marker of order) {
      const position = footer.indexOf(marker);
      expect(position, `${marker} still in footer`).toBeGreaterThan(-1);
      expect(position, `${marker} after the previous item`).toBeGreaterThan(previous);
      previous = position;
    }
  });

  it('keeps no telephone link and the untranslated company line', () => {
    expect(footer).not.toContain('tel:');
    expect(footer).not.toContain('complianceText.supportLabel');
    expect(footer).toContain('<span translate="no">©');
  });


  it('keeps a 44px press area on each control', () => {
    expect(footer.match(/min-h-11/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
