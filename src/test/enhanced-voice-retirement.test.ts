import {expect,it} from 'vitest';
import {ENHANCED_VOICE_AVAILABLE,requireEnhancedVoice} from '@/lib/premium/retirement';
import {generatePremium} from '@/lib/premium/generate.server';
it('paid enhanced voice cannot be reopened by client controls',()=>{expect(ENHANCED_VOICE_AVAILABLE).toBe(false);expect(()=>requireEnhancedVoice()).toThrow('no longer offered');});
it('direct synthesis requests are retired without calling a provider or billing',async()=>{const response=await generatePremium(new Request('https://example.com/api/premium-voice',{method:'POST'}));expect(response.status).toBe(410);});