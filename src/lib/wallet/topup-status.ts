// Pure top-up status derivation, shared by the wallet status view and tests.
// A top-up is "verified" only when the credit actually reached the wallet
// ledger (the signed Stripe event or the checkout-return readback wrote it).
// A paid session whose ledger row is not present yet stays "pending", so the
// view never shows delivered credit that the balance does not have.
export type TopupState = 'verified' | 'pending' | 'failed';
export interface TopupRow {
  id: string;
  cents: number;
  created: string;
  state: TopupState;
}
export interface StripeSessionLike {
  id: string;
  created_at: string;
  cents: number;
  paid: boolean;
  expired: boolean;
}
export interface CreditRowLike {
  checkout_id: string;
  created_at: string;
  cents: number;
}

export function topupStatusRows(sessions: StripeSessionLike[], credits: CreditRowLike[]): TopupRow[] {
  const delivered = new Set(credits.map(row => row.checkout_id));
  const rows = new Map<string, TopupRow>();
  for (const row of credits) rows.set(row.checkout_id, { id: row.checkout_id, cents: row.cents, created: row.created_at, state: 'verified' });
  for (const session of sessions) {
    if (rows.has(session.id)) continue;
    const state: TopupState = session.paid ? 'pending' : session.expired ? 'failed' : 'pending';
    rows.set(session.id, { id: session.id, cents: session.cents, created: session.created_at, state });
  }
  return [...rows.values()].sort((a, b) => b.created.localeCompare(a.created)).slice(0, 50);
}
