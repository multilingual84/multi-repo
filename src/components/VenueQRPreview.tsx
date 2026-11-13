import { useEffect, useState } from 'react';
import { Download, Printer, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { venueQrCopy } from '@/lib/venue-qr-copy';
import { publicTranslatorLink } from '@/lib/public-translator-link';
import type { UILocale } from '@/lib/ui-copy';
import { useGuidedQrExport } from '@/hooks/use-guided-qr-export';
import QrSaveHint from '@/components/QrSaveHint';
import QrEarningFooter from '@/components/QrEarningFooter';
import { qrSharingText } from '@/lib/qr-sharing-copy';
import type { QrPurpose } from '@/lib/qr-sharing-policy';
import { AFFILIATE_PREVIEW_KEY, affiliatePreviewLink } from '@/lib/affiliate-preview';
import stopHand from '@/assets/qr-stop-hand.png';

export default function VenueQRPreview({ locale }: { locale: UILocale }) {
  const c = venueQrCopy[locale];
  const sharingCopy = qrSharingText(locale);
  const [purpose, setPurpose] = useState<QrPurpose>('business');
  const [sharingLink, setSharingLink] = useState('');
  const [sharingQr, setSharingQr] = useState('');
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState('');
  const [qr, setQr] = useState('');
  const shownQr = purpose === 'business' ? qr : sharingQr;
  const shownLink = purpose === 'business' ? link : sharingLink;
  const exportQr = useGuidedQrExport(shownQr);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!open) return;
    let alive = true;
    setError(false);
    let id = '';
    try { id = localStorage.getItem('multilingual-venue-qr-preview') ?? ''; } catch { /* Storage is optional. */ }
    if (!/^[a-zA-Z0-9-]{20,80}$/.test(id)) id = crypto.randomUUID();
    try { localStorage.setItem('multilingual-venue-qr-preview', id); } catch { /* Remain usable without storage. */ }
    const url = link || publicTranslatorLink(window.location.origin, id);
    setLink(url);
    import('qrcode').then(m => m.toDataURL(url, { width: 768, margin: 4, errorCorrectionLevel: 'M' })).then(image => {
      if (alive) setQr(image);
    }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [open, link]);
  useEffect(() => {
    if (!open || purpose !== 'sharing') return;
    let alive = true;
    let id = '';
    try { id = localStorage.getItem(AFFILIATE_PREVIEW_KEY) ?? ''; } catch { /* optional storage */ }
    if (!/^[a-zA-Z0-9-]{20,80}$/.test(id)) id = crypto.randomUUID();
    try { localStorage.setItem(AFFILIATE_PREVIEW_KEY, id); } catch { /* optional storage */ }
    const url = affiliatePreviewLink(window.location.origin, id);
    setSharingLink(url);
    import('qrcode').then(m => m.toDataURL(url, { width: 768, margin: 4, errorCorrectionLevel: 'M' })).then(image => { if (alive) setSharingQr(image); }).catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [open, purpose]);
  return <Dialog open={open} onOpenChange={setOpen}>
    <DialogTrigger asChild>
      <Button data-surround-copy variant="outline" className="qr-sharing-tab h-auto w-full whitespace-normal rounded-lg"><span className="qr-stop-hand" aria-hidden="true"><img src={stopHand} alt="" width={44} height={44}/></span><span className="min-w-0">{sharingCopy.invitation}</span></Button>
    </DialogTrigger>
    <DialogContent data-venue-qr className="venue-qr-dialog max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg text-center">
      <DialogTitle className="px-12 text-center text-xl font-black leading-snug">{purpose === 'business' ? c.title : sharingCopy.title}</DialogTitle>
      <DialogDescription className="text-center">{c.notice}</DialogDescription>
      <div data-qr-purpose-controls className="grid grid-cols-[1fr_auto_1fr] items-center gap-2" role="group" aria-label={sharingCopy.title}>
        <Button variant={purpose === 'sharing' ? 'default' : 'outline'} aria-pressed={purpose === 'sharing'} className="h-auto whitespace-normal py-3" onClick={() => setPurpose('sharing')}>{sharingCopy.sharing}</Button>
        <Switch data-qr-purpose-toggle checked={purpose === 'business'} onCheckedChange={(on) => setPurpose(on ? 'business' : 'sharing')} aria-label={sharingCopy.toggle} className="shrink-0 self-center" />
        <Button variant={purpose === 'business' ? 'default' : 'outline'} aria-pressed={purpose === 'business'} className="h-auto whitespace-normal py-3" onClick={() => setPurpose('business')}>{sharingCopy.business}</Button>
      </div>
      {shownQr && <div data-qr-guide-box className="mx-auto w-full max-w-xl space-y-2 rounded-xl bg-background p-3">
        <QrSaveHint locale={locale}/>
        <img data-venue-qr-image src={shownQr} width={288} height={288} alt={c.title} className="mx-auto aspect-square w-72 max-w-full"/>
        <QrEarningFooter locale={locale} purpose={purpose}/>
      </div>}
      {!shownQr && <p role="status">{error ? c.error : c.loading}</p>}
      {purpose === 'sharing' && <p data-qr-purpose-controls className="text-xs text-muted-foreground">{sharingCopy.pending} {sharingCopy.purchase}</p>}
      <p translate="no" className="notranslate break-all text-xs">{shownLink}</p>
      <div data-venue-actions className="flex flex-wrap justify-center gap-2">
        <Button disabled={!shownQr} onClick={() => window.print()}><Printer size={16}/>{c.print}</Button>
        <Button asChild disabled={!exportQr} variant="outline"><a href={exportQr || undefined} download="multilingual-venue-qr.png"><Download size={16}/>{c.save}</a></Button>
      </div>
    </DialogContent>
  </Dialog>;
}
