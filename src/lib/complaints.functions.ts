import { createServerFn } from '@tanstack/react-start';

import { isComplaintReference, newComplaintReference, validateComplaintReview } from './complaints';

// Repair-first pipeline. Filing and reviewing never move money.
// The old refund implementation is retired; waiver execution remains locked
// until authenticated owner access, purchase ownership and email are connected.

/** Owner-only gate: the approval code lives in a saved secret, never in code. */
function requireAdminCode(code: string) {
  const expected = process.env['COMPLAINTS_ADMIN_CODE'];
  if (!expected) throw new Error('Approval codes are not configured on this site yet');
  if (typeof code !== 'string') throw new Error('Incorrect approval code');
  let diff = code.length ^ expected.length;
  for (let i = 0; i < Math.max(code.length, expected.length); i++) {
    diff |= (code.charCodeAt(i) || 0) ^ (expected.charCodeAt(i) || 0);
  }
  if (diff !== 0) throw new Error('Incorrect approval code');
}

/** Emails the owner a copy of a complaint event. Never blocks the customer
 *  flow: a missing inbox or a failed send is logged, not thrown. */
async function notifyOwner(event: string, complaint: { reference_code?: string | null; contact?: string | null; message?: string | null }) {
  const ownerEmail = process.env['OWNER_EMAIL'];
  if (!ownerEmail) return;
  try {
    const { sendTemplateEmail } = await import('@/lib/email-templates/send-email');
    await sendTemplateEmail('complaint-owner-copy', ownerEmail, {
      templateData: { reference: complaint.reference_code, contact: complaint.contact, message: complaint.message, event },
      idempotencyKey: `complaint-owner-${complaint.reference_code}-${event}`,
    });
  } catch (error) {
    console.error('Owner complaint copy failed:', error);
  }
}

const uuidValidator = (value: string) => {
  if (typeof value !== 'string' || !/^[a-f0-9-]{36}$/.test(value)) throw new Error('Unknown complaint');
  return value;
};

export const submitComplaint = createServerFn({ method: 'POST' })
  .inputValidator((input: { credentialHandle?: string; contact: string; message: string }) => {
    const contact = typeof input.contact === 'string' ? input.contact.trim() : '';
    const message = typeof input.message === 'string' ? input.message.trim() : '';
    if (contact.length < 3 || contact.length > 200) throw new Error('Add a way for us to reach you');
    if (message.length < 10 || message.length > 4000) throw new Error('Describe the problem in a little more detail');
    const credentialHandle =
      typeof input.credentialHandle === 'string' && /^[a-f0-9-]{36}$/.test(input.credentialHandle) ? input.credentialHandle : null;
    return { contact, message, credentialHandle };
  })
  .handler(async ({ data }) => {
    const reference = newComplaintReference();
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { error } = await supabaseAdmin
      .from('complaints')
      .insert({ reference_code: reference, credential_handle: data.credentialHandle, contact: data.contact, message: data.message });
    if (error) throw new Error(error.message);
    await notifyOwner('New complaint filed', { reference_code: reference, contact: data.contact, message: data.message });
    return { reference };
  });

export const getComplaintStatus = createServerFn({ method: 'POST' })
  .inputValidator((input: { reference: string }) => {
    const reference = typeof input.reference === 'string' ? input.reference.trim().toUpperCase() : '';
    if (!isComplaintReference(reference)) throw new Error('Enter the reference code you were given');
    return { reference };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: row } = await supabaseAdmin
      .from('complaints')
      .select('status, resolution_note, refund_amount_cents, refund_currency, free_until, created_at')
      .eq('reference_code', data.reference)
      .maybeSingle();
    if (!row) return null;
    return {
      status: row.status,
      resolutionNote: row.resolution_note,
      refundAmountCents: row.refund_amount_cents,
      refundCurrency: row.refund_currency,
      freeUntil: row.free_until,
      createdAt: row.created_at,
    };
  });

export const adminListComplaints = createServerFn({ method: 'POST' })
  .inputValidator((input: { code: string }) => ({ code: typeof input.code === 'string' ? input.code : '' }))
  .handler(async ({ data }) => {
    requireAdminCode(data.code);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: rows, error } = await supabaseAdmin
      .from('complaints')
      .select('id, reference_code, contact, message, status, resolution_note, refund_amount_cents, refund_currency, free_until, created_at, resolved_at, issue_classification, repair_attempt, reviewed_at')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminReviewComplaint = createServerFn({ method: 'POST' })
  .inputValidator((input: { code: string; id: string; classification: string; repairAttempt: string }) => ({
    code: typeof input.code === 'string' ? input.code : '',
    id: uuidValidator(input.id),
    ...validateComplaintReview(input.classification, input.repairAttempt),
  }))
  .handler(async ({ data }) => {
    requireAdminCode(data.code);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: row, error } = await supabaseAdmin.from('complaints')
      .update({ issue_classification: data.classification, repair_attempt: data.repairAttempt, reviewed_at: new Date().toISOString() })
      .eq('id', data.id).eq('status', 'pending').select('id').maybeSingle();
    if (error) throw new Error('Could not save the review');
    if (!row) throw new Error('This complaint was already resolved or was not found');
    return { ok: true as const };
  });

export const adminApproveComplaint = createServerFn({ method: 'POST' })
  .inputValidator((input: { code: string; id: string }) => ({ code: typeof input.code === 'string' ? input.code : '', id: uuidValidator(input.id) }))
  .handler(async ({ data }) => {
    requireAdminCode(data.code);
    // Fail closed: never offer an unconnected waiver or execute the retired refund.
    throw new Error('Final approval is locked until secure owner access, verified customer billing and owner email copies are connected. No charges have been changed.');
  });

export const adminDeclineComplaint = createServerFn({ method: 'POST' })
  .inputValidator((input: { code: string; id: string; note?: string }) => ({
    code: typeof input.code === 'string' ? input.code : '',
    id: uuidValidator(input.id),
    note: typeof input.note === 'string' ? input.note.trim().slice(0, 500) : '',
  }))
  .handler(async ({ data }) => {
    requireAdminCode(data.code);
    const { supabaseAdmin } = await import('@/integrations/supabase/client.server');
    const { data: complaint } = await supabaseAdmin.from('complaints').select('status, reference_code, contact, message').eq('id', data.id).maybeSingle();
    if (!complaint) throw new Error('Unknown complaint');
    if (complaint.status !== 'pending') throw new Error('This complaint was already resolved');
    const { error } = await supabaseAdmin
      .from('complaints')
      .update({
        status: 'declined',
        resolution_note: data.note || 'Declined by the site owner. No refund or free service was offered.',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', data.id);
    if (error) throw new Error(error.message);
    await notifyOwner('Complaint declined', complaint);
    return { ok: true as const };
  });
