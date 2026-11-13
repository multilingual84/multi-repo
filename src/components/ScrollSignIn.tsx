import { LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import WalletSignedIn from './WalletSignedIn';
import type {UILocale} from '@/lib/ui-copy';

/** Sign in bar sits in the normal page flow under the top menu: it scrolls away
 *  with the page and is back when the visitor returns to the top. No scroll
 *  listener, so nothing at the top can flicker while scrolling. */
export default function ScrollSignIn({label,onSignIn,signedIn=false,locale='en'}:{label:string;onSignIn:()=>void;signedIn?:boolean;locale?:UILocale}) {
 return <div data-scroll-signin data-visible="true" className="relative z-30 h-11">
  <div className="flex h-full items-center justify-center border-b border-border bg-background/95">
    <Button variant="outline" data-wallet-tab onClick={onSignIn} className="h-auto min-w-0 whitespace-normal px-6 py-1 text-xs">{signedIn?<WalletSignedIn locale={locale}/>:<><span aria-hidden data-signin-red-light className="h-2 w-2 shrink-0 rounded-full bg-destructive"/><LogIn size={16}/>{label}</>}</Button>
  </div>
 </div>;
}
