import {expect,it} from 'vitest';
import {canUsePremiumVoice} from '@/lib/premium/policy';
it('denies premium voice and changer without verified positive credit',()=>{
 expect(canUsePremiumVoice(null)).toBe(false);
 expect(canUsePremiumVoice({available:0})).toBe(false);
 expect(canUsePremiumVoice({available:-1})).toBe(false);
 expect(canUsePremiumVoice({available:NaN})).toBe(false);
});
it('allows positive premium credit only when unblocked',()=>{
 expect(canUsePremiumVoice({available:1})).toBe(true);
 expect(canUsePremiumVoice({available:100,blocked:'review'})).toBe(false);
});