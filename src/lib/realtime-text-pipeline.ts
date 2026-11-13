/**
 * Near real-time talk unit: TEXT.
 * Translate: open API → local phrases → passthrough.
 * Speak uses speech-playback (Kokoro → device).
 */
import { translateTypedTextFn } from '@/lib/translator-text.functions';

const MOCK: Record<string, Record<string, string>> = {
  en: { hello: 'Hello', hi: 'Hi', yes: 'Yes', no: 'No', thanks: 'Thank you', please: 'Please', help: 'Help', goodbye: 'Goodbye' },
  es: { hello: 'Hola', hi: 'Hola', yes: 'Sí', no: 'No', thanks: 'Gracias', please: 'Por favor', help: 'Ayuda', goodbye: 'Adiós' },
  zh: { hello: '你好', hi: '你好', yes: '是', no: '不', thanks: '谢谢', please: '请', help: '帮忙', goodbye: '再见' },
  de: { hello: 'Hallo', hi: 'Hallo', yes: 'Ja', no: 'Nein', thanks: 'Danke', please: 'Bitte', help: 'Hilfe', goodbye: 'Tschüss' },
  tl: { hello: 'Kumusta', hi: 'Hi', yes: 'Oo', no: 'Hindi', thanks: 'Salamat', please: 'Pakiusap', help: 'Tulong', goodbye: 'Paalam' },
  ja: { hello: 'こんにちは', hi: 'こんにちは', yes: 'はい', no: 'いいえ', thanks: 'ありがとう', please: 'お願いします', help: '助けて', goodbye: 'さようなら' },
};

function base(lang: string) {
  return (lang || 'en').toLowerCase().split(/[-_]/)[0] || 'en';
}

export function localPhraseTranslate(text: string, targetLang: string): string | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  const bag = MOCK[base(targetLang)] ?? MOCK['en'];
  if (!bag) return null;
  if (bag[t]) return bag[t];
  for (const [k, v] of Object.entries(bag)) {
    if (new RegExp(`(?:^|\\s)${k}(?:$|\\s|[?.!,])`, 'i').test(t)) return v;
  }
  return null;
}

export async function translateRegisteredText(
  text: string,
  targetLang: string,
): Promise<{ text: string; source: 'api' | 'local' | 'passthrough' }> {
  const trimmed = text.trim();
  if (!trimmed) return { text: '', source: 'passthrough' };
  try {
    const r = await translateTypedTextFn({
      data: { text: trimmed, target: targetLang.slice(0, 12), consent: true as const },
    });
    if (r && typeof r === 'object' && 'ok' in r && r.ok && 'text' in r && r.text) {
      return { text: String(r.text), source: 'api' };
    }
  } catch {
    /* fall through */
  }
  const local = localPhraseTranslate(trimmed, targetLang);
  if (local) return { text: local, source: 'local' };
  return { text: trimmed, source: 'passthrough' };
}
