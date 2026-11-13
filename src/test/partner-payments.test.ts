// @vitest-environment node
import {beforeEach,afterEach,expect,it,vi} from 'vitest';
import {tierCommissionMinor,remainingCommission,commissionEligibleAt} from '@/lib/referrals/policy';
const mocks=vi.hoisted(()=>({stripe:vi.fn(),ready:vi.fn(),from:vi.fn(),rpc:vi.fn(),enabled:vi.fn()}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{from:mocks.from,rpc:mocks.rpc}}));
vi.mock('@/lib/referrals/stripe.server',()=>({partnerStripe:mocks.stripe,partnerAccountReady:mocks.ready,livePartnerPaymentsEnabled:mocks.enabled}));
vi.mock('@/lib/stripe.functions',()=>({packageCheckoutPrices:{single:{tier:'solo',prices:{USD:'price_tier'}},hub:{tier:'hub',prices:{USD:'price_other'}}}}));
import {recordPartnerInvoice,settlePartnerCommission,runPartnerPayments} from '@/lib/referrals/commissions.server';
let saved:Record<string,any>[]=[];
const row={id:'commission',partner_id:'partner',invoice_id:'in_fixture',charge_id:'ch_fixture',currency:'usd',tier_minor:100,share_minor:50,livemode:false,transfer_id:null,transferred_minor:0,reversed_minor:0};
const invoice={id:'in_fixture',subscription:'sub_fixture',paid:true,amount_paid:110,currency:'usd',livemode:false,charge:'ch_fixture',status_transitions:{paid_at:1700000000}};
let metadata:Record<string,string>,charge:Record<string,any>;
beforeEach(()=>{
 vi.resetAllMocks();saved=[];metadata={partner_referral:'ML-0000000000000000',tier:'solo',credential_handle:'buyer'};
 charge={livemode:false,paid:true,currency:'usd',amount:110,amount_refunded:0,disputed:false,balance_transaction:'txn_fixture'};
 mocks.enabled.mockReturnValue(false);mocks.ready.mockResolvedValue(true);
 mocks.from.mockImplementation((table:string)=>{const q:any={select:()=>q,eq:()=>q,single:async()=>({data:{stripe_account:'acct_fixture'},error:null}),maybeSingle:async()=>({data:{id:'partner',wallet:'owner'},error:null}),upsert:async(v:any)=>{if(!saved.some(s=>s['invoice_id']===v.invoice_id))saved.push(v);return {error:null};},update:(v:any)=>{saved.push(v);return q;},then:(resolve:any)=>resolve({error:null})};return q;});
 mocks.stripe.mockImplementation(async(path:string,_live:boolean,body:any)=>{
  if(path.includes('/subscriptions/'))return {livemode:false,metadata};
  if(path.includes('/invoices/'))return {has_more:false,data:[{amount:100,price:{id:'price_tier'}},{amount:10,price:{id:'price_fee'}}]};
  if(path.includes('/charges/'))return charge;
  if(path.includes('/balance_transactions/'))return {status:'available',livemode:false,currency:'usd',fee:30};
  if(path.startsWith('/v1/transfers?'))return {has_more:false,data:[]};
  if(path==='/v1/transfers')return {id:'tr_fixture',livemode:false,amount:body.amount};
  if(path.endsWith('/reversals'))return {id:'trr_fixture'};
  if(path.includes('/transfers/'))return {amount:50,amount_reversed:0};
  throw new Error('Unexpected Stripe operation');
 });
});
afterEach(()=>vi.unstubAllEnvs());
it.each(['solo','yearly','team','hub','community','enterprise_global'])('splits %s tier purchases at exactly 50%%',tier=>expect(tierCommissionMinor(tier,undefined,1000)).toBe(500));
it('never splits voice credit even if a tier metadata field is present',()=>expect(tierCommissionMinor('solo','premium_voice_credit',1000)).toBe(0));
it('free or unknown purchases earn nothing',()=>{expect(tierCommissionMinor('free',undefined,100)).toBe(0);expect(tierCommissionMinor('solo',undefined,0)).toBe(0);});
it('holds each purchase for 30 days from payment, not partner signup',()=>expect(commissionEligibleAt(1700000000)).toBe('2023-12-14T22:13:20.000Z'));
it('signed-payment record preserves the full 50% share and is idempotent',async()=>{await recordPartnerInvoice(invoice,false);await recordPartnerInvoice(invoice,false);expect(saved).toHaveLength(1);expect(saved[0]).toMatchObject({tier_minor:100,share_minor:50,fee_minor:0,eligible_at:'2023-12-14T22:13:20.000Z'});});
it('a $0.99 package plus $0.35 surcharge earns a full rounded $0.50 share',async()=>{charge['amount']=134;(mocks.stripe as any).mockImplementation(async(path:string,_live:boolean,body:any)=>{
 if(path.includes('/subscriptions/'))return {livemode:false,metadata};
 if(path.includes('/invoices/'))return {has_more:false,data:[{amount:99,price:{id:'price_tier'}},{amount:35,price:{id:'price_fee'}}]};
 if(path.includes('/charges/'))return charge;
 if(path.includes('/balance_transactions/'))return {status:'available',livemode:false,currency:'usd',fee:60};
 throw new Error('Unexpected Stripe operation');
});await recordPartnerInvoice({...invoice,amount_paid:134},false);expect(saved[0]).toMatchObject({tier_minor:99,share_minor:50,fee_minor:0});});
it('commission recording does not deduct or require merchant processing fees',async()=>{(mocks.stripe as any).mockImplementation(async(path:string)=>{
 if(path.includes('/subscriptions/'))return {livemode:false,metadata};
 if(path.includes('/invoices/'))return {has_more:false,data:[{amount:100,price:{id:'price_tier'}},{amount:10,price:{id:'price_fee'}}]};
 if(path.includes('/charges/'))return {...charge,balance_transaction:null};
 if(path.includes('/balance_transactions/'))return {status:'available',livemode:false,currency:'usd',fee:30};
 throw new Error('Unexpected Stripe operation');
});await recordPartnerInvoice(invoice,false);expect(saved[0]).toMatchObject({share_minor:50,fee_minor:0});expect(mocks.stripe.mock.calls.some(c=>String(c[0]).includes('/balance_transactions/'))).toBe(false);});
it('voice-credit metadata never creates a partner commission',async()=>{metadata['purpose']='premium_voice_credit';await recordPartnerInvoice(invoice,false);expect(saved).toHaveLength(0);});
it('mode mismatch never creates commission',async()=>{await expect(recordPartnerInvoice({...invoice,livemode:true},false)).rejects.toThrow('mode mismatch');expect(saved).toHaveLength(0);});
it('missing paid timestamp retries rather than acknowledging a dropped commission',async()=>{await expect(recordPartnerInvoice({...invoice,status_transitions:{}},false)).rejects.toThrow('payment date');expect(saved).toHaveLength(0);});
it('verified test partner gets exactly 50 cents with a stable transfer key',async()=>{await settlePartnerCommission(row);expect(mocks.stripe).toHaveBeenCalledWith('/v1/transfers',false,expect.objectContaining({amount:50,source_transaction:'ch_fixture'}),'ml-commission-commission');expect(saved[0]).toMatchObject({status:'transferred',transferred_minor:50,transfer_id:'tr_fixture'});});
it('unverified payout account cannot receive transfer',async()=>{mocks.ready.mockResolvedValue(false);await settlePartnerCommission(row);expect(mocks.stripe.mock.calls.some(c=>c[0]==='/v1/transfers')).toBe(false);expect(saved[0]?.['status']).toBe('setup_required');});
it('refund reverses the 50 cent transfer rather than paying twice',async()=>{charge['amount_refunded']=110;await settlePartnerCommission({...row,transfer_id:'tr_fixture',transferred_minor:50});expect(mocks.stripe).toHaveBeenCalledWith('/v1/transfers/tr_fixture/reversals',false,{amount:50},'ml-reversal-commission-50');expect(saved[0]?.['status']).toBe('reversed');});
it('disputed payment is held without a transfer',async()=>{charge['disputed']=true;await settlePartnerCommission(row);expect(saved[0]?.['status']).toBe('reversed');expect(mocks.ready).not.toHaveBeenCalled();});
it('partial refunds proportionately reduce commission',()=>expect(remainingCommission(500,1000,200,false)).toBe(400));
it('live payments remain locked before end-to-end verification',async()=>{expect(await runPartnerPayments(true)).toEqual({enabled:false,processed:0});expect(mocks.rpc).not.toHaveBeenCalled();});