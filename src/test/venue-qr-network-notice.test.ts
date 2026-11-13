import { expect, it } from 'vitest';
import { venueQrCopy } from '@/lib/venue-qr-copy';

// The owner asked the venue QR notice to match the call-screen guidance:
// both people must join and allow the microphone, calls run on cellular data or
// private Wi-Fi, and public Wi-Fi such as airports and restaurants does not carry them.
const EXPECT: Record<string, { mic: string; private: string[]; public: string[] }> = {
  en: { mic: 'microphone', private: ['cellular', 'Wi-Fi'], public: ['airport', 'restaurant'] },
  es: { mic: 'micrófono', private: ['datos', 'Wi-Fi'], public: ['aeropuerto', 'restaurante'] },
  tl: { mic: 'mikropono', private: ['cellular', 'Wi-Fi'], public: ['paliparan', 'restaurant'] },
  zh: { mic: '麦克风', private: ['移动数据', 'Wi-Fi'], public: ['机场', '餐厅'] },
  de: { mic: 'Mikrofon', private: ['mobile', 'WLAN'], public: ['Flugh', 'Restaurant'] },
  ja: { mic: 'マイク', private: ['モバイル', 'Wi-Fi'], public: ['空港', 'レストラン'] },
};

it('every locale keeps the join-and-microphone requirement in the venue notice', () => {
  for (const [locale, need] of Object.entries(EXPECT)) {
    const notice = venueQrCopy[locale as keyof typeof venueQrCopy].notice;
    expect(`${locale} notice: ${notice}`).toContain(need.mic);
  }
});

it('every locale names the private networks a venue call can run on', () => {
  for (const [locale, need] of Object.entries(EXPECT)) {
    const notice = venueQrCopy[locale as keyof typeof venueQrCopy].notice;
    for (const needle of need.private) expect(`${locale} notice: ${notice}`).toContain(needle);
  }
});

it('every locale names public Wi-Fi that does not carry the venue call', () => {
  for (const [locale, need] of Object.entries(EXPECT)) {
    const notice = venueQrCopy[locale as keyof typeof venueQrCopy].notice;
    for (const needle of need.public) expect(`${locale} notice: ${notice}`).toContain(needle);
  }
});

it('no locale promises the venue call will connect', () => {
  for (const locale of Object.keys(EXPECT)) {
    const notice = venueQrCopy[locale as keyof typeof venueQrCopy].notice;
    expect(notice).not.toMatch(/guarantee|always works|certain to work|will always/i);
  }
});
