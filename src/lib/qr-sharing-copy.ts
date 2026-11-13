import type { UILocale } from './ui-copy';

type SharingCopy = { invitation: string; earn: string; signup: string; freeSignup: string; setup: string; title: string; business: string; sharing: string; toggle: string; pending: string; stripeNote: string; purchase: string; reachout: string };
export const qrSharingCopy: Record<UILocale, SharingCopy> = {
  en: {
    invitation: 'For Business owners, Charity, Taxi Drivers, Social Workers, Places of Worship, Law Firms and Clinics, Influencers and Individuals can also Earn 50% just by sharing this code. Sharing our Code Gives you a Lifetime Free Personal Translator and 7 day free pass to whoever you share it to!',
    earn: 'Share us make 50%', signup: 'Users Must Sign Up for Stripe to Earn', freeSignup: 'Free sign up — no cost, no catch.', setup: 'Sign up with Stripe', title: 'Your QR code', business: 'Public business / agency QR', sharing: 'Earning / sharing QR', toggle: 'Switch between the sharing QR and the public business QR',
    pending: 'Referral payouts and lifetime rewards are not active yet. Your QR must be linked to a verified account before rewards can be granted.',
    stripeNote: 'Stripe registration opens in a separate browser tab so this page stays open. Registration alone does not link your QR or enable payouts; secure Stripe payout onboarding is still required.',
    purchase: '50% applies to eligible paid purchases, not scans or free passes.',
    reachout: 'Prepare outreach email drafts',
  },
  es: {
    invitation: 'Para propietarios de negocios, organizaciones benéficas, taxistas, trabajadores sociales, lugares de culto, bufetes, clínicas, influencers e individuos: todos pueden ganar el 50% compartiendo este código. ¡Compartir nuestro código te da un Traductor Personal gratis de por vida y un pase gratuito de 7 días para quien lo reciba!',
    earn: 'Compártenos y gana el 50%', signup: 'Los usuarios deben registrarse en Stripe para ganar', freeSignup: 'Registro gratuito — sin costo, sin trampa.', setup: 'Registrarse en Stripe', title: 'Tu código QR', business: 'QR público para negocios / agencias', sharing: 'QR para ganar / compartir', toggle: 'Cambiar entre el QR para compartir y el QR público',
    pending: 'Los pagos por referidos y las recompensas de por vida aún no están activos. Tu QR debe vincularse a una cuenta verificada antes de conceder recompensas.',
    stripeNote: 'El registro de Stripe se abre en otra pestaña y esta página permanece abierta. Registrarse no vincula tu QR ni habilita pagos; aún se requiere la incorporación segura para pagos de Stripe.',
    purchase: 'El 50% se aplica a compras pagadas elegibles, no a escaneos ni pases gratuitos.',
    reachout: 'Preparar borradores de correos de alcance',
  },
  zh: {
    invitation: '企业主、慈善机构、出租车司机、社工、宗教场所、律师事务所、诊所、网红及个人均可通过分享此二维码赚取50%收益。分享我们的二维码可让您终身免费使用个人翻译器，并为收到二维码的人提供7天免费通行证！',
    earn: '分享我们，赚取50%', signup: '用户必须注册Stripe才能获得收益', freeSignup: '免费注册——零费用，无隐藏条件。', setup: '注册Stripe', title: '您的二维码', business: '企业／机构公开二维码', sharing: '收益／分享二维码', toggle: '在分享二维码与企业／机构公开二维码之间切换',
    pending: '推荐付款及终身奖励尚未启用。二维码必须绑定经过验证的账户，才能发放奖励。',
    stripeNote: 'Stripe注册将在新的浏览器标签页中打开，此页面保持开启。注册本身不会绑定您的二维码或启用付款；仍需完成安全的Stripe收款开户。',
    purchase: '50%仅适用于符合条件的已付款购买，不适用于扫码或免费通行证。',
    reachout: '准备外联邮件草稿',
  },
  de: {
    invitation: 'Geschäftsinhaber, Wohltätigkeitsorganisationen, Taxifahrer, Sozialarbeiter, Gotteshäuser, Kanzleien, Kliniken, Influencer und Einzelpersonen können ebenfalls 50% verdienen, indem sie diesen Code teilen. Das Teilen unseres Codes gibt Ihnen einen lebenslang kostenlosen persönlichen Übersetzer und dem Empfänger einen kostenlosen 7-Tage-Pass!',
    earn: 'Teilen Sie uns und verdienen Sie 50%', signup: 'Nutzer müssen sich bei Stripe registrieren, um zu verdienen', freeSignup: 'Kostenlose Registrierung – keine Kosten, kein Haken.', setup: 'Bei Stripe registrieren', title: 'Ihr QR-Code', business: 'Öffentlicher Geschäfts- / Behörden-QR', sharing: 'QR zum Verdienen / Teilen', toggle: 'Zwischen QR zum Teilen und öffentlichem QR wechseln',
    pending: 'Empfehlungsauszahlungen und lebenslange Prämien sind noch nicht aktiv. Ihr QR muss vor einer Prämienvergabe mit einem verifizierten Konto verbunden werden.',
    stripeNote: 'Die Stripe-Registrierung öffnet sich in einem neuen Browser-Tab; diese Seite bleibt offen. Die Registrierung allein verbindet Ihren QR nicht und aktiviert keine Auszahlungen. Eine sichere Stripe-Auszahlungsregistrierung ist weiterhin nötig.',
    purchase: '50% gelten für berechtigte bezahlte Käufe, nicht für Scans oder kostenlose Pässe.',
    reachout: 'Ansprache-E-Mail-Entwürfe erstellen',
  },
  tl: {
    invitation: 'Ang mga may-ari ng negosyo, charity, taxi driver, social worker, lugar ng pagsamba, law firm, klinika, influencer, at mga indibidwal ay maaari ring kumita ng 50% sa pagbabahagi ng code na ito. Ang pagbabahagi ng aming code ay nagbibigay sa iyo ng libreng Personal Translator habambuhay at 7-araw na libreng pass sa sinumang pagbabahaginan mo!',
    earn: 'I-share kami, kumita ng 50%', signup: 'Kailangang mag-sign up sa Stripe para kumita', freeSignup: 'Libreng pag-sign up — walang bayad, walang huli.', setup: 'Mag-sign up sa Stripe', title: 'Iyong QR code', business: 'Pampublikong QR para sa negosyo / ahensya', sharing: 'QR para sa kita / pagbabahagi', toggle: 'Lumipat sa pagitan ng QR para sa pagbabahagi at pampublikong QR',
    pending: 'Hindi pa aktibo ang referral payout at habambuhay na reward. Kailangang iugnay ang QR sa beripikadong account bago maibigay ang reward.',
    stripeNote: 'Magbubukas ang Stripe registration sa hiwalay na browser tab at mananatiling bukas ang pahinang ito. Ang registration lang ay hindi nag-uugnay ng QR o nagpapagana ng payout; kailangan pa ang ligtas na Stripe payout onboarding.',
    purchase: 'Ang 50% ay para sa kwalipikadong bayad na pagbili, hindi sa pag-scan o libreng pass.',
    reachout: 'Maghanda ng mga draft ng outreach email',
  },
  ja: {
    invitation: '事業主、慈善団体、タクシー運転手、ソーシャルワーカー、礼拝施設、法律事務所、クリニック、インフルエンサー、そして個人の皆様も、このコードを共有して50%を獲得できます。共有すると、ご自身には生涯無料のパーソナル翻訳機、受け取った方には7日間の無料パスが提供されます！',
    earn: 'シェアして50%を獲得', signup: '報酬を得るにはStripeへの登録が必要です', freeSignup: '登録は無料 — 費用も落とし穴もありません。', setup: 'Stripeに登録', title: 'あなたのQRコード', business: '事業／行政機関向け公開QR', sharing: '報酬／共有用QR', toggle: '共有用QRと事業／行政機関向け公開QRを切り替える',
    pending: '紹介報酬の支払いと生涯特典はまだ有効ではありません。特典を付与するにはQRを認証済みアカウントに紐付ける必要があります。',
    stripeNote: 'Stripe登録は別のブラウザータブで開き、このページはそのまま残ります。登録だけではQRの紐付けや支払いは有効になりません。安全なStripe受取手続きが別途必要です。',
    purchase: '50%は対象となる支払い済み購入に適用され、スキャンや無料パスには適用されません。',
    reachout: 'アウトリーチメールの下書きを作成',
  },
};

export function qrSharingText(locale: string) {
  return qrSharingCopy[locale.replace(/^gt:/, '').split('-')[0] as UILocale] ?? qrSharingCopy.en;
}