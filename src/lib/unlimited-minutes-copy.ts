// Browser-safe presentation copy for the unlimited minute usage and unlimited
// invites statement that ships with every pricing tier. Native locales render
// instantly; all other flag languages arrive through the existing whole-page
// translation flow. This is owner-supplied commercial wording and never gates access.

export type MinutesLocale = 'en' | 'es' | 'zh' | 'de' | 'tl' | 'ja';

export const unlimitedMinutesCopy: Record<MinutesLocale, string> = {
  en: "Every package includes unlimited minute usage and unlimited invites.",
  es: "Todos los paquetes incluyen minutos de uso ilimitados e invitaciones ilimitadas.",
  tl: "Ang lahat ng package ay may kasamang walang limitasyong paggamit ng minuto at walang limitasyong mga imbita.",
  zh: "所有套餐均包含无限通话分钟数和无限邀请名额。",
  de: "Alle Pakete enthalten eine unbegrenzte Minutennutzung und unbegrenzte Einladungen.",
  ja: "すべてのパッケージに分単位の使い放題と招待の使い放題が含まれます。",
};
