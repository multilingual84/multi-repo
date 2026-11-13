// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import FlagBanner from '@/components/FlagBanner';
import type { SearchableFlag } from '@/lib/flag-search';

// Rolling flags select languages; the full list remains available for corrections.
afterEach(() => {
  cleanup();
});

const FLAGS: SearchableFlag[] = [
  { country: 'us', label: 'English', lang: 'en', locale: 'en' },
  { country: 'mx', label: 'Español', lang: 'es', locale: 'es' },
  { country: 'ph', label: 'Tagalog', lang: 'tl', locale: 'tl' },
];

const strip = () => screen.getByRole('region', { name: 'Choose your language' });
const panel = () => screen.queryByRole('dialog', { name: 'All languages' });
const banner = () => document.querySelector('[data-flag-banner]') as HTMLElement;
const allFlags = () => screen.getByRole('button', { name: 'All languages' });

describe('the all-flags logo button opens the all-languages panel', () => {
  it('opens the panel when the visitor taps the all-flags logo button', () => {
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={() => {}} />);
    expect(panel()).toBeNull();
    fireEvent.click(allFlags());
    expect(panel()).toBeTruthy();
  });

  it('does not open the panel when the visitor taps the rolling strip itself', () => {
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={() => {}} />);
    fireEvent.pointerDown(strip());
    expect(panel()).toBeNull();
  });

  it('closes the panel when the visitor taps the all-flags logo button again', () => {
    const picked: SearchableFlag[] = [];
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={(flag) => picked.push(flag)} />);
    fireEvent.click(allFlags());
    expect(panel()).toBeTruthy();
    fireEvent.click(allFlags());
    expect(panel()).toBeNull();
    expect(picked).toEqual([]);
    fireEvent.click(allFlags());
    expect(panel()).toBeTruthy();
  });

  it('keeps the panel open after the pointer leaves the banner', () => {
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={() => {}} />);
    fireEvent.click(allFlags());
    expect(panel()).toBeTruthy();
    fireEvent.pointerLeave(banner());
    expect(panel()).toBeTruthy();
  });

  it('closes the panel when a flag is chosen from the grid', () => {
    const picked: SearchableFlag[] = [];
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={(flag) => { picked.push(flag); }} />);
    fireEvent.click(allFlags());
    expect(panel()).toBeTruthy();
    // The panel's own grid repeats each flag, so pick from inside the panel.
    const dialog = screen.getByRole('dialog', { name: 'All languages' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'English flag English' }));
    expect(picked[0]?.country).toBe('us');
    expect(panel()).toBeNull();
  });

  it('selects a rolling flag and closes the full list', () => {
    const picked: SearchableFlag[] = [];
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={(flag) => { picked.push(flag); }} />);
    fireEvent.click(allFlags());
    const stripFlag = within(strip()).getByRole('button', { name: 'Español flag Español' });
    fireEvent.pointerDown(stripFlag);
    fireEvent.click(stripFlag);
    expect(panel()).toBeNull();
    expect(picked.map((flag) => flag.country)).toEqual(['mx']);
  });

  it('changes the language instead of opening all flags when a rolling flag is tapped', () => {
    const picked: SearchableFlag[] = [];
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={(flag) => picked.push(flag)} />);
    const flag = within(strip()).getByRole('button', { name: 'Español flag Español' });
    fireEvent.click(flag);
    expect(panel()).toBeNull();
    fireEvent.click(flag);
    expect(panel()).toBeNull();
    expect(picked.map((entry) => entry.country)).toEqual(['mx', 'mx']);
    fireEvent.click(within(strip()).getByRole('button', { name: 'English flag English' }));
    expect(panel()).toBeNull();
    expect(picked.map((entry) => entry.country)).toEqual(['mx', 'mx', 'us']);
  });

  it('closes all flags without changing the language and can reopen them', () => {
    const picked: SearchableFlag[] = [];
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={(flag) => picked.push(flag)} />);
    fireEvent.click(allFlags());
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(panel()).toBeNull();
    expect(picked).toEqual([]);
    fireEvent.click(allFlags());
    expect(panel()).toBeTruthy();
  });

  it('switches a multi-dialect country flag without opening the panel', () => {
    const picked: SearchableFlag[] = [];
    render(<FlagBanner flags={[...FLAGS, { country: 'ph', label: 'English PH', lang: 'en', locale: 'en' }]} locale="en" onSelect={(flag) => picked.push(flag)} />);
    fireEvent.click(within(strip()).getByRole('button', { name: 'Tagalog flag Tagalog' }));
    expect(panel()).toBeNull();
    expect(picked[0]?.country).toBe('ph');
    expect(picked[0]?.lang).toBe('tl');
    // The extra dialects stay reachable through the panel's own grid.
    fireEvent.click(allFlags());
    const dialog = screen.getByRole('dialog', { name: 'All languages' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Tagalog flag Tagalog' }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'English PH flag English PH' }));
    expect(picked[1]?.lang).toBe('en');
    expect(picked[1]?.country).toBe('ph');
    expect(panel()).toBeNull();
  });

  it('allows closing the full list with Escape', () => {
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={() => {}} />);
    fireEvent.click(allFlags());
    fireEvent.keyDown(screen.getByRole('button', { name: 'Close' }), { key: 'Escape' });
    expect(panel()).toBeNull();
  });

  it('leaves no pause control on the rolling strip', () => {
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={() => {}} />);
    expect(screen.queryByRole('button', { name: 'Pause flags' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Resume flags' })).toBeNull();
    expect(allFlags()).toBeTruthy();
  });
});
