import type { UILocale } from '@/lib/ui-copy';
export const localLanguageCopy: Record<UILocale, { choose: string; auto: string; unknown: string; hint: string }> = {
  en: { choose: 'Choose local language', auto: 'Auto detect', unknown: 'Choose a language', hint: 'Just leave mic on for any language and it will self adjust itself for users.' },
  es: { choose: 'Elige el idioma local', auto: 'Detectar automáticamente', unknown: 'Elige un idioma', hint: 'Deja el micrófono encendido para cualquier idioma y se ajustará solo para los usuarios.' },
  tl: { choose: 'Piliin ang lokal na wika', auto: 'Awtomatikong tukuyin', unknown: 'Pumili ng wika', hint: 'Iwanang nakabukas ang mic para sa anumang wika at kusang aaangkop ito para sa mga gumagamit.' },
  zh: { choose: '选择当地语言', auto: '自动检测', unknown: '选择语言', hint: '无论何种语言，只需让麦克风保持开启，它就会自动为用户调整。' },
  de: { choose: 'Lokale Sprache wählen', auto: 'Automatisch erkennen', unknown: 'Sprache wählen', hint: 'Lassen Sie das Mikrofon für jede Sprache an – es passt sich für die Nutzer von selbst an.' },
  ja: { choose: '現地の言語を選択', auto: '自動検出', unknown: '言語を選択', hint: 'どの言語でもマイクをつけたままにすれば、ユーザーに合わせて自動で調整されます。' },
};
