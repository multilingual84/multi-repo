import { useId, useState } from 'react';
import { Check, Copy, Ticket } from 'lucide-react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { couponCopy } from '@/lib/affiliate-coupon-copy';
import { applyCouponPassBonus, normalizeCoupon, validCoupon } from '@/lib/affiliate-coupon';
import { checkAffiliateCodeFn, claimAffiliateCodeFn, redeemAffiliateCodeFn } from '@/lib/referrals/partners.functions';
import type { UILocale } from '@/lib/ui-copy';
import { useTranslationState } from '@/context/TranslationContext';

export default function AffiliateCoupon({ locale, recipient = false }: { locale: UILocale; recipient?: boolean }) {
  const c = couponCopy[locale];
  const translationState = useTranslationState();
  const inputId = useId();
  const checkCode = useServerFn(checkAffiliateCodeFn);
  const claimCode = useServerFn(claimAffiliateCodeFn);
  const redeemCode = useServerFn(redeemAffiliateCodeFn);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('US');
  const [checked, setChecked] = useState('');
  const [saved, setSaved] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<keyof typeof c | null>(null);

  async function check() {
    if (busy) return;
    if (!validCoupon(code)) { setStatus('invalid'); return; }
    setBusy(true);
    try {
      if (recipient) {
        const result = await redeemCode({ data: { code: normalizeCoupon(code) } });
        if (result.ok) {
          applyCouponPassBonus();
          translationState?.setAffiliateToken(normalizeCoupon(code));
          setStatus('matched');
        } else setStatus('unknown');
        return;
      }
      const result = await checkCode({ data: { code: normalizeCoupon(code) } });
      setStatus(result); setChecked(result === 'available' ? normalizeCoupon(code) : '');
    } catch { setStatus('error'); }
    finally { setBusy(false); }
  }
  async function save() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await claimCode({ data: { code: checked, email: email.trim(), country: country.trim().toUpperCase() } });
      if ('taken' in result) { setStatus('taken'); setChecked(''); }
      else { setSaved(result.code); setStatus('saved'); }
    } catch (error) {
      setStatus(error instanceof Error && error.message.includes('wallet') ? 'walletNeeded' : 'error');
    } finally { setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(saved); setStatus('copied'); } catch { setStatus('error'); }
  }
  return <section data-affiliate-coupon={recipient ? 'recipient' : 'creator'} className="min-w-0 space-y-3 border-t border-border pt-5 text-foreground">
    <h3 className="flex items-center gap-2 font-bold"><Ticket className="shrink-0" size={20}/>{recipient ? c.recipientTitle : c.title}</h3>
    <p className="text-sm leading-relaxed">{recipient ? c.recipientOffer : c.offer}</p>
    <form onSubmit={event => { event.preventDefault(); void check(); }} className="space-y-3">
      <label htmlFor={inputId} className="block text-sm font-semibold">{c.label}</label>
      <Input id={inputId} value={code} onChange={event => { setCode(event.target.value); setChecked(''); setStatus(null); }} maxLength={24} autoComplete="off" autoCapitalize="characters" spellCheck={false} aria-describedby={`${inputId}-format`} className="notranslate min-h-11" translate="no"/>
      <p id={`${inputId}-format`} className="text-xs text-muted-foreground">{c.format}</p>
      {!recipient && <>
        <label className="block text-sm font-semibold">{c.emailLabel}
          <Input type="email" value={email} onChange={event => setEmail(event.target.value)} maxLength={254} autoComplete="email" className="mt-1 min-h-11"/>
        </label>
        <label className="block text-sm font-semibold">{c.countryLabel}
          <Input value={country} onChange={event => setCountry(event.target.value.toUpperCase())} maxLength={2} autoComplete="country" className="notranslate mt-1 min-h-11 w-24" translate="no"/>
        </label>
      </>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy || !code.trim()} variant="outline" className="h-auto min-h-11 whitespace-normal"><Check size={16}/>{recipient ? c.apply : c.check}</Button>
        {!recipient && <Button type="button" disabled={busy || !checked || checked !== normalizeCoupon(code) || !email.trim() || !/^[A-Z]{2}$/.test(country)} onClick={() => void save()} className="h-auto min-h-11 whitespace-normal"><Ticket size={16}/>{c.save}</Button>}
        {!recipient && saved && <Button type="button" onClick={() => void copy()} variant="outline" className="h-auto min-h-11 whitespace-normal"><Copy size={16}/>{c.copy}</Button>}
      </div>
    </form>
    {!recipient && saved && <code data-saved-coupon translate="no" className="notranslate block break-all font-mono text-lg font-bold text-accent">{saved}</code>}
    {status && <p role="status" className="text-sm leading-relaxed">{c[status]}</p>}
    {!recipient && <p className="text-xs leading-relaxed text-muted-foreground">{c.notice}</p>}
  </section>;
}
