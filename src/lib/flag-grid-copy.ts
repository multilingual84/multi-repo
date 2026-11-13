// Native copy for the all-languages grid picker, in all six native locales.
// Other flags receive the whole-page translation of this text.
import type { FlagRegion } from './flag-grid';

export type FlagGridLocale = 'en' | 'es' | 'zh' | 'de' | 'tl' | 'ja';

export const FLAG_GRID_LOCALES: FlagGridLocale[] = ['en', 'es', 'zh', 'de', 'tl', 'ja'];

export type FlagGridCopy = {
  /** Label for the button that opens the grid. Kept short so it never wraps. */
  button: string;
  /** Heading inside the grid panel. */
  title: string;
  /** Label for the close button. */
  close: string;
  /** Continent group headings. */
  groups: Record<FlagRegion, string>;
};

export const flagGridCopy: Record<FlagGridLocale, FlagGridCopy> = {
  en: {
    button: 'All languages',
    title: 'All languages',
    close: 'Close',
    groups: { africa: 'Africa', americas: 'Americas', asia: 'Asia', europe: 'Europe', mena: 'Middle East & North Africa', oceania: 'Oceania' },
  },
  es: {
    button: 'Todos los idiomas',
    title: 'Todos los idiomas',
    close: 'Cerrar',
    groups: { africa: 'África', americas: 'Américas', asia: 'Asia', europe: 'Europa', mena: 'Medio Oriente y Norte de África', oceania: 'Oceanía' },
  },
  zh: {
    button: '全部语言',
    title: '全部语言',
    close: '关闭',
    groups: { africa: '非洲', americas: '美洲', asia: '亚洲', europe: '欧洲', mena: '中东与北非', oceania: '大洋洲' },
  },
  de: {
    button: 'Alle Sprachen',
    title: 'Alle Sprachen',
    close: 'Schließen',
    groups: { africa: 'Afrika', americas: 'Amerika', asia: 'Asien', europe: 'Europa', mena: 'Naher Osten & Nordafrika', oceania: 'Ozeanien' },
  },
  tl: {
    button: 'Lahat ng wika',
    title: 'Lahat ng wika',
    close: 'Isara',
    groups: { africa: 'Aprika', americas: 'Amerika', asia: 'Asya', europe: 'Europa', mena: 'Gitnang Silangan at Hilagang Aprika', oceania: 'Oceania' },
  },
  ja: {
    button: 'すべての言語',
    title: 'すべての言語',
    close: '閉じる',
    groups: { africa: 'アフリカ', americas: '南北アメリカ', asia: 'アジア', europe: 'ヨーロッパ', mena: '中東・北アフリカ', oceania: 'オセアニア' },
  },
};
