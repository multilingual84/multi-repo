import {describe,it,expect} from 'vitest';
import {topupStatusRows} from '@/lib/wallet/topup-status';

describe('wallet top-up status', () => {
  it('marks a paid session with a ledger row as verified', () => {
    const rows = topupStatusRows(
      [{ id: 'cs_live_1', created_at: '2026-10-26T00:00:00.000Z', cents: 100, paid: true, expired: false }],
      [{ checkout_id: 'cs_live_1', created_at: '2026-10-26T00:00:01.000Z', cents: 100 }],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ id: 'cs_live_1', state: 'verified', cents: 100 });
  });

  it('keeps a paid session without a delivered ledger row as pending', () => {
    const rows = topupStatusRows(
      [{ id: 'cs_live_2', created_at: '2026-10-26T00:00:00.000Z', cents: 500, paid: true, expired: false }],
      [],
    );
    expect(rows[0]?.state).toBe('pending');
  });

  it('marks an unpaid, unexpired session as pending', () => {
    const rows = topupStatusRows(
      [{ id: 'cs_live_3', created_at: '2026-10-26T00:00:00.000Z', cents: 100, paid: false, expired: false }],
      [],
    );
    expect(rows[0]?.state).toBe('pending');
  });

  it('marks an expired unpaid session as failed', () => {
    const rows = topupStatusRows(
      [{ id: 'cs_live_4', created_at: '2026-10-25T00:00:00.000Z', cents: 1000, paid: false, expired: true }],
      [],
    );
    expect(rows[0]?.state).toBe('failed');
  });

  it('marks a ledger row with no matching session (older than the session window) as verified', () => {
    const rows = topupStatusRows(
      [],
      [{ checkout_id: 'cs_live_5', created_at: '2026-09-01T00:00:00.000Z', cents: 100 }],
    );
    expect(rows[0]).toMatchObject({ id: 'cs_live_5', state: 'verified' });
  });

  it('sorts newest first', () => {
    const rows = topupStatusRows(
      [{ id: 'cs_live_a', created_at: '2026-10-26T00:00:00.000Z', cents: 100, paid: false, expired: false }],
      [{ checkout_id: 'cs_live_b', created_at: '2026-10-26T01:00:00.000Z', cents: 100 }],
    );
    expect(rows.map(r => r.id)).toEqual(['cs_live_b', 'cs_live_a']);
  });
});
