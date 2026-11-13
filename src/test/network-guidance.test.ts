import { expect, it } from 'vitest';
import { networkGuidanceCopy } from '@/lib/network-guidance-copy';

// What the owner asked for: say calls run on private networks, and that public
// Wi-Fi such as airports and restaurants does not carry them.
const EXPECT: Record<string, { private: string[]; public: string[] }> = {
  en: { private: ['cellular', 'Wi-Fi'], public: ['airport', 'restaurant'] },
  es: { private: ['datos', 'Wi-Fi'], public: ['aeropuerto', 'restaurante'] },
  tl: { private: ['cellular', 'Wi-Fi'], public: ['paliparan', 'restaurant'] },
  zh: { private: ['移动数据', 'Wi-Fi'], public: ['机场', '餐厅'] },
  de: { private: ['mobilen', 'WLAN'], public: ['Flugh', 'Restaurant'] },
  ja: { private: ['モバイル', 'Wi-Fi'], public: ['空港', 'レストラン'] },
};

it('every locale names the private networks a call can run on', () => {
  for (const [locale, need] of Object.entries(EXPECT)) {
    const copy = networkGuidanceCopy[locale as keyof typeof networkGuidanceCopy];
    for (const needle of need.private) expect(`${locale} private: ${copy.private}`).toContain(needle);
  }
});

it('every locale names public Wi-Fi that does not carry the call', () => {
  for (const [locale, need] of Object.entries(EXPECT)) {
    const copy = networkGuidanceCopy[locale as keyof typeof networkGuidanceCopy];
    for (const needle of need.public) expect(`${locale} public: ${copy.public}`).toContain(needle);
  }
});

it('every locale offers a next step without promising the call will work', () => {
  for (const locale of Object.keys(EXPECT)) {
    const copy = networkGuidanceCopy[locale as keyof typeof networkGuidanceCopy];
    expect(copy.title.length).toBeGreaterThan(0);
    expect(copy.try.length).toBeGreaterThan(0);
    expect(`${copy.private} ${copy.try}`).not.toMatch(/guarantee|always works|certain to work/i);
  }
});
