import QrPhotoFooter from './QrPhotoFooter';
import { useEffect, useState } from 'react';
import { Mail, MessageSquare, Copy, Share2 } from 'lucide-react';
import { cleanCallShareLink, shareCallLink } from '@/lib/call-share-actions';
import { callShareActionCopy } from '@/lib/call-share-action-copy';
import { isPublicTranslatorHash } from '@/lib/public-translator-link';
import { publicTranslatorSharingCopy } from '@/lib/qr-access-copy';
import { Button } from '@/components/ui/button';
import { callShareHref, callSharingLabels, callSharingInstructions } from '@/lib/shared-call-entry';
export default function CallSharing({ link: rawLink, locale }: { link: string; locale: string }) {
  const link = rawLink ? cleanCallShareLink(rawLink) : '';
  const actions = callShareActionCopy[locale as keyof typeof callShareActionCopy] ?? callShareActionCopy.en;
  const [message, setMessage] = useState('');
  const c = callSharingLabels[locale as keyof typeof callSharingLabels] ?? callSharingLabels.en;
  const instructions = link && isPublicTranslatorHash(new URL(link).hash) ? publicTranslatorSharingCopy[locale as keyof typeof publicTranslatorSharingCopy] ?? publicTranslatorSharingCopy.en : callSharingInstructions[locale as keyof typeof callSharingInstructions] ?? callSharingInstructions.en;
  const [qr, setQr] = useState('');
  useEffect(() => {
    let alive = true; setQr('');
    void import('qrcode').then(m => m.toDataURL(link, { width: 256, margin: 4 })).then(image => { if (alive) setQr(image); }).catch(() => {});
    return () => { alive = false; };
  }, [link]);
  useEffect(() => {
    if (!link) return;
    try {
      const hash = new URL(link).hash;
      if (!hash.startsWith('#talk-') && !hash.startsWith('#meeting-')) return;
      const room = hash.slice(1);
      sessionStorage.setItem('ml-call-caller', room);
      sessionStorage.setItem('ml-call-room', room);
    } catch { /* */ }
  }, [link]);
  function joinThisQrRoom() {
    if (!link) return;
    try {
      const hash = new URL(link).hash;
      if (!hash) return;
      if (window.location.hash !== hash) window.location.hash = hash;
      else window.dispatchEvent(new CustomEvent('ml-open-call', { detail: { immediate: true } }));
    } catch { /* */ }
  }
  if (!link) return null;
  return <div data-call-sharing className="w-full space-y-3">
    <p data-call-share-instructions className="text-center text-sm leading-relaxed text-muted-foreground">{instructions}</p>
    <Button type="button" className="h-auto w-full whitespace-normal font-bold" onClick={joinThisQrRoom}>
      {locale === 'es' ? 'Unirme por este QR (conexión automática)' :
       locale === 'zh' ? '通过此二维码加入（自动连接）' :
       locale === 'de' ? 'Über diesen QR beitreten (automatisch)' :
       locale === 'tl' ? 'Sumali sa QR na ito (awtomatikong koneksyon)' :
       locale === 'ja' ? 'このQRで参加（自動接続）' :
       'Join on this QR (auto-connect)'}
    </Button>
    <div className="qr-plate mx-auto grid aspect-square w-full max-w-48 place-items-center">{qr ? <img data-call-share-qr src={qr} alt={c.qr} width={256} height={256} className="h-auto w-full" /> : <span role="status" className="text-ink">…</span>}</div>
    <QrPhotoFooter locale={locale}/>
    <div className="grid grid-cols-2 gap-2">
      <Button asChild variant="outline"><a data-call-share-text href={callShareHref('text', link)}><MessageSquare />{c.text}</a></Button>
      <Button asChild variant="outline"><a data-call-share-email href={callShareHref('email', link)}><Mail />{c.email}</a></Button>
    </div>
    <div className="grid grid-cols-2 gap-2">
      <Button data-call-share-copy variant="outline" onClick={() => { if (!navigator.clipboard?.writeText) { setMessage(actions.fallback); return; } void navigator.clipboard.writeText(link).then(() => setMessage(actions.copied)).catch(() => setMessage(actions.fallback)); }}><Copy />{actions.copy}</Button>
      <Button data-call-share-native variant="outline" onClick={() => void shareCallLink(link).then(result => { if (result === 'fallback') setMessage(actions.fallback); })}><Share2 />{actions.share}</Button>
    </div>
    {message && <p role="status" className="text-center text-sm">{message}</p>}
    <input data-call-share-link aria-label={actions.label} value={link} readOnly onFocus={event => event.target.select()} className="w-full min-w-0 rounded-md border border-border bg-background p-2 text-sm text-foreground" />
  </div>;
}