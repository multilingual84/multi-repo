import type { UILocale } from '../ui-copy';

type CampaignCopy = { subject: string; to: string; departments: string[]; introduction: string; access: string; privacy: string };

export type CampaignSector = 'retail' | 'airport' | 'taxi' | 'corporate';

// Drafts only: sector subjects/bodies are presentation templates, never sent or tracked.
export const sectorCopy: Record<CampaignSector, { subject: string; body: string }> = {
  retail: {
    subject: 'Retail translation for your counter — Reference',
    body: 'Multi-Lingual™ offers browser-based translation for face-to-face retail conversations, with no app to install. Text translation and two-person, two-phone translation are free for life; free calls, video and one-phone translation include 30 minutes per rolling 24 hours.',
  },
  airport: {
    subject: 'Translation pass for transit and lobby staff — Reference',
    body: 'Multi-Lingual™ offers browser-based translation for international transit workers and gate agents, with no app to install. Greet travelers face-to-face in their language; text translation is free for life.',
  },
  taxi: {
    subject: 'Driver translation pass — Reference',
    body: 'Multi-Lingual™ offers a browser-based real-time translator for independent drivers, with no app to install. Display your QR code for passengers; sharing a code adds 30 days for its user and pays the sharer 50% only on a completed purchase, claimed by email.',
  },
  corporate: {
    subject: 'Cross-border translation for your organization — Reference',
    body: 'Multi-Lingual™ offers browser-based translation for businesses, places of worship, charities and social workers, with no app to install. User-to-user translated text and two-person, two-phone translation are free for life.',
  },
};

// Drafts only: department labels are not email addresses or a delivery list.
export const campaignCopy: Record<UILocale, CampaignCopy> = {
  en: {
    subject: 'Multi-Lingual™ browser translation — Reference', to: 'Corporate Operations Desk / Administrative Lead',
    departments: ['Executive Leadership Team', 'Board of Directors', 'General Counsel', 'Regional Operations', 'Chief Information Officer', 'IT Procurement', 'Human Resources', 'Accounts Payable & Finance', 'Sales & Marketing', 'Customer Support', 'Facilities & Logistics'],
    introduction: 'Multi-Lingual™ offers browser-based language translation without installing an app, for business and community conversations.',
    access: 'User-to-user translated text and two-person, two-phone translation are free for life. Free calls, video and one-phone translation have a 30-minute allowance per rolling 24 hours. Share this referral link with interested colleagues; opening it does not activate a paid plan or verify an organization.',
    privacy: 'Microphone audio is sent for transcription and translation when those features are used. Premium synthesis sends translated text to a licensed voice service. Device cleanup does not establish provider deletion; payment and wallet records are maintained for account operations. Review the in-app privacy details before use.',
  },
  es: {
    subject: 'Traducción en el navegador Multi-Lingual™ — Referencia', to: 'Operaciones corporativas / Responsable administrativo',
    departments: ['Dirección ejecutiva', 'Consejo de administración', 'Asesoría jurídica', 'Operaciones regionales', 'Dirección de informática', 'Compras de TI', 'Recursos humanos', 'Cuentas por pagar y finanzas', 'Ventas y marketing', 'Atención al cliente', 'Instalaciones y logística'],
    introduction: 'Multi-Lingual™ ofrece traducción de idiomas en el navegador sin instalar una aplicación, para conversaciones empresariales y comunitarias.',
    access: 'Los mensajes traducidos entre usuarios y la traducción entre dos personas con dos teléfonos son gratis de por vida. Las llamadas, el vídeo y la traducción con un teléfono gratuitos tienen 30 minutos por cada período móvil de 24 horas. Comparta este enlace de referencia con colegas interesados; abrirlo no activa un plan de pago ni verifica una organización.',
    privacy: 'El audio del micrófono se envía para transcripción y traducción al usar esas funciones. La síntesis premium envía el texto traducido a un servicio de voz autorizado. La limpieza del dispositivo no confirma la eliminación por el proveedor; se mantienen registros de pagos y cartera para gestionar la cuenta. Revise los detalles de privacidad de la aplicación antes de usarla.',
  },
  tl: {
    subject: 'Pagsasalin sa browser ng Multi-Lingual™ — Sanggunian', to: 'Tanggapan ng operasyon / Pinunong administratibo',
    departments: ['Pamunuang ehekutibo', 'Lupon ng mga direktor', 'Tagapayo sa batas', 'Operasyong panrehiyon', 'Pinuno ng impormasyon', 'Pagbili ng IT', 'Yamang tao', 'Bayarin at pananalapi', 'Benta at marketing', 'Suporta sa customer', 'Pasilidad at logistik'],
    introduction: 'Nag-aalok ang Multi-Lingual™ ng pagsasalin sa browser nang walang ini-install na app, para sa usapang pangnegosyo at pangkomunidad.',
    access: 'Libre habambuhay ang isinaling text sa pagitan ng mga user at pagsasalin ng dalawang tao gamit ang dalawang telepono. May 30 minutong allowance sa bawat gumugulong na 24 oras ang libreng tawag, video at pagsasalin gamit ang isang telepono. Ibahagi ang referral link sa interesadong kasamahan; hindi nito ina-activate ang bayad na plano o bineberipika ang organisasyon.',
    privacy: 'Ipinapadala ang audio ng mikropono para sa transkripsyon at pagsasalin kapag ginagamit ang mga iyon. Ipinapadala ng premium synthesis ang isinaling text sa lisensiyadong serbisyo ng boses. Hindi pinatutunayan ng paglilinis ng device ang pagbura ng provider; pinananatili ang rekord ng bayad at wallet para sa account. Basahin ang detalye ng privacy sa app bago gamitin.',
  },
  zh: {
    subject: 'Multi-Lingual™ 浏览器翻译 — 参考编号', to: '企业运营部门 / 行政负责人',
    departments: ['高管团队', '董事会', '法律顾问', '区域运营', '首席信息官', '信息技术采购', '人力资源', '应付账款与财务', '销售与营销', '客户支持', '设施与物流'],
    introduction: 'Multi-Lingual™ 提供无需安装应用的浏览器语言翻译，适用于商业和社区交流。',
    access: '用户间文字翻译及两人使用两部手机的翻译终身免费。免费通话、视频及单手机翻译在每个滚动24小时内有30分钟额度。可向感兴趣的同事分享此推荐链接；打开链接不会激活付费套餐或验证组织。',
    privacy: '使用相关功能时，麦克风音频会发送用于转录和翻译。高级语音合成会将翻译文字发送给获授权的语音服务。设备清理不代表服务商已删除数据；账户运营需要保留付款和钱包记录。使用前请阅读应用内隐私说明。',
  },
  de: {
    subject: 'Multi-Lingual™ Browser-Übersetzung — Referenz', to: 'Unternehmensbetrieb / Verwaltungsleitung',
    departments: ['Geschäftsleitung', 'Vorstand', 'Rechtsberatung', 'Regionaler Betrieb', 'IT-Leitung', 'IT-Beschaffung', 'Personalwesen', 'Kreditoren und Finanzen', 'Vertrieb und Marketing', 'Kundensupport', 'Einrichtungen und Logistik'],
    introduction: 'Multi-Lingual™ bietet Sprachübersetzung im Browser ohne App-Installation für geschäftliche und gemeinschaftliche Gespräche.',
    access: 'Übersetzte Nachrichten zwischen Nutzern und Übersetzung für zwei Personen mit zwei Telefonen sind lebenslang kostenlos. Kostenlose Anrufe, Video und Ein-Telefon-Übersetzung haben 30 Minuten je gleitendem 24-Stunden-Zeitraum. Teilen Sie diesen Empfehlungslink mit interessierten Kollegen; er aktiviert keinen bezahlten Tarif und verifiziert keine Organisation.',
    privacy: 'Bei Nutzung dieser Funktionen wird Mikrofon-Audio zur Transkription und Übersetzung gesendet. Premium-Synthese sendet übersetzten Text an einen lizenzierten Sprachdienst. Gerätereinigung bestätigt keine Löschung beim Anbieter; Zahlungs- und Wallet-Aufzeichnungen bleiben für den Kontobetrieb erhalten. Lesen Sie vor Nutzung die Datenschutzhinweise in der App.',
  },
  ja: {
    subject: 'Multi-Lingual™ ブラウザー翻訳 — 参照番号', to: '企業運営部門 / 管理責任者',
    departments: ['経営幹部', '取締役会', '法務顧問', '地域運営', '最高情報責任者', 'IT調達', '人事', '買掛金・財務', '営業・マーケティング', '顧客サポート', '施設・物流'],
    introduction: 'Multi-Lingual™ はアプリのインストールなしで、ビジネスや地域の会話向けにブラウザーで言語翻訳を提供します。',
    access: '利用者間の翻訳テキストと、2人が2台の電話を使う翻訳は生涯無料です。無料の通話、動画、1台の電話での翻訳は、連続する24時間ごとに60分の利用枠があります。関心のある同僚に紹介リンクを共有できますが、開いても有料プランは有効にならず、組織の確認にもなりません。',
    privacy: '関連機能を使う際、マイク音声は文字起こしと翻訳のために送信されます。プレミアム音声合成では翻訳テキストをライセンスされた音声サービスへ送信します。端末の清掃は提供者による削除を証明しません。アカウント運営のため支払いとウォレットの記録は保持されます。利用前にアプリ内のプライバシー説明をご確認ください。',
  },
};