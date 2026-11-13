import { useEffect, useState } from 'react';
import { formatUsd } from '@/lib/staging/pricing';
import { referralLink } from '@/lib/staging/local-pricing';

type Earnings = { heldCents: number; payableCents: number; paidCents: number; referrals: number };

export default function ReferralQr({ code, earnings }: { code: string; earnings: Earnings }) {
  const [qr, setQr] = useState('');
  const [link, setLink] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const url = referralLink(code);
    setLink(url);
    void import('qrcode').then(m => m.toDataURL(url, { margin: 2, width: 240 })).then(setQr).catch(() => setQr(''));
  }, [code]);
  async function share() {
    if (navigator.share) { try { await navigator.share({ title: 'Bricktown Staging Lab', url: link }); return; } catch { /* fall through */ } }
    await navigator.clipboard?.writeText(link); setCopied(true);
  }
  return (
    <div className="space-y-3">
      {qr && <img src={qr} alt="Your referral QR code" className="mx-auto h-48 w-48 rounded-xl bg-[#FFFFFF] p-2" />}
      <p className="text-[11px] text-stage-muted">Point any phone camera at this code — it opens the site with your referral attached.</p>
      <p className="font-mono text-xs text-stage-gold" translate="no">{code}</p>
      <button onClick={() => void share()} className="rounded-xl bg-stage-gold px-5 py-2.5 text-xs font-black uppercase tracking-wider text-stage-gold-ink">{copied ? 'Link copied' : 'Share my link'}</button>
      <div className="grid grid-cols-3 gap-2 text-[11px]">
        <div className="rounded-lg border border-stage-line p-2"><div className="text-stage-muted">Clearing</div><div className="font-mono font-bold">{formatUsd(earnings.heldCents)}</div></div>
        <div className="rounded-lg border border-stage-line p-2"><div className="text-stage-muted">Next weekly payout</div><div className="font-mono font-bold">{formatUsd(earnings.payableCents)}</div></div>
        <div className="rounded-lg border border-stage-line p-2"><div className="text-stage-muted">Paid</div><div className="font-mono font-bold">{formatUsd(earnings.paidCents)}</div></div>
      </div>
    </div>
  );
}
