import type { UILocale } from '@/lib/ui-copy';
export const automaticConversationCopy: Record<UILocale, { hint: string; active: string; error: string; play: string }> = {
  en: { hint: 'Just leave mic on for any language and it will self adjust itself for users.', active: 'Listening', error: 'Voice translation unavailable. Tap to try again.', play: 'Play translation' },
  es: { hint: 'Deja el micrófono encendido para cualquier idioma y se ajustará solo para los usuarios.', active: 'Escuchando', error: 'Traducción de voz no disponible. Toca para volver a intentar.', play: 'Reproducir traducción' },
  zh: { hint: '无论何种语言，只需让麦克风保持开启，它就会自动为用户调整。', active: '正在聆听', error: '语音翻译暂不可用。点击重试。', play: '播放翻译' },
  de: { hint: 'Lassen Sie das Mikrofon für jede Sprache an – es passt sich für die Nutzer von selbst an.', active: 'Hört zu', error: 'Sprachübersetzung nicht verfügbar. Zum erneuten Versuch tippen.', play: 'Übersetzung abspielen' },
  tl: { hint: 'Iwanang nakabukas ang mic para sa anumang wika at kusang aaangkop ito para sa mga gumagamit.', active: 'Nakikinig', error: 'Hindi magamit ang pagsasalin ng boses. I-tap para subukan muli.', play: 'Pakinggan ang salin' },
  ja: { hint: 'どの言語でもマイクをつけたままにすれば、ユーザーに合わせて自動で調整されます。', active: '聞き取り中', error: '音声翻訳を利用できません。タップして再試行してください。', play: '翻訳を再生' },
};
