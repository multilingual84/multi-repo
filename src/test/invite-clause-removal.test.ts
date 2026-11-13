import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// The owner asked that the closing clause of the invitation helper copy —
// "with absolute zero sign-up chores or upfront commitments required" — be
// deleted outright in every native locale, while the rest of the sentence and
// the whole backend stay exactly as they are. Each locale's own removed phrase
// is checked, so a locale that silently keeps its version fails its own row.

const source = readFileSync(
  path.resolve('src/components/MultiLingualOKCSystem.tsx'),
  'utf8',
);

const inviteSubs: string[] = [...source.matchAll(/inviteSub: "([^"]*)"/g)].map((m) => m[1] ?? "");

const banned: [string, string][] = [
  ['en', 'with absolute zero sign-up chores or upfront commitments required'],
  ['es', 'sin ningún trámite de registro ni compromiso por adelantado'],
  ['tl', 'walang anumang abala sa pag-sign up o paunang commitment'],
  ['zh', '完全无需注册，也无需任何预先承诺'],
  ['de', 'ganz ohne Registrierungsaufwand oder Vorabverpflichtungen'],
  ['ja', '面倒な登録も事前の契約も一切不要です'],
];

describe('Invitation helper copy', () => {
  it('keeps one invitation line per native locale', () => {
    expect(inviteSubs).toHaveLength(6);
  });

  it.each(banned)('%s no longer carries the deleted clause', (locale, phrase) => {
    expect(inviteSubs.some((line) => line.includes(phrase))).toBe(false);
  });

  it('still ends each invitation line on the trial-pass offer', () => {
    expect((inviteSubs[0] ?? "").endsWith('launch their own 7-day free trial pass.')).toBe(true);
    expect((inviteSubs[1] ?? "").endsWith('pase de prueba gratuito de 7 días.')).toBe(true);
    expect((inviteSubs[2] ?? "").endsWith('7-araw na libreng trial pass.')).toBe(true);
    expect((inviteSubs[3] ?? "").endsWith('7天免费试用通行证的选项。')).toBe(true);
    expect((inviteSubs[4] ?? "").endsWith('7-Tage-Testpass zu starten.')).toBe(true);
    expect((inviteSubs[5] ?? "").endsWith('オプションを即座に提供します。')).toBe(true);
  });

  it('keeps the rest of the invitation sentence intact', () => {
    expect(inviteSubs[0] ?? "").toContain('Viral Pass Ingress:');
    expect(inviteSubs[0] ?? "").toContain('7-day all-access invitation');
  });
});
