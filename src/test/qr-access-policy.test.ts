import {describe,it,expect} from 'vitest';
import {parseAccessQr,validDeviceSession,freshLegacyOwnership} from '../lib/qr-access-policy';
import {FREE_DAILY_MINUTES,currentUsage,hitsPaywall,isFreeForLife} from '../lib/free-allowance-policy';
describe('QR access and daily allowance',()=>{
 it('allows 30 minutes then requires upgrade',()=>{expect(FREE_DAILY_MINUTES).toBe(30);expect(hitsPaywall(false,1799999)).toBe(false);expect(hitsPaywall(false,1800000)).toBe(true);});
 it('resets after exactly 24 hours',()=>{const u={windowStart:1000,usedMs:1800000};expect(currentUsage(u,86400999).usedMs).toBe(1800000);expect(currentUsage(u,86401000).usedMs).toBe(0);});
 it('keeps text free for life',()=>{expect(isFreeForLife('messaging')).toBe(true);expect(isFreeForLife('call')).toBe(false);});
 it('rejects previous device session after a move',()=>{expect(validDeviceSession({device_hash:'new',generation:2},{deviceHash:'old',generation:1})).toBe(false);expect(validDeviceSession({device_hash:'new',generation:2},{deviceHash:'new',generation:2})).toBe(true);});
 it('copied old device proof cannot reuse a newer generation',()=>{expect(validDeviceSession({device_hash:'same',generation:3},{deviceHash:'same',generation:2})).toBe(false);});
 it('legacy enrollment needs fresh verified ownership, not just an identifier',()=>{expect(freshLegacyOwnership({handle:'owner'},'owner',500000)).toBe(false);expect(freshLegacyOwnership({handle:'other',legacyVerifiedAt:499999},'owner',500000)).toBe(false);expect(freshLegacyOwnership({handle:'owner',legacyVerifiedAt:200000},'owner',500000)).toBe(false);expect(freshLegacyOwnership({handle:'owner',legacyVerifiedAt:499999},'owner',500000)).toBe(true);});
 it('public QR cannot import an account',()=>{expect(()=>parseAccessQr('https://multi-lingual.tech/#my-code-7950e106-422f-40ee-91a2-a9f348677309')).toThrow();expect(()=>parseAccessQr(JSON.stringify({version:2,id:'7950e106-422f-40ee-91a2-a9f348677309'}))).toThrow();});
});