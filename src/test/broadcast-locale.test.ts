import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { broadcastStatusCopy, logExpiryCopy } from '@/lib/ecosystem-preview';
import type { UILocale } from '@/lib/ui-copy';

const LOCALES: UILocale[] = ['en', 'es', 'tl', 'zh', 'de', 'ja'];

describe('Public broadcast preview localization', () => {
  it('every native locale has all four broadcast status strings', () => {
    for (const locale of LOCALES) {
      const copy = broadcastStatusCopy[locale];
      expect(copy.transmitting.length).toBeGreaterThan(0);
      expect(copy.offAir.length).toBeGreaterThan(0);
      expect(copy.activeListeners).toContain('0');
      expect(copy.openBroadcast.length).toBeGreaterThan(0);
    }
  });

  it('Spanish broadcast strings are actually Spanish, not English', () => {
    const es = broadcastStatusCopy.es;
    expect(es.offAir).toBe('🔒 FUERA DEL AIRE');
    expect(es.activeListeners).toBe('Oyentes activos: 0');
    expect(es.openBroadcast).toContain('Abrir');
    expect(es.transmitting).toBe('📡 TRANSMITIENDO');
  });

  it('every native locale has log-expiry strings', () => {
    for (const locale of LOCALES) {
      expect(logExpiryCopy[locale].expired.length).toBeGreaterThan(0);
      expect(logExpiryCopy[locale].unlock.length).toBeGreaterThan(0);
    }
  });

  it('the broadcast component has no hardcoded English status strings left', () => {
    const source = readFileSync('src/components/EcosystemPreview.tsx', 'utf8');
    expect(source).not.toContain("'🔒 OFF AIR'");
    expect(source).not.toContain("'📡 TRANSMITTING'");
    expect(source).not.toContain('Active Listeners: 0</p>');
    expect(source).not.toContain('🌐 Open Public Setting Broadcast</Button>');
    expect(source).not.toContain('⏳ 7-Day Pass Expired</p>');
  });
});
