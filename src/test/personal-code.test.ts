import { beforeEach, describe, expect, it } from 'vitest';

import {
  clearOpenedPersonalCode, getPersonalCode, openedPersonalCode,
  personalCodeCopy, personalCodeIdFromHash, personalCodeLink, rememberOpenedPersonalCode,
} from '@/lib/personal-code';
import { isSharedCallLink } from '@/lib/answer-call';
import { roomFromHash } from '@/lib/call-room';

const LOCALES = ['en', 'es', 'de', 'tl', 'zh', 'ja'] as const;

beforeEach(() => { localStorage.clear(); sessionStorage.clear(); });

describe('personal free-for-life code', () => {
  it('mints one code on this phone and keeps using it', () => {
    const first = getPersonalCode();
    expect(first.length).toBeGreaterThan(8);
    expect(getPersonalCode()).toBe(first);
  });

  it('gives two different phones two different codes', () => {
    const first = getPersonalCode();
    localStorage.clear();
    expect(getPersonalCode()).not.toBe(first);
  });

  it('uses the existing wallet identity for the personal QR rather than creating a second code', () => {
    getPersonalCode();
    const walletId = '7950e106-422f-40ee-91a2-a9f348677309';
    localStorage.setItem('ml-device-wallet-v1', JSON.stringify({ id: walletId }));
    expect(getPersonalCode()).toBe(walletId);
    expect(personalCodeLink('https://multi-lingual.tech', getPersonalCode())).toBe(`https://multi-lingual.tech/#my-code-${walletId}`);
  });

  it('points the code at the visitor\'s own room on this site only', () => {
    const link = personalCodeLink('https://multi-lingual.tech/', getPersonalCode());
    expect(link.startsWith('https://multi-lingual.tech/#my-code-')).toBe(true);
    const hash = new URL(link).hash;
    expect(isSharedCallLink(hash)).toBe(true);
    expect(roomFromHash(hash)).toBeTruthy();
  });

  it('reads the code back out of a just-opened address, dashes and all', () => {
    const code = getPersonalCode();
    expect(personalCodeIdFromHash(new URL(personalCodeLink('https://multi-lingual.tech', code)).hash)).toBe(code);
    expect(personalCodeIdFromHash('#meeting-abc123')).toBe('');
    expect(personalCodeIdFromHash('')).toBe('');
  });

  it('still knows whose code this phone opened after the address is cleared', () => {
    const code = getPersonalCode();
    rememberOpenedPersonalCode(`#my-code-${code}`);
    expect(openedPersonalCode()).toBe(code);
    clearOpenedPersonalCode();
    expect(openedPersonalCode()).toBe('');
  });


  it('tells the visitor to keep or print the code because nothing is stored', () => {
    for (const locale of LOCALES) {
      const copy = personalCodeCopy[locale];
      expect(copy?.heading).toBeTruthy();
      expect(copy?.print).toBeTruthy();
      expect(copy?.exit).toBeTruthy();
      expect(copy?.notice).toMatch(/print|drucken|impr|印刷|打印/i);
      expect(copy!.notice.length).toBeGreaterThan(30);
    }
  });

  it('offers a PIN on the card in every locale and says the PIN is for new phones only', () => {
    for (const locale of LOCALES) {
      const copy = personalCodeCopy[locale];
      expect(copy?.pinHeading).toBeTruthy();
      expect(copy?.pinButton).toBeTruthy();
      expect(copy?.claimButton).toBeTruthy();
      expect(copy?.wrong).toBeTruthy();
      // The scan-and-talk side must never be presented as needing a PIN.
      expect(copy?.claimHint).toMatch(/without|sin|ohne|walang|无需|なし/i);
    }
  });
});
