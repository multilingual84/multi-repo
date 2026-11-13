// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { encryptWallet, decryptWallet } from '@/lib/wallet/crypto';
import { parseWalletQr, pinSchema, paidWalletAccess, PIN_MAX_ATTEMPTS, PIN_LOCK_MINUTES } from '@/lib/wallet/schema';
const identity={version:1 as const,id:'baaaac0a-620d-4bbf-988f-5ade01277625',nickname:'Traveler',language:'es',preferences:{'ml-speech-rate:es':'0.24'}};
describe('QR wallet protection',()=>{
 it('requires exactly four numeric PIN digits',()=>{expect(pinSchema.safeParse('1234').success).toBe(true);for(const v of ['123','12345','abcd'])expect(pinSchema.safeParse(v).success).toBe(false);});
 it('restores nickname language and per-language preference with the correct PIN',async()=>{const encrypted=await encryptWallet(identity,'1234');expect(await decryptWallet(encrypted,'1234')).toEqual(identity);});
 it('rejects a wrong PIN without revealing wallet contents',async()=>{const encrypted=await encryptWallet(identity,'1234');await expect(decryptWallet(encrypted,'4321')).rejects.toThrow();});
 it('rejects tampered identity material',async()=>{const encrypted=await encryptWallet(identity,'1234');await expect(decryptWallet({...encrypted,id:crypto.randomUUID()},'1234')).rejects.toThrow();});
 it('rejects public meeting QR data',()=>{expect(()=>parseWalletQr('https://multi-lingual.tech/#meeting-abcdef')).toThrow();});
 it('does not unlock a paid plan from QR identity alone',()=>{expect(paidWalletAccess(false,true,'2027-01-01',Date.parse('2026-10-26'))).toBe(false);});
 it('does not unlock unpaid or expired access even after PIN verification',()=>{expect(paidWalletAccess(true,false,'2027-01-01')).toBe(false);expect(paidWalletAccess(true,true,'2020-01-01')).toBe(false);expect(paidWalletAccess(true,true,'2027-01-01',Date.parse('2026-10-26'))).toBe(true);});
 it('defines bounded five-attempt fifteen-minute protection',()=>{expect(PIN_MAX_ATTEMPTS).toBe(5);expect(PIN_LOCK_MINUTES).toBe(15);});
});
