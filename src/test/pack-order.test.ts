import { describe, expect, it } from 'vitest';
import { paidPackages, defaultBillingPreferences } from '@/lib/pricing';
describe('paid packages', () => {
 it('orders yearly duo between supply hub and community',()=>{expect(paidPackages.map(p=>p.id)).toEqual(['single','team','hub','duo-yearly','community','enterprise']);});
 for (const [id,price,seats] of [['single',0.99,1],['team',3.99,10],['hub',7.99,25],['duo-yearly',9.99,2],['community',19.99,100],['enterprise',199,1500]] as const) {
  it(`${id} has the owner-approved fee`,()=>expect(paidPackages.find(p=>p.id===id)?.price).toBe(price));
  it(`${id} has the owner-approved seats`,()=>expect(paidPackages.find(p=>p.id===id)?.seats).toBe(seats));
 }
 // Owner decision 2026-10-24: Auto pay ships pre-checked at every checkout.
 it('ships with the Auto pay checkbox pre-checked',()=>expect(defaultBillingPreferences.autoPay).toBe(true));
 it('does not save a payment profile by default',()=>expect(defaultBillingPreferences.rememberPayment).toBe(false));
});
