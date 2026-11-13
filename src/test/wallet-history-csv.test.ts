import { expect, it } from 'vitest';
import { walletHistoryCsv } from '@/lib/wallet/history-csv';

const history = {
  credits: [{ created_at: '2026-10-26T02:00:00Z', cents: 100, characters: 10000 }],
  usage: [
    { created_at: '2026-10-26T02:01:00Z', characters: 1000, state: 'succeeded' },
    { created_at: '2026-10-26T02:02:00Z', characters: 100, state: 'failed' },
    { created_at: '2026-10-26T02:03:00Z', characters: 50, state: 'reserved' },
  ],
};
it('exports purchases and usage newest first with actual character-metered USD amounts', () => {
  const csv = walletHistoryCsv(history, false);
  expect(csv).toContain('"voice_credit_purchase","1.0000","USD","10000","completed"');
  expect(csv).toContain('"voice_usage","-0.1000","USD","1000","succeeded"');
  expect(csv).toContain('"voice_usage","0.0000","USD","100","failed"');
  expect(csv).toContain('"voice_usage","-0.0050","USD","50","reserved"');
  expect(csv.indexOf('02:03:00Z')).toBeLessThan(csv.indexOf('02:00:00Z'));
});
it('honors amount hiding for money and character counts', () => {
  const csv = walletHistoryCsv(history, true);
  expect(csv).toContain('"hidden","USD","hidden"');
  expect(csv).not.toContain('1.0000');
  expect(csv).not.toContain('10000');
});
it('quotes commas and neutralizes formula-like cells', () => {
  const csv = walletHistoryCsv({ credits: [], usage: [{ created_at: '2026-10-26', characters: 1, state: '=HYPERLINK("x,y")' }] }, false);
  expect(csv).toContain('"\'=HYPERLINK(""x,y"")"');
});