# Connect the approved site without changing its appearance

## Preserve the approved interface and terms
- Keep every existing tab, label, font, color, image, spacing rule and flag control in place. Do not add the upload’s floating Clara button or replace the six pricing boxes.
- Keep the disclosed $0.20 processing fee and Auto pay **off** by default. No hidden surcharges, doubled rates or warehouse-photo charge.
- Complaints remain optional and require your approval before a full refund plus **six calendar months** free is offered. No automatic refunds or free year.
- Do not publish the site or execute actual customer charges/refunds during testing.

## Shared language and referral state
- Add a nonvisual shared state layer beneath existing controls for language, country, referral code and billing preferences.
- Restore explicit saved flag choices first; use the browser language and translation cookie only as fallbacks. Keep country-specific prices separate from language.
- Normalize referral codes case-insensitively and persist them locally. Only verified payment events may create actual commission credit; local state never proves payment or entitlement.
- Retain the six native translations and existing Google Translate flow for other flags; prevent intentional reload loops. Do not promise local-only processing while Google Translate is used.

## Existing microphones and Clara
- Connect permission requests and safe recording start/stop to the existing microphone controls, without moving or restyling them.
- Stop all owned microphone tracks, disconnect audio nodes, close audio contexts and clear owned buffers on release, cancellation and page exit, including permission-request races.
- Reuse existing Clara speech playback. Web Audio and SpeechSynthesis do not recognize speech, detect its language or generate intelligent replies; keep those functions unavailable until a suitable recognition/translation connection is configured.
- Do not claim guaranteed garbage collection, global zero retention or sub-150ms translation.

## Checkout and affiliate safeguards
- Verify the actual Stripe product prices and billing periods against all six approved packages and the displayed regional currency.
- Pass the existing Auto pay choice into checkout. Default purchases must not create recurring subscriptions; recurring billing is permitted only through explicit opt-in and matching approved prices.
- Reject unconfigured currencies rather than silently charging USD. Include the disclosed fee in the actual checkout total.
- Confirm payment ownership, amount, currency, package and paid status on the server; use verified Stripe events for ongoing renewal/cancellation updates and retry-safe processing.
- Attribute 50% of qualifying purchase value only to a validated referral owner after verified payment. Record commission credit separately from payouts; do not send money or invent a payout arrangement.

## Complaint safeguards and identity
- Review the existing complaint desk’s access protection before enabling financial approvals. Keep admin authority server-verified and out of browser storage.
- Link remedies to verified purchases, prevent duplicate refunds, preserve recoverable progress across failures and grant six calendar months only after the approved operation succeeds.
- Never report a refund or service grant when it did not occur.
- Add the supplied address, support email and public domain as shared identity data; do not treat them as verified compliance or alter existing visible copy.

## Technical approach
- Use browser-safe context/helpers for local state and audio. Keep secret-backed work inside TanStack server functions and verified public webhook handlers.
- Keep the pricing module authoritative; use server records as the authority for paid access. Add narrowly scoped database grants and policies if new payment/referral records are needed.
- Record structural decisions in `AGENTS.md` and unresolved service requirements in `roadmap.md`.

## Verification and completion
- Run focused tests for opt-in billing, currency rejection, payment verification, referral percentage, six-month duration, approval gating and microphone cleanup.
- Check the existing tabs and language/referral persistence in the running site; check microphone capture with controlled browser audio and confirm tracks stop.
- Exercise payment/refund flows only in confirmed test mode with an authorized test identity. Report any unverified hosted flow or missing connection explicitly.
- Deliver what is connected and a short list of remaining blockers. Live speech recognition/translation, referral payouts and any unavailable billing/admin configuration are not complete until their connections are supplied and verified.