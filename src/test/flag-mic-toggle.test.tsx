import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import FlagLanguageMic from '@/components/FlagLanguageMic';

afterEach(() => { cleanup(); vi.useRealTimers(); });

it('stays on after one tap until a second tap turns it off', () => {
  vi.useFakeTimers();
  const view = render(<FlagLanguageMic locale="en" />);
  const mic = view.getByRole('button');
  expect(mic).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(mic);
  expect(mic).toHaveAttribute('aria-pressed', 'false');
  fireEvent.click(view.getByRole('button',{name:'Continue'}));
  act(() => vi.advanceTimersByTime(60000));
  expect(mic).toHaveAttribute('aria-pressed', 'true');
  fireEvent.click(mic);
  expect(mic).toHaveAttribute('aria-pressed', 'false');
});