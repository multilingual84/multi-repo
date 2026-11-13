# Free person-to-person texting + Fleet group texting (replaces walkie-talkie)

## What changes for users
- **Person-to-person text stays free for life** — sending, receiving and translation between two QR users. No change to how it works today.
- **Walkie-talkie is replaced by Fleet messaging.** The walkie panel and the disabled "annual checkout not available yet" block inside private messages are removed and replaced with a "Fleet group text" entry.
- **Fleet group text** — the fleet owner sends one translated text to all approved members at once; members can reply to the group. Each member reads it in their own language.
- **Seats come from the existing price matrix** (no price or table changes):
  - Solo $0.99 → 1 seat, Team $3.99 → 10, Hub $7.99 → 25, Duo yearly $9.99 → 2, Community $19.99 → 100, Enterprise $199 → 1500.
  - Approved members beyond the purchased seat count can't be added; the owner sees "seats full — upgrade" pointing to the existing pricing table and "💳 Pay on Stripe".
  - No paid package = no group text (person-to-person still free).
- All new wording in the six native languages plus the Google Translate overlay.

## Steps
1. Remove walkie panel and annual-walkie block from Private messaging; add Fleet group text button (fleet owners/members only).
2. Database: add a fleet group message table (owner, sender, encrypted/translated text, created time, 24h content-free delivery status consistent with current rules), with grants and access only through server checks of the verified QR device.
3. Server functions: send to group (owner or approved member only, seat limit enforced from the owner's paid package), list recent group messages, per-member translation using the existing message translation.
4. Seat enforcement in the existing approve-member action: block approval past the seat count.
5. Fleet panel: show "X of Y seats used", group thread, compose box, upgrade prompt when full.
6. Tests for the rules: seat counts per package, approval blocked at limit, no package = no group send, person-to-person stays free.
7. Focused browser check: owner + one member send and receive a translated group text.

## Technical notes
- Seat counts read from `src/lib/pricing` tiers; paid status via existing paid-only checkout eligibility helpers (unpaid sessions never unlock).
- Reuse `fleet.functions.ts`, `FleetAccess.tsx`, `message-translation.functions.ts`; identity via QR device session (generation-checked), not Supabase auth.
- `WalkieTalkie.tsx` unmounted (file kept unused); pricing matrix untouched.
