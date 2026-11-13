import { characterCostUsd } from '@/lib/premium/policy';

type History = {
  credits: { created_at: string; cents: number; characters: number }[];
  usage: { created_at: string; characters: number; state: string; minutes?:number }[];
};

function cell(value: string | number) {
  const text = String(value);
  const safe = /^[=+@\t\r]/.test(text) || /^-[^\d]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

// Export only the PIN-authorized history already loaded in the wallet.
export function walletHistoryCsv(history: History, hideAmounts: boolean) {
  const rows = [
    ...history.credits.map(r => ({ date: r.created_at, type: 'voice_credit_purchase', amount: r.cents / 100, characters: r.characters, state: 'completed',minutes:r.cents/16 })),
    ...history.usage.map(r => ({ date: r.created_at, type: 'voice_usage', amount: r.state === 'failed' ? 0 : -characterCostUsd(r.characters), characters: r.characters, state: r.state,minutes:r.minutes??'' })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return '\uFEFF' + [
    ['date_utc', 'type', 'amount_usd', 'currency', 'legacy_credit_units', 'status', 'enhanced_minutes'],
    ...rows.map(r => [r.date, r.type, hideAmounts ? 'hidden' : r.amount.toFixed(4), 'USD', hideAmounts ? 'hidden' : r.characters, r.state,hideAmounts?'hidden':r.minutes]),
  ].map(row => row.map(cell).join(',')).join('\r\n') + '\r\n';
}

export function downloadWalletHistoryCsv(history: History, hideAmounts: boolean) {
  const blob = new Blob([walletHistoryCsv(history, hideAmounts)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'multi-lingual-voice-transactions.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}