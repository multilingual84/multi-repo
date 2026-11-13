import { walletClarityCopy } from '@/lib/wallet/clarity';
import type { UILocale } from '@/lib/ui-copy';
export default function WalletSignedIn({locale,signedIn=true}:{locale:UILocale;signedIn?:boolean}) { const copy=walletClarityCopy[locale]; return <span data-wallet-signed-in={signedIn?'true':'false'} className="inline-flex items-center gap-1 whitespace-normal text-[10px] font-bold"><span aria-hidden className={signedIn?'h-2 w-2 shrink-0 rounded-full bg-voice-ready':'h-2 w-2 shrink-0 rounded-full bg-destructive'}/>{signedIn?copy.signedIn:copy.signedOut}</span>; }
