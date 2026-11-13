# Premium voice synthesis with transparent spending

## Preserve what is approved
- Keep the existing $0.99 Solo pack, all other package prices, durations, checkout defaults, flags and existing controls unchanged.
- Add premium voice as a separate optional feature on the Personal Translator, not a replacement or automatic upgrade.
- Label it **Premium voice synthesis**. No voice cloning, speaker-identity claim or voice-reference upload.

## Proposed price requiring your approval
- Retail price: **$0.10 USD per 1,000 synthesized characters**, metered proportionally rather than rounding each sentence up to a full block.
- Customers choose a **$1, $5 or $10 prepaid voice budget** and explicitly approve the total in Stripe before paid synthesis starts. These are proposed new prices, not existing approved prices or a claim about provider cost.
- No automatic refill, saved-card charge on hangup, compulsory purchase or changes to the $0.99 pack.
- Show the rate, generated-character usage, used credit and remaining credit. Unused prepaid credit remains available in that PIN-protected wallet; it does not vanish on hangup.
- State any applicable checkout tax separately. Do not describe the retail voice price as a fee imposed by Stripe.
- Offer USD premium billing explicitly; never silently substitute USD for a visitor's regional package checkout.

## Voice and session controls
- Use Google's current synthesized speech service through Lovable AI, with named synthetic voices and a clear artificial-voice label. Verify commercial-service terms before enabling sales; do not monetize F5-TTS checkpoints with unresolved commercial licensing.
- Keep standard browser voice playback available without premium purchase.
- Charge for successful generated speech only; replay the current clip without another generation charge.
- Do not submit a premium request when the remaining prepaid credit cannot cover it. Handle failures without duplicate charges or automatic provider retries.
- Stop premium sessions after **2 minutes without detected conversation** (proposed idle timeout) or **90 minutes maximum**, whichever happens first. Stop recording and playback, release device media, and preserve unused credit.
- Preserve existing free-user limits; the premium maximum does not grant extra free access.

## Clear privacy details in every language
- Add compact expandable **Voice privacy** and **Usage and billing** sections beside the new option, preserving existing presentation.
- Explain that microphone clips are sent to the transcription service, recognized text is translated remotely, and premium synthesis sends translated text—not a speaker's voice sample—to the speech provider.
- Explain that device voices may also use the device vendor's online service.
- Keep the current generated clip in temporary browser memory for replay, release it on session end, and do not store audio or transcript content in the premium billing ledger.
- Keep content-free usage/payment records for credit reconciliation. Do not promise that payment records never exist or that browser cleanup proves provider erasure.
- Explain the selected service's documented retention policy and the limits of that policy; avoid absolute anonymity, guaranteed erasure and instantaneous cleanup claims.
- Supply native copy in the site's six maintained locales and preserve whole-page translation for every other language flag.

## Technical implementation
- Add server-owned prepaid balances, immutable credit/payment events and premium session/request records. Protect all access through the existing server-verified wallet PIN session; QR handles and editable browser state never authorize spending.
- Create separate one-time Stripe voice-credit products and verify paid checkout, wallet ownership, amount, currency and idempotency before crediting. Keep existing package checkout untouched.
- Atomically reserve request cost before synthesis, settle once on successful completion, and prevent concurrent requests from overspending. Retain unresolved reservations for reconciliation rather than reissuing potentially billed work.
- Keep provider credentials and billing calculations server-side. Stop new requests after server-checked expiry; client idle detection is a cost-saving aid, not tamper-proof enforcement or knowledge of the other speaker's intent.
- Use the currently available Google Gemini TTS service with its documented streaming protocol. Billing records contain counts and opaque request IDs, not spoken text or audio.

## Verification
- Test concrete price calculations, prepaid-budget enforcement, 90-minute expiry, the proposed idle timeout, failed/pending payment rejection, wallet ownership and duplicate settlement.
- Verify wallet unlock → approved test checkout → credited balance → synthesis → usage display → replay → stop and balance readback.
- Test insufficient credit and provider failures; verify no background capture before consent and no late requests after exit.
- Inspect the new controls and privacy sections at narrow and desktop widths; report real-phone sound quality separately from browser tests.
- Do not claim live payment verification from simulated or test payments, or enable sales until licensing and the full paid flow are verified.

Approving this plan approves the proposed premium retail price, budget choices and two-minute idle timeout. Existing $0.99 package terms remain unchanged.