import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { formatRefund, canOfferWaiver } from '@/lib/complaints';
import { adminApproveComplaint, adminDeclineComplaint, adminListComplaints, adminReviewComplaint } from '@/lib/complaints.functions';

type Row = Awaited<ReturnType<typeof adminListComplaints>>[number];

// Reviews record evidence only; final financial approval remains fail-closed.
export default function ComplaintAdminPanel() {
  const [code, setCode] = useState('');
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [classification, setClassification] = useState('undetermined');
  const [repairAttempt, setRepairAttempt] = useState('');
  async function saveReview(id: string) {
    setBusy(true); setError('');
    try { await adminReviewComplaint({ data: { code, id, classification, repairAttempt } }); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not save review.'); }
    finally { setBusy(false); }
  }

  async function refresh(nextCode = code) {
    setBusy(true);
    setError('');
    try {
      setRows(await adminListComplaints({ data: { code: nextCode } }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not open the desk.');
      setRows(null);
    } finally {
      setBusy(false);
    }
  }

  async function approve(id: string) {
    setBusy(true);
    setError('');
    setConfirmId(null);
    try {
      await adminApproveComplaint({ data: { code, id } });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not approve this complaint.');
    } finally {
      setBusy(false);
    }
  }

  async function decline(id: string) {
    setBusy(true);
    setError('');
    setConfirmId(null);
    try {
      await adminDeclineComplaint({ data: { code, id } });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not decline this complaint.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-black uppercase">Complaint approval desk</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Try to fix the problem first. Review whether it is user error or a system issue. Only your final approval can offer a last-resort 60-day waiver of future service charges; no past charges are refunded.
      </p>

      <div className="mt-6 flex flex-wrap items-end gap-2">
        <div className="min-w-0 flex-1">
          <label className="block text-xs font-bold uppercase">Approval code</label>
          <input
            type="password"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm"
          />
        </div>
        <Button onClick={() => refresh()} disabled={busy}>
          Open desk
        </Button>
      </div>
      {error && <p className="mt-3 text-sm font-bold text-destructive">{error}</p>}

      {rows && rows.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No complaints yet.</p>}
      {rows && rows.length > 0 && (
        <ul className="mt-6 space-y-4">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase">
                <span className="font-mono" translate="no">{row.reference_code}</span>
                <span className="rounded bg-muted px-2 py-0.5">{row.status}</span>
                <span className="text-muted-foreground">{new Date(row.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm" translate="no">{row.contact}</p>
              <p className="mt-2 text-sm leading-relaxed">{row.message}</p>
              {row.resolution_note && <p className="mt-2 text-xs text-muted-foreground">{row.resolution_note}</p>}
              {row.status === 'pending' && <div className="mt-3 space-y-2">
                <label className="block text-sm font-bold">Issue assessment
                  <select aria-label="Issue assessment" value={classification} onChange={e => setClassification(e.target.value)} className="mt-1 block w-full border border-border bg-background p-2">
                    <option value="undetermined">Undetermined — needs investigation</option><option value="user_error">User error</option><option value="system_issue">System issue</option>
                  </select>
                </label>
                <label className="block text-sm font-bold">Fix attempted and outcome
                  <textarea value={repairAttempt} onChange={e => setRepairAttempt(e.target.value)} maxLength={2000} className="mt-1 block w-full border border-border bg-background p-2" />
                </label>
                <Button variant="outline" disabled={busy || repairAttempt.trim().length < 10} onClick={() => saveReview(row.id)}>Save review — no billing change</Button>
                {row.reviewed_at && <p className="text-sm">Saved assessment: {row.issue_classification} — {row.repair_attempt}</p>}
                <p className="text-xs text-muted-foreground">Final approval is locked until secure owner access, verified customer billing and owner email copies are connected. No waiver has been applied.</p>
              </div>}
              {row.status === 'pending' && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {confirmId === row.id ? (
                    <>
                      <span className="text-sm font-bold">Give final approval for 60 days without future service charges?</span>
                      <Button onClick={() => approve(row.id)} disabled={busy}>Confirm approve</Button>
                      <Button variant="outline" onClick={() => setConfirmId(null)} disabled={busy}>Cancel</Button>
                    </>
                  ) : (
                    <>
                      <Button onClick={() => setConfirmId(row.id)} disabled={busy || !canOfferWaiver({ ownerApproved: false, classification: row.issue_classification, repairAttempt: row.repair_attempt })}>Final approval — 60-day waiver</Button>
                      <Button variant="outline" onClick={() => decline(row.id)} disabled={busy}>Decline</Button>
                    </>
                  )}
                </div>
              )}
              {row.status === 'approved' && row.refund_amount_cents != null && (
                <p className="mt-2 font-mono text-sm font-black" translate="no">
                  Refunded {formatRefund(row.refund_amount_cents, row.refund_currency)}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
