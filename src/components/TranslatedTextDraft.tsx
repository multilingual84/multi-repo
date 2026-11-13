import { useEffect, useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { translatorSendCopy } from '@/lib/translator-send-copy';
import { shareTranslatedText } from '@/lib/translated-text-share';
import type { UILocale } from '@/lib/ui-copy';

export default function TranslatedTextDraft({ text, locale }: { text: string; locale: UILocale }) {
  const c = translatorSendCopy[locale];
  const [draft, setDraft] = useState(text);
  const [notice, setNotice] = useState('');
  const [sending, setSending] = useState(false);
  useEffect(() => { setDraft(text); setNotice(''); }, [text]);
  return <div data-translated-draft className="w-full space-y-2 text-left">
    <label className="flex flex-col gap-1 text-sm font-bold">
      <span>{c.translated}</span>
      <textarea value={draft} onChange={event => { setDraft(event.target.value); setNotice(''); }} rows={3}
        className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm font-normal" />
    </label>
    <Button variant="outline" disabled={sending || !draft.trim()} onClick={() => {
      setSending(true); setNotice('');
      void shareTranslatedText(draft).then(result => { if (result === 'copied') setNotice(c.copied); })
        .catch(() => setNotice(c.error)).finally(() => setSending(false));
    }}><Send size={16}/>{c.send}</Button>
    {notice && <p role="status" className="text-xs text-muted-foreground">{notice}</p>}
  </div>;
}