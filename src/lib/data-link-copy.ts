type Copy = {
  heading: string; tabs: [string, string, string]; titles: [string, string, string];
  body: string; notice: string; placeholder: string; count: string; generate: string;
  generated: string; copy: string; copied: string; copyFailed: string; copyOne: string;
};

export const dataLinkCopy: Record<'en' | 'es' | 'tl' | 'zh' | 'de' | 'ja', Copy> = {
  en: {
    heading: '📱 Mobile & Browser Data-Link Activator',
    tabs: ['Personal Cellphones', 'Outbound Data Links', 'Digital Business Links'],
    titles: ['Option A: Personal Cellphone Data Links', 'Option B: Outbound Global Audio Links', 'Option C: Digital Business Data Links'],
    body: 'Secure Voice Connection: Connect through your browser using the internet, without app downloads. Enter your client or teammate’s existing email or handle below to connect through an encrypted multilingual voice link.',
    notice: 'Your link opens a live translated voice room the moment it is opened. The site does not send messages — copy a link and send it yourself from your email or messaging app.',
    placeholder: 'Enter existing client or teammate emails or handles (one per line)…', count: 'Recipients detected',
    generate: 'Create my live voice links', generated: 'Live links ready · copy each one and send it yourself',
    copy: 'Copy all live links', copied: 'All links copied', copyFailed: 'Copy unavailable — select the links below', copyOne: 'Copy this link',
  },
  es: {
    heading: '📱 Activador de enlaces de datos móvil y web', tabs: ['Teléfonos personales', 'Enlaces de datos salientes', 'Enlaces empresariales digitales'],
    titles: ['Opción A: Enlaces de datos para teléfonos personales', 'Opción B: Enlaces de audio globales salientes', 'Opción C: Enlaces de datos empresariales digitales'],
    body: 'Conexión de voz segura: Conéctese por internet en su navegador, sin descargar aplicaciones. Introduzca abajo el correo o identificador existente de su cliente o compañero para conectarse mediante un enlace de voz multilingüe cifrado.',
    notice: 'Tu enlace abre una sala de voz traducida en vivo en cuanto se abre. El sitio no envía mensajes: copia un enlace y envíalo tú mismo desde tu correo o aplicación de mensajería.',
    placeholder: 'Introduzca correos o identificadores existentes de clientes o compañeros (uno por línea)…', count: 'Destinatarios detectados', generate: 'Crear mis enlaces de voz en vivo', generated: 'Enlaces en vivo listos · copia cada uno y envíalo tú mismo', copy: 'Copiar todos los enlaces en vivo', copied: 'Todos los enlaces copiados', copyFailed: 'No se puede copiar — selecciona los enlaces de abajo', copyOne: 'Copiar este enlace',
  },
  tl: {
    heading: '📱 Mobile at Browser Data-Link Activator', tabs: ['Personal na cellphone', 'Papalabas na data link', 'Digital na business link'],
    titles: ['Opsyon A: Data Link para sa Personal na Cellphone', 'Opsyon B: Papalabas na Global Audio Link', 'Opsyon C: Digital na Business Data Link'],
    body: 'Ligtas na Koneksyon sa Boses: Kumonekta sa internet gamit ang browser, nang walang app download. Ilagay sa ibaba ang kasalukuyang email o handle ng kliyente o katrabaho upang kumonekta sa isang naka-encrypt na multilingguwal na voice link.',
    notice: 'Ang iyong link ay bubuksan ang live na translated voice room sa sandaling buksan ito. Hindi nagpapadala ng mensahe ang site — kopyahin ang link at padalhan mo mismo mula sa iyong email o messaging app.',
    placeholder: 'Ilagay ang kasalukuyang email o handle ng kliyente o katrabaho (isa bawat linya)…', count: 'Mga natukoy na tatanggap', generate: 'Gumawa ng aking live voice links', generated: 'Handa na ang live links · kopyahin ang bawat isa at padalhan mo mismo', copy: 'Kopyahin lahat ng live links', copied: 'Nakopya lahat ng links', copyFailed: 'Hindi makopya — piliin ang links sa ibaba', copyOne: 'Kopyahin ang link na ito',
  },
  zh: {
    heading: '📱 手机与浏览器数据链接启用器', tabs: ['个人手机', '外发数据链接', '数字商务链接'],
    titles: ['选项 A：个人手机数据链接', '选项 B：全球外发音频链接', '选项 C：数字商务数据链接'],
    body: '安全语音连接：通过互联网在浏览器中连接，无需下载应用。请在下方输入客户或同事现有的邮箱或账号，通过加密的多语言语音链接进行连接。',
    notice: '您的链接一被打开就会进入实时翻译语音房间。网站不会发送消息——请复制链接，自己通过邮箱或聊天应用发送。',
    placeholder: '输入客户或同事现有的邮箱或账号（每行一个）…', count: '已识别的接收人', generate: '生成我的实时语音链接', generated: '实时链接已就绪 · 请逐一复制并自行发送', copy: '复制全部实时链接', copied: '已复制全部链接', copyFailed: '无法复制 — 请选中下方链接', copyOne: '复制此链接',
  },
  de: {
    heading: '📱 Datenlink-Aktivierung für Handy und Browser', tabs: ['Private Handys', 'Ausgehende Datenlinks', 'Digitale Geschäftslinks'],
    titles: ['Option A: Datenlinks für private Handys', 'Option B: Ausgehende globale Audiolinks', 'Option C: Digitale Geschäftsdatenlinks'],
    body: 'Sichere Sprachverbindung: Verbinden Sie sich über das Internet im Browser, ohne App-Downloads. Geben Sie unten die bestehende E-Mail-Adresse oder Kennung Ihres Kunden oder Kollegen ein, um sich über einen verschlüsselten mehrsprachigen Sprachlink zu verbinden.',
    notice: 'Ihr Link öffnet in dem Moment, in dem er geöffnet wird, einen live übersetzten Sprachraum. Die Site versendet keine Nachrichten – kopieren Sie einen Link und senden Sie ihn selbst aus Ihrer E-Mail- oder Messenger-App.',
    placeholder: 'Bestehende E-Mail-Adressen oder Kennungen eingeben (eine pro Zeile)…', count: 'Erkannte Empfänger', generate: 'Meine Live-Sprachlinks erstellen', generated: 'Live-Links bereit · jeden kopieren und selbst senden', copy: 'Alle Live-Links kopieren', copied: 'Alle Links kopiert', copyFailed: 'Kopieren nicht möglich — Links unten auswählen', copyOne: 'Diesen Link kopieren',
  },
  ja: {
    heading: '📱 モバイル・ブラウザ用データリンク設定', tabs: ['個人の携帯電話', '発信用データリンク', 'デジタル業務リンク'],
    titles: ['オプション A：個人携帯電話用データリンク', 'オプション B：グローバル発信音声リンク', 'オプション C：デジタル業務用データリンク'],
    body: '安全な音声接続：インターネットとブラウザで接続でき、アプリのダウンロードは不要です。顧客や同僚の既存のメールアドレスまたはユーザー名を下に入力し、暗号化された多言語音声リンクで接続できます。',
    notice: 'リンクが開かれると同時に、翻訳付きのライブ音声ルームが開きます。当サイトはメッセージを送信しません。リンクをコピーして、ご自身のメールやメッセージアプリからお送りください。',
    placeholder: '顧客や同僚の既存のメールアドレスまたはユーザー名（1行に1件）…', count: '検出された送信先', generate: 'マイライブ音声リンクを作成', generated: 'ライブリンクの準備が完了 · 一つずつコピーしてご自身でお送りください', copy: 'すべてのライブリンクをコピー', copied: 'すべてのリンクをコピーしました', copyFailed: 'コピーできません — 下のリンクを選択してください', copyOne: 'このリンクをコピー',
  },
};