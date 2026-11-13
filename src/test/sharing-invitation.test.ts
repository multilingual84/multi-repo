import { describe, expect, it } from 'vitest';
import { qrSharingCopy } from '@/lib/qr-sharing-copy';

describe('stop-hand sharing message', () => {
  it('includes Individuals alongside the other groups in every native locale', () => {
    expect(qrSharingCopy.en.invitation).toContain('Influencers and Individuals can also Earn 50%');
    expect(qrSharingCopy.es.invitation).toContain('individuos');
    expect(qrSharingCopy.zh.invitation).toContain('个人');
    expect(qrSharingCopy.de.invitation).toContain('Einzelpersonen');
    expect(qrSharingCopy.tl.invitation).toContain('indibidwal');
    expect(qrSharingCopy.ja.invitation).toContain('個人');
  });

  it('keeps Social Workers in the list', () => {
    expect(qrSharingCopy.en.invitation).toContain('Social Workers');
  });

  it('tells sharers Stripe sign-up is free in every native locale', () => {
    for (const locale of ['en', 'es', 'zh', 'de', 'tl', 'ja'] as const) {
      const c = qrSharingCopy[locale];
      expect(c.signup.length, `${locale}.signup`).toBeGreaterThan(0);
      expect(c.freeSignup.length, `${locale}.freeSignup`).toBeGreaterThan(0);
      expect(c.setup.length, `${locale}.setup`).toBeGreaterThan(0);
    }
    expect(qrSharingCopy.en.freeSignup).toContain('Free sign up');
  });
});
