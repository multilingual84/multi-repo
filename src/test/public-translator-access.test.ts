import { describe, expect, it } from 'vitest';
import { publicTranslatorLink, isPublicTranslatorHash } from '@/lib/public-translator-link';
import { roomFromHash } from '@/lib/call-room';
import { parseAccessQr } from '@/lib/qr-access-policy';
import { qrAccessPackage } from '@/lib/qr-access-status';
import { callShareHref } from '@/lib/shared-call-entry';
describe('public one-phone access', () => {
  it('offers the week without starting its clock merely on arrival', () => {
    expect(qrAccessPackage({verified:true,paid:false,tier:'none',renewsAt:null,trialExpiresAt:null}, 0)).toBe('eligible');
  });
  it('opens translation without being a call or private recovery code', () => {
    const link = publicTranslatorLink('https://multi-lingual.tech', '7950e106-422f-40ee-91a2-a9f348677309');
    expect(isPublicTranslatorHash(new URL(link).hash)).toBe(true);
    expect(roomFromHash(new URL(link).hash)).toBe(null);
    expect(() => parseAccessQr(link)).toThrow();
    expect(new URL(link).search).toBe('');
    expect(decodeURIComponent(callShareHref('text',link))).toBe(`sms:?body=${link}`);
    expect(decodeURIComponent(callShareHref('email',link))).toBe(`mailto:?body=${link}`);
  });
  it('shows the weekly pass before its expiry', () => {
    expect(qrAccessPackage({verified:true,paid:true,tier:'trial',renewsAt:new Date(604800000).toISOString()}, 604799999)).toBe('weekly');
  });
  it('drops to lifetime limited access at pass expiry', () => {
    expect(qrAccessPackage({verified:true,paid:true,tier:'trial',renewsAt:new Date(604800000).toISOString()}, 604800000)).toBe('limited');
  });
});