# Personal Translator and repeat-call flow

## Keep unchanged
- Preserve the current layout, microphone styling, flags, six packages and currency-aware checkout.
- Personal Translator stays in the $0.99 Solo 30-day package and every other paid tier. Do not restore the uploaded standalone annual translator or forced checkout at hang-up.
- Keep unpaid call answering free and automated outreach texts off.

## One phone
- Use the selected flag as the owner's spoken language. Geography and local-language controls never change this chosen language or the page language.
- Seed the outgoing language from available approximate location signals, separately from the chosen flag. Location is a starting suggestion, not proof of the other person's language or dialect.
- Add an All Flags icon within the existing microphone area, with “Choose local language” above it and an “Auto detect” toggle underneath. Local flag selection sets only the other language; keep the microphone, meter and surrounding layout in place. Localize both labels for every supported page language.
- Auto detect starts on unless the user turns it off. While on, geography provides the initial local language and detected replies can update it. While off, keep the chosen local language fixed; do not override it with geography or detected replies.
- Update the existing instruction: the owner taps the microphone and speaks first; translated speech plays aloud. With Auto detect on, a reply in a different detected language updates the conversation's other language and translates to the owner's language.
- Reuse the current microphone capture and live meter. Keep the active microphone highlighted and stop capture on exit.
- If location cannot establish a supported language, ask the other person to speak first rather than inventing one.
- Keep synthesized speech clearly distinguished from cloning. Browser microphone permission stays required. Each speaker must explicitly agree before their voice is cloned, even with on-device processing.

## Access rules
- One-phone translation: seven-day trial, then access through an active approved paid package.
- Two-phone translation: users may continue meeting new people free for life. Each pair gets seven days from its first connected call; starting another call to that same person at or after that boundary requires paid initiating access. Free recipients can still answer.
- New participants receive their own free week. A new room link must not reset an existing pair's window.
- No automatic payment, forced annual offer, or mid-call checkout.

## Technical implementation and verification
- Keep geographic language defaults and direction rules in browser-safe helpers; detected reply language stays session-only. Add concrete tests for owner-first translation, reply-language changes, owner-language preservation, default-on Auto detect and fixed local-language behavior when off.
- Establish server-verified caller/recipient identity and paid-package ownership before enforcing access. Existing room hashes and browser-stored IDs are not sufficient. Scope signaling authorization to the permitted participants; do not rely on a hidden button as enforcement.
- Store only the minimum pair identifiers and first-connected timestamp needed for the return-call rule, not call audio or transcripts. This introduces connection metadata and must not be described as keeping no records.
- Test the exact seven-day boundary, new-pair access, paid-to-free answering, duplicate starts, and removal of microphone resources. Exercise paid/free sandbox calls and one-phone translation through the UI.

## Not available yet
- Actual voice cloning needs an authorized cloning service, per-speaker consent, supported languages and verified running costs. Current translation uses an online speech service; it is not fully phone-local or guaranteed zero-cost.
- Do not apply the upload's exposed private credential, unsupported government-validation claims, worldwide deletion guarantee, automatic tab closing or retired annual product.