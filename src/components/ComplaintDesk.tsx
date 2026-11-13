import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { complaintCopy } from '@/lib/complaint-copy';
import { formatRefund } from '@/lib/complaints';
import { getComplaintStatus, submitComplaint } from '@/lib/complaints.functions';
import { getCredentialHandle } from '@/lib/free-session';
import type { UILocale } from '@/lib/ui-copy';
import ComplaintAssistant from '@/components/ComplaintAssistant';

type Status = Awaited<ReturnType<typeof getComplaintStatus>>;

export default function ComplaintDesk({ locale }: { locale: UILocale }) {
  const copy = complaintCopy[locale];
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState<Status | undefined>(undefined);

  async function send() {
    setSending(true);
    setError('');
    try {
      const result = await submitComplaint({ data: { credentialHandle: getCredentialHandle(), contact, message } });
      setSent(result.reference);
      setContact('');
      setMessage('');
    } catch {
      setError(copy.error);
    } finally {
      setSending(false);
    }
  }

  async function check() {
    setChecking(true);
    setError('');
    try {
      setChecked(await getComplaintStatus({ data: { reference } }));
    } catch {
      setChecked(null);
    } finally {
      setChecking(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-2xl border border-border bg-card p-8">
      <h2 className="text-2xl font-black uppercase leading-tight">{copy.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.intro}</p>
      <ComplaintAssistant locale={locale}/>

      <label className="mt-6 block text-xs font-bold uppercase">{copy.contactLabel}</label>
      <input
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder={copy.contactPlaceholder}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <label className="mt-4 block text-xs font-bold uppercase">{copy.messageLabel}</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={copy.messagePlaceholder}
        rows={5}
        className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
      />
      <Button onClick={send} disabled={sending} className="mt-4 max-w-full whitespace-normal">
        {sending ? copy.submitting : copy.submit}
      </Button>
      {error && <p className="mt-3 text-sm font-bold text-destructive">{error}</p>}

      {sent && (
        <div className="mt-6 rounded-xl border border-thunder bg-thunder p-4 text-ink">
          <p className="text-sm font-black uppercase">{copy.sentTitle}</p>
          <p className="mt-1 text-xs font-bold uppercase">{copy.yourReference}</p>
          <p className="font-mono text-lg font-black" translate="no">{sent}</p>
          <p className="mt-2 text-xs leading-relaxed">{copy.sentNotice}</p>
        </div>
      )}

      <div className="mt-8 border-t border-border pt-6">
        <p className="text-sm font-black uppercase">{copy.checkTitle}</p>
        <label className="mt-3 block text-xs font-bold uppercase">{copy.checkLabel}</label>
        <div className="mt-1 flex flex-wrap gap-2">
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="ML-XXXX-XXXX"
            translate="no"
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
          />
          <Button onClick={check} disabled={checking} variant="outline" className="max-w-full whitespace-normal">
            {copy.checkButton}
          </Button>
        </div>
        {checked === null && <p className="mt-3 text-sm text-muted-foreground">{copy.notFound}</p>}
        {checked?.status === 'pending' && <p className="mt-3 text-sm text-muted-foreground">{copy.pending}</p>}
        {checked?.status === 'declined' && (
          <p className="mt-3 text-sm text-muted-foreground">
            <span className="font-black uppercase">{copy.declined}</span> — {checked.resolutionNote}
          </p>
        )}
        {checked?.status === 'approved' && (
          <div className="mt-3 rounded-xl border border-thunder bg-thunder p-4 text-ink">
            <p className="text-sm font-black uppercase">{copy.approved}</p>
            <p className="mt-1 text-sm leading-relaxed">{checked.resolutionNote}</p>
            {checked.freeUntil && (
              <p className="mt-2 text-xs font-bold uppercase">
                {new Date(checked.freeUntil).toLocaleDateString(locale === 'ja' ? 'ja-JP' : locale)}
              </p>
            )}
            {checked.refundAmountCents != null && (
              <p className="mt-1 font-mono text-sm font-black" translate="no">
                {formatRefund(checked.refundAmountCents, checked.refundCurrency)}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
