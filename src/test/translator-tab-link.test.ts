import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const SOURCE = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');

function freeLifeTab(): string {
  const start = SOURCE.indexOf('<Button type="button" data-free-life');
  expect(start).toBeGreaterThan(-1);
  const end = SOURCE.indexOf('</Button>', start);
  expect(end).toBeGreaterThan(start);
  return SOURCE.slice(start, end);
}

describe('Personal Translator tab is one clickable link', () => {
  it('makes the whole banner a single button that opens the translator screen', () => {
    const tab = freeLifeTab();
    expect(tab).toContain('data-free-life');
    expect(tab).toContain('w-full');
    expect(tab).toContain("setActiveRoute('walking')");
  });

  it('leaves no nested button that would steal the click', () => {
    const tab = freeLifeTab();
    expect(tab.match(/<Button/g) || []).toHaveLength(1);
  });

  it('shows the title letters bigger than the free-life line', () => {
    const tab = freeLifeTab();
    expect(tab).toContain('text-[11px] font-black uppercase');
    expect(tab).toContain('text-[10px] font-bold uppercase');
  });

  it('keeps the banner padding unchanged so the tab size does not grow', () => {
    const tab = freeLifeTab();
    expect(tab).toContain('px-2 py-0.5');
    expect(tab).toContain('gap-0');
  });
});
