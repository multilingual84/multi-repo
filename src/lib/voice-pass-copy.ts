import type { UILocale } from './ui-copy';

// Voice sign-up button on the 7-Day Free Pass screen. Preview only: the mic
// opens on the visitor's device; nothing is saved until plumbing is connected.
export const voicePassCopy: Record<UILocale, { button: string; listening: string; stop: string; denied: string }> = {
  en: { button: '🎙️ Start my pass with my voice', listening: 'Listening… say your name to start your 7-day pass.', stop: 'Tap again to finish', denied: 'Allow the microphone to sign up with your voice.' },
  es: { button: '🎙️ Activar mi pase con mi voz', listening: 'Escuchando… diga su nombre para iniciar su pase de 7 días.', stop: 'Toque de nuevo para terminar', denied: 'Permita el micrófono para registrarse con su voz.' },
  tl: { button: '🎙️ Simulan ang pass gamit ang boses ko', listening: 'Nakikinig… sabihin ang iyong pangalan para simulan ang 7-araw na pass.', stop: 'I-tap muli para tapusin', denied: 'Payagan ang mikropono para mag-sign up gamit ang boses.' },
  zh: { button: '🎙️ 用语音开通我的通行证', listening: '正在聆听……说出您的名字即可开通7天通行证。', stop: '再次点击结束', denied: '请允许使用麦克风以语音注册。' },
  de: { button: '🎙️ Pass per Stimme starten', listening: 'Ich höre zu… sagen Sie Ihren Namen, um Ihren 7-Tage-Pass zu starten.', stop: 'Erneut tippen zum Beenden', denied: 'Erlauben Sie das Mikrofon, um sich per Stimme anzumelden.' },
  ja: { button: '🎙️ 声でパスを開始', listening: '聞き取り中… お名前を話すと7日間パスが始まります。', stop: 'もう一度タップして終了', denied: '声で登録するにはマイクを許可してください。' },
};
