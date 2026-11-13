import {describe,it,expect} from 'vitest';
import {characterCount,characterCostUsd,premiumExpired,verifiedVoiceCredit,VOICE_BUDGETS,presetVoiceForPlayback,localPremiumPitchRate} from '@/lib/premium/policy';
describe('approved premium voice rules',()=>{
 it('applies local pitch only when enabled with gentle bounds',()=>{expect(localPremiumPitchRate(false,1.1)).toBe(1);expect(localPremiumPitchRate(true,1.1)).toBe(1.1);expect(localPremiumPitchRate(true,.6)).toBe(.85);expect(localPremiumPitchRate(true,1.8)).toBe(1.15);expect(localPremiumPitchRate(true,NaN)).toBe(1);});
 it('keeps premium synthesis default unless preset changer is enabled',()=>{expect(presetVoiceForPlayback(false,'Puck')).toBe('Kore');expect(presetVoiceForPlayback(true,'Puck')).toBe('Puck');expect(presetVoiceForPlayback(true,'unlicensed')).toBe('Kore');});
 it('charges $0.10 per 1000 characters proportionally',()=>{expect(characterCostUsd(1000)).toBe(.10);expect(characterCostUsd(7)).toBe(.0007);});
 it('counts Unicode characters rather than UTF16 halves',()=>expect(characterCount('😀a')).toBe(2));
 it('offers exactly $1 $5 $10 USD credit budgets',()=>expect([...VOICE_BUDGETS]).toEqual([100,500,1000]));
 it('stops at 90 minutes even with recent conversation',()=>{expect(premiumExpired(0,5399999,5399999)).toBe(false);expect(premiumExpired(0,5400000,5400000)).toBe(true);});
 it('stops after 2 minutes without conversation',()=>{expect(premiumExpired(0,0,119999)).toBe(false);expect(premiumExpired(0,0,120000)).toBe(true);});
 const s={status:'complete',payment_status:'paid',mode:'payment',currency:'usd',client_reference_id:'owner',metadata:{purpose:'premium_voice_credit',wallet:'owner',cents:'100'},amount_subtotal:100};
 it('requires completed paid owner-scoped credit checkout',()=>{expect(verifiedVoiceCredit(s,'owner',100)).toBe(true);expect(verifiedVoiceCredit({...s,payment_status:'unpaid'},'owner',100)).toBe(false);expect(verifiedVoiceCredit(s,'thief',100)).toBe(false);expect(verifiedVoiceCredit({...s,amount_subtotal:99},'owner',100)).toBe(false);});
});
