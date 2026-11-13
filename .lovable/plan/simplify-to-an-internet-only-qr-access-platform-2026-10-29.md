# Simplify to an internet-only, QR-access platform

## What stays untouched
- Preserve the visual pricing matrix, tables, six packages, prices, currencies, checkout surcharge and full rounded 50% affiliate split.
- Preserve historical purchases, balances, commissions, fleet ownership and tier seat limits. Removing the visible wallet does not delete financial records.
- Retain existing working calls, translated text, camera translation, speech settings, walkie-talkie, Listen In and public broadcast controls.

## 1. Clean up and remove telephone features
- Delete `src/test/push-notifications.test.ts` as requested; retain focused notification-consent, safe-destination and no-media regressions in properly structured tests.
- Resolve compilation failures and the duplicate language-option keys observed in the preview.
- Remove carrier interception, cellular/landline dialing, phone-number entry and their obsolete promotional wording in every language. Retire app telephone endpoints safely so they cannot initiate carrier activity.
- Do not cancel the external Telnyx account or number without separate authorization; removing its site integration does not stop a provider's recurring charges.

## 2. Automatic access with safe QR transfers
- On the first visit, silently establish a new app-owned cryptographic identity after the page loads. No email sign-in, registration form or PIN for new customer access.
- Generate randomness on the device with secure browser cryptography. Use the existing open-source QR library to draw the code locally; no third party receives identity secrets and no device fingerprint is collected.
- Automatically remember access and create an instant public Countertop Room QR Pass. Opening it gives a visitor their own identity and connects them to the host—not ownership of the host's account.
- Provide **Import Existing Account from QR**, supporting an explicit camera permission step or a saved QR image. Verify the private credential before changing local identity or loading account data.
- Provide a separate **private account-transfer QR**, with clear save/keep-private instructions. Anyone possessing this credential can claim the account; it must never appear on public placards, referral links, call links or listener links.
- Moving access to another device atomically revokes the previous device's server session and notification subscriptions. Old tabs lose protected access, release active media and cannot silently register themselves again. Preserve the trial and usage window when moving devices.
- Existing accounts migrate from a verified current session. A public old call QR or a caller-supplied account ID cannot establish purchase ownership. Accounts without a verified session require a separately verified recovery path; no unapproved reassignment of paid accounts.

## 3. One communication screen
- Merge all Personal Translator tools into **Tap here to start talking**: one-phone translation, QR/link conversations, incoming Answer controls, private text, walkie-talkie, camera tools, nearby phones, audio choices and local recents.
- Remove repeated entry controls, then remove the empty Personal Translator tab. Existing shared links continue to open the consolidated screen.
- Remove visible wallet/PIN/sign-in controls. Replace the wallet affordance with compact **days remaining** and **minutes remaining today**, plus access to QR saving/import, settings, plan details and fleet management where needed.
- Keep QR first, then Text and Email. Include onsite Copy and the native share sheet where available; sending through another app cannot be guaranteed to stay inside the browser.
- Place the following localized offer where the Personal Translator banner was, keeping this offer visible during scrolling without making the rest of the menu sticky or obscuring content:

> For Business owners, Charity, Taxi Drivers, Social Workers, Places of Worship, Law Firms and Clinics, Influencers and Individuals can also Earn 50% just by sharing this code. Sharing our Code Gives you a Lifetime Free Personal Translator and 7 day free pass to whoever you share it to!

- The 50% remains a share of qualifying purchases, not a payment just for scanning or sharing. Preserve existing extra-30-day referral benefits because this request does not explicitly retire them.

## 4. Free access and usable fleet/walkie tools
- Automatically award the initial seven-day pass on first arrival, without a card or form; do not award a second trial after import or repeat visits.
- After the trial, each free device/account gets **45 minutes per rolling 24 hours** for metered translation. Show a Solo upgrade prompt only on exhaustion; normal non-metered browsing remains accessible.
- Translated text sending and receiving remain free for life, including fleet text messaging. Incoming participation and public business/charity QR placards remain free for life.
- Lifetime free Personal Translator means continued access under the daily free allowance, not an unlimited paid entitlement. Verified active tiers retain their existing benefits.
- Preserve fleet purchaser approval, seat limits and configurable member minutes; provide a fleet roster and translated messaging in the consolidated experience.
- Reuse the existing encrypted walkie transport and display its controls in that experience. Preserve the existing $0.99/year audio/walkie price and paid-tier/trial inclusion; securely map its access to the new identity rather than granting audio from an editable browser flag.
- Do not reset allowance with a QR import, stack old daily-share bonuses onto the new 45-minute baseline, or claim browser storage can prevent every cache-clearing abuse. Enforce established identities on the server and keep lightweight abuse limits.

## 5. Public speaking and QR presentation
- Keep public speaking one-way: the host consents to phone microphone capture and outputs translated speech through compatible paired speakers. No listener talk-back.
- Public broadcast QR visitors see all supported language choices first, then **Listen** and **Thank you, have a seat!** Listener entry never requests camera or microphone permission.
- During translated-only playback, mute original incoming speech and play synthesized translated speech through the selected available output. Handle synthesis failure visibly instead of claiming instant speech or guaranteed Bluetooth routing.
- Add a camera with a restrained flash animation and **take a picture of me** below public/shared QR codes, plus **Free for life** alongside the relevant hand symbols. Apply the same readable guidance to exports without touching QR pixels or quiet zones. Private transfer codes instead say to save privately.
- Keep the existing five-listener broadcast cap and other safety limits; this request streamlines broadcasting, not conference-scale infrastructure.

## 6. Home-screen shortcut
- Complete the existing standalone manifest, icons and head metadata, with localized iPhone/Android Home Screen instructions.
- Use manifest-only installability: no offline cache or app-shell service worker. Preserve the separate consent-based notification worker, updating its account authorization and transfer cleanup.

## Technical approach
- Introduce an app-owned QR credential and device-session layer with server-verified proofs, private credential verifiers, atomic session-version rotation and protected account mappings. Do not create anonymous authentication-provider signups or trust a QR handle as authorization.
- Adapt account access, paid checkout, fleet, public broadcasting, push and encrypted messaging together. Migrate existing authenticated mailboxes only with proven ownership; preserve encryption keys when moving compatible accounts and never claim old encrypted messages are recovered without their keys.
- Use additive database changes with explicit grants and row security. Retire old customer PIN and carrier entry paths only once their replacements pass checks.
- Keep shared policies, translation copy and QR presentation in focused modules; record updated architecture rules and supersede obsolete PIN-specific rules.
- All copy supports six native locales and the existing whole-page translation for other languages. Preserve distinct page titles and share descriptions.

## Focused verification and completion
- Test exact 45-minute exhaustion, 24-hour reset, seven-day expiry, non-stacking transfer, free text/receiving and unchanged paid/fleet limits.
- Use two fresh browser sessions to create access, send/receive encrypted text and walkie audio, open a public call QR, then privately transfer an account and verify the previous session is denied. Include a verified existing-account migration case without charging a customer.
- Verify listener language selection/audio with zero microphone calls, original-audio muting, QR decoding, permission cancellation, and notification-only testing.
- Check phone portrait/landscape for readable controls, sticky offer visibility and unchanged pricing geometry. Check the preview's compilation result after edits, not an exhaustive full suite or paid load test.
- Report physical-phone/Bluetooth playback and real closed-site notification delivery separately where sandbox checks cannot establish them. Do not claim universal device support, zero delay, unlimited audience capacity or a fully finished platform without evidence.
- This plan makes no new paid infrastructure purchase and does not publish automatically. Report any remaining ownership-recovery or service limitation before release.