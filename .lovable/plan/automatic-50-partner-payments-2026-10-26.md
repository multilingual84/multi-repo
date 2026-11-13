# Automatic 50% partner payments

Replace manual voucher-email claims with Stripe-connected partner payments, without changing the site’s prices or layout.

## What changes
- Add secure payout setup to the existing earning-QR dialog. Partners sign in, receive an account-owned voucher code, and complete Stripe’s identity and bank-account setup.
- Record eligible paid package purchases against that verified code. Free passes and voice-credit top-ups do not generate package referral commissions.
- Automatically transfer the existing 50% purchase share to the connected partner account after payment funds become available and any existing payout hold expires. Stripe controls when the money reaches the partner’s bank; it is not instant or fee-free.
- Show pending, transferred, setup-required, and failed payments in the partner’s wallet, translated through the existing language system.
- Prevent duplicate payments, self-referrals and payments against unverified codes. Handle refunds and disputes with commission adjustments and transfer reversals rather than paying twice.

## Activation and verification
There are currently no connected partner accounts or owned affiliate records. Existing device-only codes cannot prove payout ownership; they need verified enrollment or owner-reviewed migration.

Test onboarding, signed purchase events, exact 50% calculation, duplicate delivery, refunds, failed transfers and wallet readback in Stripe test mode without charging a real card. Keep automatic live transfers disabled until Stripe platform permissions and this flow are verified. No retrospective payouts without verified ownership.

Stripe payment, transfer and bank payout fees may apply; automation does not guarantee profitability. No outreach or performance analytics will be added.

## Technical details
Use authenticated TanStack server functions for partner enrollment and owner-filtered wallet reads. Extend the signed Stripe webhook with an immutable purchase/commission ledger, currency-native minor-unit accounting, idempotent transfers and durable retries. Apply explicit grants and owner-only read policies to new Lovable Cloud tables. Do not replace existing payment or voice-provider connections.