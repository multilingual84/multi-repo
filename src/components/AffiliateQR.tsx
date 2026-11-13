import { useEffect, useState } from 'react';
import { Copy, Download, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { affiliateCopy } from '@/lib/affiliate-copy';
import { AFFILIATE_PREVIEW_KEY, affiliatePreviewLink, PARTNER_CODE_KEY, makePartnerCode, isPartnerCode } from '@/lib/affiliate-preview';
import type { UILocale } from '@/lib/ui-copy';
import AffiliateCoupon from '@/components/AffiliateCoupon';
import { useGuidedQrExport } from '@/hooks/use-guided-qr-export';
import QrSaveHint from '@/components/QrSaveHint';
import QrEarningFooter from '@/components/QrEarningFooter';
import { qrSharingText } from '@/lib/qr-sharing-copy';

const claimCopy: Record<string, string> = {
  en: 'Your partner code — save it, then email it to support@multi-lingual.tech to claim your 50% from paid purchases:',
  es: 'Tu código de socio: guárdalo y envíalo a support@multi-lingual.tech para cobrar tu 50% de las compras pagadas:',
  zh: '您的合作伙伴代码——请保存，并发送至 support@multi-lingual.tech 以领取已付款购买的50%：',
  de: 'Ihr Partnercode – speichern und an support@multi-lingual.tech senden, um Ihre 50% aus bezahlten Käufen anzufordern:',
  tl: 'Ang iyong partner code — i-save ito, saka i-email sa support@multi-lingual.tech para kunin ang iyong 50% mula sa bayad na pagbili:',
  ja: 'パートナーコード — 保存して support@multi-lingual.tech にメールし、有料購入の50%を請求してください：',
};

export default function AffiliateQR({ locale }: { locale: UILocale }) {
  const c = affiliateCopy[locale];
  const [link, setLink] = useState('');
  const [qr, setQr] = useState('');
  const [code, setCode] = useState('');
  const exportQr = useGuidedQrExport(qr);
  const [status, setStatus] = useState<'copied' | 'error' | null>(null);
  useEffect(() => {
    let id = '';
    try { id = localStorage.getItem(AFFILIATE_PREVIEW_KEY) ?? ''; } catch { /* Device storage is optional. */ }
    if (!/^[a-zA-Z0-9-]{20,80}$/.test(id)) id = crypto.randomUUID();
    try { localStorage.setItem(AFFILIATE_PREVIEW_KEY, id); } catch { /* Keep this visit usable. */ }
    let pc: string | null = null;
    try { pc = localStorage.getItem(PARTNER_CODE_KEY); } catch { /* optional */ }
    if (!isPartnerCode(pc)) pc = makePartnerCode(crypto.getRandomValues(new Uint8Array(8)));
    try { localStorage.setItem(PARTNER_CODE_KEY, pc); } catch { /* optional */ }
    setCode(pc);
    const url = affiliatePreviewLink(window.location.origin, id, pc);
    setLink(url);
    let alive = true;
    import('qrcode').then(m => m.toDataURL(url, { width: 640, margin: 4 })).then(image => { if (alive) setQr(image); }).catch(() => {});
    return () => { alive = false; };
  }, []);
  async function copy() {
    try { await navigator.clipboard.writeText(link); setStatus('copied'); } catch { setStatus('error'); }
  }
  async function share() {
    if (!navigator.share) { await copy(); return; }
    try { await navigator.share({ title: c.title, text: c.offer, url: link }); }
    catch (error) { if (!(error instanceof Error && error.name === 'AbortError')) await copy(); }
  }
  return <div data-affiliate-qr className="mt-6 min-w-0 space-y-4">
    <h3 className="font-bold">{c.title}</h3>
    <p className="text-sm font-semibold text-accent">{c.offer}</p>
    {qr && <div data-qr-guide-box className="mx-auto w-full max-w-xl space-y-2 rounded-xl bg-background p-3">
      <QrSaveHint locale={locale}/>
      <img src={qr} width={224} height={224} alt={c.title} className="mx-auto h-56 w-56 max-w-full rounded-lg" />
      <QrEarningFooter locale={locale}/>
    </div>}
    <p className="text-xs text-muted-foreground">{qrSharingText(locale).pending} {qrSharingText(locale).purchase}</p>
    <div className="flex flex-wrap justify-center gap-2">
      {qr && <Button asChild disabled={!exportQr} variant="outline" className="h-auto whitespace-normal"><a href={exportQr || undefined} download="multilingual-affiliate-qr.png"><Download size={16}/>{c.save}</a></Button>}
      <Button disabled={!link} onClick={() => void copy()} variant="outline" className="h-auto whitespace-normal"><Copy size={16}/>{c.copy}</Button>
      <Button disabled={!link} onClick={() => void share()} className="h-auto whitespace-normal"><Share2 size={16}/>{c.share}</Button>
    </div>
    <code data-affiliate-link translate="no" className="notranslate block select-all break-all rounded-xl border border-border bg-background p-3 text-sm text-accent">{link}</code>
    {code && <p data-partner-code className="text-sm">{claimCopy[locale] ?? claimCopy['en']} <strong translate="no" className="notranslate font-mono text-accent">{code}</strong></p>}
    {status && <p role="status" className="text-xs">{c[status]}</p>}
    <p className="text-xs leading-relaxed text-muted-foreground">{c.notice}</p>
    <AffiliateCoupon locale={locale}/>
  </div>;
}
