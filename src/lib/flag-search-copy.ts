// Native copy for the "type to find your flag" search box, in all six native
// locales. Other flags receive the whole-page translation of this text.
export type FlagSearchLocale = 'en' | 'es' | 'zh' | 'de' | 'tl' | 'ja';

export type FlagSearchCopy = {
  /** Short caption shown beside the box. Kept short so it never wraps. */
  hint: string;
  /** Placeholder inside the empty box. */
  placeholder: string;
  /** Shown when nothing matches what the visitor typed. */
  none: string;
  /** Label for the button that empties the box. */
  clear: string;
  /** Accessible name of the box. */
  label: string;
};

export const flagSearchCopy: Record<FlagSearchLocale, FlagSearchCopy> = {
  en: {
    hint: 'Type your language to find your flag',
    placeholder: 'Type your language…',
    none: 'No flag matches that word yet',
    clear: 'Clear',
    label: 'Search for your language',
  },
  es: {
    hint: 'Escribe tu idioma para hallar tu bandera',
    placeholder: 'Escribe tu idioma…',
    none: 'Ninguna bandera coincide con esa palabra',
    clear: 'Borrar',
    label: 'Buscar tu idioma',
  },
  zh: {
    hint: '输入你的语言，快速找到你的国旗',
    placeholder: '输入你的语言…',
    none: '还没有国旗与这个词相符',
    clear: '清除',
    label: '搜索你的语言',
  },
  de: {
    hint: 'Sprache eintippen und Flagge finden',
    placeholder: 'Sprache eintippen…',
    none: 'Keine Flagge passt zu diesem Wort',
    clear: 'Löschen',
    label: 'Nach deiner Sprache suchen',
  },
  tl: {
    hint: 'I-type ang wika para hanapin ang watawat',
    placeholder: 'I-type ang wika…',
    none: 'Walang watawat na tumutugma sa salitang iyan',
    clear: 'Burahin',
    label: 'Hanapin ang iyong wika',
  },
  ja: {
    hint: '言語を入力して国旗を見つけましょう',
    placeholder: '言語を入力…',
    none: 'その言葉に合う国旗はありません',
    clear: '消去',
    label: '言語を検索',
  },
};
