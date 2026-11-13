/**
 * Client-safe Stripe production constants.
 * Publishable keys (pk_live_*) are safe in the browser.
 * Secret keys (sk_live_*) must NEVER appear here or in any frontend bundle.
 */

/** Absolute production domain for checkout return routing. */
export const PRODUCTION_DOMAIN = 'https://multi-lingual.tech' as const;

/** Main dashboard path (cancel / home). */
export const PRODUCTION_DASHBOARD = 'https://multi-lingual.tech/' as const;

/**
 * Live Production Stripe Publishable Key.
 * Set VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... in Netlify / build env.
 * Never put sk_live_ or sk_test_ values in this file or any VITE_* var.
 */
export const STRIPE_LIVE_PUBLISHABLE_KEY: string =
  (typeof import.meta !== 'undefined' &&
    (import.meta as ImportMeta & { env?: Record<string, string> }).env?.['VITE_STRIPE_PUBLISHABLE_KEY']) ||
  (typeof process !== 'undefined' ? process.env?.['VITE_STRIPE_PUBLISHABLE_KEY'] : undefined) ||
  '';

/** Package checkout success return (absolute). */
export const STRIPE_CHECKOUT_SUCCESS_URL =
  `${PRODUCTION_DOMAIN}/?checkout=success&session_id={CHECKOUT_SESSION_ID}` as const;

/** Package checkout cancel → main dashboard. */
export const STRIPE_CHECKOUT_CANCEL_URL = `${PRODUCTION_DASHBOARD}?checkout=cancelled` as const;

/** Premium voice checkout success return (absolute). */
export const STRIPE_VOICE_SUCCESS_URL =
  `${PRODUCTION_DOMAIN}/?voice_checkout=success&voice_session={CHECKOUT_SESSION_ID}#personal-translator` as const;

/** Premium voice cancel → main dashboard / personal translator. */
export const STRIPE_VOICE_CANCEL_URL =
  `${PRODUCTION_DOMAIN}/?voice_checkout=cancelled#personal-translator` as const;
