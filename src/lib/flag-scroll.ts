/** Bound manual browsing to a finite strip, including narrow search results. */
export function boundedFlagPosition(position: number, scrollWidth: number, clientWidth: number) {
  return Math.max(0, Math.min(position, Math.max(0, scrollWidth - clientWidth)));
}