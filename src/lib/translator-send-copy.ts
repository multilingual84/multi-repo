import type { UILocale } from '@/lib/ui-copy';

export const translatorSendCopy: Record<UILocale, { translated: string; send: string; copied: string; error: string }> = {
  en: { translated: 'Translated text', send: 'Send translated text', copied: 'Copied — paste into your message.', error: 'Could not share. Select the text to copy it.' },
  es: { translated: 'Texto traducido', send: 'Enviar texto traducido', copied: 'Copiado — pégalo en tu mensaje.', error: 'No se pudo compartir. Selecciona el texto para copiarlo.' },
  tl: { translated: 'Isinaling teksto', send: 'Ipadala ang isinaling teksto', copied: 'Nakopya — ilagay sa iyong mensahe.', error: 'Hindi maibahagi. Piliin ang teksto para kopyahin.' },
  zh: { translated: '翻译文本', send: '发送翻译文本', copied: '已复制——粘贴到您的消息中。', error: '无法分享。请选择文本进行复制。' },
  de: { translated: 'Übersetzter Text', send: 'Übersetzten Text senden', copied: 'Kopiert — in Ihre Nachricht einfügen.', error: 'Teilen fehlgeschlagen. Text zum Kopieren auswählen.' },
  ja: { translated: '翻訳テキスト', send: '翻訳テキストを送信', copied: 'コピー済み — メッセージに貼り付けてください。', error: '共有できませんでした。テキストを選択してコピーしてください。' },
};