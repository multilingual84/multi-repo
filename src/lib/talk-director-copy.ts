import type { UILocale } from '@/lib/ui-copy';

export type TalkDirectorCopy = {
  coachTitle: string;
  listenNow: string;
  speakNow: string;
  switchHint: string;
  greenSpeak: string;
  greenDone: string;
  greenHear: string;
  greenRead: string;
  greenNext: string;
  busyHear: string;
  busyTranslate: string;
  busySpeak: string;
  frostWorking: string;
  frostAlmost: string;
  showText: string;
  hideText: string;
  roomReady: string;
};

export const talkDirectorCopy: Record<UILocale, TalkDirectorCopy> = {
  en: {
    coachTitle: 'Your live translator',
    listenNow: 'Please wait — listening / translating…',
    speakNow: 'Your turn — press the green button and speak clearly',
    switchHint: 'Only one person speaks at a time. Press green when it is your turn.',
    greenSpeak: 'Hold to speak',
    greenDone: 'I’m done — next person',
    greenHear: 'Hear translation',
    greenRead: 'Read translation',
    greenNext: 'Next turn',
    busyHear: 'Hearing you…',
    busyTranslate: 'Translating into their language…',
    busySpeak: 'Speaking the translation…',
    frostWorking: 'Working on your languages — please wait a moment',
    frostAlmost: 'Almost ready — do not refresh',
    showText: 'Also show text',
    hideText: 'Hide text',
    roomReady: 'Translation room ready — pick languages, then take turns',
  },
  es: {
    coachTitle: 'Tu traductor en vivo',
    listenNow: 'Espera — escuchando / traduciendo…',
    speakNow: 'Tu turno — pulsa el botón verde y habla claro',
    switchHint: 'Solo una persona habla a la vez. Pulsa verde en tu turno.',
    greenSpeak: 'Mantén para hablar',
    greenDone: 'Listo — siguiente persona',
    greenHear: 'Oír traducción',
    greenRead: 'Leer traducción',
    greenNext: 'Siguiente turno',
    busyHear: 'Te escucho…',
    busyTranslate: 'Traduciendo a su idioma…',
    busySpeak: 'Reproduciendo la traducción…',
    frostWorking: 'Preparando idiomas — espera un momento',
    frostAlmost: 'Casi listo — no actualices',
    showText: 'Mostrar también texto',
    hideText: 'Ocultar texto',
    roomReady: 'Sala lista — elijan idiomas y turnos',
  },
  zh: {
    coachTitle: '你的实时翻译员',
    listenNow: '请稍候 — 正在听 / 翻译…',
    speakNow: '轮到你 — 按绿色按钮并清楚说话',
    switchHint: '一次只有一人说话。轮到你时按绿色。',
    greenSpeak: '按住说话',
    greenDone: '说完了 — 下一位',
    greenHear: '听翻译',
    greenRead: '看文字',
    greenNext: '下一轮',
    busyHear: '正在听你说…',
    busyTranslate: '正在译成对方语言…',
    busySpeak: '正在播放翻译…',
    frostWorking: '正在切换语言 — 请稍候',
    frostAlmost: '即将就绪 — 请勿刷新',
    showText: '同时显示文字',
    hideText: '隐藏文字',
    roomReady: '翻译房间已就绪 — 选择语言后轮流说',
  },
  de: {
    coachTitle: 'Ihr Live-Übersetzer',
    listenNow: 'Bitte warten — hört / übersetzt…',
    speakNow: 'Ihr Zug — grüne Taste drücken und deutlich sprechen',
    switchHint: 'Nur eine Person spricht. Grün drücken, wenn Sie dran sind.',
    greenSpeak: 'Halten zum Sprechen',
    greenDone: 'Fertig — nächste Person',
    greenHear: 'Übersetzung hören',
    greenRead: 'Text lesen',
    greenNext: 'Nächster Zug',
    busyHear: 'Ich höre zu…',
    busyTranslate: 'Übersetzung in deren Sprache…',
    busySpeak: 'Übersetzung wird gesprochen…',
    frostWorking: 'Sprachen werden vorbereitet — kurz warten',
    frostAlmost: 'Gleich fertig — nicht aktualisieren',
    showText: 'Text auch anzeigen',
    hideText: 'Text ausblenden',
    roomReady: 'Raum bereit — Sprachen wählen, dann abwechseln',
  },
  tl: {
    coachTitle: 'Ang iyong live translator',
    listenNow: 'Maghintay — nakikinig / nagsasalin…',
    speakNow: 'Ikaw — pindutin ang berdeng button at magsalita nang malinaw',
    switchHint: 'Isang tao lang ang nagsasalita. Pindutin ang berde sa iyong turn.',
    greenSpeak: 'Pindutin para magsalita',
    greenDone: 'Tapos na — susunod',
    greenHear: 'Pakinggan ang salin',
    greenRead: 'Basahin ang salin',
    greenNext: 'Susunod na turn',
    busyHear: 'Naririnig ka…',
    busyTranslate: 'Isinasalin sa wika nila…',
    busySpeak: 'Binibigkas ang salin…',
    frostWorking: 'Inihahanda ang mga wika — maghintay sandali',
    frostAlmost: 'Malapit na — huwag i-refresh',
    showText: 'Ipakita rin ang text',
    hideText: 'Itago ang text',
    roomReady: 'Handa na ang room — pumili ng wika, magpalitan',
  },
  ja: {
    coachTitle: 'ライブ翻訳ガイド',
    listenNow: 'お待ちください — 聴取 / 翻訳中…',
    speakNow: 'あなたの番 — 緑のボタンを押してはっきり話してください',
    switchHint: '一度に話すのは一人。自分の番は緑を押します。',
    greenSpeak: '長押しで話す',
    greenDone: '話した — 次の人',
    greenHear: '翻訳を聞く',
    greenRead: '文字で読む',
    greenNext: '次の番',
    busyHear: '聞いています…',
    busyTranslate: '相手の言語に翻訳中…',
    busySpeak: '翻訳を読み上げ中…',
    frostWorking: '言語を準備中 — 少しお待ちください',
    frostAlmost: 'まもなく完了 — 更新しないでください',
    showText: '文字も表示',
    hideText: '文字を隠す',
    roomReady: '翻訳ルーム準備完了 — 言語を選び交互に',
  },
};
