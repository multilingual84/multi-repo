import {describe,it,expect} from 'vitest';
import {canSendMessages,messagingUsdPrice,messagingSeats,messagingSku} from '@/lib/private-message-policy';
describe('messaging terms',()=>{
 it('keeps text sending free for life after the old trial',()=>{const start='2026-10-25T00:00:00Z';expect(canSendMessages(start,null,Date.parse('2026-10-31T23:59:59.999Z'))).toBe(true);expect(canSendMessages(start,null,Date.parse('2036-11-01T00:00:00Z'))).toBe(true);});
 it('keeps the distinct annual messaging plan at $0.99',()=>expect(messagingUsdPrice).toBe(0.99));
 it('offers two seats',()=>expect(messagingSeats).toBe(2));
 it('uses a separate messaging SKU',()=>expect(messagingSku).toBe('ML-PRIVATE-DUO-YEAR'));
 it('allows verified paid access after the trial',()=>expect(canSendMessages('2026-01-01T00:00:00Z','2026-11-02T00:00:00Z',Date.parse('2026-11-01T00:00:00Z'))).toBe(true));
});