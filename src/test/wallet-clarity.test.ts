import {expect,it} from 'vitest';
import {planDaysLeft} from '@/lib/wallet/clarity';
import {SLOW_SPEECH_PACES,SPEECH_RATE} from '@/lib/speech-playback';
it('shows remaining paid days including a partial final day',()=>{expect(planDaysLeft('2026-10-27T01:00:00Z',Date.parse('2026-10-26T00:00:00Z'))).toBe(2);expect(planDaysLeft('2026-10-25T00:00:00Z',Date.parse('2026-10-26T00:00:00Z'))).toBe(0);expect(planDaysLeft(null)).toBe(0);});
it('offers ten slow speech paces starting at the slowest',()=>{expect(SLOW_SPEECH_PACES).toEqual([.15,.2,.25,.3,.35,.4,.45,.5,.55,.6]);expect(SPEECH_RATE).toBe(0.8);});