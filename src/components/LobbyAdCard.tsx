import { useState } from 'react';
import { Phone, X } from 'lucide-react';
import { isReturnCallGated, lobbyAdCardBranding } from '@/lib/lobby-ad-card';
import { lobbyAdCardCopy } from '@/lib/lobby-ad-card-copy';
import type { FlagEntry } from '@/lib/flag-catalog';
import type { UILocale } from '@/lib/ui-copy';
import type { usePassInterface } from '@/components/PassInterface';
import QrSaveHint from '@/components/QrSaveHint';
import QrEarningFooter from '@/components/QrEarningFooter';

// Sample connection rows for the visible history log; no live calls exist.
const SAMPLE_CONNECTIONS = [
  { id: 'lobby-1', room: '/#meeting-4f7b-91a2', language: 'EN → ZH' },
  { id: 'lobby-2', room: '/#meeting-8c2d-01f4', language: 'EN → ES' },
  { id: 'lobby-3', room: '/#meeting-3e9a-77c1', language: 'EN → TL' },
] as const;

export default function LobbyAdCard({ locale, state, onSelect }: {
  locale: UILocale;
  state: ReturnType<typeof usePassInterface>;
  onSelect: (flag: FlagEntry) => void;
}) {
  const c = lobbyAdCardCopy[locale];
  const [gated, setGated] = useState(false);
  const [previewNote, setPreviewNote] = useState(false);
  const expired = state.pass ? isReturnCallGated(state.pass.expiresAt, state.now || Date.now(), false) : false;

  function callBack() {
    setPreviewNote(false);
    if (expired) setGated(true);
    else setPreviewNote(true);
  }

  return (
    <div data-lobby-ad-card className="relative overflow-hidden rounded-2xl border-4 border-[#f59e0b] bg-[#111111] p-4 text-center text-white shadow-xl sm:p-6">
      <header className="space-y-1">
        <p className="text-sm font-black uppercase tracking-wide" translate="no">{lobbyAdCardBranding.header}</p>
        <p className="text-lg font-black text-[#f59e0b]" translate="no">{lobbyAdCardBranding.domain}</p>
      </header>

      {state.qr && <div data-qr-guide-box className="mx-auto mt-4 w-full max-w-xl space-y-2 rounded-xl bg-background p-3">
        <QrSaveHint locale={locale}/>
        <img src={state.qr} width={224} height={224} alt="Multi-Lingual.tech lobby QR" className="mx-auto h-56 w-56 max-w-full rounded-lg bg-white p-2"/>
        <QrEarningFooter locale={locale} purpose="business"/>
      </div>}

      <section aria-label={c.historyTitle} className="mt-6 text-left">
        <h3 className="text-center text-sm font-black uppercase tracking-wide">{c.historyTitle}</h3>
        <p className="mt-1 text-center text-[11px] text-white/70">{c.historyNote}</p>
        <ul className="mt-3 space-y-2">
          {SAMPLE_CONNECTIONS.map((log) => (
            <li key={log.id} className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2">
              <span className="min-w-0 break-all font-mono text-xs" translate="no">{log.room}</span>
              <span className="text-xs text-white/80" translate="no">{log.language}</span>
              <button
                type="button"
                onClick={callBack}
                className="min-h-11 shrink-0 rounded-lg bg-green-600 px-3 py-1 text-xs font-black text-white transition hover:bg-green-500"
              >
                <Phone size={12} className="mr-1 inline" aria-hidden/>{c.callBack}
              </button>
            </li>
          ))}
        </ul>
        {previewNote && <p role="status" className="mt-2 text-center text-xs font-bold text-[#f59e0b]">{c.previewOnly}</p>}
      </section>

      <footer className="mt-6 space-y-2 border-t border-white/20 pt-3">
        <p className="text-xs font-bold" translate="no">{lobbyAdCardBranding.footer}</p>
      </footer>

      {gated && (
        <div role="alertdialog" aria-label={c.gateTitle} className="absolute inset-0 z-10 grid place-items-center bg-black/85 p-4">
          <div className="max-w-md space-y-3 rounded-xl border-2 border-[#f59e0b] bg-[#111111] p-5 text-left">
            <p className="text-base font-black">{c.gateTitle}</p>
            <p className="text-sm leading-relaxed">{c.gateBody}</p>
            <button
              type="button"
              onClick={() => setGated(false)}
              className="min-h-11 w-full rounded-lg bg-[#f59e0b] px-3 py-2 text-sm font-black text-black"
            >
              <X size={14} className="mr-1 inline" aria-hidden/>{c.close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
