// Background platform configuration constants. Owner directive (2026-10-24):
// bind the provisioned local Oklahoma City virtual line underneath the visual
// layer only — no presentation, typography, spacing or tab changes.
//
// Privacy boundary: this is the PUBLIC virtual line. The owner's personal
// developer mobile line must never appear in this codebase; it stays inside
// Stripe's private account vault only.

/** Active local Oklahoma City virtual line (E.164). */
export const localVirtualLine = '+14052569880' as const;

/** US-formatted rendering of the same line for metadata blocks. */
export const localVirtualLineDisplay = '(405) 256-9880' as const;

/** Metadata fields attached to automated transaction invoices. */
export const invoiceMetadata = {
  support_line: localVirtualLine,
  support_line_display: localVirtualLineDisplay,
} as const;

/** Statement/receipt descriptor block carried on card receipts. */
export const receiptStatementBlock = {
  support_phone: localVirtualLine,
} as const;

/** Public-facing customer support contact details. */
export const supportContact = {
  phone: localVirtualLine,
  phoneDisplay: localVirtualLineDisplay,
} as const;
