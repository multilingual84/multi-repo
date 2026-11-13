import { qrSaveHint, qrSaveHintDomain } from '@/lib/qr-save-hint-copy';

// Bold capitals sitting directly above every QR code on the site.
// The domain keeps its exact spelling so nobody types a mangled address.
export default function QrSaveHint({ locale }: { locale: string }) {
  const c = qrSaveHint(locale);
  return (
    <p
      data-qr-save-hint
      className="text-center text-sm font-black uppercase leading-snug tracking-wide"
    >
      {c.lead}{' '}
      <span translate="no" className="notranslate normal-case">
        {qrSaveHintDomain}
      </span>
    </p>
  );
}
