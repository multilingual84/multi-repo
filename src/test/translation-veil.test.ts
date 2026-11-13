import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  showTranslationVeil,
  hideTranslationVeil,
  hideTranslationVeilWhenSettled,
} from '@/lib/translation-veil';

const VEIL_ID = 'ml-translation-veil';

beforeEach(() => {
  vi.useFakeTimers();
  hideTranslationVeil();
});

afterEach(() => {
  hideTranslationVeil();
  vi.useRealTimers();
});

describe('translation veil', () => {
  it('shows a centered loading circle with the veil', () => {
    showTranslationVeil();
    const veil = document.getElementById(VEIL_ID);
    expect(veil).not.toBeNull();
    const spinner = veil!.querySelector(`#${VEIL_ID}-spinner`);
    expect(spinner).not.toBeNull();
    expect((spinner as HTMLElement).style.animation).toContain('ml-veil-spin');
    expect(veil!.style.display).toBe('flex');
  });

  it('stays up until the page has settled, then lifts', () => {
    showTranslationVeil();
    hideTranslationVeilWhenSettled();
    // Immediately after, the site is not ready: veil still covers the page.
    expect(document.getElementById(VEIL_ID)).not.toBeNull();
    // Arming window, quiet window and minimum visible time must elapse first.
    vi.advanceTimersByTime(600);
    expect(document.getElementById(VEIL_ID)).not.toBeNull();
    vi.advanceTimersByTime(400);
    expect(document.getElementById(VEIL_ID)).not.toBeNull();
    vi.advanceTimersByTime(600);
    expect(document.getElementById(VEIL_ID)).not.toBeNull();
    vi.advanceTimersByTime(500);
    expect(document.getElementById(VEIL_ID)).toBeNull();
  });

  it('re-showing during a pending fade restores the full cover with its spinner', () => {
    showTranslationVeil();
    hideTranslationVeil();
    showTranslationVeil();
    // The pending fade removal was cancelled: the veil must be back, opaque.
    expect(document.getElementById(VEIL_ID)).not.toBeNull();
    expect(
      document.getElementById(`${VEIL_ID}-spinner`)
    ).not.toBeNull();
    vi.advanceTimersByTime(450);
    expect(document.getElementById(VEIL_ID)).not.toBeNull();
  });

  it('never sticks: a safety cap removes the veil even if the page never settles', () => {
    showTranslationVeil();
    hideTranslationVeilWhenSettled();
    vi.advanceTimersByTime(6100);
    expect(document.getElementById(VEIL_ID)).toBeNull();
  });

  it('explicit hide removes the veil after its fade', () => {
    showTranslationVeil();
    hideTranslationVeil();
    expect(document.getElementById(VEIL_ID)).not.toBeNull();
    vi.advanceTimersByTime(450);
    expect(document.getElementById(VEIL_ID)).toBeNull();
  });
});
