import {cleanup,fireEvent,render} from '@testing-library/react';
import {afterEach,expect,it,vi} from 'vitest';
import WalletAccountSettings from '@/components/WalletAccountSettings';
import {readWalletPrivacy,saveWalletPrivacy,voiceCreditAlert,WALLET_PRIVACY_KEY,WALLET_SETTINGS_EVENT} from '@/lib/wallet/privacy';
afterEach(()=>{cleanup();localStorage.removeItem(WALLET_PRIVACY_KEY);});
it('persists payment privacy without changing retired credit settings',()=>{
 const changed=vi.fn();window.addEventListener(WALLET_SETTINGS_EVENT,changed);
 const view=render(<WalletAccountSettings locale="en"/>);
 fireEvent.click(view.getByRole('switch',{name:'Hide payment amounts'}));
 expect(readWalletPrivacy().hide).toBe(true);
 expect(readWalletPrivacy().threshold).toBe(.1);
 expect(changed).toHaveBeenCalledTimes(1);
 window.removeEventListener(WALLET_SETTINGS_EVENT,changed);
});
it('preserves zero-credit protection independently of optional low-credit warnings',()=>{
 saveWalletPrivacy({hide:true,autoLock:false,alerts:false,threshold:1});
 expect(readWalletPrivacy()).toEqual({hide:true,autoLock:false,alerts:false,threshold:1});
 expect(voiceCreditAlert(0,readWalletPrivacy().threshold)).toBe('zero');
});
it('falls back safely for malformed saved settings',()=>{
 localStorage.setItem(WALLET_PRIVACY_KEY,'{"threshold":-5,"alerts":"false"}');
 expect(readWalletPrivacy().threshold).toBe(.1);
 expect(readWalletPrivacy().alerts).toBe(true);
});