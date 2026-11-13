import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';

import MultiLingualOKCSystem from '@/components/MultiLingualOKCSystem';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it('scrolls to the top of the page whenever a tab is opened', () => {
  const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  render(<MultiLingualOKCSystem />);
  scrollTo.mockClear();

  const walkingTab = screen.getByRole('button', { name: /Personal Translator™ in Your Phone/i });
  fireEvent.click(walkingTab);
  expect(scrollTo).toHaveBeenCalledWith(0, 0);

  const freePassTab = screen.getByRole('button', { name: /7-Day Free Pass/i });
  fireEvent.click(freePassTab);
  expect(scrollTo).toHaveBeenCalledWith(0, 0);
});
