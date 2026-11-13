import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  installBufferingVeil,
  noteBufferingStart,
  noteBufferingEnd,
  resetBufferingVeil,
} from '@/lib/buffering-veil';

const VEIL_ID = 'ml-translation-veil';
const STALL_MS = 900;
const QUIET_MS = 600;
const MIN_VISIBLE_MS = 700;
const MAX_WAIT_MS = 20000;
const FADE_MS = 400;

let uninstall: () => void = () => {};
let realFetch: typeof globalThis.fetch;

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  document.documentElement.lang = 'en';
  resetBufferingVeil();
  realFetch = globalThis.fetch;
});

afterEach(() => {
  uninstall();
  resetBufferingVeil();
  globalThis.fetch = realFetch;
  localStorage.clear();
  vi.useRealTimers();
});

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => { resolve = done; });
  return { promise, resolve };
}

describe('buffering veil', () => {
  it('frosts every click after allowing its action and releases when ready', async () => {
    uninstall = installBufferingVeil();
    const button = document.createElement('button');
    const action = vi.fn();
    button.addEventListener('click', action);
    document.body.appendChild(button);
    button.click();
    expect(action).toHaveBeenCalledOnce();
    await vi.runAllTicks();
    expect(document.getElementById(VEIL_ID)).not.toBeNull();
    vi.advanceTimersByTime(QUIET_MS + MIN_VISIBLE_MS + FADE_MS);
    expect(document.getElementById(VEIL_ID)).toBeNull();
    button.remove();
  });

  it('holds immediate local voice loading until generation finishes', () => {
    uninstall = installBufferingVeil();
    noteBufferingStart(true);
    expect(document.getElementById(VEIL_ID)).not.toBeNull();
    vi.advanceTimersByTime(3000);
    expect(document.getElementById(VEIL_ID)).not.toBeNull();
    noteBufferingEnd();
    vi.advanceTimersByTime(QUIET_MS + FADE_MS);
    expect(document.getElementById(VEIL_ID)).toBeNull();
  });

  it('frosts the page while a request hangs, then lifts once it comes back', async () => {
    const { promise, resolve } = deferred();
    globalThis.fetch = (() => promise) as unknown as typeof globalThis.fetch;
    // Install after the stub so the watcher wraps the request being tested.
    uninstall = installBufferingVeil();

    void globalThis.fetch('/api/anything');
    vi.advanceTimersByTime(STALL_MS - 100);
    expect(document.getElementById(VEIL_ID)).toBeNull();

    vi.advanceTimersByTime(200);
    expect(document.getElementById(VEIL_ID)).not.toBeNull();

    resolve();
    await promise;
    vi.advanceTimersByTime(QUIET_MS + MIN_VISIBLE_MS + FADE_MS);
    expect(document.getElementById(VEIL_ID)).toBeNull();
  });

  it('never frosts for a request that answers quickly', async () => {
    globalThis.fetch = (async () => undefined) as unknown as typeof globalThis.fetch;
    uninstall = installBufferingVeil();
    await globalThis.fetch('/api/quick');
    vi.advanceTimersByTime(STALL_MS + QUIET_MS + FADE_MS);
    expect(document.getElementById(VEIL_ID)).toBeNull();
  });

  it('holds the frost until the language the visitor chose is applied', () => {
    localStorage.setItem('user_locale', 'es');
    document.documentElement.lang = 'en';
    uninstall = installBufferingVeil();

    noteBufferingStart();
    vi.advanceTimersByTime(STALL_MS);
    expect(document.getElementById(VEIL_ID)).not.toBeNull();

    noteBufferingEnd();
    vi.advanceTimersByTime(QUIET_MS + MIN_VISIBLE_MS + FADE_MS);
    // The site is quiet but still showing the wrong language: frost stays on.
    expect(document.getElementById(VEIL_ID)).not.toBeNull();

    document.documentElement.lang = 'es';
    vi.advanceTimersByTime(QUIET_MS + MIN_VISIBLE_MS + FADE_MS);
    expect(document.getElementById(VEIL_ID)).toBeNull();
  });

  it('releases the frost at the cap even if the site never stops buffering', () => {
    uninstall = installBufferingVeil();
    noteBufferingStart();
    vi.advanceTimersByTime(STALL_MS);
    expect(document.getElementById(VEIL_ID)).not.toBeNull();
    vi.advanceTimersByTime(MAX_WAIT_MS + FADE_MS);
    expect(document.getElementById(VEIL_ID)).toBeNull();
    noteBufferingEnd();
  });
});
