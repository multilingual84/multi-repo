// @vitest-environment node
import {afterEach,expect,it,vi} from 'vitest';
import {netTransferredMinor} from '@/lib/referrals/status';
import {partnerAccountReady} from '@/lib/referrals/stripe.server';
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
it('pending tier commissions are not reported as transferred funds',()=>{
 expect(netTransferredMinor({status:'pending',share_minor:500,transferred_minor:0,reversed_minor:0})).toBe(0);
});
it('partial reversal subtracts the returned funds from the Stripe transfer',()=>{
 expect(netTransferredMinor({status:'transferred',share_minor:500,transferred_minor:500,reversed_minor:200})).toBe(300);
});
it('a fully reversed commission leaves no transferred funds',()=>{
 expect(netTransferredMinor({status:'reversed',share_minor:500,transferred_minor:500,reversed_minor:500})).toBe(0);
});
it.each([
 ['active','active',false,true],
 ['active','pending',false,false],
 ['pending','active',false,false],
 ['active','active',true,false],
])('requires active transfer and payout capabilities in the correct mode (%s, %s, %s)',async(transfer,payout,live,expected)=>{
 vi.stubEnv('STRIPE_TEST_API_KEY','sk_test_fixture');
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({id:'acct_fixture',livemode:live,configuration:{recipient:{capabilities:{stripe_balance:{stripe_transfers:{status:transfer},payouts:{status:payout}}}}}}))));
 expect(await partnerAccountReady('acct_fixture',false)).toBe(expected);
});