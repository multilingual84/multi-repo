import {useEffect,useState} from 'react';
import {Switch} from '@/components/ui/switch';
import {defaultWalletPrivacy,readWalletPrivacy,saveWalletPrivacy,WALLET_SETTINGS_EVENT} from '@/lib/wallet/privacy';
import {walletUiCopy} from '@/lib/wallet/ui-copy';
import {walletSettingsCopy} from '@/lib/wallet/settings-copy';
import type {UILocale} from '@/lib/ui-copy';

export default function WalletAccountSettings({locale}:{locale:UILocale}){
 const c=walletUiCopy[locale],[settings,setSettings]=useState(defaultWalletPrivacy);
 useEffect(()=>{const sync=()=>setSettings(readWalletPrivacy());sync();window.addEventListener(WALLET_SETTINGS_EVENT,sync);return()=>window.removeEventListener(WALLET_SETTINGS_EVENT,sync);},[]);
 const change=(next:typeof settings)=>{setSettings(next);try{saveWalletPrivacy(next);}catch{}};
 return <section data-wallet-settings className="space-y-3 border-b border-border pb-4 text-xs">
  <h3 className="font-bold">{walletSettingsCopy[locale].settings}</h3>
  {(['hide','autoLock'] as const).map(key=><label key={key} className="flex items-center justify-between gap-3"><span>{key==='hide'?walletSettingsCopy[locale].hide:c.lock}</span><Switch aria-label={key==='hide'?walletSettingsCopy[locale].hide:c.lock} checked={settings[key]} onCheckedChange={value=>change({...settings,[key]:value})}/></label>)}
 </section>;
}