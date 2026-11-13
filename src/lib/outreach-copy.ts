import type { UILocale } from './ui-copy';

// Share & use-as-translator panel on the 7-Day Free Pass screen.
// Presentation-only: no messages are sent and nothing is stored.
export type OutreachCopy = {
  title: string;
  steps: [string, string, string];
  useFor: string;
  popupTitle: string;
  popupLanguage: string;
  popupBody: string;
  listenChoices: [string, string];
  bluetooth: string;
  close: string;
};

export const outreachCopy: Record<UILocale, OutreachCopy> = {
  en: {
    title: 'Share with everyone you need to speak with',
    steps: ["1. Save your unique QR code or share its link.", "2. Display or print the same QR code wherever you meet people.", "3. Open the universal instructions and choose your language."],
    useFor: "Keep this unique QR code for life to speak with anyone.",
    popupTitle: "Universal QR instructions",
    popupLanguage: 'Show instructions in',
    popupBody: "Display this unique QR code in front of your office, in your taxi, lobby, church, place of business or charity, or print it and put it where people can scan it to start speaking with anyone immediately. Visitors scan the code, choose their language, and speak or listen.",
    listenChoices: ['🎧 Listen with earbuds', '📱 Listen on the phone speaker'],
    bluetooth: 'Listeners connect their own Bluetooth earbuds to their phone before scanning.',
    close: 'Got it',
  },
  es: {
    title: 'Comparta con todas las personas con quienes necesita hablar',
    steps: ["1. Guarde su código QR único o comparta su enlace.", "2. Muestre o imprima el mismo código QR donde se reúna con otras personas.", "3. Abra las instrucciones universales y elija su idioma."],
    useFor: "Conserve este código QR único de por vida para hablar con cualquier persona.",
    popupTitle: "Instrucciones universales del QR",
    popupLanguage: 'Mostrar instrucciones en',
    popupBody: "Muestre este código QR único frente a su oficina, en su taxi, vestíbulo, iglesia, negocio u organización benéfica, o imprímalo y colóquelo donde puedan escanearlo para empezar a hablar con cualquier persona de inmediato. Los visitantes escanean el código, eligen su idioma y hablan o escuchan.",
    listenChoices: ['🎧 Escuchar con audífonos', '📱 Escuchar por el altavoz del teléfono'],
    bluetooth: 'Los oyentes conectan sus propios audífonos Bluetooth a su teléfono antes de escanear.',
    close: 'Entendido',
  },
  tl: {
    title: 'Ibahagi sa lahat ng kailangan mong kausapin',
    steps: ["1. I-save ang iyong natatanging QR code o ibahagi ang link nito.", "2. Ipakita o i-print ang parehong QR code saan ka man nakikipagkita.", "3. Buksan ang pangkalahatang mga tagubilin at piliin ang iyong wika."],
    useFor: "Itago ang natatanging QR code na ito habambuhay upang makausap ang sinuman.",
    popupTitle: "Pangkalahatang mga tagubilin sa QR",
    popupLanguage: 'Ipakita ang mga tagubilin sa',
    popupBody: "Ipakita ang natatanging QR code na ito sa harap ng iyong opisina, sa taxi, lobby, simbahan, negosyo o charity, o i-print at ilagay kung saan ito mai-scan upang agad makausap ang sinuman. I-scan ng mga bisita ang code, pipili ng wika, at magsasalita o makikinig.",
    listenChoices: ['🎧 Makinig gamit ang earbuds', '📱 Makinig sa speaker ng telepono'],
    bluetooth: 'Ikinokonekta ng mga nakikinig ang sarili nilang Bluetooth earbuds sa kanilang telepono bago mag-scan.',
    close: 'Sige',
  },
  zh: {
    title: '分享给所有需要沟通的人',
    steps: ["1. 保存您的专属二维码或分享其链接。", "2. 在任何与人见面的场所展示或打印同一个二维码。", "3. 打开通用说明并选择您的语言。"],
    useFor: "终身保留这个专属二维码，与任何人交流。",
    popupTitle: "通用二维码说明",
    popupLanguage: '说明显示语言',
    popupBody: "在办公室门前、出租车内、大堂、教堂、营业场所或慈善机构展示此专属二维码，或将其打印并放在方便扫码的位置，即可立即与任何人交流。访客扫码、选择语言，然后交谈或收听。",
    listenChoices: ['🎧 用耳机收听', '📱 用手机扬声器收听'],
    bluetooth: '听众需在扫码前自行将蓝牙耳机连接到手机。',
    close: '知道了',
  },
  de: {
    title: 'Mit allen teilen, mit denen Sie sprechen müssen',
    steps: ["1. Speichern Sie Ihren persönlichen QR-Code oder teilen Sie seinen Link.", "2. Zeigen oder drucken Sie denselben QR-Code überall, wo Sie Menschen treffen.", "3. Öffnen Sie die allgemeine Anleitung und wählen Sie Ihre Sprache."],
    useFor: "Bewahren Sie diesen persönlichen QR-Code lebenslang auf, um mit jedem zu sprechen.",
    popupTitle: "Allgemeine QR-Anleitung",
    popupLanguage: 'Anleitung anzeigen auf',
    popupBody: "Zeigen Sie diesen persönlichen QR-Code vor Ihrem Büro, in Ihrem Taxi, in der Lobby, Kirche, Geschäftsstelle oder Wohltätigkeitsorganisation. Oder drucken Sie ihn aus und platzieren Sie ihn gut sichtbar, damit jeder ihn scannen und sofort ein Gespräch beginnen kann. Besucher scannen den Code, wählen ihre Sprache und sprechen oder hören zu.",
    listenChoices: ['🎧 Mit Ohrhörern hören', '📱 Über den Handylautsprecher hören'],
    bluetooth: 'Zuhörer verbinden ihre eigenen Bluetooth-Ohrhörer vor dem Scannen mit ihrem Handy.',
    close: 'Verstanden',
  },
  ja: {
    title: '話す必要があるすべての人と共有',
    steps: ["1. 専用QRコードを保存するか、リンクを共有します。", "2. 人と会う場所で同じQRコードを表示または印刷します。", "3. 共通の手順を開き、言語を選択します。"],
    useFor: "この専用QRコードを生涯保存して、誰とでも話しましょう。",
    popupTitle: "共通のQRコード手順",
    popupLanguage: '手順の表示言語',
    popupBody: "この専用QRコードをオフィスの前、タクシー内、ロビー、教会、事業所、慈善団体で表示するか、印刷してスキャンしやすい場所に置くと、誰とでもすぐに会話を始められます。訪問者はコードをスキャンし、言語を選び、話すか聴くことができます。",
    listenChoices: ['🎧 イヤホンで聴く', '📱 スマホのスピーカーで聴く'],
    bluetooth: '聞き手はスキャン前に、ご自身のBluetoothイヤホンをスマホに接続してください。',
    close: '了解',
  },
};

export const outreachLocaleNames: Record<UILocale, string> = {
  en: 'English', es: 'Español', tl: 'Tagalog', zh: '中文', de: 'Deutsch', ja: '日本語',
};
