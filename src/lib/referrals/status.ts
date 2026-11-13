export type PartnerAccountStatus = 'not_connected' | 'setup_required' | 'ready' | 'unavailable';
export type CommissionStatusRow = {
  status: string;
  share_minor: number;
  fee_minor?: number;
  transferred_minor: number;
  reversed_minor: number;
};

// A transfer is not proof of a completed bank payout.
export function netTransferredMinor(row: CommissionStatusRow) {
  return Math.max(0, Number(row.transferred_minor) - Number(row.reversed_minor));
}