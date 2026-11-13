import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');
const LOCALES = 6;

describe('Share us button single-line label', () => {
  it('defines one label per hand-written locale and no second line', () => {
    expect((SOURCE.match(/partnerTabTop:/g) || []).length).toBe(LOCALES);
    expect(SOURCE).not.toContain('partnerTabSub');
  });

  it('uses the owner wording in English', () => {
    expect(SOURCE).toContain('partnerTabTop: "\u{1F525} Share us and earn 50%"');
  });

  it('shows the 50% share in every hand-written locale', () => {
    const labels = SOURCE.match(/partnerTabTop: "[^"]*"/g) || [];
    expect(labels.length).toBe(LOCALES);
    for (const label of labels) expect(label).toContain('50%');
  });

  it('renders that label inside the same button that opens the partner screen', () => {
    const top = SOURCE.indexOf('{text.partnerTabTop}');
    expect(top).toBeGreaterThan(-1);
    const buttonStart = SOURCE.lastIndexOf('<Button', top);
    const buttonEnd = SOURCE.indexOf('</Button>', top);
    expect(buttonStart).toBeGreaterThan(-1);
    expect(buttonEnd).toBeGreaterThan(top);
    expect(SOURCE.slice(buttonStart, buttonEnd)).toContain('setActiveRoute(\'partner\')');
  });

  it('sits in the same single row as the 7-Day Free Pass button, with the walking banner stretching underneath', () => {
    const rowStart = SOURCE.indexOf('grid w-full items-stretch gap-0.5 text-[11px] font-bold uppercase');
    const rowEnd = SOURCE.indexOf('setActiveRoute(\'walking\')', rowStart);
    expect(rowStart).toBeGreaterThan(-1);
    expect(rowEnd).toBeGreaterThan(rowStart);
    const row = SOURCE.slice(rowStart, rowEnd);
    expect(row).toContain("setActiveRoute('trial-pass')");
    expect(row).toContain("setActiveRoute('partner')");
    const banner = SOURCE.lastIndexOf('data-free-life', rowEnd);
    expect(banner).toBeGreaterThan(rowStart);
    expect(SOURCE.slice(banner, banner + 300)).toContain('w-full');
  });
});
