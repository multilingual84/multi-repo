import WalletVoiceCredit from './WalletVoiceCredit';
import {compactCopy} from '@/lib/wallet/compact-copy';
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription,DialogFooter} from '@/components/ui/dialog';
import {premiumCopy} from '@/lib/premium/copy';
import {premiumSessionCopy} from '@/lib/premium/session-copy';
import {SPEND_REMINDER_KEY} from '@/lib/premium/session-ui';
import type {UILocale} from '@/lib/ui-copy';
export default function PremiumSpendNotice({locale,open,onAgree,onCancel}:{locale:UILocale;open:boolean;onAgree:()=>void;onCancel:()=>void}){
 const c=compactCopy[locale];
 return <Dialog open={open} onOpenChange={v=>{if(!v)onCancel();}}><DialogContent data-premium-spend className="max-w-md"><DialogHeader><div className="text-center text-3xl" aria-hidden>🛑</div><DialogTitle className="text-center">{c.warning}</DialogTitle><DialogDescription className="text-center">{c.billing}</DialogDescription></DialogHeader><WalletVoiceCredit locale={locale} compact/><DialogFooter className="gap-2"><Button variant="outline" onClick={onCancel}>{c.close}</Button><Button onClick={onAgree}>{c.continue}</Button></DialogFooter></DialogContent></Dialog>;
}
