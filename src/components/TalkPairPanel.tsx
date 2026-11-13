import { useState } from 'react';
import { Smartphone, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FlagGridPicker from '@/components/FlagGridPicker';
import CallSharing from '@/components/CallSharing';
import { ALL_FLAGS } from '@/lib/flag-catalog';
import { localizedFlagLabel } from '@/lib/flag-label';
import { talkPairCopy } from '@/lib/talk-pair-copy';
import { talkDirectorCopy } from '@/lib/talk-director-copy';
import type { UILocale } from '@/lib/ui-copy';

type Mode = 'one' | 'two';
type Side = 'local' | 'tourist';

const GREEN =
  'bg-emerald-600 text-white hover:bg-emerald-600/90 border-emerald-700 shadow-md font-black';

function PartyFlagPicker({
  locale, pageLanguage, language, heading, pickLabel, onLanguage, side, locked,
}: {
  locale: UILocale; pageLanguage: string; language: string; heading: string; pickLabel: string;
  onLanguage: (lang: string) => void; side: string; locked?: boolean | undefined;
}) {
  const [open, setOpen] = useState(false);
  const flag = ALL_FLAGS.find(e => e.lang === language);
  const label = flag ? localizedFlagLabel(flag, pageLanguage) : language || pickLabel;
  return (
    <div className="relative flex min-w-0 flex-col items-center gap-2 rounded-xl border-2 border-border bg-background p-3" data-party-flag={side}>
      <p className="text-xs font-black uppercase tracking-wide text-signal">{heading}</p>
      {flag?.country ? (
        <img src={`https://flagcdn.com/w80/${flag.country}.png`} srcSet={`https://flagcdn.com/w160/${flag.country}.png 2x`} alt="" width={48} height={32} className="h-8 w-12 rounded object-cover shadow" />
      ) : (
        <span className="flex h-8 w-12 items-center justify-center rounded bg-muted text-lg" aria-hidden>🌐</span>
      )}
      <p className="max-w-full break-words text-center text-sm font-bold leading-tight">{label}</p>
      {!locked ? (
        <>
          <Button type="button" variant="outline" className="h-auto w-full whitespace-normal py-2 text-xs font-bold" aria-expanded={open} onClick={() => setOpen(v => !v)}>
            {pickLabel}
          </Button>
          <FlagGridPicker
            flags={ALL_FLAGS.map(e => ({ ...e, label: localizedFlagLabel(e, pageLanguage) }))}
            locale={locale}
            open={open}
            onOpenChange={setOpen}
            onSelect={e => onLanguage(e.lang)}
            wide
          />
        </>
      ) : (
        <p className="text-[10px] font-semibold text-muted-foreground">
          {locale === 'es' ? 'Fijado por el QR' : locale === 'zh' ? '由二维码设定' : locale === 'de' ? 'Per QR festgelegt' : locale === 'tl' ? 'Naka-set sa QR' : locale === 'ja' ? 'QRで設定済み' : 'Set by your QR'}
        </p>
      )}
    </div>
  );
}

export default function TalkPairPanel({
  locale, pageLanguage, localLang, touristLang, onLocalLang, onTouristLang,
  shareLink, turn, onTurn, busy, lastHeard, lastText, showText, onShowText, onSpeakAgain, localLocked,
}: {
  locale: UILocale;
  pageLanguage: string;
  localLang: string;
  touristLang: string;
  onLocalLang: (lang: string) => void;
  onTouristLang: (lang: string) => void;
  shareLink: string;
  turn: Side;
  onTurn: (side: Side) => void;
  busy?: boolean | undefined;
  lastHeard?: string | undefined;
  lastText?: string | undefined;
  showText?: boolean | undefined;
  onShowText?: ((v: boolean) => void) | undefined;
  onSpeakAgain?: (() => void) | undefined;
  localLocked?: boolean | undefined;
}) {
  const c = talkPairCopy[locale] ?? talkPairCopy.en;
  const d = talkDirectorCopy[locale] ?? talkDirectorCopy.en;
  const [mode, setMode] = useState<Mode>('one');

  return (
    <section data-talk-pair-panel className="w-full max-w-xl space-y-3 rounded-xl border-2 border-primary bg-card p-3 text-center shadow-md">
      <div>
        <h3 className="text-lg font-black text-signal">{d.coachTitle}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{c.subtitle}</p>
        <p className="mt-1 text-xs font-bold text-emerald-700 dark:text-emerald-400">{d.roomReady}</p>
      </div>

      <div className="relative z-40 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <PartyFlagPicker side="local" locale={locale} pageLanguage={pageLanguage} language={localLang} heading={c.local} pickLabel={c.pickLocal} onLanguage={onLocalLang} locked={localLocked} />
        <PartyFlagPicker side="tourist" locale={locale} pageLanguage={pageLanguage} language={touristLang} heading={c.tourist} pickLabel={c.pickTourist} onLanguage={onTouristLang} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant={mode === 'one' ? 'default' : 'outline'} className="h-auto flex-col gap-1 whitespace-normal py-2 text-sm font-bold" aria-pressed={mode === 'one'} onClick={() => setMode('one')}>
          <Smartphone className="h-4 w-4" />{c.modeOne}
        </Button>
        <Button type="button" variant={mode === 'two' ? 'default' : 'outline'} className="h-auto flex-col gap-1 whitespace-normal py-2 text-sm font-bold" aria-pressed={mode === 'two'} onClick={() => setMode('two')}>
          <Share2 className="h-4 w-4" />{c.modeTwo}
        </Button>
      </div>

      {/* Human translator coach */}
      <div className="space-y-2 rounded-lg border border-emerald-600/40 bg-emerald-500/10 p-3" data-talk-coach role="status" aria-live="polite">
        <p className="text-sm font-black text-emerald-800 dark:text-emerald-300">
          {busy ? d.listenNow : d.speakNow}
        </p>
        <p className="text-xs text-muted-foreground">{d.switchHint}</p>
        {busy && (
          <p className="animate-pulse text-sm font-bold text-accent">{d.busyTranslate}</p>
        )}
        {mode === 'one' && !busy && (
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" className={`h-auto whitespace-normal py-3 text-xs ${turn === 'local' ? GREEN : ''}`} variant={turn === 'local' ? 'default' : 'outline'} aria-pressed={turn === 'local'} onClick={() => onTurn('local')}>
              {c.yourTurn}
            </Button>
            <Button type="button" className={`h-auto whitespace-normal py-3 text-xs ${turn === 'tourist' ? GREEN : ''}`} variant={turn === 'tourist' ? 'default' : 'outline'} aria-pressed={turn === 'tourist'} onClick={() => onTurn('tourist')}>
              {c.theirTurn}
            </Button>
          </div>
        )}
        {mode === 'one' && (
          <Button
            type="button"
            className={`h-auto w-full whitespace-normal py-3 ${GREEN}`}
            onClick={() => onTurn(turn === 'local' ? 'tourist' : 'local')}
          >
            {d.greenNext}
          </Button>
        )}
        {(lastText || lastHeard) && (
          <div className="space-y-2 text-left">
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" className={GREEN} onClick={() => onSpeakAgain?.()}>{d.greenHear}</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => onShowText?.(!showText)}>
                {showText ? d.hideText : d.showText}
              </Button>
            </div>
            {showText && (
              <div className="rounded-md border border-border bg-background p-2 text-sm">
                {lastHeard ? <p className="text-muted-foreground"><span className="font-bold">↑</span> {lastHeard}</p> : null}
                {lastText ? <p className="font-bold text-signal">{lastText}</p> : null}
              </div>
            )}
          </div>
        )}
      </div>

      {mode === 'two' && (
        <div className="space-y-2">
          <p className="text-sm font-bold">{c.shareTitle}</p>
          {shareLink ? <CallSharing link={shareLink} locale={locale} /> : null}
        </div>
      )}
    </section>
  );
}
