export const paidPackages = [
 {id:'single', price:0.99, seats:1, nameIndex:0},
 {id:'team', price:3.99, seats:10, nameIndex:1},
 {id:'hub', price:7.99, seats:25, nameIndex:2},
 {id:'duo-yearly', price:9.99, seats:2, nameIndex:null},
 {id:'community', price:19.99, seats:100, nameIndex:3},
 {id:'enterprise', price:199, seats:1500, nameIndex:4},
] as const;
// Owner decision (2026-10-24): the Auto pay checkbox is pre-checked at every
// checkout. Visitors can still untick it before paying.
export const defaultBillingPreferences = {autoPay:true, rememberPayment:false} as const;
// Static Stripe processing fee passed through at checkout on every 1-time charge.
export const stripeFixedProcessingFee = 0.35;
export const corporateName = 'Multi-Lingual™, a division of Bricktown Software Systems LLC';
