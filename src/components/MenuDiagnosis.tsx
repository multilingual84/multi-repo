import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { diagnosisCopy } from '@/lib/diagnosis-copy';
import { diagnoseMenuLayoutFn } from '@/lib/menu-diagnosis.functions';
import type { UILocale } from '@/lib/ui-copy';

export default function MenuDiagnosis({ locale }: { locale: UILocale }) {
  const c = diagnosisCopy[locale];
  const diagnose = useServerFn(diagnoseMenuLayoutFn);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    setResult('');
    try {
      const device = `${navigator.userAgent} • viewport ${window.innerWidth}x${window.innerHeight}`;
      const { diagnosis } = await diagnose({ data: { description, device } });
      setResult(diagnosis);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : c.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl rounded-3xl border border-border bg-card p-8" data-menu-diagnosis>
      <h2 className="text-2xl font-black md:text-3xl">{c.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={c.placeholder}
          aria-label={c.title}
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          required
          minLength={10}
          maxLength={2000}
        />
        <Button type="submit" disabled={busy || description.trim().length < 10} className="h-auto w-full whitespace-normal py-3 font-black">
          {busy ? c.loading : c.button}
        </Button>
      </form>
      {error && <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{error}</p>}
      {result && (
        <div className="mt-4 rounded-xl border border-border bg-background px-4 py-3" data-diagnosis-result>
          <p className="text-[11px] font-black uppercase tracking-wider text-accent">{c.resultLabel}</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{result}</p>
        </div>
      )}
    </section>
  );
}
