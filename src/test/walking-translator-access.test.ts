import { describe, expect, it } from 'vitest';
import { walkingTranslatorAccess } from '@/lib/travel-utility-copy';

describe('Walking Translator access', () => {
  it('costs zero', () => {
    expect(walkingTranslatorAccess.price).toBe(0);
  });

  it('is available to every user level', () => {
    expect(walkingTranslatorAccess.availableToAllUserLevels).toBe(true);
  });
});