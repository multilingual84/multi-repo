import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { qrSaveHint, qrSaveHintCopy, qrSaveHintDomain } from '@/lib/qr-save-hint-copy';

const LOCALES = ['en', 'es', 'zh', 'de', 'tl', 'ja'] as const;

// Every QR display on the site, and the marker of the code picture inside it.
const SURFACES: Record<string, string> = {
  'src/components/WalkingTranslator.tsx': 'alt={c.qr}',
  'src/components/VenueQRPreview.tsx': 'data-venue-qr-image',
  'src/components/PassInterface.tsx': 'data-pass-qr',
  'src/components/AffiliateQR.tsx': 'alt={c.title}',
  'src/components/MeetingBroadcastPreview.tsx': 'alt={c.title}',
  'src/components/LobbyAdCard.tsx': 'lobby QR',
  'src/components/PrivateMessaging.tsx': 'width={240}',
  'src/components/MultiLingualOKCSystem.tsx': 'data-podium-qr',
};

describe('QR save caption', () => {
  it('carries the owner’s wording in English', () => {
    expect(qrSaveHintCopy.en.lead).toBe(
      'Have the other person take a picture and save it on their phone or visit:',
    );
  });

  it('keeps the address spelled exactly as typed, in every locale', () => {
    expect(qrSaveHintDomain).toBe('Multi-Lingual.tech');
  });

  it('is present in every native locale', () => {
    for (const locale of LOCALES) {
      expect(qrSaveHintCopy[locale].lead.trim().length).toBeGreaterThan(10);
    }
  });

  it('follows the page language, including translated pages', () => {
    expect(qrSaveHint('gt:es')).toBe(qrSaveHintCopy.es);
    expect(qrSaveHint('zh-CN')).toBe(qrSaveHintCopy.zh);
    expect(qrSaveHint('sw')).toBe(qrSaveHintCopy.en);
  });

  it('is bold capitals and leaves the address untranslated', () => {
    const source = readFileSync('src/components/QrSaveHint.tsx', 'utf8');
    expect(source).toContain('font-black uppercase');
    expect(source).toContain('translate="no"');
    expect(source).toContain('notranslate');
    expect(source).toContain('normal-case');
  });

  it('sits directly above the QR picture on every surface', () => {
    for (const [path, imageMarker] of Object.entries(SURFACES)) {
      const source = readFileSync(path, 'utf8');
      const hint = source.indexOf('<QrSaveHint');
      const image = source.indexOf(imageMarker);
      expect(hint, path).toBeGreaterThan(-1);
      expect(image, path).toBeGreaterThan(-1);
      expect(hint, path).toBeLessThan(image);
    }
  });

  it('renders exactly once per surface', () => {
    for (const path of Object.keys(SURFACES)) {
      const source = readFileSync(path, 'utf8');
      expect(source.match(/<QrSaveHint/g), path).toHaveLength(1);
    }
  });
});
