import type { UILocale } from './ui-copy';

// The address people type is the same in every language, so it never gets translated.
export const qrSaveHintDomain = 'Multi-Lingual.tech';

export const qrSaveHintCopy: Record<UILocale, { lead: string }> = {
  en: { lead: 'Have the other person take a picture and save it on their phone or visit:' },
  es: { lead: 'Pide a la otra persona que tome una foto y la guarde en su teléfono, o visite:' },
  zh: { lead: '请对方拍照并保存到手机上，或访问：' },
  de: { lead: 'Lassen Sie die andere Person ein Foto machen und auf dem Handy speichern – oder besuchen Sie:' },
  tl: { lead: 'Hayaan ang kausap na kumuha ng larawan at i-save sa kanyang telepono, o bisitahan ang:' },
  ja: { lead: '相手の方に写真を撮ってスマホに保存してもらうか、こちらへ：' },
};

// Google Translate prefixes the page language, so normalise before looking up.
export function qrSaveHint(locale: string) {
  return qrSaveHintCopy[locale.replace(/^gt:/, '').split('-')[0] as UILocale] ?? qrSaveHintCopy.en;
}
