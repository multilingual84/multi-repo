import { act, cleanup, fireEvent, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import AnswerCallScreen from '@/components/AnswerCallScreen';

vi.mock('@/context/TranslationContext', () => ({ useTranslationState: () => ({ activeLanguage: 'en' }) }));
vi.mock('@/components/CallAudioControls', () => ({ default: () => null }));
// The peer connection dies: the call reports a failed connection.
vi.mock('@/lib/live-call', () => ({
  LiveCall: class {
    private ev: { onStatus: (s: string) => void };
    constructor(_room: string, _stream: MediaStream, _lang: string, ev: { onStatus: (s: string) => void }) { this.ev = ev; }
    start() { this.ev.onStatus('failed'); }
    setPremiumOutput() {}
    hangUp() {}
  },
}));

afterEach(() => { cleanup(); window.history.replaceState(null, '', '/'); vi.restoreAllMocks(); });

it('shows which networks the call can run on when the connection fails', async () => {
  const stream = { getTracks: () => [], getAudioTracks: () => [], getVideoTracks: () => [] } as unknown as MediaStream;
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: { getUserMedia: () => Promise.resolve(stream) } });
  window.history.replaceState(null, '', '/#meeting-abc');
  const view = render(<AnswerCallScreen />);
  await act(async () => { fireEvent.click(view.getByRole('button', { name: /^Answer$/ })); });
  await act(async () => { fireEvent.click(view.getByRole('button', { name: 'Continue' })); });

  expect(view.getByText('This call couldn’t connect')).toBeInTheDocument();
  expect(view.getByText(/private networks/)).toBeInTheDocument();
  expect(view.getByText(/Public Wi-Fi such as airports, restaurants and hotels/)).toBeInTheDocument();
  expect(view.getByText(/Switch to cellular data or a private Wi-Fi network/)).toBeInTheDocument();
});
