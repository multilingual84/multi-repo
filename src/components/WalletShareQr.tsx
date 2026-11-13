import { useEffect, useState } from 'react';
import { Copy, Lock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { personalCodeCopy, personalCodeLink } from '@/lib/personal-code';
import { signInWallCopy } from '@/lib/signin-wall-copy';
import type { UILocale } from '@/lib/ui-copy';

/** The signed-in person's own share QR, shown inside the wallet with sharing steps. */
export default function WalletShareQr({ locale, id }: { locale: UILocale; id: string }) {
  const c = signInWallCopy[locale] ?? signInWallCopy.en;
  const codeCopy = personalCodeCopy[locale] ?? personalCodeCopy['en'];
  const [img, setImg] = useState(''), [link, setLink] = useState(''), [copied, setCopied] = useState(false);
  useEffect(() => {
    let alive = true; const url = personalCodeLink(window.location.origin, id); setLink(url);
    void import('qrcode').then(m => m.toDataURL(url, { width: 360, margin: 4, errorCorrectionLevel: 'M' })).then(d => { if (alive) setImg(d); }).catch(() => {});
    return () => { alive = false; };
  }, [id]);
  async function copy() { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard optional */ } }
  async function share() { if (navigator.share) { try { await navigator.share({ url: link, title: 'Multi-Lingual™' }); return; } catch { return; } } await copy(); }
  return <section data-wallet-share-qr className="space-y-3 rounded-2xl border-2 border-orange bg-card p-4 text-center">
    <h3 className="text-lg font-black">{c.myQr}</h3>
    {img && <div className="qr-plate mx-auto w-full max-w-80 rounded-lg p-2"><img src={img} alt={c.myQr} width={360} height={360} className="aspect-square w-full" /></div>}
    <p data-wallet-code-pin className="flex items-center justify-center gap-2 text-sm font-bold"><Lock size={16} className="text-voice-ready" />{codeCopy?.protectedLine}</p>
    <p className="text-sm leading-snug text-muted-foreground">{codeCopy?.useElsewhere}</p>
    <ol className="list-decimal space-y-1 pl-5 text-left text-sm">{c.myQrSteps.map(s => <li key={s}>{s}</li>)}</ol>
    <div className="flex flex-wrap justify-center gap-2">
      <Button className="bg-orange text-orange-foreground hover:bg-orange/90" onClick={() => void share()}><Share2 size={16} />{c.share}</Button>
      <Button className="bg-orange text-orange-foreground hover:bg-orange/90" onClick={() => void copy()}><Copy size={16} />{copied ? c.copied : c.copy}</Button>
    </div>
  </section>;
}
