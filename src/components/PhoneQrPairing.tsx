import { useEffect, useState } from 'react';
import { Copy, QrCode, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { newRoomId } from '@/lib/call-room';
import { phonePairingCopy, phonePairingLink } from '@/lib/phone-pairing';
import type { UILocale } from '@/lib/ui-copy';
import CallSharing from './CallSharing';

export default function PhoneQrPairing({ locale }: { locale: UILocale }) {
  const c = phonePairingCopy[locale];
  const [open, setOpen] = useState(false);
  const [link, setLink] = useState('');
  const [qr, setQr] = useState('');
  const [failed, setFailed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!open || !link) return;
    let alive = true;
    setFailed(false);
    void import('qrcode').then(m => m.toDataURL(link, { width: 320, margin: 4, errorCorrectionLevel: 'M' }))
      .then(image => { if (alive) setQr(image); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [open, link, retry]);
  function show() {
    setLink(phonePairingLink(window.location.origin, newRoomId()));
    setQr(''); setCopied(false); setOpen(true);
  }
  function start() {
    const room = new URL(link).hash.slice(1);
    try { localStorage.setItem('ml-call-caller', room); } catch { /* optional storage */ }
    setOpen(false);
    window.location.hash = room;
    window.dispatchEvent(new Event('ml-open-call'));
  }
  return <>
    <Button data-phone-qr-pairing variant="outline" size="icon" title={c.title} aria-label={c.title} onClick={show} className="shrink-0 border-signal bg-background text-signal"><QrCode /></Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-sm" data-phone-pairing-dialog>
        <DialogHeader><DialogTitle>{c.title}</DialogTitle><DialogDescription>{c.scan}</DialogDescription></DialogHeader>
        <CallSharing link={link} locale={locale} />
        {failed && <Button variant="outline" onClick={() => setRetry(v => v + 1)}>{c.retry}</Button>}
        <Button disabled={!qr} onClick={start}><Phone />{c.start}</Button>
        <Button variant="outline" onClick={() => { void navigator.clipboard.writeText(link).then(() => setCopied(true)).catch(() => setCopied(false)); }}><Copy />{c.copy}</Button>
        {copied && <p role="status" className="text-center text-sm">{c.copied}</p>}
        <Button variant="ghost" onClick={() => setOpen(false)}>{c.close}</Button>
      </DialogContent>
    </Dialog>
  </>;
}