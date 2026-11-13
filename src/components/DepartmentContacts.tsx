import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { departmentFormCopy, departmentMessageSchema } from '@/lib/department-message';
import { sendDepartmentMessage } from '@/lib/department-message.functions';
import type { DepartmentId } from '@/lib/department-contacts';
import { departmentContactCopy, departmentEmail, departmentIds, type DepartmentLocale } from '@/lib/department-contacts';

/** Public department contact card grid. All aliases deliver to the owner's
 *  private inbox server-side; only the uniform public addresses are shown. */
export default function DepartmentContacts({ locale, className }: { locale: DepartmentLocale; className?: string }) {
  const copy = departmentContactCopy[locale] ?? departmentContactCopy.en;
  const formCopy = departmentFormCopy[locale] ?? departmentFormCopy.en;
  const send = useServerFn(sendDepartmentMessage);
  const [department, setDepartment] = useState<DepartmentId | null>(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submissionId, setSubmissionId] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [sent, setSent] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (busy || sent) return;
    const parsed = departmentMessageSchema.safeParse({ department, email, message, submissionId });
    if (!parsed.success) { setStatus(formCopy.invalid); return; }
    setBusy(true); setStatus('');
    try {
      const result = await send({ data: parsed.data });
      setSent(result.sent);
      setStatus(result.sent ? formCopy.sent : formCopy.error);
    } catch { setStatus(formCopy.error); }
    finally { setBusy(false); }
  }
  return (
    <section className={className ?? "rounded-3xl border border-border bg-card p-8 md:p-12"} data-department-contacts>
      <h2 className="text-2xl font-black md:text-3xl">✉️ {copy.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.note}</p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {departmentIds.map((id) => {
          const email = departmentEmail(id);
          return (
            <Button
              key={id}
              variant="outline"
              onClick={() => { setDepartment(id); setSent(false); setStatus(''); setSubmissionId(crypto.randomUUID()); }}
              className="flex h-auto min-h-11 w-full items-center justify-start gap-3 whitespace-normal normal-case tracking-normal rounded-2xl border border-border bg-background px-4 py-3 text-left transition hover:border-primary"
            >
              <Mail className="h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0">
                <span className="block text-sm font-bold">{copy.labels[id]}</span>
                <span className="block break-all text-xs text-muted-foreground">{email}</span>
              </span>
            </Button>
          );
        })}
      </div>
      <Dialog open={department !== null} onOpenChange={open => { if (!open) setDepartment(null); }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogTitle>{department ? copy.labels[department] : copy.title}</DialogTitle>
          <DialogDescription>{department ? departmentEmail(department) : ''}</DialogDescription>
          <form onSubmit={submit} className="grid gap-4">
            <label className="grid gap-2 text-sm">{formCopy.email}<Input type="email" required maxLength={254} value={email} onChange={event => { setEmail(event.target.value); setSubmissionId(crypto.randomUUID()); }} disabled={busy || sent} /></label>
            <label className="grid gap-2 text-sm">{formCopy.message}<Textarea required minLength={10} maxLength={4000} rows={5} value={message} onChange={event => { setMessage(event.target.value); setSubmissionId(crypto.randomUUID()); }} disabled={busy || sent} /></label>
            {status && <p role="status" className="text-sm">{status}</p>}
            <Button type="submit" disabled={busy || sent}>{busy ? formCopy.sending : formCopy.send}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
}
