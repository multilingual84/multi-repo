import { describe, expect, it } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';

const source = fs.readFileSync(path.resolve('src/components/MultiLingualOKCSystem.tsx'), 'utf8');

// Owner-confirmed factual claim: first ever global translation platform with
// zero sign-up screens and no contracts. It must appear in the hero paragraph
// of every hand-written locale.
describe('zero sign-up, no contracts first-claim', () => {
  it('states the claim in English', () => {
    expect(source).toContain(
      'Yes — we are factually the absolute first in the history of the technology sector to launch a global translation platform with zero sign-up screens and no contracts.'
    );
  });

  it('states the claim in Spanish', () => {
    expect(source).toContain('los primeros en la historia del sector tecnológico en lanzar una plataforma de traducción global sin pantallas de registro y sin contratos');
  });

  it('states the claim in Tagalog', () => {
    expect(source).toContain('walang sign-up screen at walang kontrata');
  });

  it('states the claim in Chinese', () => {
    expect(source).toContain('零注册页面、无合同约束的全球翻译平台');
  });

  it('states the claim in German', () => {
    expect(source).toContain('ohne Anmelde-Bildschirme und ohne Verträge gestartet haben');
  });

  it('states the claim in Japanese', () => {
    expect(source).toContain('サインアップ画面も契約も一切ないグローバル翻訳プラットフォームを世界で初めて立ち上げた存在');
  });
});
