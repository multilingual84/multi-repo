import { describe, expect, it } from 'vitest';
import { flagEmoji, isReturnCallGated, lobbyAdCardBranding, LOBBY_FLAG_ROWS, lobbyFlagEntry } from '@/lib/lobby-ad-card';
import { lobbyAdCardCopy } from '@/lib/lobby-ad-card-copy';
import { PASS_DURATION_MS } from '@/lib/pass-preview';

describe('Lobby ad card flag matrix', () => {
  it('arranges the owner-specified flags across three stacked rows', () => {
    expect(LOBBY_FLAG_ROWS.length).toBe(3);
    expect(LOBBY_FLAG_ROWS[0]).toEqual(['us', 'ca', 'mx', 'ph', 'cn', 'jp', 'kr', 'vn', 'th', 'id', 'my', 'in']);
    expect(LOBBY_FLAG_ROWS[1]).toEqual(['gb', 'es', 'fr', 'de', 'it', 'pt', 'nl', 'pl', 'ua', 'by', 'ru', 'tr']);
    expect(LOBBY_FLAG_ROWS[2]).toEqual(['sa', 'ae', 'eg', 'ma', 'il', 'za', 'ke', 'ng', 'br', 'cl', 'ar', 'au']);
  });

  it('resolves every listed flag to a shared catalog entry', () => {
    for (const country of LOBBY_FLAG_ROWS.flat()) {
      expect(lobbyFlagEntry(country), country).toBeDefined();
    }
  });

  it('renders a regional-indicator emoji for each two-letter country', () => {
    expect(flagEmoji('us')).toBe('🇺🇸');
    expect(flagEmoji('jp')).toBe('🇯🇵');
    expect(flagEmoji('gb-wls')).toBe('🏳️');
  });
});

describe('Return-call gate', () => {
  const now = 1_000_000_000_000;
  it('gates an un-upgraded free operator once the 1-week pass has expired', () => {
    expect(isReturnCallGated(now - 1, now, false)).toBe(true);
    expect(isReturnCallGated(now - PASS_DURATION_MS, now, false)).toBe(true);
  });

  it('never gates while the pass is running or an upgrade is on file', () => {
    expect(isReturnCallGated(now + 1000, now, false)).toBe(false);
    expect(isReturnCallGated(now - 1, now, true)).toBe(false);
  });
});

describe('Lobby ad card branding and copy', () => {
  it('locks the corporate footer string', () => {
    expect(lobbyAdCardBranding.footer).toBe('© 2026 Multi-Lingual.tech, a division of Bricktown Software Systems LLC');
    expect(lobbyAdCardBranding).not.toHaveProperty('badge');
  });

  it('carries the gate warning and call-back label in every native locale', () => {
    for (const copy of Object.values(lobbyAdCardCopy)) {
      expect(copy.gateBody).toContain('$0.99');
      expect(copy.callBack.trim().length).toBeGreaterThan(0);
      expect(copy.close.trim().length).toBeGreaterThan(0);
    }
  });
});
