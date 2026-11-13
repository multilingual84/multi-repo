import {it,expect} from 'vitest';
import {canUseVoiceChanger,canUsePremiumVoice} from '@/lib/premium/policy';
import {shouldConfirmPremiumSpend,localVoiceAmount,sessionUsage} from '@/lib/premium/session-ui';
import {voiceCreditAlert} from '@/lib/wallet/privacy';
it('a verified paid Solo pack unlocks changer controls but not credit synthesis',()=>{expect(canUseVoiceChanger({verified:true,paid:true,tier:'solo'})).toBe(true);expect(canUseVoiceChanger({verified:false,paid:true,tier:'solo'})).toBe(false);expect(canUseVoiceChanger({verified:true,paid:false,tier:'solo'})).toBe(false);expect(canUsePremiumVoice({available:0})).toBe(false);});
it('suppressing the reminder never replaces consent',()=>{expect(shouldConfirmPremiumSpend(false,true)).toBe(true);expect(shouldConfirmPremiumSpend(true,false)).toBe(true);expect(shouldConfirmPremiumSpend(true,true)).toBe(false);});
it('minutes are elapsed time, cost stays character-metered',()=>{expect(sessionUsage(1000,60000)).toEqual({characters:1000,minutes:1,usd:.1});expect(sessionUsage(1000,120000).usd).toBe(.1);});
it('converts a known country without silently using USD for unsupported regions',()=>{expect(localVoiceAmount(1,'us')).toEqual({amount:1,code:'USD'});expect(localVoiceAmount(1,'unknown')).toBe(null);expect(localVoiceAmount(1,'jp')?.code).toBe('JPY');});
it('warns at zero or below the chosen threshold',()=>{expect(voiceCreditAlert(0,.1)).toBe('zero');expect(voiceCreditAlert(999,.1)).toBe('low');expect(voiceCreditAlert(1000,.1)).toBe(null);});