import { useEffect, useState } from 'react';
import { Download, ExternalLink, Mail, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPassPreview, parsePassPreview, passTimeRemaining, passPreviewLink, PASS_PREVIEW_KEY, type PassPreview } from '@/lib/pass-preview';
import { passInterfaceCopy } from '@/lib/pass-interface-copy';
import type { UILocale } from '@/lib/ui-copy';
import AffiliateCoupon from '@/components/AffiliateCoupon';
import { useGuidedQrExport } from '@/hooks/use-guided-qr-export';
import QrSaveHint from '@/components/QrSaveHint';
import QrEarningFooter from '@/components/QrEarningFooter';

export function usePassInterface(enabled: boolean) {
  const [pass, setPass] = useState<PassPreview | null>(null);
  const [link, setLink] = useState('');
  const [qr, setQr] = useState('');
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let saved: PassPreview | null = null;
    try { saved = parsePassPreview(localStorage.getItem(PASS_PREVIEW_KEY)); } catch { /* Storage may be unavailable. */ }
    const preview = saved ?? pass ?? createPassPreview(crypto.randomUUID(), Date.now());
    try { localStorage.setItem(PASS_PREVIEW_KEY, JSON.stringify(preview)); } catch { /* Keep an in-memory preview. */ }
    setPass(preview);
    setLink(passPreviewLink(window.location.origin, preview));
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [enabled]);
  useEffect(() => {
    if (!link) return;
    let alive = true;
    import('qrcode').then(m => m.toDataURL(link, { width: 640, margin: 2 })).then(image => { if (alive) setQr(image); }).catch(() => { if (alive) setQr(''); });
    return () => { alive = false; };
  }, [link]);
  return { pass, link, qr, now };
}

export default function PassInterface({ locale, state, onOpen }: { locale: UILocale; state: ReturnType<typeof usePassInterface>; onOpen: () => void }) {
  const c = passInterfaceCopy[locale];
  const exportQr = useGuidedQrExport(state.qr);
  const [email, setEmail] = useState('');
  const [reminderState, setReminderState] = useState<'idle' | 'busy' | 'saved' | 'error'>('idle');
  async function saveReminder() {
    if (!state.pass || reminderState === 'busy') return;
    setReminderState('busy');
    try {
      const res = await fetch('/api/public/pass-reminder', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passId: state.pass.id, email: email.trim(), expiresAt: state.pass.expiresAt }),
      });
      setReminderState(res.ok ? 'saved' : 'error');
    } catch { setReminderState('error'); }
  }
  if (!state.pass) return null;
  const remaining = passTimeRemaining(state.pass.expiresAt, state.now);
  const values = [remaining.days, remaining.hours, remaining.minutes, remaining.seconds];
  return <div data-pass-interface className="mt-5 min-w-0 space-y-4 border-t border-ink/20 pt-5 text-ink">
    <h3 className="flex items-center justify-center gap-2 text-center font-black"><QrCode size={20}/>{c.title}</h3>
    {state.qr && <div data-qr-guide-box className="qr-plate mx-auto w-full max-w-xl space-y-2 rounded-xl p-3">
      <QrSaveHint locale={locale}/>
      <img data-pass-qr src={state.qr} width={224} height={224} alt={c.title} className="mx-auto h-56 w-56 max-w-full rounded-lg"/>
      <QrEarningFooter locale={locale}/>
    </div>}
    <div className="flex justify-center">
      <Button asChild disabled={!exportQr} className="h-auto max-w-full whitespace-normal bg-ink py-3 text-ink-foreground"><a href={exportQr || undefined} download="multilingual-meeting-qr.png"><Download size={16}/>{c.save}</a></Button>
    </div>
    <p className="text-center text-sm font-black">{c.time}</p>
    <dl data-pass-countdown className="grid grid-cols-4 gap-1 text-center sm:gap-3">
      {values.map((value, i) => <div key={i} className="min-w-0"><dd className="font-mono text-xl font-black tabular-nums sm:text-2xl">{String(value).padStart(2, '0')}</dd><dt className="break-words text-[11px] font-bold">{c.units[i]}</dt></div>)}
    </dl>
    <p className="text-center text-xs">{c.expires}: <time dateTime={new Date(state.pass.expiresAt).toISOString()}>{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(state.pass.expiresAt)}</time></p>
    {remaining.status !== 'running' && <p role="status" data-pass-expiry-notice className="rounded-lg bg-signal p-3 text-sm font-black text-ink">{remaining.status === 'ending' ? c.ending : c.expired}</p>}
    <p className="text-sm font-bold">{c.free}</p>
    <Button onClick={onOpen} className="h-auto w-full whitespace-normal bg-ink py-3 text-ink-foreground"><ExternalLink size={16}/>{c.open}</Button>
    <p className="text-xs leading-relaxed text-ink/80">{c.notice}</p>
    {reminderState === 'saved'
      ? <p role="status" data-pass-reminder-saved className="rounded-lg bg-voice-ready/20 p-3 text-center text-sm font-bold">{c.reminderSaved}</p>
      : <div data-pass-reminder className="space-y-2">
        <label className="block text-xs font-bold">{c.emailLabel}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} maxLength={254} aria-label={c.emailLabel}
            className="mt-1 min-h-11 w-full rounded-md border border-ink/30 bg-card p-2 text-sm text-foreground" />
        </label>
        <Button variant="outline" className="h-auto min-h-11 w-full whitespace-normal border-ink/30" disabled={reminderState === 'busy' || !/^\S+@\S+\.\S+$/.test(email.trim())} onClick={() => void saveReminder()}>
          <Mail size={16}/>{reminderState === 'busy' ? '…' : c.reminderButton}
        </Button>
        {reminderState === 'error' && <p role="alert" className="text-xs font-bold text-destructive">{c.reminderError}</p>}
      </div>}
    <AffiliateCoupon locale={locale} recipient/>
  </div>;
}
