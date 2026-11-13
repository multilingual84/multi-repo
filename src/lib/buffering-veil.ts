// The page already frosts over while a flag switch rewrites it. This module keeps
// that frost on for every other buffering moment: a request that hangs, a page
// that is still loading, or a language the visitor chose that has not been
// applied yet. The blur lifts only once the site is ready again for that
// language — and a hard cap always releases it, so a dead request can never
// trap anyone behind the frost. Browser-safe: nothing here runs during SSR.

import { showTranslationVeil, hideTranslationVeil, hideTranslationVeilWhenSettled, holdTranslationVeil } from './translation-veil';

const VEIL_ID = 'ml-translation-veil';
// Ordinary requests finish far below this, so only a real stall earns the blur.
const STALL_MS = 900;
// Nothing in flight for this long means the site has stopped buffering.
const QUIET_MS = 600;
// The blur reads as intentional loading only if it stays up at least this long.
const MIN_VISIBLE_MS = 700;
// Whatever happens, the blur lifts by now and the visitor can refresh.
const MAX_WAIT_MS = 20000;

let pending = 0;
let stallTimer = 0;
let quietTimer = 0;
let minTimer = 0;
let maxTimer = 0;
let shownAt = 0;
// Only the module that put the frost up is allowed to take it down: a flag
// switch owns its own veil and lifts it on its own settle watch.
let owned = false;
let releaseHold: (() => void) | null = null;
let installed = false;
// A stall only counts as "waiting" shortly after a real tap.
const TAP_WINDOW_MS = 2500;
let lastTap = 0;
let lastScroll = 0;
function noteScroll() { lastScroll = Date.now(); }
let bootToken = false;
let originalFetch: typeof window.fetch | null = null;
let originalSend: XMLHttpRequest['send'] | null = null;

// The language the visitor actually asked for, or null when they never picked
// one (then the English base is the chosen state and nothing is pending).
function chosenLanguage(): string | null {
  let saved: string | null = null;
  try { saved = localStorage.getItem('user_locale'); } catch { return null; }
  return saved ? saved.replace(/^gt:/, '') : null;
}

// True when the page is showing the language the visitor asked for. A translate
// widget that never loaded here (blocked in some frames) must not hold the blur
// hostage — the visitor then simply sees the base page and can refresh.
function languageApplied(): boolean {
  if (typeof document === 'undefined') return true;
  const lang = chosenLanguage();
  if (!lang) return true;
  let saved = '';
  try { saved = localStorage.getItem('user_locale') ?? ''; } catch { return true; }
  if (saved.startsWith('gt:')) {
    const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
    if (!combo) return true;
    return combo.value === lang || new RegExp(`googtrans=/en/${lang}(?:;|$)`).test(document.cookie);
  }
  return document.documentElement.lang === lang;
}

function readyToLift(): boolean {
  if (typeof document === 'undefined') return true;
  return pending === 0 && document.readyState === 'complete' && languageApplied();
}

function clearTimers() {
  window.clearTimeout(stallTimer);
  window.clearTimeout(quietTimer);
  window.clearTimeout(minTimer);
  window.clearTimeout(maxTimer);
}

function lift() {
  clearTimers();
  shownAt = 0;
  releaseHold?.();
  releaseHold = null;
  if (owned) {
    owned = false;
    hideTranslationVeil();
  } else if (document.getElementById(VEIL_ID)) {
    hideTranslationVeilWhenSettled();
  }
}

function scheduleLift() {
  window.clearTimeout(quietTimer);
  quietTimer = window.setTimeout(tryLift, QUIET_MS);
}

// Keep the frost until the site is genuinely ready, but never past the cap.
function tryLift() {
  if (!shownAt) return;
  if (!readyToLift()) {
    scheduleLift();
    return;
  }
  const remaining = MIN_VISIBLE_MS - (Date.now() - shownAt);
  if (remaining > 0) {
    window.clearTimeout(minTimer);
    minTimer = window.setTimeout(tryLift, remaining);
    return;
  }
  lift();
}

function show() {
  if (typeof document === 'undefined' || shownAt) return;
  if (!document.getElementById(VEIL_ID)) owned = true;
  releaseHold = holdTranslationVeil();
  showTranslationVeil();
  shownAt = Date.now();
  window.clearTimeout(maxTimer);
  maxTimer = window.setTimeout(lift, MAX_WAIT_MS);
  scheduleLift();
}

function armStall() {
  window.clearTimeout(stallTimer);
  stallTimer = window.setTimeout(() => {
    // Background requests (polling, scroll-loaded content) never frost the page:
    // only boot, or a stall right after the visitor tapped something.
    if (!shownAt && (bootToken || (pending > 0 && Date.now() - lastTap < TAP_WINDOW_MS))) show();
  }, STALL_MS);
}

// App code can report buffering that is not a request it can see (a capture that
// is still starting, a checkout that is still confirming).
export function noteBufferingStart(immediate = false) {
  if (typeof document === 'undefined') return;
  pending += 1;
  if (pending === 1) armStall();
  if (immediate) show();
}

export function noteBufferingEnd() {
  if (typeof document === 'undefined') return;
  pending = Math.max(0, pending - 1);
  if (pending === 0) scheduleLift();
}

function beginRequest() {
  pending += 1;
  if (pending === 1) armStall();
}

function endRequest() {
  pending = Math.max(0, pending - 1);
  if (pending === 0) scheduleLift();
}

// Watch every request the page makes, so "buffering" means the same thing
// everywhere: something the visitor is waiting on that has not come back yet.
function patchNetwork() {
  if (typeof window === 'undefined') return;
  const host = globalThis as typeof globalThis & { fetch?: typeof globalThis.fetch };
  const nativeFetch = host.fetch;
  if (typeof nativeFetch === 'function' && !(nativeFetch as unknown as { __mlBuffering?: boolean }).__mlBuffering) {
    originalFetch = nativeFetch;
    const wrapped = function (...args: Parameters<typeof globalThis.fetch>) {
      beginRequest();
      return nativeFetch.apply(host, args).finally(endRequest);
    } as typeof globalThis.fetch;
    (wrapped as unknown as { __mlBuffering: boolean }).__mlBuffering = true;
    host.fetch = wrapped;
  }
  const proto = typeof XMLHttpRequest !== 'undefined' ? XMLHttpRequest.prototype : null;
  if (proto && !(proto as unknown as { __mlBuffering?: boolean }).__mlBuffering) {
    const send = proto.send;
    originalSend = send;
    proto.send = function (this: XMLHttpRequest, ...args: Parameters<XMLHttpRequest['send']>) {
      const xhr = this as XMLHttpRequest & { __mlPending?: boolean };
      if (!xhr.__mlPending) {
        xhr.__mlPending = true;
        beginRequest();
        xhr.addEventListener('loadend', () => {
          if (xhr.__mlPending) {
            xhr.__mlPending = false;
            endRequest();
          }
        }, { once: true });
      }
      return send.apply(this, args);
    };
    (proto as unknown as { __mlBuffering: boolean }).__mlBuffering = true;
  }
}

function restoreNetwork() {
  if (typeof window === 'undefined') return;
  const host = globalThis as typeof globalThis & { fetch?: typeof globalThis.fetch };
  if (originalFetch) {
    host.fetch = originalFetch;
    originalFetch = null;
  }
  const proto = typeof XMLHttpRequest !== 'undefined' ? XMLHttpRequest.prototype : null;
  if (proto && originalSend) {
    proto.send = originalSend;
    originalSend = null;
  }
}

function finishBoot() {
  if (!bootToken) return;
  bootToken = false;
  endRequest();
}

function frostAfterClick(event: MouseEvent) {
  if (!(event.target instanceof Element) || event.target.closest(`#${VEIL_ID}`)) return;
  // Only real controls frost, and never a tap that ended a scroll/fling.
  if (!event.target.closest('button,a[href],select,summary,label,[role="button"],[role="tab"],input[type="checkbox"],input[type="radio"]')) return;
  if (Date.now() - lastScroll < 250) return;
  lastTap = Date.now();
  // Preserve the original click and its audio/microphone permission gesture.
  queueMicrotask(() => {
    if (!installed) return;
    show();
    scheduleLift();
  });
}

// Mount once from the root route: it covers the page from the first paint until
// the site is ready again for the language the visitor chose.
export function installBufferingVeil(): () => void {
  if (typeof document === 'undefined' || installed) return () => {};
  installed = true;
  document.addEventListener('click', frostAfterClick, true);
  window.addEventListener('scroll', noteScroll, { passive: true, capture: true });
  patchNetwork();
  if (document.readyState !== 'complete') {
    bootToken = true;
    beginRequest();
    window.addEventListener('load', finishBoot, { once: true });
  }
  return () => {
    if (!installed) return;
    installed = false;
    document.removeEventListener('click', frostAfterClick, true);
    window.removeEventListener('scroll', noteScroll, true);
    if (bootToken) {
      bootToken = false;
      window.removeEventListener('load', finishBoot);
    }
    restoreNetwork();
    lift();
    pending = 0;
  };
}

// Test seam: drop every signal and release the frost.
export function resetBufferingVeil() {
  if (typeof document === 'undefined') return;
  if (bootToken) {
    bootToken = false;
    window.removeEventListener('load', finishBoot);
  }
  pending = 0;
  lift();
}
