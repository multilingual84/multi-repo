# Connect public translated broadcasting

## What changes
- Keep the existing broadcast console and colors. Its button opens real broadcast controls instead of changing a pretend status.
- The speaker starts after the existing microphone permission notice, then shares a listener QR/link. Listeners explicitly tap Listen and choose their language; they never need to turn on their microphone.
- Show connected listeners, real transmitting/off-air status, connection failures, resume-audio and Stop controls. Stop or leaving releases microphone and connections.
- Include local public-speaking output to a paired Bluetooth speaker while the speaker talks into the phone. Offer independent input/output selection where supported; use phone-settings routing as the fallback. Do not promise every phone can independently choose its microphone and Bluetooth output.
- Keep the existing Listen In tool and its current behavior alongside these additions; do not replace it with Bluetooth output or the new broadcast listener controls.
- Public speaking includes one free week, then unlocks with the existing $0.99 Solo pack. Reuse the existing seven-day pass rather than granting a second trial; verified active paid tiers keep their existing inclusive benefits. Keep the Solo pack's current duration and checkout surcharge unchanged, and do not change unrelated free features or listener access.
- Replace the preview notice only when the live flow is connected and verified. Local call logs and other features stay unchanged.
- Improve the existing call-sharing panel: keep QR and copying onsite and add a phone share-menu action where supported, retaining QR/text/email order and fallbacks. Sharing must not hang up or navigate the call page. Text/email delivery still requires the sender's chosen app; do not claim automatic delivery or guarantee no app switch.

## Small, cost-conscious first release
- Start with a small, capped shared-link audience rather than an unlimited public streaming service. The speaker's phone sends audio directly to listeners using the existing call connection technology.
- Transcribe each spoken phrase once, then translate once per distinct listening language, not once per listener. Reuse free device speech for translated playback; do not archive audio or transcripts.
- Use a random listener link and separately protected broadcaster ownership, so a listener cannot impersonate the speaker. Enforce session, audience and translation limits on the server.
- No new paid streaming subscription or automatic publishing. A larger audience and networks that block direct audio require a separate media relay service and its ongoing costs.

## Technical details
- Separate the browser broadcast lifecycle from the existing preview component; reuse microphone consent, speech/output preferences and language helpers.
- Reuse the existing remembered audio-output choice for translated speaker playback. Prefer the phone microphone when identifiable; avoid feeding speaker playback back into speech capture. Bluetooth pairing stays in phone settings, not website Bluetooth scanning.
- Add server-validated session ownership and bounded admission before signaling or translation. Listener count reflects connected audio peers, not an editable presence number.
- Enforce broadcasting access server-side using the verified trial/pass or active purchase, never an editable countdown, checkout-return URL or QR alone; stop publishing when access expires.
- Keep stale signaling, late microphone grants and late translation results from restarting a stopped session. Serialize phrase translation and clean up on errors/unmount.
- Route listener links to the public broadcast console without triggering two-person call routing.
- Keep call-share links clean and consistent across QR, copy and native sharing, preserving the same room identity and excluding editor-only query parameters. Handle share cancellation and clipboard refusal with localized feedback and an onsite selectable-link fallback.

## Focused verification
- Test ownership, audience bounds, stop/expiry and translation deduplication with small concrete tests.
- Test exactly seven free days, expiry rejection, verified active Solo access and rejection of unpaid checkout; retain existing pack pricing and duration.
- Verify one broadcaster and two browser listeners, QR/link consistency, differing languages, no listener microphone capture, disconnect counts and stop cleanup.
- Use fake microphone audio for connection checks and at most one short real translation sample. Report physical-phone playback and restricted-network reliability separately if unverified.
- Check output routing without switching microphone input, permission failures and saved output. Physical Bluetooth speaker playback remains unverified without paired hardware; expose browser/phone routing limitations honestly.
- Verify call QR/copy/share payloads open the same recipient Answer screen; check native share cancellation/fallback without changing the caller's page or ending its call. Report native SMS/email delivery as unverified unless exercised on a real device.