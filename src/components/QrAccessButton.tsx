import {useEffect,useState} from 'react';
import {FREE_DAILY_MINUTES} from '@/lib/free-allowance-policy';
import {QrCode} from 'lucide-react';
import {Button} from './ui/button';
import {walletStateFn} from '@/lib/wallet/access.functions';
import {qrAccessCopy} from '@/lib/qr-access-copy';
import type {UILocale} from '@/lib/ui-copy';
export default function QrAccessButton({locale,onOpen}:{locale:UILocale;onOpen:()=>void}){const c=qrAccessCopy[locale];const [state,setState]=useState<Awaited<ReturnType<typeof walletStateFn>>|null>(null);useEffect(()=>{let alive=true;const refresh=()=>void walletStateFn().then(v=>{if(alive)setState(v);}).catch(()=>{});refresh();window.addEventListener('ml-wallet-change',refresh);window.addEventListener('ml-access-revoked',refresh);return()=>{alive=false;window.removeEventListener('ml-wallet-change',refresh);window.removeEventListener('ml-access-revoked',refresh);};},[]);const days=state?.renewsAt?Math.max(0,Math.ceil((Date.parse(state.renewsAt)-Date.now())/86400000)):0;return <Button variant="outline" data-qr-access-button title={c.access} onClick={onOpen} className="h-auto min-w-0 shrink-0 gap-1 px-2 py-1 text-[10px]"><QrCode size={18}/><span className="flex flex-col text-right"><span>{c.days}: {days}</span><span>{c.minutes}: {state?Math.ceil(state.remainingSeconds/60):FREE_DAILY_MINUTES}</span></span></Button>;}