import type { UILocale } from './ui-copy';

type MeetingCopy = { title:string; create:string; open:string; copy:string; copied:string; language:string; listen:string; stop:string; sample:string; room:string };
export const meetingCopy: Record<UILocale, MeetingCopy> = {
  en: {title:'Public Meeting Broadcast',create:'Prepare meeting QR',open:'Open meeting preview',copy:'Copy meeting link',copied:'Meeting link copied',language:'Listening language',listen:'Play audio sample',stop:'Stop audio',sample:'Welcome to your public meeting translation preview.',room:'Meeting room preview'},
  es: {title:'Transmisión de reuniones públicas',create:'Preparar QR de reunión',open:'Abrir vista previa de reunión',copy:'Copiar enlace de reunión',copied:'Enlace de reunión copiado',language:'Idioma de escucha',listen:'Reproducir muestra de audio',stop:'Detener audio',sample:'Bienvenido a la vista previa de traducción de su reunión pública.',room:'Vista previa de sala de reunión'},
  zh: {title:'公共会议广播',create:'准备会议二维码',open:'打开会议预览',copy:'复制会议链接',copied:'已复制会议链接',language:'收听语言',listen:'播放音频示例',stop:'停止音频',sample:'欢迎来到公共会议翻译预览。',room:'会议室预览'},
  de: {title:'Übertragung öffentlicher Sitzungen',create:'Sitzungs-QR vorbereiten',open:'Sitzungsvorschau öffnen',copy:'Sitzungslink kopieren',copied:'Sitzungslink kopiert',language:'Hörsprache',listen:'Audiobeispiel abspielen',stop:'Audio stoppen',sample:'Willkommen zur Übersetzungsvorschau Ihrer öffentlichen Sitzung.',room:'Sitzungsraum-Vorschau'},
  tl: {title:'Broadcast ng Pampublikong Pagpupulong',create:'Ihanda ang QR ng pulong',open:'Buksan ang preview ng pulong',copy:'Kopyahin ang link ng pulong',copied:'Nakopya ang link ng pulong',language:'Wika ng pakikinig',listen:'I-play ang sample ng audio',stop:'Ihinto ang audio',sample:'Maligayang pagdating sa preview ng pagsasalin ng pampublikong pagpupulong.',room:'Preview ng silid ng pulong'},
  ja: {title:'公開会議の配信',create:'会議QRを準備',open:'会議プレビューを開く',copy:'会議リンクをコピー',copied:'会議リンクをコピーしました',language:'聴く言語',listen:'音声サンプルを再生',stop:'音声を停止',sample:'公開会議の翻訳プレビューへようこそ。',room:'会議室プレビュー'},
};
export const meetingLanguages: {locale:UILocale; label:string; speech:string}[] = [
  {locale:'en',label:'English',speech:'en-US'}, {locale:'es',label:'Español',speech:'es-ES'},
  {locale:'zh',label:'中文',speech:'zh-CN'}, {locale:'de',label:'Deutsch',speech:'de-DE'},
  {locale:'tl',label:'Tagalog',speech:'fil-PH'}, {locale:'ja',label:'日本語',speech:'ja-JP'},
];