import { describe, expect, it } from 'vitest';
import { conversationPartner, parseAutomaticTranslation } from '@/lib/automatic-conversation';
describe('automatic conversation direction', () => {
  it('detects the other language without defaulting to English or Spanish', () => {
    const result = parseAutomaticTranslation('ja|tl|Magandang umaga');
    expect(result.lang).toBe('tl');
    expect(conversationPartner('tl', result.source)).toBe('ja');
  });
  it('retains the detected language when the owner replies', () => {
    const result = parseAutomaticTranslation('en-US|zh|你好');
    expect(conversationPartner('en', result.source, 'zh')).toBe('zh');
    expect(result.lang).toBe('zh');
  });
  it('does not invent a partner language if the owner speaks first', () => {
    expect(conversationPartner('es', 'es-MX')).toBeUndefined();
  });
  it('rejects malformed detection instead of speaking metadata', () => {
    expect(() => parseAutomaticTranslation('Some commentary')).toThrow();
  });
});