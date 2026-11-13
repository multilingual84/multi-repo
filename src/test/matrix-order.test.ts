import { describe, expect, it } from 'vitest';
import { uiCopy, type UILocale } from '@/lib/ui-copy';

// The owner asked that government agencies and emergency dispatch be the final
// two cards of both industry mock-ups, government first, in every native locale.
// A locale whose list ends on any other pair fails its own row.

const audienceTails: [UILocale, string, string][] = [
  ['en', 'Government agencies', 'Emergency Dispatch & 911 Call Centers'],
  ['es', 'Agencias gubernamentales', 'Despacho de Emergencias y Centros 911'],
  ['zh', '政府机构', '紧急调度与911呼叫中心'],
  ['de', 'Behörden', 'Notrufzentralen & 911'],
  ['tl', 'Mga ahensya ng gobyerno', 'Emergency Dispatch at 911 Call Centers'],
  ['ja', '政府機関', '緊急通報・911コールセンター'],
];

describe('Audience mock-up order', () => {
  it.each(audienceTails)('%s ends with government, then emergency', (locale, government, emergency) => {
    expect(uiCopy[locale].audiences.map((a) => a.title).slice(-2)).toEqual([government, emergency]);
  });
});

