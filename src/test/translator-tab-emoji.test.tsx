import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import MultiLingualOKCSystem from '@/components/MultiLingualOKCSystem';
import { travelUtilityCopy, walkingTabTitle } from '@/lib/travel-utility-copy';
import type { UILocale } from '@/lib/ui-copy';

const LOCALES: UILocale[] = ['en', 'es', 'tl', 'zh', 'de', 'ja'];

afterEach(() => {
  cleanup();
});

describe('Personal Translator tab flame position', () => {
  it('drops the leading flame from the stored title in every native locale', () => {
    for (const locale of LOCALES) {
      const stored = travelUtilityCopy[locale].walkingTitle;
      const tab = walkingTabTitle(locale);
      expect(stored.startsWith('🔥')).toBe(true);
      expect(tab.startsWith('🔥')).toBe(false);
      expect(tab).toBe(stored.replace(/^🔥\s*/, ''));
      expect(tab.length).toBeGreaterThan(3);
    }
  });

  it('renders the stacked tab with a flame at each end of the phone screen', () => {
    render(<MultiLingualOKCSystem />);
    const tab = document.querySelector('[data-free-life]');
    expect(tab).not.toBeNull();
    const lines = Array.from(tab!.querySelectorAll(':scope > span')).map((s) => s.textContent!.trim());
    expect(lines).toHaveLength(3);
    const nameLine = lines[0]!;
    const deviceLine = lines[1]!;
    const lifeLine = lines[2]!;
    expect(nameLine.startsWith('🔥')).toBe(true);
    expect(lifeLine.endsWith('🔥')).toBe(true);
    expect(nameLine.replace('🔥', '').trim()).toContain('Personal Translator™');
    expect(deviceLine.toLowerCase()).toContain('in your phone');
    expect(lifeLine).toContain('FREE FOR LIFE NO SIGNUPS');
    expect(lines.join('\n').match(/🔥/g)!.length).toBe(2);
    expect(tab!.getAttribute('aria-label')!.startsWith('Personal Translator')).toBe(true);
  });
});
