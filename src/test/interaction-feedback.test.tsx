import { fireEvent, render, cleanup } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import InteractionFeedback from '@/components/InteractionFeedback';

afterEach(() => { cleanup(); vi.useRealTimers(); });

it('responds to a single activation without intercepting the action', () => {
  vi.useFakeTimers();
  const action = vi.fn();
  const view = render(<><InteractionFeedback /><button onClick={action}><span>Choose</span></button></>);
  fireEvent.click(view.getByText('Choose'));
  expect(action).toHaveBeenCalledTimes(1);
  expect(view.getByRole('button')).toHaveAttribute('data-click-feedback', 'true');
  vi.advanceTimersByTime(360);
  expect(view.getByRole('button')).not.toHaveAttribute('data-click-feedback');
});

it('handles new links and restarts feedback on repeated clicks', () => {
  vi.useFakeTimers();
  const view = render(<InteractionFeedback />);
  const link = document.createElement('a');
  link.href = '#test';
  document.body.append(link);
  fireEvent.click(link);
  vi.advanceTimersByTime(300);
  fireEvent.click(link);
  vi.advanceTimersByTime(60);
  expect(link).toHaveAttribute('data-click-feedback', 'true');
  view.unmount();
  expect(link).not.toHaveAttribute('data-click-feedback');
  link.remove();
});

it('ignores disabled controls', () => {
  const view = render(<><InteractionFeedback /><button disabled>Disabled</button><button aria-disabled="true">Unavailable</button></>);
  view.getAllByRole('button').forEach(button => {
    fireEvent.click(button);
    expect(button).not.toHaveAttribute('data-click-feedback');
  });
});