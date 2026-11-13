# Owner-supplied connections: universal QR

- One unique QR code is intended to remain usable for life, independent of the seven-day all-access pass countdown.
- The same QR must work universally: office, taxi, lobby, church, business and charity. Do not require a venue/campaign selector or change the approved frontend.
- Visitors should be able to scan, choose their language, and speak or listen immediately once the owner supplies the connections.
- Recipient journey: opening a shared link or scanning the QR must land directly on the microphone connection screen for the two parties, not on signup, invitation or promotional screens. Microphone access requires the recipient's action and browser permission; do not promise automatic microphone activation.
- Show the invitation and sharing-with-others options only after the conversation ends, not before or during it.
- After the conversation ends, offer the recipient a push notification containing the seven-day free pass and free-for-life Personal Translator access. Deliver push only with explicit notification permission and on supported devices; if permission is declined or push is unavailable, show the same offer on screen without blocking conversation access.
- Preserve the instruction-language picker and earbuds/phone-speaker guidance. Visitors pair their own Bluetooth earbuds with their own phone.
- Preserve free-for-life access after the seven-day pass ends.
- Current QR links and countdown are device-local previews, not live service activation or automatic reminders. Lifetime recoverability across devices and live conversations are future connection requirements, not verified current capabilities.
- Do not implement any connections from these notes until the owner supplies and authorizes them.

## Affiliate QR referrals

- The Share us affiliate screen offers recipients a one-week (7-day) free pass using a unique QR and matching link, with the owner's 50/50 affiliate earnings terms.
- Current identity is device-local and links open the existing Free Pass preview. No pass entitlement, invitation delivery, earnings or affiliate attribution is created by the frontend.
- Owner-authorized future connections must persist verified affiliate ownership, retain referral attribution through QR/link redemption, issue eligible recipients a seven-day pass, and calculate 50/50 earnings on qualifying activated purchases without paying commissions on a free preview. Eligibility and qualifying purchase rules require owner confirmation.

## Affiliate coupon codes

- Affiliates choose a personal coupon code, check global availability and reserve it uniquely under verified ownership once connections are authorized. Perform case-insensitive normalization and atomic uniqueness checks; a device-local preview is not a global reservation.
- The one-week (7-day) free pass is free for everyone, with or without a code; issuing it does not pay a commission. A person who enters a code keeps the code owner's referral attribution and is owed one free month from us.
- Owner's clarified reward: the free month belongs to the person using the code, not to the code owner. The code owner earns 50% on qualifying purchases attributed to them. Reward issuance remains deferred. Confirm the eligible service, calendar-month handling (the current preview adds one calendar month, never a fixed 30 days), repeat-purchase/stacking rules, free-month start and expiry, and refund treatment before connecting.
- Future connections must preserve the current create/check/save/copy and recipient-entry interface, support unavailable codes, invalid or expired codes and retryable errors, and prevent duplicate entitlement or commission issuance. Do not overwrite a prior referral silently; confirm the attribution policy with the owner.
- Current codes are saved only on the same device. Unknown codes cannot be verified across devices; no pass entitlement, live attribution, reservation or payout is created.

## Spoken-language detection below the flags

- The approved frontend includes a microphone button directly below the rolling flags: “Speak into the mic for language or help,” translated with the rest of the screen. This is also the future entry point to Clara, whose service definition the owner will supply later.
- Clara should understand spoken language requests and requests for assistance, then reply in text in the visitor’s language in the existing reply area. Do not invent Clara’s capabilities, connect an AI service, or add voice replies here before the owner explains and authorizes Clara.
- Future browser audio connections should support a reliable, helpful experience using the owner-approved WebRTC configuration where appropriate, with microphone permission, actual audio readiness, actionable connection errors and manual flag selection as a fallback. This is a future connection requirement, not a claim of current Google or WebRTC service availability.
- Once authorized connections are supplied, a visitor's tap and browser microphone permission should start spoken-language detection. Identify the actual spoken language, not just the current browser or page language.
- Route a supported detection through the existing flag/language-selection flow to update the selected flag and translate the screen the visitor is already viewing. Preserve the current screen, layout, and persisted revisit language behavior.
- Language alone may not determine a country: retain a compatible selected country when possible, otherwise use the catalog's primary matching flag; keep one flag per country and the existing dialect menus. For ambiguous or unsupported results, ask the visitor to select a flag/dialect rather than silently guessing.
- Provide listening, stop/cancel, permission-denied, unsupported-device, and retry states when connecting detection. Do not record, retain, or upload audio without an authorized implementation and accurate privacy disclosure.
- Current button is presentation only: it does not request microphone access, capture audio, detect language, automatically switch flags, or contact Clara. Tapping opens the green talking-bar preview and Clara text-reply area; a clearly labeled typing preview briefly appears before the availability notice, not a fabricated Clara reply or visitor transcript. It stays open until a second tap closes it. Existing manual flag selection stays active.
- Authorized future connections must stream the visitor's actual words as live typing, then show Clara's typing state followed by the real localized text reply. Keep the microphone session open across replies until the visitor taps once to stop; clear pending typing and audio activity immediately on stop.

## Talking indicator

- The owner clarified that the audio detector presentation is just a green bar, not a separate audio-check button or troubleshooting panel.
- Keep the bar hidden while idle. During an authorized microphone session, show it when it is time to speak and drive its level from real audio input; hide it when the session stops, is cancelled, or permission fails.
- Current frontend shows only a static green bar after the mic button is tapped, with an unconnected availability notice and a second tap to close it. No simulated audio levels, microphone access, recording, or language detection are active.

## Compliance P-Card hold sequence — October 24 owner upload

- Preserve all existing frontend text, font sizes, cards, colors, tab placements and the six-box pricing matrix. Existing public-safety headers, corporate copyright rows and SAM.gov badges must remain untouched.
- On entry into the compliance sector lane, the owner requests no registration, preamble or delay questions, and this exact spoken block:

> This particular service is on hold though while we are already available to conduct business globally, we are still waiting for our p-card approvals to access public funds, but our website and platform is 100% functional and approved for use, feel free to use our free tier available globally to test our platform capabilities. A pre planned outreach has been set once validation is complete. we will reach out or call once a randomly generated   secure temporary line is ready for you and our firm to establish communication. this call is being terminated.

- At actual playback completion, terminate the microphone line, start a continuous 1000Hz sine-wave beep, and display a standalone `[ END CALL ]` node for exactly 5 seconds. The upload does not specify a separate tone duration or authorize a new outreach scheduler.
- Owner-requested end notice, preserved verbatim as a requirement, not an implemented or verified deletion confirmation:

> 🔒 MESH LINE DISMANTLED. Please be advised: Our platform does not keep any records, track any metadata, or retain any physical metrics regarding this connection. There is absolute zero memory of this interaction. Every signal buffer has been overwritten with null bytes, the data is forever lost, and the temporary line infrastructure has been permanently destroyed.

- Preserve the requested existing branding: `© 2026 Multi-Lingual.tech, a division of Bricktown Software Systems LLC` and `🛡️ SAM.gov Unique Entity ID (UEI) Verification Profile: Active & Discretionary P-Card Approved` without using their presence as evidence of verified approval.
- Execution is blocked pending identification of the compliance-lane entry and a live Clara call connection with real playback-completion and termination events. Browser speech helpers alone do not provide a connected call or guarantee final-syllable millisecond synchronization.
- Do not announce global record destruction or approval as verified. The current free-session code writes user/session rows; stopping microphone tracks does not erase these rows, browser-managed buffers, hosting logs or provider records. The supplied source remains unchanged here while a truthful implementation scope is established.

### Three-zone placement clarification — 00:29 UTC

**Status: owner subsequently chose “Hold additions for later.” All three additions are deferred; do not implement until explicitly resumed. No existing site content or behavior was changed.**

1. **Phone call to Clara:** audio-only analog inbound compliance intercept. Play the exact script without introductions; follow the final word with the 1000Hz tone over the line and terminate the call. No web overlay belongs in this audio-only channel. A remote caller cannot hear a new tone after the transport has been terminated; the call provider must support a defined tone-then-hangup sequence.
2. **Government agency card / Component A (Public Lobby Ingress):** redirected-link arrival should display the bright red `[ END CALL ]` node and the exact requested end notice within the card boundaries for 5 seconds, then reveal the calling cockpit. Do not attach this to ordinary flag selection, all visitors or sample callback buttons. No connected call cockpit or redirect contract currently exists.
3. **Microphone below flags:** permanently place the requested public-safety announcement at the top of the central column, preserving existing text and placement. Owner supplied the excerpt `🛡️ BRICKTOWN SOFTWARE SYSTEMS | PUBLIC SAFETY ANNOUNCEMENT... All microphone buffers parse temporarily inside local device RAM and are immediately destroyed at sub-second execution speeds.` This is not verification of browser-memory erasure; do not invent omitted text or certify untested data handling.