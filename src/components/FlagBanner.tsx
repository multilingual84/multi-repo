import { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { flagSearchCopy, type FlagSearchLocale } from '@/lib/flag-search-copy';
import { filterFlags, type SearchableFlag } from '@/lib/flag-search';
import { boundedFlagPosition } from '@/lib/flag-scroll';
import FlagLanguageMic from '@/components/FlagLanguageMic';
import FlagGridPicker from '@/components/FlagGridPicker';
import { flagGridCopy } from '@/lib/flag-grid-copy';
import { localizedFlagLabel } from '@/lib/flag-label';

type Flag = SearchableFlag;

const NATIVE_LOCALES = Object.keys(flagSearchCopy) as FlagSearchLocale[];

export default function FlagBanner({ flags, locale, onSelect, microphone = true }: { flags: Flag[]; locale: string; onSelect: (flag: Flag) => void; microphone?: boolean }) {
  const viewport = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  // While the visitor is typing we show a short filtered list, so the gentle
  // roll must stand down instead of moving a list the visitor is reading.
  const filteringRef = useRef(false);
  const [query, setQuery] = useState('');
  // The type-to-find box stays out of the way until the visitor starts moving
  // the flags, so the strip reads as just flags at first.
  const [revealed, setRevealed] = useState(false);

  const localeKey: FlagSearchLocale = NATIVE_LOCALES.includes(locale as FlagSearchLocale) ? (locale as FlagSearchLocale) : 'en';
  const copy = flagSearchCopy[localeKey];
  const gridCopy = flagGridCopy[localeKey];
  const filtering = query.trim().length > 0;
  filteringRef.current = filtering;
  const displayFlags = useMemo(() => flags.map(flag => ({ ...flag, label: localizedFlagLabel(flag, locale) })), [flags, locale]);
  const visible = useMemo(() => filterFlags(displayFlags, query), [displayFlags, query]);
  // One flag per country in the strip: the first entry for each country code.
  const primary = useMemo(
    () => displayFlags.filter((flag, index) => displayFlags.findIndex((f) => f.country === flag.country) === index),
    [displayFlags],
  );

  const stop = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  // A wheel turn hands the strip to the visitor for a moment; the roll picks
  // itself back up once the wheel rests.
  const resumeTimer = useRef<number | null>(null);
  const pauseBriefly = () => {
    stop();
    if (resumeTimer.current !== null) clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      resumeTimer.current = null;
      resume();
    }, 1200);
  };
  useEffect(() => () => { if (resumeTimer.current !== null) clearTimeout(resumeTimer.current); }, []);

  // The first real movement of the strip brings the type-to-find box in.
  const reveal = () => setRevealed(true);

  // The rolling flags are plain language choices: tapping one switches the site
  // and never raises the full list. That panel opens only from the all-flags
  // mosaic button at the left of the strip.
  const [gridOpen, setGridOpen] = useState(false);

  // Keep the tapped flag pinned where the visitor touched it while the page
  // switches language (translated labels change widths and would shove the
  // strip), then let the roll pick back up after a calm pause.
  const anchorFrame = useRef(0);
  useEffect(() => () => cancelAnimationFrame(anchorFrame.current), []);
  const holdFlagInPlace = (target: HTMLElement) => {
    const element = viewport.current;
    if (!element) return;
    const offset = target.getBoundingClientRect().left - element.getBoundingClientRect().left;
    const until = performance.now() + 2500;
    cancelAnimationFrame(anchorFrame.current);
    const keep = () => {
      if (!target.isConnected) return;
      const drift = target.getBoundingClientRect().left - element.getBoundingClientRect().left - offset;
      if (Math.abs(drift) > 0.5) element.scrollLeft = boundedFlagPosition(element.scrollLeft + drift, element.scrollWidth, element.clientWidth);
      if (performance.now() < until) anchorFrame.current = requestAnimationFrame(keep);
    };
    anchorFrame.current = requestAnimationFrame(keep);
  };

  const chooseFlag = (flag: Flag, target?: HTMLElement) => {
    setGridOpen(false);
    if (target) {
      stop();
      if (resumeTimer.current !== null) clearTimeout(resumeTimer.current);
      resumeTimer.current = window.setTimeout(() => { resumeTimer.current = null; resume(); }, 4000);
      holdFlagInPlace(target);
    } else resume();
    onSelect(flag);
  };

  // Mouse wheel / trackpad: one controlled step, vertical wheel moves sideways.
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const onWheel = (event: WheelEvent) => {
      const raw = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!raw) return;
      event.preventDefault();
      setRevealed(true);
      pauseBriefly();
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
      const step = Math.max(-120, Math.min(120, raw * unit));
      element.scrollLeft = boundedFlagPosition(element.scrollLeft + step, element.scrollWidth, element.clientWidth);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      element.removeEventListener('wheel', onWheel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A search starts from the top of its own short list.
  useEffect(() => {
    const element = viewport.current;
    if (element && filtering) element.scrollLeft = 0;
  }, [filtering]);

  // Endless gentle roll: from the first flag to the last, then it wraps around
  // and keeps going. Nothing here stops it for good.
  useEffect(() => {
    const element = viewport.current;
    if (!element || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0;
    let last = 0;
    // iPhone browsers round scrollLeft to whole pixels, so tiny per-frame steps
    // vanish; keep a fractional position and resync if the user moved the strip.
    let position = element.scrollLeft;
    const tick = (now: number) => {
      const delta = last ? Math.min(now - last, 50) : 0;
      last = now;
      if (delta && !pausedRef.current && !filteringRef.current) {
        const end = element.scrollWidth - element.clientWidth;
        if (Math.abs(element.scrollLeft - position) > 2) position = element.scrollLeft;
        if (position >= end - 1) position = 0;
        else position = Math.min(position + delta * 0.055, end);
        element.scrollLeft = position;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div dir="ltr" data-flag-banner className="relative border-b border-border bg-background/90 px-2 py-2.5 backdrop-blur">
      <div className="relative flex items-center gap-1">
        <Button
          type="button"
          variant="outline"
          size="icon"
          data-all-flags-button
          aria-label={gridCopy.button}
          title={gridCopy.button}
          aria-expanded={gridOpen}
          onClick={() => {
            reveal();
            // Tapping the mosaic again shuts the panel back down; the roll resumes.
            if (gridOpen) {
              setGridOpen(false);
              resume();
              return;
            }
            stop();
            setGridOpen(true);
          }}
          className="h-9 w-9 shrink-0 p-0!">
          {/* Universal all-flags sign: a four-color flag mosaic. */}
          <span aria-hidden="true" className="grid grid-cols-2 gap-[2px] rounded-[2px] p-[2.5px]">
            <span className="h-[6px] w-[6px] rounded-[1.5px]" style={{ background: '#2f6fed' }} />
            <span className="h-[6px] w-[6px] rounded-[1.5px]" style={{ background: '#e0392e' }} />
            <span className="h-[6px] w-[6px] rounded-[1.5px]" style={{ background: '#f3c614' }} />
            <span className="h-[6px] w-[6px] rounded-[1.5px]" style={{ background: '#17954c' }} />
          </span>
        </Button>
        <div ref={viewport} dir="ltr" role="region" aria-label={locale === 'en' ? 'Choose your language' : copy.label} tabIndex={0} className="flag-scroll min-w-0 flex-1 overflow-x-auto overscroll-x-none touch-pan-x"
          onPointerDown={() => { reveal(); stop(); }}
          onPointerUp={pauseBriefly}
          onPointerCancel={pauseBriefly}
          onKeyDown={(event) => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); pauseBriefly(); const element = viewport.current; if (element) element.scrollLeft = boundedFlagPosition(element.scrollLeft + (event.key === 'ArrowLeft' ? -300 : 300), element.scrollWidth, element.clientWidth); } }}>
          <div className="flex w-max items-center gap-1 whitespace-nowrap pr-2">
            {(filtering ? visible : primary).map((flag, index) => <Button key={`${flag.country}-${index}`} variant="outline" size="sm" title={flag.label} onClick={(event) => chooseFlag(flag, event.currentTarget)} className="h-9 touch-manipulation gap-1.5 px-1.5!">
              <img src={`https://flagcdn.com/w40/${flag.country}.png`} srcSet={`https://flagcdn.com/w80/${flag.country}.png 2x`} alt={locale === 'en' ? `${flag.label} flag` : flag.label} width={24} height={16} loading="lazy" draggable={false} className="h-5 w-7 rounded-sm object-cover" />
              <span className={`max-w-[58px] truncate text-[11px] font-black uppercase tracking-wider ${flag.locale === locale ? 'text-primary' : ''}`}>{flag.label}</span>
            </Button>)}
          </div>
        </div>
        {/* The banner's panel stretches across the full phone width. */}
        <FlagGridPicker flags={displayFlags} locale={localeKey} open={gridOpen} wide onOpenChange={(open) => { setGridOpen(open); if (!open) resume(); }} onSelect={chooseFlag} />
      </div>

      {microphone && <FlagLanguageMic locale={localeKey} />}

      {(revealed || filtering) && <>
        <div className="mt-1.5 flex items-center gap-2">
          <label className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-background px-2 py-1.5 focus-within:border-primary">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">{copy.label}</span>
            <input
              type="search"
              value={query}
              onChange={(event) => { setQuery(event.target.value); stop(); }}
              onKeyDown={(event) => { const first = visible[0]; if (event.key === 'Enter' && first) { event.preventDefault(); chooseFlag(first); } }}
              placeholder={copy.placeholder}
              className="min-w-0 flex-1 bg-transparent text-[12px] font-bold uppercase tracking-wider outline-none placeholder:font-semibold placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground"
            />
          </label>
          {filtering && <Button variant="ghost" size="sm" className="shrink-0 gap-1 px-2 text-[11px] font-black uppercase tracking-wider" onClick={() => { setQuery(''); resume(); }}>
            <X className="h-3.5 w-3.5" aria-hidden="true" />{copy.clear}
          </Button>}
        </div>
        <p className="mt-1 truncate text-[11px] font-semibold text-muted-foreground">{filtering && !visible.length ? copy.none : copy.hint}</p>
      </>}
    </div>
  );
}
