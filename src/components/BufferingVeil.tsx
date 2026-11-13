import { useEffect } from 'react';
import { installBufferingVeil } from '@/lib/buffering-veil';

// Mounts once at the root: while the site is buffering — a hung request, a page
// still loading, a chosen language not applied yet — the frost stays on until
// the site is ready again for the language the visitor chose.
export default function BufferingVeil() {
  useEffect(() => installBufferingVeil(), []);
  return null;
}
