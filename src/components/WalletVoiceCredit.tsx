import {useEffect,useState,type ReactNode} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import type {UILocale} from '@/lib/ui-copy';
import {walletClarityCopy} from '@/lib/wallet/clarity';
import {compactCopy} from '@/lib/wallet/compact-copy';
import WalletAccountSettings from './WalletAccountSettings';
import {walletSettingsCopy} from '@/lib/wallet/settings-copy';
import WalletPlanPayments from './WalletPlanPayments';
import {readWalletPrivacy,WALLET_SETTINGS_EVENT} from '@/lib/wallet/privacy';
export default function WalletVoiceCredit({locale,days,children}:{locale:UILocale;compact?:boolean;days?:number;children?:ReactNode}){
 const [manage,setManage]=useState(false),c=compactCopy[locale];
 const [hide,setHide]=useState(false);
 useEffect(()=>{const sync=()=>setHide(readWalletPrivacy().hide);sync();window.addEventListener(WALLET_SETTINGS_EVENT,sync);return()=>window.removeEventListener(WALLET_SETTINGS_EVENT,sync);},[]);
 const stats=<dl className="border-b border-border py-3"><div data-wallet-plan-days><dt className="text-muted-foreground">{walletClarityCopy[locale].days}</dt><dd className="text-xl font-black">{days??0}</dd></div></dl>;
 return <section data-wallet-plan className="space-y-3 text-xs"><h3 className="font-bold">{walletSettingsCopy[locale].plan}</h3>{stats}<Button variant="outline" className="w-full" onClick={()=>setManage(true)}>{c.manage}</Button><Dialog open={manage} onOpenChange={setManage}><DialogContent data-wallet-account className="max-w-lg"><DialogHeader><DialogTitle>{c.manage}</DialogTitle><DialogDescription>{walletSettingsCopy[locale].plan}</DialogDescription></DialogHeader><div className="space-y-4">{stats}<WalletAccountSettings locale={locale}/><Button variant="outline" onClick={()=>window.dispatchEvent(new Event('ml-open-pricing'))}>{walletClarityCopy[locale].plans}</Button><WalletPlanPayments locale={locale} hide={hide} refresh={0}/>{children}<Button variant="outline" className="w-full" onClick={()=>setManage(false)}>{c.close}</Button></div></DialogContent></Dialog></section>;
}
