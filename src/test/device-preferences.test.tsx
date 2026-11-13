import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { readDevicePreference, saveDevicePreference, readAudioRoute } from '@/lib/device-preferences';
import { useDevicePreference } from '@/hooks/use-device-preference';
afterEach(() => { cleanup(); localStorage.clear(); });
describe('remembered communication choices', () => {
  it('nearby starts enabled on a new device', () => {
    expect(readDevicePreference('ml-nearby-on', true)).toBe(true);
  });
  it('keeps nearby disabled after the user turns it off', () => {
    saveDevicePreference('ml-nearby-on', false);
    expect(readDevicePreference('ml-nearby-on', true)).toBe(false);
  });
  it('remembers speech detection off', () => {
    saveDevicePreference('ml-auto-detect', false);
    expect(readDevicePreference('ml-auto-detect', true)).toBe(false);
  });
  it('remembers headset and disabled noise reduction', () => {
    saveDevicePreference('ml-audio-route', 'headset');
    saveDevicePreference('ml-audio-enhanced', false);
    expect(readAudioRoute()).toBe('headset');
    expect(readDevicePreference('ml-audio-enhanced', true)).toBe(false);
  });
  it('restores a choice after remount and synchronizes mounted screens', async () => {
    function Choice({name}:{name:string}) {
      const [on,setOn]=useDevicePreference<boolean>('ml-auto-detect',true);
      return <input aria-label={name} type="checkbox" checked={on} onChange={e=>setOn(e.target.checked)}/>;
    }
    const first=render(<><Choice name="translator"/><Choice name="call"/></>);
    fireEvent.click(screen.getByLabelText('translator'));
    await waitFor(()=>expect((screen.getByLabelText('call') as HTMLInputElement).checked).toBe(false));
    first.unmount();
    render(<Choice name="returning"/>);
    await waitFor(()=>expect((screen.getByLabelText('returning') as HTMLInputElement).checked).toBe(false));
  });
});