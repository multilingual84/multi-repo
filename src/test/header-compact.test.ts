import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

const CSS = readFileSync('src/styles.css', 'utf8');
const SOURCE = readFileSync('src/components/MultiLingualOKCSystem.tsx', 'utf8');

describe('pinned tab block stays compact', () => {
  it('lowers the shared 44px touch floor only inside the pinned header', () => {
    expect(SOURCE).toContain('ml-header');
    expect(CSS).toMatch(/\.ml-header button[^}]*min-height:\s*30px/);
    expect(CSS).toMatch(/:where\(button[^)]*\)\s*\{[^}]*min-height:\s*44px/);
  });

  it('lets the top block scroll away with the page (owner request: hide on scroll down, back at the top)', () => {
    const header = SOURCE.slice(SOURCE.indexOf('<header'), SOURCE.indexOf('</header>'));
    expect(header.slice(0, header.indexOf('>'))).not.toContain('sticky');
    expect(header).toContain('data-free-life');
    expect(header).toContain('TellerAnnouncement');
  });
});
