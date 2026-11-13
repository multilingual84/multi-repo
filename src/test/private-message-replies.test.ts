import { describe, expect, it } from 'vitest';
import { canSendMessages, canSendToMailbox } from '@/lib/private-message-policy';
describe('unpaid message replies',()=>{
 const paidSender='11111111-1111-4111-8111-111111111111';
 const other='22222222-2222-4222-8222-222222222222';
 it('allows expired unpaid recipients to reply to an authorized paid sender',()=>{
  const expired=canSendMessages('2026-01-01T00:00:00Z',null,Date.parse('2026-10-25T00:00:00Z'));
  expect(expired).toBe(true);
  expect(canSendToMailbox(expired,paidSender,[paidSender])).toBe(true);
 });
 it('does not unlock unrelated new conversations',()=>expect(canSendToMailbox(false,other,[paidSender])).toBe(false));
 it('does not retain permission when the server no longer returns the paid sender',()=>expect(canSendToMailbox(false,paidSender,[])).toBe(false));
 it('accepts the authorized mailbox through its QR link',()=>expect(canSendToMailbox(false,`https://multi-lingual.tech/?messages=1&mailbox=${paidSender}`,[paidSender])).toBe(true));
 it('allows paid users to start a conversation without recipient entitlement',()=>expect(canSendToMailbox(true,other,[])).toBe(true));
});