// Browser-safe presentation copy for pricing-tier seat counts.
// Native locales render instantly; all other flag languages arrive through the
// existing whole-page translation flow. This module never gates access.

export type SeatLocale = 'en' | 'es' | 'zh' | 'de' | 'tl' | 'ja';

type SeatStrings = {
  one: string;
  many: string;
  unlimited: string;
  /** True when the count sits directly against the counter with no space (中文, 日本語). */
  tight: boolean;
};

export const seatCopy: Record<SeatLocale, SeatStrings> = {
  en: { one: "seat", many: "seats", unlimited: "Unlimited seats", tight: false },
  es: { one: "asiento", many: "asientos", unlimited: "Asientos ilimitados", tight: false },
  zh: { one: "个席位", many: "个席位", unlimited: "席位不限", tight: true },
  de: { one: "Sitz", many: "Sitze", unlimited: "Unbegrenzte Sitze", tight: false },
  tl: { one: "upuan", many: "upuan", unlimited: "Walang limitasyong upuan", tight: false },
  ja: { one: "席", many: "席", unlimited: "無制限の席", tight: true },
};

/** seats = null means unlimited */
export function formatSeats(locale: SeatLocale, seats: number | null): string {
  const strings = seatCopy[locale] || seatCopy.en;
  if (seats === null) return strings.unlimited;
  if (seats === 1) return strings.tight ? `${seats}${strings.one}` : `${seats} ${strings.one}`;
  return strings.tight ? `${seats}${strings.many}` : `${seats} ${strings.many}`;
}
