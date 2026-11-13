import type { UILocale } from './ui-copy';

type PassShareCopy = { share: string; shareText: string };
export const passShareCopy: Record<UILocale, PassShareCopy> = {
  en: { share: 'Share pass', shareText: 'Your free 7-day all-access Multi-Lingual™ pass — no sign-ups, no credit card. Tap to start:' },
  es: { share: 'Compartir pase', shareText: 'Su pase gratuito de 7 días de acceso total a Multi-Lingual™ — sin registros ni tarjeta de crédito. Toque para comenzar:' },
  zh: { share: '分享通行证', shareText: '您的 Multi-Lingual™ 免费 7 天全权限通行证 — 无需注册，无需信用卡。点击即可开始：' },
  de: { share: 'Pass teilen', shareText: 'Ihr kostenloser 7-Tage-All-Access-Pass für Multi-Lingual™ — ohne Anmeldung, ohne Kreditkarte. Zum Starten antippen:' },
  tl: { share: 'Ibahagi ang pass', shareText: 'Ang inyong libreng 7-araw na all-access pass sa Multi-Lingual™ — walang sign-up, walang credit card. I-tap para magsimula:' },
  ja: { share: 'パスを共有', shareText: 'Multi-Lingual™ の無料 7 日間オールアクセスパス — 登録もクレジットカードも不要。タップして開始：' },
};
