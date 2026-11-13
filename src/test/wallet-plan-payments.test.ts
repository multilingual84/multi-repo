// @vitest-environment node
import {beforeEach,expect,it,vi} from 'vitest';
const m=vi.hoisted(()=>({requireWallet:vi.fn(),from:vi.fn(),select:vi.fn(),eq:vi.fn(),maybeSingle:vi.fn()}));
vi.mock('@tanstack/react-start',()=>({createServerFn:()=>({handler:(fn:unknown)=>fn})}));
vi.mock('@/lib/wallet/access.server',()=>({requireWallet:m.requireWallet}));
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:{from:m.from}}));
import {walletPlanPaymentsFn} from '@/lib/wallet/payments.functions';
beforeEach(()=>{vi.resetAllMocks();m.requireWallet.mockResolvedValue('owner-wallet');m.from.mockReturnValue({select:m.select});m.select.mockReturnValue({eq:m.eq});m.eq.mockReturnValue({maybeSingle:m.maybeSingle});m.maybeSingle.mockResolvedValue({data:{stripe_customer_id:'cus_owner'},error:null});vi.stubEnv('STRIPE_SECRET_KEY','test-fixture');});
it('requires PIN authorization before reading payment history',async()=>{m.requireWallet.mockRejectedValue(new Error('locked'));await expect(walletPlanPaymentsFn()).rejects.toThrow('locked');expect(m.from).not.toHaveBeenCalled();});
it('only requests invoices for the server-resolved wallet customer and returns paid invoices',async()=>{const fetcher=vi.fn().mockResolvedValue(Response.json({data:[{id:'in_paid',created:100,amount_paid:99,currency:'usd',status:'paid'},{id:'in_unpaid',created:100,amount_paid:0,currency:'usd',status:'open'}]}));vi.stubGlobal('fetch',fetcher);expect(await walletPlanPaymentsFn()).toEqual([{id:'in_paid',date:'1970-01-01T00:01:40.000Z',amount:99,currency:'USD'}]);expect(m.eq).toHaveBeenCalledWith('credential_handle','owner-wallet');expect(fetcher.mock.calls[0]?.[0]).toBe('https://api.stripe.com/v1/invoices?customer=cus_owner&limit=50');});