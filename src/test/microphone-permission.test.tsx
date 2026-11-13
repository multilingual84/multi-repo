import { cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AnswerCallScreen from '@/components/AnswerCallScreen';
vi.mock('@/context/TranslationContext', () => ({ useTranslationState: () => ({ activeLanguage: 'en' }) }));
vi.mock('@/components/CallAudioControls', () => ({ default: () => null }));
afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); });
it('does not capture audio before the visitor continues past the notice', () => {
 const getUserMedia = vi.fn();
 Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia } });
 window.history.replaceState(null, '', '/#meeting-abc');
 const view = render(<AnswerCallScreen/>);
 fireEvent.click(view.getByRole('button', { name: /^Answer$/ }));
 expect(getUserMedia).not.toHaveBeenCalled();
 fireEvent.click(view.getByRole('button', { name: 'Cancel' }));
 expect(getUserMedia).not.toHaveBeenCalled();
});