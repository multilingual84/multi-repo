import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Copy, Lock, Printer, Share2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PinKeypad from '@/components/PinKeypad';
import { createWalletFn, unlockWalletFn } from '@/lib/wallet/access.functions';
import { collectPreferences, encryptWallet, WALLET_STORAGE_KEY } from '@/lib/wallet/crypto';
import { saveSessionIdentity } from '@/lib/wallet/session-identity';
import { clearOpenedPersonalCode, getPersonalCode, openedPersonalCode, personalCodeCopy, personalCodeLink } from '@/lib/personal-code';
import type { UILocale } from '@/lib/ui-copy';

/**
 * Mints the visitor's own free-for-life code as soon as the screen opens, shows
 * the steps for keeping it, and lets a PIN be put on it. The PIN is checked by
 * the backend, so the code can be claimed on another phone by the person who
 * knows it. A visitor who only scans the code still talks without a PIN.
 */
export function PersonalCodeCard({ locale }: { locale: UILocale }) {
  const c = personalCodeCopy[locale] ?? personalCodeCopy['en']!;
  const create = useServerFn(createWalletFn), unlock = useServerFn(unlockWalletFn);
  const [code, setCode] = useState('');
  const [claiming, setClaiming] = useState(false);
  const [link, setLink] = useState('');
  const [img, setImg] = useState('');
  const [copied, setCopied] = useState(false);
  const [shown, setShown] = useState(true);
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [owned, setOwned] = useState(false);

  useEffect(() => {
    const own = getPersonalCode();
    const opened = openedPersonalCode();

    const target = opened && opened !== own ? opened : own;
    if (!target) return;
    setCode(target);
    setClaiming(!!opened && opened !== own);
    try { setOwned((JSON.parse(localStorage.getItem(WALLET_STORAGE_KEY) || 'null') as { id?: string } | null)?.id === target); }
    catch { setOwned(false); }
    const url = personalCodeLink(window.location.origin, target);
    setLink(url);
    let alive = true;
    void import('qrcode')
      .then(m => m.toDataURL(url, { width: 360, margin: 4, errorCorrectionLevel: 'M' }))
      .then(data => { if (alive) setImg(data); })
      .catch(() => { /* the link below still works without the picture */ });
    return () => { alive = false; };
  }, []);

  async function lockWithPin() {
    if (pin.length !== 4 || !nickname.trim() || !code) return;
    setBusy(true); setWrong(false);
    try {
      const identity = {
        version: 1 as const, id: code, nickname: nickname.trim(),
        language: (document.documentElement.lang || locale).replace(/^gt:/, ''),
        preferences: collectPreferences(),
      };
      const encrypted = await encryptWallet(identity, pin);
      if (claiming) await unlock({ data: { id: code, pin } });
      else { try { await create({ data: { id: code, pin } }); } catch { await unlock({ data: { id: code, pin } }); } }
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(encrypted));
      localStorage.setItem('ml-free-credential-handle', code);
      saveSessionIdentity(identity);
      window.dispatchEvent(new Event('ml-wallet-change'));
      clearOpenedPersonalCode();
      setOwned(true); setPin('');

    } catch { setWrong(true); }
    finally { setBusy(false); }
  }

  async function copy() {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { /* clipboard optional */ }
  }

  async function share() {
    if (navigator.share) { try { await navigator.share({ url: link, title: 'Multi-Lingual™' }); return; } catch { return; } }
    await copy();
  }

  if (!shown || !link) return null;

  return (
    <section data-personal-code-card className="personal-code-card qr-plate relative w-full space-y-3 rounded-2xl border-2 border-orange bg-card p-4 text-center">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-black leading-tight">{c.heading}</h3>
        <Button variant="ghost" size="icon" aria-label={c.exit} onClick={() => setShown(false)}><X size={16} /></Button>
      </div>
      {img && <img src={img} alt={c.heading} width={420} height={420} className="mx-auto aspect-square w-full max-w-96 rounded-lg bg-background" />}
      <p className="text-sm font-bold leading-snug">{c.codeLine}</p>
      <p data-personal-code-notice className="text-base font-bold leading-snug">{c.notice}</p>
      <p className="break-all text-[10px] text-muted-foreground">{link}</p>
      <div className="flex flex-wrap justify-center gap-2">
        <Button className="h-auto min-h-11 whitespace-normal" onClick={() => window.print()}><Printer size={16} />{c.print}</Button>
        <Button variant="outline" className="h-auto min-h-11 whitespace-normal" onClick={() => void copy()}><Copy size={16} />{copied ? c.copied : c.copy}</Button>
        <Button variant="outline" className="h-auto min-h-11 whitespace-normal" onClick={() => void share()}><Share2 size={16} />{c.share}</Button>
      </div>
      {owned
        ? <div data-personal-code-protected className="space-y-1 rounded-xl border-2 border-voice-ready bg-card p-3 text-left">
          <p className="flex items-center gap-2 text-sm font-black"><Lock size={16} />{c.protectedLine}</p>
          <p className="text-xs leading-snug text-muted-foreground">{c.useElsewhere}</p>
        </div>
        : <div data-personal-code-pin className="space-y-2 rounded-xl border-2 border-border bg-card p-3 text-left">
          <p className="text-sm font-black">{claiming ? c.claimHeading : c.pinHeading}</p>
          <p className="text-[11px] leading-snug text-muted-foreground">{claiming ? c.claimHint : c.pinHint}</p>
          <label className="block text-[11px] font-bold">{c.nickname}
            <input value={nickname} onChange={e => setNickname(e.target.value)} maxLength={40} aria-label={c.nickname}
              className="mt-1 min-h-11 w-full rounded-md border border-border bg-background p-2 text-sm" />
          </label>
          <PinKeypad label={c.pin} value={pin} onChange={setPin} disabled={busy} pad={false} />
          {wrong && <p role="alert" className="text-xs font-bold text-destructive">{c.wrong}</p>}
          <Button className="w-full" disabled={busy || pin.length !== 4 || !nickname.trim()} onClick={() => void lockWithPin()}>
            <Lock size={16} />{busy ? '…' : claiming ? c.claimButton : c.pinButton}
          </Button>
        </div>}
    </section>
  );
}

export default PersonalCodeCard;
