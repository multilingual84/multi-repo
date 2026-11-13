// Browser-safe repair-first complaint policy. A review does not authorize billing.
export const FREE_SERVICE_DAYS = 60;
export const complaintPolicy = { ownerApprovalRequired: true, repairFirst: true, refundPastCharges: false, freeServiceDays: FREE_SERVICE_DAYS } as const;
export const issueClassifications = ['user_error', 'system_issue', 'undetermined'] as const;
export type IssueClassification = typeof issueClassifications[number];

export function validateComplaintReview(classification: string, repairAttempt: string) {
  if (!issueClassifications.some(value => value === classification)) throw new Error('Choose an issue classification');
  const note = typeof repairAttempt === 'string' ? repairAttempt.trim() : '';
  if (note.length < 10 || note.length > 2000) throw new Error('Record the attempted fix (10–2000 characters)');
  return { classification: classification as IssueClassification, repairAttempt: note };
}

export function canOfferWaiver(input: { ownerApproved: boolean; classification: string | null; repairAttempt: string | null }): boolean {
  return input.ownerApproved && ['user_error', 'system_issue'].includes(input.classification ?? '') && (input.repairAttempt?.trim().length ?? 0) >= 10;
}

export function addSixtyDays(from: Date): Date {
  return new Date(from.getTime() + FREE_SERVICE_DAYS * 24 * 60 * 60 * 1000);
}

// Reference codes avoid look-alike characters (no I, O, 0, 1) so customers can
// read them back over the phone or from a screenshot.
const REFERENCE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function newComplaintReference(): string {
  const bytes = new Uint8Array(8);
  globalThis.crypto.getRandomValues(bytes);
  const code = Array.from(bytes, (b) => REFERENCE_ALPHABET[b % REFERENCE_ALPHABET.length]).join('');
  return `ML-${code.slice(0, 4)}-${code.slice(4)}`;
}

export function isComplaintReference(value: string): boolean {
  return /^ML-[A-HJ-NP-Z2-9]{4}-[A-HJ-NP-Z2-9]{4}$/.test(value);
}

export function formatRefund(amountCents: number | null, currency: string | null): string {
  if (amountCents == null) return '';
  const amount = (amountCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${currency ?? 'USD'} ${amount}`;
}
