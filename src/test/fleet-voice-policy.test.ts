import {expect,it} from 'vitest';
import {fleetSeatLimit,fleetMemberAllowed} from '@/lib/fleet-policy';
import {DEFAULT_CALL_PREMIUM,estimatedVoiceMinutes} from '@/lib/voice-everyday-copy';
it('fleet owner must hold a paid multi-seat pack',()=>{expect(fleetSeatLimit(false,'enterprise')).toBe(0);expect(fleetSeatLimit(true,'team')).toBe(10);expect(fleetSeatLimit(true,'enterprise')).toBe(1500);});
it('members require owner approval',()=>{expect(fleetMemberAllowed(false,30,0)).toBe(false);expect(fleetMemberAllowed(true,30,0)).toBe(true);});
it('member allowance stops at owner-set daily limit',()=>{expect(fleetMemberAllowed(true,5,299)).toBe(true);expect(fleetMemberAllowed(true,5,300)).toBe(false);expect(fleetMemberAllowed(true,0,0)).toBe(false);});
it('enhanced voice defaults off for each call',()=>{expect(DEFAULT_CALL_PREMIUM).toBe(false);});
it('one dollar buys 6.25 enhanced session minutes',()=>{expect(estimatedVoiceMinutes(100)).toBe(6.25);});
it('five dollar estimate follows the same proportional rate',()=>{expect(estimatedVoiceMinutes(500)).toBe(31.25);});