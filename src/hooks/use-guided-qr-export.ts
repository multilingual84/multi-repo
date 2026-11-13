import { useEffect, useState } from 'react';
import { createGuidedQrExport } from '@/lib/qr-guided-export';

export function useGuidedQrExport(qr: string) {
  const [result, setResult] = useState({ source: '', image: '' });
  useEffect(() => {
    if (!qr) return;
    let alive = true;
    createGuidedQrExport(qr).then(image => {
      if (alive) setResult({ source: qr, image });
    }).catch(() => { if (alive) setResult({ source: qr, image: '' }); });
    return () => { alive = false; };
  }, [qr]);
  // Never fall back to an unguided QR or export a previous QR's destination.
  return result.source === qr ? result.image : '';
}