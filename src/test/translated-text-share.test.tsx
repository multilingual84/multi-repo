import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import TranslatedTextDraft from '@/components/TranslatedTextDraft';
import { shareTranslatedText } from '@/lib/translated-text-share';

afterEach(() => { cleanup(); vi.restoreAllMocks(); });
it('does not send a translation until explicitly requested and shares the edited text', async () => {
  const share = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'share', { configurable: true, value: share });
  const view = render(<TranslatedTextDraft text="Hola" locale="en"/>);
  expect(share).not.toHaveBeenCalled();
  fireEvent.change(view.getByRole('textbox'), { target: { value: 'Hola Ana' } });
  fireEvent.click(view.getByRole('button', { name: 'Send translated text' }));
  await waitFor(() => expect(share).toHaveBeenCalledWith({ text: 'Hola Ana' }));
});
it('copies when native sharing is unavailable without claiming delivery', async () => {
  Object.defineProperty(navigator, 'share', { configurable: true, value: undefined });
  const writeText = vi.fn().mockResolvedValue(undefined);
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  expect(await shareTranslatedText(' Bonjour ')).toBe('copied');
  expect(writeText).toHaveBeenCalledWith('Bonjour');
});
it('does not copy or send after the share sheet is cancelled', async () => {
  Object.defineProperty(navigator, 'share', { configurable: true, value: vi.fn().mockRejectedValue(new DOMException('Cancelled', 'AbortError')) });
  const writeText = vi.fn();
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
  expect(await shareTranslatedText('Hola')).toBe('cancelled');
  expect(writeText).not.toHaveBeenCalled();
});