import { approximateLocalLanguage } from '@/lib/local-language';
import { isSharedCallLink } from '@/lib/answer-call';
import { isPublicTranslatorHash } from '@/lib/public-translator-link';
export function recipientCallLanguage(saved: string | null, phone: string, country: string | null = null, zone = ''): string {
  const normalize = (value: string) => value.replace(/^gt:/, '').replace(/^fil(?=-|$)/, 'tl');
  for (const value of [saved, phone]) {
    const language = normalize(value ?? '');
    if (/^[a-z]{2,3}(?:-[A-Za-z]{2,8})?$/.test(language)) return language;
  }
  return approximateLocalLanguage(country, zone) || 'en';
}
export function callShareHref(kind: 'text' | 'email', link: string): string {
  const url = new URL(link);
  if (!/^https?:$/.test(url.protocol) || (!isSharedCallLink(url.hash) && !isPublicTranslatorHash(url.hash))) throw new Error('Invalid call link');
  return kind === 'text' ? `sms:?body=${encodeURIComponent(link)}` : `mailto:?body=${encodeURIComponent(link)}`;
}
export const callSharingLabels = {
  en: { qr: 'Share QR code', text: 'Text', email: 'Email' },
  es: { qr: 'Compartir código QR', text: 'Texto', email: 'Correo' },
  zh: { qr: '分享二维码', text: '短信', email: '电子邮件' },
  de: { qr: 'QR-Code teilen', text: 'SMS', email: 'E-Mail' },
  tl: { qr: 'Ibahagi ang QR code', text: 'Text', email: 'Email' },
  ja: { qr: 'QRコードを共有', text: 'SMS', email: 'メール' },
};
export const callSharingInstructions = {
  en: 'Scan this QR with another phone, or take a photo or screenshot and send it. You can also send the same link by Text or Email below. The recipient opens the link and taps Answer; both of you allow the microphone when prompted.',
  es: 'Escanea este QR con otro teléfono, o toma una foto o captura de pantalla y envíala. También puedes enviar el mismo enlace por Texto o Correo abajo. La otra persona abre el enlace y toca Responder; ambos permiten el micrófono cuando se les solicite.',
  tl: 'I-scan ang QR gamit ang ibang telepono, o kumuha ng litrato o screenshot at ipadala ito. Maaari ring ipadala ang parehong link gamit ang Text o Email sa ibaba. Bubuksan ng tatanggap ang link at pipiliin ang Sagutin; pareho kayong papayag sa mikropono kapag hiniling.',
  zh: '用另一部手机扫描此二维码，或拍照、截图后发送。也可以通过下方的短信或电子邮件发送同一个链接。接收者打开链接并点击接听；双方在提示时允许使用麦克风。',
  de: 'Scanne diesen QR-Code mit einem anderen Telefon oder fotografiere ihn bzw. mache einen Screenshot und sende das Bild. Du kannst denselben Link auch unten per SMS oder E-Mail senden. Der Empfänger öffnet den Link und tippt auf Annehmen; beide erlauben das Mikrofon, wenn sie gefragt werden.',
  ja: '別のスマートフォンでこのQRを読み取るか、写真やスクリーンショットを撮って送ってください。下のSMSやメールでも同じリンクを送れます。相手はリンクを開いて応答をタップし、双方が案内に従ってマイクの使用を許可します。',
};