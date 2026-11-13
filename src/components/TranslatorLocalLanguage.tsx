import { useState } from 'react';
import { Button } from '@/components/ui/button';
import FlagGridPicker from '@/components/FlagGridPicker';
import { ALL_FLAGS } from '@/lib/flag-catalog';
import { localizedFlagLabel } from '@/lib/flag-label';
import { localLanguageCopy } from '@/lib/local-language-copy';
import type { UILocale } from '@/lib/ui-copy';

export default function TranslatorLocalLanguage({ locale, pageLanguage, language, onLanguage }: {
  locale: UILocale; pageLanguage: string; language: string;
  onLanguage: (language: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const copy = localLanguageCopy[locale];
  const flag = ALL_FLAGS.find(entry => entry.lang === language);
  const label = flag ? localizedFlagLabel(flag, pageLanguage) : language || copy.unknown;
  return <div className="flex min-w-0 flex-col items-center gap-2" data-translator-local-language>
    <label className="text-xs font-bold" htmlFor="translator-local-flags">{copy.choose}</label>
    <Button id="translator-local-flags" variant="outline" size="icon" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={copy.choose} title={`${copy.choose}: ${label}`}>
      <span aria-hidden="true" className="all-flags-mosaic"><span/><span/><span/><span/></span>
    </Button>
    <span className="max-w-full break-words text-xs" data-local-language-label>{label}</span>
    <FlagGridPicker flags={ALL_FLAGS.map(entry => ({ ...entry, label: localizedFlagLabel(entry, pageLanguage) }))} locale={locale} open={open} onOpenChange={setOpen} onSelect={entry => onLanguage(entry.lang)}/>
  </div>;
}