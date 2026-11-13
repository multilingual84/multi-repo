import type { FlagSearchLocale } from '@/lib/flag-search-copy';

export const flagVoiceCopy: Record<FlagSearchLocale, { label: string; replyTitle: string; notice: string }> = {
  en: { label: 'Speak into the mic for language or help', replyTitle: 'Clara · Text replies', notice: 'Clara’s text replies and automatic language detection are not connected yet. Choose your flag for now.' },
  es: { label: 'Habla al micrófono para elegir idioma o pedir ayuda', replyTitle: 'Clara · Respuestas por texto', notice: 'Las respuestas por texto de Clara y la detección automática de idioma aún no están conectadas. Por ahora, elige tu bandera.' },
  zh: { label: '对着麦克风说话，识别语言或寻求帮助', replyTitle: 'Clara · 文字回复', notice: 'Clara 的文字回复和自动语言识别尚未连接。请先选择你的国旗。' },
  de: { label: 'Sprich ins Mikrofon für Spracherkennung oder Hilfe', replyTitle: 'Clara · Textantworten', notice: 'Claras Textantworten und die automatische Spracherkennung sind noch nicht verbunden. Wähle vorerst deine Flagge.' },
  tl: { label: 'Magsalita sa mikropono para sa wika o tulong', replyTitle: 'Clara · Mga sagot sa teksto', notice: 'Hindi pa nakakonekta ang mga sagot sa teksto ni Clara at ang awtomatikong pagtukoy ng wika. Piliin muna ang iyong watawat.' },
  ja: { label: '言語の識別やサポートのためにマイクに話しかけてください', replyTitle: 'Clara · テキストでの返信', notice: 'Clara のテキスト返信と自動言語検出はまだ接続されていません。今は国旗を選択してください。' },
};

export const flagTypingCopy: Record<FlagSearchLocale, string> = {
  en: 'Clara is typing… · Preview',
  es: 'Clara está escribiendo… · Vista previa',
  zh: 'Clara 正在输入… · 预览',
  de: 'Clara schreibt… · Vorschau',
  tl: 'Nagta-type si Clara… · Preview',
  ja: 'Clara が入力中… · プレビュー',
};