import { ExternalLink, Mail } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { qrSharingText } from '@/lib/qr-sharing-copy';
import { showQrEarnings, type QrPurpose } from '@/lib/qr-sharing-policy';
import PartnerPayments from './PartnerPayments';
import type {UILocale} from '@/lib/ui-copy';
import QrPhotoFooter from './QrPhotoFooter';

// Stripe's sign-up page receives the page language so it can open in the visitor's language when Stripe supports it.
export function stripeSignupUrl(lang: string) {
  const code = (lang || 'en').replace(/^gt:/, '').toLowerCase();
  return `https://dashboard.stripe.com/register?locale=${encodeURIComponent(code === 'tl' ? 'fil' : code)}`;
}

export default function QrEarningFooter({ locale, purpose = 'sharing' }: { locale: string; purpose?: QrPurpose }) {
  const c = qrSharingText(locale);
  if (!showQrEarnings(purpose)) return <QrPhotoFooter locale={locale}/>;
  return <div data-qr-earning-footer className="space-y-2 pt-2 text-center">
    <QrPhotoFooter locale={locale}/>
    <p className="text-base font-black text-signal">{c.earn}</p>
    <p className="text-sm font-bold text-signal">{c.signup}</p>
    <p className="text-xs font-semibold text-muted-foreground">{c.freeSignup}</p>
    <Dialog>
      <DialogTrigger asChild><Button variant="outline" className="h-auto max-w-full whitespace-normal"><span translate="no" className="notranslate qr-stripe-wordmark">stripe</span><ExternalLink size={16}/>{c.setup}</Button></DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogTitle>{c.setup}</DialogTitle>
        <DialogDescription>{c.stripeNote}</DialogDescription>
        <p className="text-sm font-bold text-signal">{c.freeSignup}</p>
        <p role="status" className="text-sm font-semibold">{c.pending}</p>
        <p className="text-sm">{c.purchase}</p>
        <PartnerPayments locale={(['en','es','zh','de','tl','ja'].includes(locale)?locale:'en') as UILocale}/>
        <Button asChild className="h-auto whitespace-normal"><a href={stripeSignupUrl(locale)} onClick={(e) => { const lang = document.documentElement.lang; if (lang) e.currentTarget.href = stripeSignupUrl(lang); }} target="_blank" rel="noopener noreferrer"><span translate="no" className="notranslate qr-stripe-wordmark">stripe</span><ExternalLink size={16}/>{c.setup}</a></Button>
      </DialogContent>
    </Dialog>
    <Button asChild variant="outline" className="h-auto whitespace-normal">
      <Link to="/reachout"><Mail size={16}/>{c.reachout}</Link>
    </Button>
  </div>;
}