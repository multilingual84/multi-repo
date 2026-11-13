import globalShareTranslations from './share-translations.json';

export const shareDescriptionEnglish = 'We provide an advanced, superior tech upgrade saving your administration up to 90% with no contracts or microcharges.';

// Sharing crawlers cannot run the page's Google Translate widget. Only use
// static translations here; unsupported request languages use English.
export const shareDescriptions: Record<string, string> = {
  ...globalShareTranslations,
  en: shareDescriptionEnglish,
  es: 'Ofrecemos una actualización tecnológica avanzada y superior que permite a su administración ahorrar hasta un 90%, sin contratos ni microcargos.',
  tl: 'Nagbibigay kami ng advanced at nakahihigit na pag-upgrade sa teknolohiya na makakatipid sa inyong administrasyon ng hanggang 90%, nang walang kontrata o maliliit na singil.',
  'zh-CN': '我们提供先进、卓越的技术升级，为您的行政管理节省高达90%的费用，无需签订合同，也无微额收费。',
  'zh-TW': '我們提供先進、卓越的技術升級，為您的行政管理節省高達90%的費用，無需簽訂合約，也無微額收費。',
  de: 'Wir bieten ein fortschrittliches, überlegenes Technologie-Upgrade, mit dem Ihre Verwaltung bis zu 90 % spart – ohne Verträge oder Kleinstgebühren.',
  ja: '先進的で優れた技術アップグレードを提供し、契約や少額課金なしで管理業務の費用を最大90%削減します。',
};

export function resolveShareLocale(acceptLanguage = ''): string {
  const preferences = acceptLanguage.split(',').map((entry, index) => {
    const [tag = '', ...parameters] = entry.trim().split(';');
    const quality = parameters.find(value => value.trim().startsWith('q='));
    const q = quality ? Number(quality.trim().slice(2)) : 1;
    return { tag: tag.toLowerCase(), q: Number.isFinite(q) ? q : 0, index };
  }).filter(entry => entry.q > 0).sort((a, b) => b.q - a.q || a.index - b.index);

  for (const { tag } of preferences) {
    if (tag.startsWith('zh')) {
      return /(?:tw|hk|mo|hant)/.test(tag) ? 'zh-TW' : 'zh-CN';
    }
    const base = tag.split('-')[0] ?? '';
    const aliases: Record<string, string> = { fil: 'tl', he: 'iw', nb: 'no', nn: 'no' };
    const language = aliases[base] ?? base;
    if (shareDescriptions[language]) return language;
  }
  return 'en';
}

export function getShareDescription(locale: string): string {
  return shareDescriptions[locale] ?? shareDescriptionEnglish;
}