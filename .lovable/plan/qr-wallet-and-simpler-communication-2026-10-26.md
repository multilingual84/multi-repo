# QR wallet and simpler communication

Preserve the approved site and add these features in every language. Keep new device preferences and wallet content on the device, with no picture profiles.

## 1. Small privacy notice
- Add small text directly above the voice controls: “For your privacy, choose a nickname—not your real name. No profile photo is required. Be cautious: voice technologies can be misused for scams or impersonation.”
- Omit the rejected synthesized-speech and payment-record wording from this short notice.
- Keep accurate microphone consent explaining that translation audio is sent for speech processing. Do not add a false promise that audio never leaves the device or that no records exist.

## 2. Device QR wallet
- Add a Sign in tab with QR image upload, camera scan, and the wallet on the same screen. Reuse the Personal Translator camera permission flow for backup scanning.
- Create one device identity with a nickname, saved language and preferences; explicitly request a nickname rather than a real name.
- Add a four-digit PIN using a phone-style keypad, encrypted local storage, lock/unlock, QR export and sign-out. An optional lock can protect preferences, but a PIN is mandatory before accessing a paid plan.
- Clearly warn users to save their QR backup and write down their PIN. No PIN recovery is provided. Clearing browser storage can lose a device-only wallet; an exported backup is needed to restore it.
- Recognize wallet QRs separately from public meeting, venue and earning QRs. Never let a public sharing QR unlock a private wallet.
- Restore the saved language immediately when unlocking; load language and voice resources early without requesting microphone/camera access.

**Security boundary:** The QR identifies the account; it never grants paid access by itself. Paid access requires server-verified PIN authentication and verified purchase ownership. A four-digit PIN has only 10,000 combinations, so protect the verification endpoint against repeated guesses and never embed the PIN or its verifier in a public QR. Keep account authentication separate from the client-only nickname/preferences wallet. Never display local numbers as verified account balances.

## 3. Video Meeting call flow
- Add cellphone-style Recents and Missed views, using actual browser call events rather than invented callers.
- Keep content-free call history locally with nickname, time, audio/video type and a clear-history control.
- Tapping a recent caller starts the existing call flow directly; still require permission confirmation when capture is needed.
- Do not label an event “missed” unless an incoming call was actually observed and unanswered. Browser-closed ringing and missed-call discovery are not supported by the current call system.
- Preserve shared-link two-person calling and the existing group-capacity notice.

## 4. Personal Translator text and timing
- Add typed-text input and translated-text sending beside the existing microphone transcript, available free for life without removing existing controls.
- Keep sending explicit and distinguish clipboard/native sharing from verified in-site delivery.
- Investigate incremental translation using the existing service. Implement it only if partial input/output can be delivered reliably, without duplicate speech or feeding playback back into the microphone.
- Keep the current pause controls as fallback. No background capture, guaranteed instant delivery, or unsupported all-language streaming claims.

## 5. Agency Wi-Fi guidance
- Add an instructions panel agencies can share with their network administrator.
- Document the actual website, secure connection, signaling and media destinations required by the configured calling services, including any relay requirements.
- Provide permission and connection checks, with actionable failure messages; never recommend disabling an agency firewall or security controls.

## 6. Trusted access and Telnyx
- Audit existing identity, payment and free-allowance checks. Separate client-side preferences from server-verified entitlements; do not grant access from a QR, PIN or editable local balance.
- For paid accounts, require the QR account identifier plus server PIN verification before issuing an authenticated session; store only a protected PIN verifier, never the PIN itself. Enforce bounded attempts and lockout on the server, and check purchase ownership before associating a plan. Do not expose an account-existence lookup or allow a public QR to claim someone else's purchase.
- Keep the minimum account-security and paid-account records required for PIN verification and backend authorization; do not delete required records or weaken security to fulfill “client-side only.” Nicknames/preferences stay local. Full allowance enforcement must bind usage to the authenticated account and remains separate from the local wallet.
- Inspect the available Telnyx connection and number configuration. The current inbound endpoint only plays a greeting and hangs up; it does not connect to a translator.
- Repair a verified routing/configuration failure where access permits. Do not invent a live call destination or claim the number works without an actual call check.

## 7. Complaint assistance and improvement
- Add guided troubleshooting using the existing complaint flow, with an open-source implementation and a clear distinction between guidance and a submitted complaint.
- Keep complaint content out of training or improvement datasets by default. Any reuse requires explicit opt-in.
- Produce owner-reviewable improvement suggestions and regression checks, never automatic production changes, automatic financial remedies or autonomous experimentation on customers.
- Verify an available open-source model/service before promising model-backed assistance; open-source code does not make hosted inference free.

## Technical approach
- Separate browser-safe wallet, local call-history, localized copy and pure validation helpers from server authorization.
- Use established browser QR decoding and Web Crypto for the local encrypted wallet. Validate QR payloads, versions and size; do not follow arbitrary scanned links as sign-in.
- Reuse existing calling and translation services; additions to private server actions require validated identity and owner-scoped access.
- Record architectural rules in AGENTS.md. Keep existing content-route metadata intact and give any new content routes unique metadata.

## Verification and limitations
- Test PIN validation, wrong-PIN rejection, lock/unlock, QR backup import, nickname/language restoration, public-QR rejection and local-history behavior.
- Test typed translation, explicit send, permission cancellation, two-browser audio/video connection, callback and reconnect cleanup.
- Test server allowance/payment rules independently of local wallet state. Verify no QR/PIN can manufacture access or a balance.
- Test that a QR alone, wrong PIN, exhausted attempts, copied public QR and unowned purchase cannot unlock a plan; valid PIN access still requires an active verified entitlement.
- Check desktop and phone-sized screens and current site errors.
- Report physical-device sound, carrier calling, blocked enterprise networks and unavailable provider credentials as unverified, not passed.
- External blockers may remain: Telnyx account access and an agreed live call destination, reliable media relay configuration, and a verified account identity for trustworthy usage/balance enforcement.