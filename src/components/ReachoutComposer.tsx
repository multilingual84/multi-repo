import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { generateFavorCampaign } from '@/lib/network/favorCampaign.functions';
import { reachoutCopy, reachoutLocaleNames, reachoutText, type ReachoutSector } from '@/lib/network/reachout-copy';
import { PARTNER_CODE_KEY } from '@/lib/affiliate-preview';
import { Button } from '@/components/ui/button';
import type { UILocale } from '@/lib/ui-copy';

type DraftResult = {
  locale: string;
  subject: string;
  toDepartment: string;
  ccDepartments: string[];
  body: string;
  draft: string;
  referralUrl: string;
};

const SECTORS: ReachoutSector[] = ['general', 'retail', 'airport', 'taxi'];
const LOCALES: UILocale[] = ['en', 'es', 'tl', 'zh', 'de', 'ja'];

// Presentation-only composer: calls the stateless draft factory; nothing is sent or stored.
export default function ReachoutComposer() {
  const [locale, setLocale] = useState<UILocale>('en');
  const [sector, setSector] = useState<ReachoutSector>('general');
  const [targetId, setTargetId] = useState('');
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  const generateFn = useServerFn(generateFavorCampaign);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PARTNER_CODE_KEY);
      if (saved) setTargetId(saved);
    } catch { /* stored value unreadable — leave the field empty */ }
  }, []);

  const c = reachoutText(locale);
  const ui = reachoutCopy[locale];

  async function prepare() {
    setBusy(true); setCopied(false); setError(false);
    try {
      const result = await generateFn({ data: { targetId: targetId.trim(), locale, sector: sector === 'general' ? undefined : sector } });
      setDraft(result as DraftResult);
    } catch {
      setDraft(null); setError(true);
    } finally {
      setBusy(false);
    }
  }

  async function copyDraft() {
    if (!draft) return;
    try {
      await navigator.clipboard.writeText(draft.draft);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div data-reachout-composer className="mx-auto max-w-2xl space-y-4 rounded-xl border bg-card p-4 text-card-foreground sm:p-6">
      <div>
        <h2 className="text-xl font-black">{ui.title}</h2>
        <p className="mt-1 text-sm font-semibold">{ui.intro}</p>
        <p className="mt-1 text-xs font-semibold text-muted-foreground">{ui.notice}</p>
      </div>

      <label className="block text-sm font-bold" htmlFor="reachout-sector">{ui.sectorLabel}</label>
      <div id="reachout-sector" role="group" className="flex flex-wrap gap-2">
        {SECTORS.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => setSector(s)}
            aria-pressed={sector === s}
            className={`rounded-full border px-3 py-2 text-sm font-bold ${sector === s ? 'bg-primary text-primary-foreground' : 'bg-background'}`}
          >{ui.sectors[s]}</button>
        ))}
      </div>

      <label className="block text-sm font-bold" htmlFor="reachout-language">{ui.languageLabel}</label>
      <select
        id="reachout-language"
        value={locale}
        onChange={e => setLocale(e.target.value as UILocale)}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      >
        {LOCALES.map(l => <option key={l} value={l}>{reachoutLocaleNames[l]}</option>)}
      </select>

      <label className="block text-sm font-bold" htmlFor="reachout-code">{ui.codeLabel}</label>
      <input
        id="reachout-code"
        value={targetId}
        onChange={e => { setTargetId(e.target.value); setCopied(false); }}
        maxLength={64}
        placeholder="ML-XXXX-XXXX"
        className="w-full rounded-md border bg-background px-3 py-2 text-sm"
      />
      <p className="text-xs font-semibold text-muted-foreground">{ui.codeHint}</p>

      <Button type="button" onClick={prepare} disabled={busy || !targetId.trim()} className="w-full sm:w-auto">
        {busy ? ui.generating : ui.generate}
      </Button>

      {error && <p role="alert" className="text-sm font-bold text-destructive">{ui.error}</p>}

      {draft && (
        <div className="space-y-2 rounded-lg border bg-background p-3" data-reachout-draft>
          <p className="text-sm font-black">{ui.draftTitle}</p>
          <p className="text-sm"><span className="font-bold">{ui.subject}:</span> {draft.subject}</p>
          <p className="text-sm"><span className="font-bold">{ui.to}:</span> {draft.toDepartment}</p>
          <p className="text-sm"><span className="font-bold">{ui.cc}:</span> {draft.ccDepartments.join(' / ')}</p>
          <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-md border bg-muted/40 p-3 text-xs">{draft.draft}</pre>
          <Button type="button" variant="outline" onClick={copyDraft}>{copied ? ui.copied : ui.copyDraft}</Button>
        </div>
      )}
    </div>
  );
}
