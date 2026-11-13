import { beforeEach, describe, expect, it } from 'vitest';
import { enableMatchedVoice, setVoiceChangerProfile, voiceChangerProfile } from '@/lib/audio/voice-changer';
import { matchedPitch, setVoiceMatch, voiceMatchOn } from '@/lib/voice-match';

beforeEach(() => localStorage.clear());
describe('voice selection and matching', () => {
  it.each(['f-ava', 'm-james', 'deeper', 'natural', 'higher'] as const)('selecting %s automatically disables matching', id => {
    setVoiceMatch(true);
    setVoiceChangerProfile(id);
    expect(voiceChangerProfile()).toBe(id);
    expect(voiceMatchOn()).toBe(false);
    expect(matchedPitch(1.3)).toBe(1);
  });
  it('enabling matching restores lightweight natural speech and session pitch', () => {
    setVoiceChangerProfile('m-james');
    enableMatchedVoice();
    expect(voiceChangerProfile()).toBe('natural');
    expect(voiceMatchOn()).toBe(true);
    expect(matchedPitch(1.3)).toBe(1.3);
  });
});