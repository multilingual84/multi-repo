import { useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { Button } from '@/components/ui/button';
import { submitSuggestionFn } from '@/lib/suggestions.functions';
import type { UILocale } from '@/lib/ui-copy';

const copy: Record<string, { title: string; body: string; placeholder: string; button: string; sending: string; thanks: string; error: string }> = {
  en: { title: '💡 Help us improve', body: 'Tell us what would make Multi-Lingual™ better or what isn’t working. We review every note before changing anything.', placeholder: 'e.g. I wish I could…', button: 'Send suggestion', sending: 'Sending…', thanks: 'Thank you! Your note was received.', error: 'Could not send. Please try again.' },
  es: { title: '💡 Ayúdanos a mejorar', body: 'Cuéntanos qué mejoraría Multi-Lingual™ o qué no funciona. Revisamos cada nota antes de cambiar algo.', placeholder: 'p. ej. Me gustaría poder…', button: 'Enviar sugerencia', sending: 'Enviando…', thanks: '¡Gracias! Recibimos tu nota.', error: 'No se pudo enviar. Inténtalo de nuevo.' },
  zh: { title: '💡 帮助我们改进', body: '告诉我们如何让 Multi-Lingual™ 更好，或哪里出了问题。我们会先审核每条意见再做更改。', placeholder: '例如：我希望可以……', button: '提交建议', sending: '发送中…', thanks: '谢谢！已收到您的意见。', error: '发送失败，请重试。' },
  de: { title: '💡 Hilf uns besser zu werden', body: 'Sag uns, was Multi-Lingual™ besser machen würde oder was nicht funktioniert. Wir prüfen jede Nachricht, bevor wir etwas ändern.', placeholder: 'z. B. Ich wünschte, ich könnte…', button: 'Vorschlag senden', sending: 'Senden…', thanks: 'Danke! Deine Nachricht ist angekommen.', error: 'Senden fehlgeschlagen. Bitte erneut versuchen.' },
  tl: { title: '💡 Tulungan kaming gumanda', body: 'Sabihin kung ano ang magpapaganda sa Multi-Lingual™ o kung ano ang hindi gumagana. Sinusuri namin ang bawat mensahe bago magbago.', placeholder: 'hal. Sana puwede kong…', button: 'Ipadala ang mungkahi', sending: 'Ipinapadala…', thanks: 'Salamat! Natanggap ang iyong mensahe.', error: 'Hindi naipadala. Subukang muli.' },
  ja: { title: '💡 改善にご協力ください', body: 'Multi-Lingual™ をより良くするアイデアや不具合を教えてください。変更前にすべて確認します。', placeholder: '例：〜できたらいいのに', button: '提案を送信', sending: '送信中…', thanks: 'ありがとうございます！受け付けました。', error: '送信できませんでした。もう一度お試しください。' },
};

export default function SuggestionBox({ locale }: { locale: UILocale }) {
  const c = copy[locale] ?? copy['en']!;
  const send = useServerFn(submitSuggestionFn);
  const [message, setMessage] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (state === 'busy') return; setState('busy');
    try { await send({ data: { message, page: window.location.hash || '/', locale, device: `${window.innerWidth}x${window.innerHeight}` } }); setMessage(''); setState('done'); }
    catch { setState('error'); }
  }
  return (
    <section className="mx-auto mt-6 max-w-2xl rounded-3xl border border-border bg-card p-8" data-suggestion-box>
      <h2 className="text-2xl font-black md:text-3xl">{c.title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <textarea rows={3} value={message} onChange={e => setMessage(e.target.value)} placeholder={c.placeholder} aria-label={c.title} minLength={8} maxLength={1500} required className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none" />
        <Button type="submit" disabled={state === 'busy' || message.trim().length < 8} className="h-auto w-full whitespace-normal py-3 font-black">{state === 'busy' ? c.sending : c.button}</Button>
      </form>
      {state === 'done' && <p role="status" className="mt-4 rounded-xl border border-border bg-background px-4 py-3 text-sm">{c.thanks}</p>}
      {state === 'error' && <p role="alert" className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">{c.error}</p>}
    </section>
  );
}
