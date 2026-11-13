import { describe, expect, it } from 'vitest';
import { unlimitedMinutesCopy, type MinutesLocale } from '@/lib/unlimited-minutes-copy';

// Each native locale must state, in its own language, that a package carries
// unlimited minute usage: the "unlimited" qualifier, the "minute" unit, and the
// word for "package". A missing or watered-down locale fails its own row.
const expectations: [MinutesLocale, string[]][] = [
  ['en', ['unlimited', 'minute', 'package', 'invit']],
  ['es', ['ilimitad', 'minuto', 'paquete', 'invitacion']],
  ['tl', ['walang limitasyon', 'minuto', 'package', 'imbita']],
  ['zh', ['无限', '分钟', '套餐', '邀请']],
  ['de', ['unbegrenzt', 'minuten', 'paket', 'einladung']],
  ['ja', ['使い放題', '分', 'パッケージ', '招待']],
];

describe('Unlimited minute usage statement', () => {
  it('covers all six native locales', () => {
    expect(Object.keys(unlimitedMinutesCopy).sort()).toEqual(['de', 'en', 'es', 'ja', 'tl', 'zh']);
  });

  it.each(expectations)('%s states unlimited minute usage on a package', (locale, tokens) => {
    const copy = unlimitedMinutesCopy[locale].toLowerCase();
    tokens.forEach((token) => expect(copy).toContain(token));
  });
});
