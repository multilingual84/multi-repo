import { describe, expect, it } from 'vitest';
import { greetingTexml } from '@/routes/api/public/telephony/inbound';

describe('Clara phone greeting', () => {
  it('speaks the greeting then hangs up', () => {
    const xml = greetingTexml();
    expect(xml).toContain('<Say');
    expect(xml).toContain('multi-lingual dot tech');
    expect(xml.indexOf('<Hangup/>')).toBeGreaterThan(xml.indexOf('</Say>'));
  });
});
