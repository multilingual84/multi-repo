import type { UILocale } from '@/lib/ui-copy';

export const browserCallCopy: Record<UILocale, { video: string; audio: string; sound: string; stopSound: string; note: string }> = {
  en: { video: 'Start video call', audio: 'Start audio call', sound: 'Enable ringing sound', stopSound: 'Silence ringing', note: 'Two-person calls use the shared link. The recipient must open it and answer; closed browsers cannot ring. Group meetings remain a preview.' },
  es: { video: 'Iniciar videollamada', audio: 'Iniciar llamada de audio', sound: 'Activar tono de llamada', stopSound: 'Silenciar tono', note: 'Las llamadas de dos personas usan el enlace compartido. El destinatario debe abrirlo y contestar; los navegadores cerrados no suenan. Las reuniones grupales siguen siendo una vista previa.' },
  tl: { video: 'Simulan ang video call', audio: 'Simulan ang audio call', sound: 'Paganahin ang tunog ng tawag', stopSound: 'Patahimikin ang tawag', note: 'Gamitin ang shared link para sa dalawang tao. Kailangang buksan at sagutin ito ng tatanggap; hindi tutunog ang saradong browser. Preview pa rin ang mga group meeting.' },
  zh: { video: '开始视频通话', audio: '开始语音通话', sound: '启用来电铃声', stopSound: '静音铃声', note: '双人通话使用分享链接。接收者必须打开并接听；关闭的浏览器无法响铃。群组会议仍为预览。' },
  de: { video: 'Videoanruf starten', audio: 'Audioanruf starten', sound: 'Klingelton aktivieren', stopSound: 'Klingelton stummschalten', note: 'Anrufe zu zweit nutzen den geteilten Link. Der Empfänger muss ihn öffnen und annehmen; geschlossene Browser klingeln nicht. Gruppenmeetings bleiben eine Vorschau.' },
  ja: { video: 'ビデオ通話を開始', audio: '音声通話を開始', sound: '着信音を有効にする', stopSound: '着信音を消す', note: '2人の通話には共有リンクを使用します。相手がリンクを開いて応答する必要があります。閉じたブラウザでは鳴りません。グループ会議は引き続きプレビューです。' },
};