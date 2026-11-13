// A wordless frosted veil shown while Google Translate rewrites the page after
// a flag tap. Without it the visitor sees English for a moment, then the new
// language, which reads as a glitch. The veil covers the switch and stays up —
// with a centered loading circle — until the page has actually stopped
// changing, so nothing is clickable mid-switch. Browser-safe, no layout changes.

const VEIL_ID = 'ml-translation-veil';
const STYLE_ID = 'ml-translation-veil-style';
const FADE_MS = 350;
// The veil never lifts before this, so the circle reads as intentional loading.
const MIN_VISIBLE_MS = 700;
// The page is "ready to be clicked" once it has gone this long with no changes.
const QUIET_MS = 600;
// Arming window: the translate widget starts rewriting a beat after the flag
// tap. During this window the veil can never lift, so a slow widget start can
// no longer expose the English base underneath.
const ARM_MS = 900;
// Safety cap: the veil can never stick longer than this, whatever happens.
const MAX_WAIT_MS = 6000;

let shownAt = 0;
let quietTimer = 0;
let minTimer = 0;
let maxTimer = 0;
let removeTimer = 0;
let observer: MutationObserver | null = null;
let holds = 0;

// Loading owners keep language-settle timers from uncovering unfinished work.
export function holdTranslationVeil(): () => void {
  holds += 1;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    holds = Math.max(0, holds - 1);
  };
}

export function showTranslationVeil() {
  if (typeof document === 'undefined') return;
  // Re-showing during a pending fade-out must cancel that removal and restore
  // the full cover, otherwise a quick second flag tap leaves a transparent
  // veil with no spinner.
  window.clearTimeout(removeTimer);
  let veil = document.getElementById(VEIL_ID);
  if (!veil) {
    veil = document.createElement('div');
    veil.id = VEIL_ID;
    veil.setAttribute('aria-hidden', 'true');
    Object.assign(veil.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483000',
      background: 'rgba(8, 11, 18, 0.28)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      opacity: '0',
      transition: `opacity ${FADE_MS}ms ease`,
      pointerEvents: 'all',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    } as Partial<CSSStyleDeclaration>);

    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style');
      style.id = STYLE_ID;
      style.textContent =
        '@keyframes ml-veil-spin{to{transform:rotate(360deg)}}';
      document.head.appendChild(style);
    }

    const spinner = document.createElement('div');
    spinner.id = `${VEIL_ID}-spinner`;
    spinner.setAttribute('aria-hidden', 'true');
    Object.assign(spinner.style, {
      width: '46px',
      height: '46px',
      borderRadius: '50%',
      border: '4px solid rgba(255, 255, 255, 0.28)',
      borderTopColor: 'rgba(255, 255, 255, 0.92)',
      animation: 'ml-veil-spin 0.8s linear infinite',
    } as Partial<CSSStyleDeclaration>);
    veil.appendChild(spinner);

    document.body.appendChild(veil);
  } else if (!veil.isConnected) {
    document.body.appendChild(veil);
  }
  shownAt = Date.now();
  requestAnimationFrame(() => {
    if (veil?.isConnected) veil.style.opacity = '1';
  });
}

export function hideTranslationVeil() {
  if (typeof document === 'undefined') return;
  if (holds > 0) return;
  window.clearTimeout(quietTimer);
  window.clearTimeout(minTimer);
  window.clearTimeout(maxTimer);
  observer?.disconnect();
  observer = null;
  const veil = document.getElementById(VEIL_ID);
  if (!veil) return;
  veil.style.opacity = '0';
  window.clearTimeout(removeTimer);
  removeTimer = window.setTimeout(() => veil.remove(), FADE_MS + 50);
}

// Watch the page for rewrites. After each change the quiet countdown restarts;
// once the page has stayed unchanged for QUIET_MS (and the veil has been up at
// least MIN_VISIBLE_MS), the veil lifts and the site is ready to be clicked.
// A mutation inside the veil itself (its own fade) never counts as activity.
function startSettleWatch() {
  observer?.disconnect();
  const veil = document.getElementById(VEIL_ID);
  observer = new MutationObserver((records) => {
    if (veil && records.every((r) => r.target === veil || veil.contains(r.target as Node))) return;
    // Mutations during the arming window are expected (the widget starting);
    // they must not shorten the cover.
    if (Date.now() - shownAt < ARM_MS) return;
    restartQuietCountdown();
  });
  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
}

function restartQuietCountdown() {
  window.clearTimeout(quietTimer);
  quietTimer = window.setTimeout(liftWhenReady, QUIET_MS);
}

function liftWhenReady() {
  window.clearTimeout(minTimer);
  const remaining = MIN_VISIBLE_MS - (Date.now() - shownAt);
  if (remaining > 0) {
    minTimer = window.setTimeout(() => {
      // Another rewrite slipped in before the minimum elapsed: keep waiting.
      restartQuietCountdown();
    }, remaining);
    return;
  }
  hideTranslationVeil();
}

export function hideTranslationVeilWhenSettled() {
  if (typeof document === 'undefined') return;
  window.clearTimeout(quietTimer);
  window.clearTimeout(minTimer);
  window.clearTimeout(maxTimer);
  maxTimer = window.setTimeout(hideTranslationVeil, MAX_WAIT_MS);
  startSettleWatch();
  // The first quiet countdown only starts after the arming window, so the
  // widget's slow first rewrite cannot be mistaken for a settled page.
  quietTimer = window.setTimeout(restartQuietCountdown, ARM_MS);
}

// Cover the page, run the switch, then lift the veil only once the new
// language has fully settled and the page is ready to be clicked.
export function withTranslationVeil(switchNow: () => void) {
  showTranslationVeil();
  window.setTimeout(switchNow, 120);
  hideTranslationVeilWhenSettled();
}

/** Optional plain-language status under the spinner so users know the step. */
export function setTranslationVeilStatus(message: string) {
  if (typeof document === 'undefined') return;
  const veil = document.getElementById(VEIL_ID);
  if (!veil) return;
  let status = document.getElementById('ml-translation-veil-status');
  if (!status) {
    status = document.createElement('p');
    status.id = 'ml-translation-veil-status';
    Object.assign(status.style, {
      position: 'absolute',
      left: '50%',
      top: '58%',
      transform: 'translate(-50%, 0)',
      margin: '0',
      maxWidth: 'min(22rem, 88vw)',
      padding: '0 0.75rem',
      color: '#f8fafc',
      fontSize: '0.95rem',
      fontWeight: '700',
      textAlign: 'center',
      lineHeight: '1.35',
      textShadow: '0 1px 2px rgba(0,0,0,0.45)',
    });
    veil.appendChild(status);
  }
  status.textContent = message;
}
