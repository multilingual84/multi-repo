import {expect,it} from 'vitest';
import {speechRateAtPosition,speechPositionAtRate,SPEECH_RATE} from '@/lib/speech-playback';
import {voiceFundingSchema} from '@/lib/premium/funding-policy';
it('starts at the former fastest rate at the exact slider midpoint',()=>{expect(SPEECH_RATE).toBe(0.8);expect(speechRateAtPosition(50)).toBe(0.8);expect(speechPositionAtRate(0.8)).toBe(50);expect(speechRateAtPosition(0)).toBe(.3);expect(speechRateAtPosition(100)).toBe(1.6);});
it.each([100,500,1000])('accepts requested automatic refill of %i cents',amount=>{expect(voiceFundingSchema.safeParse({enabled:true,amount,limit:1000,consent:true}).success).toBe(true);});
it('rejects unrequested refill amounts and limits below a refill',()=>{expect(voiceFundingSchema.safeParse({enabled:true,amount:200,limit:1000,consent:true}).success).toBe(false);expect(voiceFundingSchema.safeParse({enabled:true,amount:500,limit:100,consent:true}).success).toBe(false);});