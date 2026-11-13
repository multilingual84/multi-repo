// All-languages grid picker: a dense multi-row grid of flags grouped by
// continent, so many options are visible at once without a long scroll.
// The all-flags mosaic button in the banner opens this panel until a flag is
// chosen or it is closed; the picker itself renders no button of its own.
import { Fragment, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type FlagEntry } from '@/lib/flag-catalog';
import { flagsByRegion } from '@/lib/flag-grid';
import { FLAG_GRID_LOCALES, flagGridCopy, type FlagGridLocale } from '@/lib/flag-grid-copy';

export default function FlagGridPicker({ flags, locale, open, onOpenChange, onSelect, wide }: { flags: FlagEntry[]; locale: string; open: boolean; onOpenChange: (open: boolean) => void; onSelect: (flag: FlagEntry) => void; wide?: boolean }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const localeKey: FlagGridLocale = FLAG_GRID_LOCALES.includes(locale as FlagGridLocale) ? (locale as FlagGridLocale) : 'en';
  const copy = flagGridCopy[localeKey];
  const groups = flagsByRegion();
  // One flag per country, mirroring the rolling strip; countries with several
  // languages expand their dialect choices in place.
  const primary = flags.filter((flag, index) => flags.findIndex((f) => f.country === flag.country) === index);

  const pick = (flag: FlagEntry) => {
    onOpenChange(false);
    setExpanded(null);
    onSelect(flag);
  };

  const tapCountry = (flag: FlagEntry) => {
    const dialects = flags.filter((f) => f.country === flag.country);
    if (dialects.length > 1) {
      setExpanded((current) => (current === flag.country ? null : flag.country));
      return;
    }
    const first = dialects[0];
    if (first) pick(first);
  };

  return (
    <>
      {open && (
        <div data-flag-grid-panel data-flag-grid-wide={wide ? 'true' : undefined} role="dialog" aria-label={copy.title} onKeyDown={(event) => { if (event.key === 'Escape') { event.stopPropagation(); onOpenChange(false); } }} className="absolute inset-x-2 top-full z-40 mt-1 max-h-[min(60vh,calc(100vh-14rem))] overflow-y-auto rounded-xl border border-border bg-background p-3 shadow-xl">
          <div className="sticky -top-3 z-10 mb-2 flex items-center justify-between gap-2 bg-background">
            <p className="text-sm font-black uppercase tracking-wider">{copy.title}</p>
            <Button variant="ghost" size="icon" aria-label={copy.close} title={copy.close} onClick={() => onOpenChange(false)} className="shrink-0">
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          {groups.map(({ region, flags: regionFlags }) => regionFlags.some((flag) => primary.some((p) => p.country === flag.country)) && (
            <section key={region} className="mb-3 last:mb-0">
              <h4 className="mb-1.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground">{copy.groups[region]}</h4>
              <div className="flex flex-wrap gap-1.5">
                {regionFlags.map((original) => {
                  const flag = flags.find(entry => entry.country === original.country) ?? original;
                  const dialects = flags.filter((f) => f.country === flag.country);
                  return (
                    <Fragment key={flag.country}>
                      <Button variant="outline" size="sm" title={flag.label} aria-expanded={expanded === flag.country ? true : undefined} onClick={() => tapCountry(flag)} className="touch-manipulation gap-1 px-1!">
                        <img src={`https://flagcdn.com/w40/${flag.country}.png`} srcSet={`https://flagcdn.com/w80/${flag.country}.png 2x`} alt={locale === 'en' ? `${flag.label} flag` : flag.label} width={24} height={16} loading="lazy" draggable={false} className="h-3.5 w-5 rounded-sm object-cover" />
                        <span className={`max-w-[72px] truncate text-[10px] font-black uppercase tracking-wider ${flag.locale === locale || flag.lang === locale ? 'text-primary' : ''}`}>{flag.label}</span>
                      </Button>
                      {expanded === flag.country && dialects.map((dialect, index) => (
                        <Button key={`${flag.country}-grid-dialect-${index}`} variant="outline" size="sm" title={dialect.label} onClick={() => pick(dialect)} className="touch-manipulation gap-1">
                          <img src={`https://flagcdn.com/w40/${dialect.country}.png`} srcSet={`https://flagcdn.com/w80/${dialect.country}.png 2x`} alt={locale === 'en' ? `${dialect.label} flag` : dialect.label} width={24} height={16} loading="lazy" draggable={false} className="h-3.5 w-5 rounded-sm object-cover" />
                          <span className={`max-w-[110px] truncate text-[10px] font-black uppercase tracking-wider ${dialect.lang === locale || dialect.locale === locale ? 'text-primary' : ''}`}>{dialect.label}</span>
                        </Button>
                      ))}
                    </Fragment>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
