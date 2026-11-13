import { useEffect } from 'react';

// Delegation covers translated controls and newly opened panels equally.
export default function InteractionFeedback() {
  useEffect(() => {
    const timers = new Map<HTMLElement, ReturnType<typeof setTimeout>>();
    const highlight = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const control = event.target.closest<HTMLElement>('button, a[href], [role="tab"], [role="button"], [role="switch"], [role="checkbox"], summary');
      if (!control || control.matches(':disabled, [aria-disabled="true"]')) return;
      const previous = timers.get(control);
      if (previous) clearTimeout(previous);
      control.setAttribute('data-click-feedback', 'true');
      timers.set(control, setTimeout(() => {
        control.removeAttribute('data-click-feedback');
        timers.delete(control);
      }, 360));
    };
    document.addEventListener('click', highlight, true);
    return () => {
      document.removeEventListener('click', highlight, true);
      timers.forEach((timer, control) => {
        clearTimeout(timer);
        control.removeAttribute('data-click-feedback');
      });
    };
  }, []);
  return null;
}