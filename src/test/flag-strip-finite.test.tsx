// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import FlagBanner from '@/components/FlagBanner';
import type { SearchableFlag } from '@/lib/flag-search';

afterEach(cleanup);

// A stand-in for the real list: five flags, one of which a visitor can search
// for by an English name instead of hunting through the strip.
const FLAGS: SearchableFlag[] = [
  { country: 'us', label: 'English', lang: 'en', locale: 'en' },
  { country: 'mx', label: 'Español', lang: 'es', locale: 'es' },
  { country: 'cn', label: '中文', lang: 'zh-CN', locale: 'zh' },
  { country: 'ph', label: 'Tagalog', lang: 'tl', locale: 'tl' },
  { country: 'jp', label: '日本語', lang: 'ja', locale: 'ja' },
];

const strip = () => screen.getByRole('region', { name: 'Choose your language' });
const flagButtons = () => strip().querySelectorAll('button').length;

describe('finite flag strip', () => {
  it('shows every flag exactly once, so the list has a first and a last', () => {
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={() => {}} />);
    expect(flagButtons()).toBe(FLAGS.length);
  });

  it('narrows to the searched flag and picks it with Enter', () => {
    const picked: string[] = [];
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={(flag) => picked.push(flag.country)} />);
    fireEvent.pointerDown(strip());
    const box = screen.getByRole('searchbox');
    fireEvent.change(box, { target: { value: 'filipino' } });
    expect(flagButtons()).toBe(1);
    fireEvent.keyDown(box, { key: 'Enter' });
    expect(picked).toEqual(['ph']);
  });

  it('keeps the type-to-find box hidden until the visitor starts moving the flags', () => {
    render(<FlagBanner flags={FLAGS} locale="en" onSelect={() => {}} />);
    expect(screen.queryByRole('searchbox')).toBeNull();
    expect(screen.queryByText('Type your language to find your flag')).toBeNull();
    fireEvent.wheel(strip(), { deltaY: 60 });
    expect(screen.getByRole('searchbox')).toBeTruthy();
    expect(screen.getByText('Type your language to find your flag')).toBeTruthy();
  });
});
