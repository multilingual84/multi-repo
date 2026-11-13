import { expect, it } from 'vitest';
import { callShareHref, recipientCallLanguage } from '@/lib/shared-call-entry';
it('keeps saved spoken language when geography changes', () => {
  expect(recipientCallLanguage('es', 'ja-JP', 'jp', 'Asia/Tokyo')).toBe('es');
});
it('uses the phone language for a new recipient and geo only as fallback', () => {
  expect(recipientCallLanguage(null, 'ja-JP', 'us')).toBe('ja-JP');
  expect(recipientCallLanguage(null, '', 'jp')).toBe('ja');
});
it('shares the identical call room through text and email', () => {
  const link = 'https://multi-lingual.tech/#meeting-abc123def456';
  expect(decodeURIComponent(callShareHref('text', link))).toBe(`sms:?body=${link}`);
  expect(decodeURIComponent(callShareHref('email', link))).toBe(`mailto:?body=${link}`);
});
it('preserves the existing wallet QR call identity when shared', () => {
  const link = 'https://multi-lingual.tech/#my-code-7950e106-422f-40ee-91a2-a9f348677309';
  expect(decodeURIComponent(callShareHref('text', link))).toBe(`sms:?body=${link}`);
});