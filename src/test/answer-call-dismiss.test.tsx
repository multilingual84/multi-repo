import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AnswerCallScreen from '@/components/AnswerCallScreen';

vi.mock('@/context/TranslationContext', () => ({ useTranslationState: () => ({ activeLanguage: 'en' }) }));
vi.mock('@/components/CallAudioControls', () => ({ default: () => null }));
afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); vi.restoreAllMocks(); });

it('closes a shared call and removes its fragment so refresh does not reopen it', () => {
  window.history.replaceState(null, '', '/?test=1#meeting-abc');
  const view = render(<AnswerCallScreen />);
  fireEvent.click(view.getByRole('button', { name: 'Close call screen' }));
  expect(view.queryByRole('dialog')).toBeNull();
  expect(window.location.hash).toBe('');
  expect(window.location.search).toBe('?test=1');
});

it('closes on Escape or navigation out of the shared call', () => {
  window.history.replaceState(null, '', '/#meeting-abc');
  const view = render(<AnswerCallScreen />);
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(view.queryByRole('dialog')).toBeNull();
  act(() => { window.location.hash = 'meeting-def'; window.dispatchEvent(new HashChangeEvent('hashchange')); });
  expect(view.getByRole('dialog')).toBeInTheDocument();
  act(() => { window.location.hash = 'pricing'; window.dispatchEvent(new HashChangeEvent('hashchange')); });
  expect(view.queryByRole('dialog')).toBeNull();
});

it('stops microphone permission arriving after dismissal instead of reopening the call', async () => {
  let resolveCapture: ((stream: MediaStream) => void) | undefined;
  const stop = vi.fn();
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: () => new Promise<MediaStream>(resolve => { resolveCapture = resolve; }) } });
  window.history.replaceState(null, '', '/#meeting-abc');
  const view = render(<AnswerCallScreen />);
  fireEvent.click(view.getByRole('button', { name: /^Answer$/ }));
  fireEvent.click(view.getByRole('button', { name: 'Continue' }));
  fireEvent.click(view.getByRole('button', { name: 'Close call screen' }));
  await act(async () => { resolveCapture?.({ getTracks: () => [{ stop }] } as unknown as MediaStream); });
  expect(stop).toHaveBeenCalledOnce();
  expect(view.queryByRole('dialog')).toBeNull();
});