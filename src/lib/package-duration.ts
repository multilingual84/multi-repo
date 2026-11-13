import type { UILocale } from './ui-copy';

export function packageDurationDays(packageId: string) { return packageId === 'duo-yearly' ? 365 : 30; }

const durationCopy: Record<UILocale, { month: string; year: string }> = {
  en: { month: '30 days of access', year: '1 year of access' },
  es: { month: '30 días de acceso', year: '1 año de acceso' },
  tl: { month: '30 araw na access', year: '1 taong access' },
  zh: { month: '30天使用权', year: '1年使用权' },
  de: { month: '30 Tage Zugang', year: '1 Jahr Zugang' },
  ja: { month: '30日間の利用権', year: '1年間の利用権' },
};
export function packageDurationLabel(id: string, locale: UILocale) { return id === 'duo-yearly' ? durationCopy[locale].year : durationCopy[locale].month; }

export function includesPersonalTranslator(id: string) { return id === 'single'; }
const personalIncludedCopy: Record<UILocale, string> = {
  en: 'Personal Translator included', es: 'Traductor Personal incluido', tl: 'Kasama ang Personal na Tagasalin',
  zh: '包含个人翻译器', de: 'Persönlicher Übersetzer enthalten', ja: 'パーソナル翻訳を含む',
};
export function packagePersonalTranslatorLabel(id: string, locale: UILocale) { return includesPersonalTranslator(id) ? personalIncludedCopy[locale] : null; }