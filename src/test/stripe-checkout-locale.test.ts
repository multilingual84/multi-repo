import { afterEach, expect, it, vi } from 'vitest';

vi.mock('@tanstack/react-start', () => ({
  createServerFn: () => ({
    inputValidator: () => ({ handler: (handler: unknown) => handler }),
  }),
}));
vi.mock('@/lib/wallet/access.server',()=>({requireWallet:vi.fn(async(handle:string)=>handle)}));

import { createPackageCheckout, confirmPackageCheckout, packageCheckoutPrices } from '@/lib/stripe.functions';
import { requireWallet } from '@/lib/wallet/access.server';
import { processingFeePriceId } from '@/lib/country-currency';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

it('sends automatic locale and the selected EUR price to Stripe', async () => {
  vi.stubEnv('STRIPE_SECRET_KEY', 'test-placeholder');
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true, text: async () => JSON.stringify({ url: 'https://checkout.stripe.com/test' }),
  });
  vi.stubGlobal('fetch', fetchMock);
  await createPackageCheckout({ data: {
    credentialHandle: '12345678-1234-1234-1234-123456789012',
    packageId: 'single', origin: 'http://localhost:8080', currency: 'EUR',
  } });
  const payload = new URLSearchParams(fetchMock.mock.calls[0]?.[1]?.body);
  expect(payload.get('locale')).toBe('auto');
  expect(payload.get('line_items[0][price]')).toBe(packageCheckoutPrices.single.prices.EUR);
  expect(processingFeePriceId).toBe('price_1UVMCPRt7sdUtv327AYd6lxB');
  expect(payload.get('line_items[1][price]')).toBe(processingFeePriceId);
});
it('rejects checkout without PIN wallet authorization before contacting Stripe',async()=>{vi.mocked(requireWallet).mockRejectedValueOnce(new Error('PIN required'));const request=vi.fn();vi.stubGlobal('fetch',request);await expect(createPackageCheckout({data:{credentialHandle:'12345678-1234-1234-1234-123456789012',packageId:'single',origin:'http://localhost:8080',currency:'EUR'}})).rejects.toThrow('PIN required');expect(request).not.toHaveBeenCalled();});
it('rejects purchase confirmation for a wallet the PIN session does not own',async()=>{vi.mocked(requireWallet).mockRejectedValueOnce(new Error('Wrong wallet'));const request=vi.fn();vi.stubGlobal('fetch',request);await expect(confirmPackageCheckout({data:{credentialHandle:'12345678-1234-1234-1234-123456789012',sessionId:'cs_test_ownership'}})).rejects.toThrow('Wrong wallet');expect(request).not.toHaveBeenCalled();});